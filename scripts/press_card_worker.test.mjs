import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { generateKeyPair, SignJWT, jwtVerify } from 'jose';
import { authenticate, createHandler, parseIssue } from '../worker/press-cards.mjs';

const origin='https://www.infonewsupdate24.com';
const now=Date.now(),today=Math.floor((now+19800000)/86400000)*86400000-19800000;
const sample={token:'a'.repeat(32),employeeId:'INU24-TEST',name:'Test Editor',designation:'Editor',photo:'',issuedAt:today-86400000,expiresAt:today+86400000*365};
function setup(auth=async()=>({uid:'owner',name:'Owner',role:'OWNER'})) {
  const sqlite=new DatabaseSync(':memory:'); sqlite.exec(fs.readFileSync('worker/press-cards-schema.sql','utf8'));
  sqlite.exec("INSERT INTO card_meta VALUES('migration_ready','1')");
  const session={prepare(sql){return {bind(...params){return {async first(){return sqlite.prepare(sql).get(...params)||null;},async all(){return {results:sqlite.prepare(sql).all(...params)};},async run(){const result=sqlite.prepare(sql).run(...params);return {meta:{changes:Number(result.changes)}};}};},async first(){return sqlite.prepare(sql).get()||null;},async all(){return {results:sqlite.prepare(sql).all()};}};}};
  const env={SITE_ORIGIN:origin,FIREBASE_PROJECT:'test-project',CARDS:{withSession(value){assert.equal(value,'first-primary');return session;}}};
  const handler=createHandler(auth);
  const call=(path='',method='GET',body,extra={})=>handler(new Request(origin+'/api/press-cards'+path,{method,headers:{Origin:origin,'Content-Type':'application/json',...extra},...(body === undefined ? {} : {body:JSON.stringify(body)})}),env);
  return {sqlite,call,env,session};
}
test('issue editable past date, unique ID, server registration timestamp and unchanged QR',async()=>{
  const {call,sqlite}=setup();
  assert.equal((await call('','POST',sample)).status,201);
  const result=await (await call('/verify/'+sample.token)).json();
  assert.equal(result.card.issuedAt,sample.issuedAt); assert.ok(result.card.createdAt>=now);assert.equal(result.card.status,'ACTIVE');
  assert.ok(!('issuedBy' in result.card));assert.ok(!('updatedBy' in result.card));
  assert.equal((await call('','POST',{...sample,token:'b'.repeat(32)})).status,409);
  assert.equal(sqlite.prepare('SELECT count(*) n FROM press_cards').get().n,1);
});
test('renew then revoke, immutable identity, expired/revoked state and durable audit',async()=>{
  const {call,sqlite}=setup();await call('','POST',sample);
  assert.equal((await call('/'+sample.token+'/renew','POST',{expiresAt:sample.expiresAt+86400000})).status,200);
  assert.equal((await call('/'+sample.token+'/renew','POST',{expiresAt:sample.expiresAt})).status,409);
  assert.equal((await call('/'+sample.token+'/revoke','POST',{})).status,200);
  assert.equal((await call('/'+sample.token+'/renew','POST',{expiresAt:sample.expiresAt+86400000*2})).status,409);
  const verified=await (await call('/verify/'+sample.token)).json();assert.equal(verified.card.status,'REVOKED');
  assert.equal(sqlite.prepare('SELECT count(*) n FROM card_audit').get().n,3);
  assert.throws(()=>sqlite.prepare("UPDATE press_cards SET name='Impostor'").run());
  assert.throws(()=>sqlite.prepare('DELETE FROM press_cards').run());
  assert.throws(()=>sqlite.prepare('DELETE FROM card_audit').run());
});
test('public verification never invokes Firebase or requires login; no stale cache',async()=>{
  const {call}=setup(async()=>{throw Error('No Firebase access');});
  const response=await call('/verify/'+sample.token);assert.equal(response.status,200);assert.equal((await response.json()).card,null);
  assert.match(response.headers.get('Cache-Control'),/no-store/);
  assert.equal((await call('')).status,503);
});
test('invalid dates, extra private fields, forged token and unsafe photo rejected',()=>{
  for(const change of [{issuedAt:today+86400000},{issuedAt:today+1},{expiresAt:today},{expiresAt:Infinity},{bloodGroup:'B+'},{name:'x'.repeat(151)},{token:'INU24-001'},{photo:'javascript:alert(1)'},{photo:'https://user:password@example.com'}]) assert.throws(()=>parseIssue({...sample,...change},now));
  assert.equal(parseIssue({...sample,issuedAt:today-86400000*100},now).issuedAt,today-86400000*100);
});
test('cross-site writes, anonymous directory and requests with forged JWT fail',async()=>{
  const {call}=setup(authenticate);
  assert.equal((await call('')).status,401);
  assert.equal((await call('','POST',sample,{Origin:'https://evil.example'})).status,403);
  assert.equal((await call('','POST',sample,{Authorization:'Bearer bad.token.here'})).status,401);
});
test('Firebase JWT cryptographic validation and independent admin revocation',async()=>{
  const {publicKey,privateKey}=await generateKeyPair('RS256');
  const {env,session,sqlite}=setup();
  sqlite.prepare('INSERT INTO card_admins VALUES(?,?,?,?,?)').run('owner','Owner','OWNER',1,now);
  const token=await new SignJWT({auth_time:Math.floor(now/1000)}).setProtectedHeader({alg:'RS256'}).setSubject('owner').setIssuer('https://securetoken.google.com/test-project').setAudience('test-project').setIssuedAt().setExpirationTime('1h').sign(privateKey);
  const req=new Request(origin,{headers:{Authorization:'Bearer '+token}});
  const verifier=(value,_keys,options)=>jwtVerify(value,publicKey,options);
  assert.equal((await authenticate(req,env,session,verifier)).uid,'owner');
  await assert.rejects(()=>authenticate(req,{...env,FIREBASE_PROJECT:'wrong-project'},session,verifier));
  sqlite.prepare('UPDATE card_admins SET active=0').run();
  await assert.rejects(()=>authenticate(req,env,session,verifier),/परवानगी/);
});
test('only owner manages card admins, cannot remove own access',async()=>{
  const owner=setup();
  assert.equal((await owner.call('/admins','POST',{uid:'owner',name:'Owner',role:'ISSUER',active:false})).status,400);
  assert.equal((await owner.call('/admins','POST',{uid:'issuer',name:'Editor',role:'ISSUER',active:true})).status,200);
  const issuer=setup(async()=>({uid:'issuer',role:'ISSUER'}));
  assert.equal((await issuer.call('/admins','POST',{uid:'other',name:'Other',role:'ISSUER',active:true})).status,404);
});
test('incomplete migration never reports an existing card missing or active',async()=>{
  const {call,sqlite}=setup();sqlite.exec('DELETE FROM card_meta');
  const response=await call('/verify/'+sample.token);assert.equal(response.status,503);assert.match((await response.json()).error,/हलवण्याचे/);
});
