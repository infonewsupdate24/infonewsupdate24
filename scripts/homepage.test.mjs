import test from 'node:test';
import assert from 'node:assert/strict';
import { createHomepageWorker, injectHomepage, loadHomepage } from '../worker/homepage.mjs';
const snap = {version:1,generatedAt:100,posts:[{id:'live',title:'Published'}],sections:[{id:'hero',enabled:true}],categories:[],menus:[]};
const shell = '<html><head></head><body><div id="root"></div></body></html>';
function storage(value=snap) { return {value,async get(){return this.value;},async put(_key,value){this.value=JSON.parse(value);}}; }
test('homepage embeds a coherent snapshot before React, including query URLs',async()=>{
  const worker=createHomepageWorker({fetcher:async()=>new Response(shell),load:async()=>{throw Error('must use prepared snapshot');}});
  const response=await worker.fetch(new Request('https://www.infonewsupdate24.com/?campaign=test'),{HOMEPAGE:storage()});
  assert.equal(response.status,200);
  assert.equal(response.headers.get('Cache-Control'),'no-store');
  const html=await response.text();
  assert(html.indexOf('"posts"') < html.indexOf('id="root"'));
  assert(html.includes('"sections"'));
});
test('inline snapshot cannot terminate its script; reinjection replaces old data',()=>{
  const html=injectHomepage(injectHomepage(shell,snap),{...snap,posts:[{title:'</script><script>alert(1)</script>'}]});
  assert.equal((html.match(/id="infonews-homepage"/g)||[]).length,1);
  assert(!html.includes('<script>alert'));
  assert(html.includes('\\u003c/script>'));
});
test('refresh rejects anonymous and cross-origin writes; authorized refresh replaces old and empty publications',async()=>{
  const kv=storage();
  const worker=createHomepageWorker({authenticate:async r=>{if(r.headers.get('Authorization')!=='Bearer staff')throw Error();},load:async()=>({...snap,posts:[],generatedAt:200})});
  const request=headers=>new Request('https://www.infonewsupdate24.com/api/homepage',{method:'POST',headers});
  assert.equal((await worker.fetch(request({Origin:'https://other.test',Authorization:'Bearer staff'}),{HOMEPAGE:kv})).status,403);
  assert.equal((await worker.fetch(request({Origin:'https://www.infonewsupdate24.com'}),{HOMEPAGE:kv})).status,403);
  assert.equal(kv.value.generatedAt,100);
  assert.equal((await worker.fetch(request({Origin:'https://www.infonewsupdate24.com',Authorization:'Bearer staff'}),{HOMEPAGE:kv})).status,200);
  assert.deepEqual(kv.value.posts,[]);
});
test('failed refresh preserves last verified snapshot; non-home routes pass through',async()=>{
  const kv=storage();
  const worker=createHomepageWorker({authenticate:async()=>{},load:async()=>{throw Error('quota');},fetcher:async()=>new Response('asset')});
  const response=await worker.fetch(new Request('https://www.infonewsupdate24.com/api/homepage',{method:'POST',headers:{Origin:'https://www.infonewsupdate24.com'}}),{HOMEPAGE:kv});
  assert.equal(response.status,503); assert.equal(kv.value.generatedAt,100);
  assert.equal(await (await worker.fetch(new Request('https://www.infonewsupdate24.com/assets/test.js'),{HOMEPAGE:kv})).text(),'asset');
});
test('source query excludes drafts/private/deleted/future posts and fails on missing layout',async()=>{
  const doc=(id,values)=>({document:{name:`posts/${id}`,fields:Object.fromEntries(Object.entries(values).map(([k,v])=>[k,typeof v==='boolean'?{booleanValue:v}:{stringValue:v}]))}});
  const fetcher=async(url,options)=>{
    if(url.endsWith('/settings/homepage_layout'))return Response.json({fields:{sections:{arrayValue:{values:[]}}}});
    const q=JSON.parse(options.body).structuredQuery;
    if(q.from[0].collectionId!=='posts')return Response.json([]);
    assert.equal(q.where.fieldFilter.op,'IN');
    assert(!q.select.fields.some(f=>f.fieldPath==='workflowHistory'));
    return Response.json([
      doc('a',{title:'public',slug:'public',status:'PUBLISHED'}),doc('b',{title:'draft',slug:'draft',status:'DRAFT'}),
      doc('c',{title:'private',slug:'private',status:'PUBLISHED',visibility:'PRIVATE'}),
      doc('d',{title:'deleted',slug:'deleted',status:'PUBLISHED',isDeleted:true}),
      doc('e',{title:'future',slug:'future',status:'PUBLISHED',scheduleDate:'2099-01-01'}),
    ]);
  };
  assert.deepEqual((await loadHomepage(fetcher)).posts.map(p=>p.id),['a']);
  await assert.rejects(loadHomepage(async(url,o)=>url.endsWith('/settings/homepage_layout')?new Response('',{status:503}):fetcher(url,o)));
});
