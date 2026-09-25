import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

test('saved content survives cache outage; retry installs one coherent snapshot',async()=>{
  const built=await build({entryPoints:['src/services/PublishedHomepage.ts'],bundle:true,write:false,platform:'node',format:'esm',plugins:[{
    name:'fixture-auth',setup(b){
      b.onResolve({filter:/^\.\/firebase$/},()=>({path:'auth',namespace:'fixture'}));
      b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export const auth={currentUser:{getIdToken:async()=>"fixture-token"}};',loader:'js'}));
    },
  }]});
  const original={document:globalThis.document,window:globalThis.window,fetch:globalThis.fetch};
  const first={version:1,generatedAt:1,posts:[],sections:[],menus:[],categories:[]};
  globalThis.document={getElementById:()=>({textContent:JSON.stringify(first)})};
  globalThis.window=new EventTarget();
  const statuses=[];const snapshots=[];
  window.addEventListener('infonews:homepage-sync-status',e=>statuses.push(e.detail));
  window.addEventListener('infonews:published-homepage',e=>snapshots.push(e.detail));
  try {
    const client=await import(`data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString('base64')}`);
    assert.deepEqual(client.getPublishedHomepage(),first);
    globalThis.fetch=async()=>new Response('',{status:503});
    await assert.doesNotReject(client.refreshPublishedHomepage());
    assert.deepEqual(statuses,[false]);assert.deepEqual(client.getPublishedHomepage(),first);
    const next={...first,generatedAt:2,posts:[{id:'published'}]};
    globalThis.fetch=async(_url,options)=>{
      assert.equal(options.headers.Authorization,'Bearer fixture-token');
      return Response.json(next);
    };
    await client.refreshPublishedHomepage();
    assert.deepEqual(statuses,[false,true]);assert.deepEqual(snapshots,[next]);
    assert.deepEqual(client.getPublishedHomepage(),next);
  } finally { Object.assign(globalThis,original); }
});
