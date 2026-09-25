import { createRemoteJWKSet, jwtVerify } from 'jose';
import { isRoutableArticle, newestArticleFirst } from '../src/utils/articleUrls.mjs';

const PROJECT = 'in24-news-platform-6f802';
const DOCUMENTS = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const ORIGIN = `https://${PROJECT}.web.app`;
const KEY = 'homepage:v1';
const keys = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
const postFields = ['title','slug','content','excerpt','summary','featuredImage','featuredImageAlt','featuredImageCaption','categoryId','categoryIds','subCategoryId','tags','authorId','authorName','authorRole','authorAvatar','authorDesignation','status','visibility','isDeleted','isTest','isQa','scheduleDate','scheduledDate','publishDate','publishedAt','createdAt','updatedAt','isBreaking','isFeatured','isTrending','isVideoNews','videoUrl','attachmentUrl','attachmentName','readingTimeMinutes','location','views','likes','seo'];
function decode(v) {
  if ('mapValue' in v) return fields(v.mapValue.fields || {});
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decode);
  if ('integerValue' in v) return Number(v.integerValue);
  return v.stringValue ?? v.timestampValue ?? v.booleanValue ?? v.doubleValue ?? null;
}
function fields(value) { return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,decode(v)])); }
async function query(collection, fetcher, select) {
  const structuredQuery = { from: [{ collectionId: collection }] };
  if (select) structuredQuery.select = { fields: select.map(fieldPath => ({ fieldPath })) };
  if (collection === 'posts') structuredQuery.where = { fieldFilter: { field: { fieldPath: 'status' }, op: 'IN', value: { arrayValue: { values: ['PUBLISHED','PUBLISH'].map(stringValue => ({ stringValue })) } } } };
  const response = await fetcher(`${DOCUMENTS}:runQuery`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({structuredQuery}), signal:AbortSignal.timeout(12000) });
  if (!response.ok) throw Error(`Homepage ${collection}: HTTP ${response.status}`);
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.some(row => row.error)) throw Error('Invalid homepage query');
  return rows.filter(row => row.document).map(({document}) => ({ ...fields(document.fields || {}), id:document.name.split('/').pop() }));
}
export async function loadHomepage(fetcher = fetch) {
  const [posts,categories,menus,layoutResponse] = await Promise.all([
    query('posts',fetcher,postFields), query('categories',fetcher), query('menus',fetcher),
    fetcher(`${DOCUMENTS}/settings/homepage_layout`, {signal:AbortSignal.timeout(12000)}),
  ]);
  if (!layoutResponse.ok) throw Error(`Homepage layout: HTTP ${layoutResponse.status}`);
  const layout = fields((await layoutResponse.json()).fields || {});
  if (!Array.isArray(layout.sections)) throw Error('Published homepage layout missing');
  return { version:1, generatedAt:Date.now(), posts:posts.filter(isRoutableArticle).sort(newestArticleFirst), categories, menus, sections:layout.sections };
}
export function injectHomepage(html, snapshot) {
  const safe = JSON.stringify(snapshot).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return html.replace(/<script id="infonews-homepage" type="application\/json">[\s\S]*?<\/script>/g,'')
    .replace('</head>',`<script id="infonews-homepage" type="application/json">${safe}</script></head>`);
}
async function authorize(request, fetcher) {
  const token = request.headers.get('Authorization')?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) throw Error('Login required');
  const {payload} = await jwtVerify(token,keys,{issuer:`https://securetoken.google.com/${PROJECT}`,audience:PROJECT,algorithms:['RS256'],requiredClaims:['sub','iat','exp'],maxTokenAge:'1h'});
  const response = await fetcher(`${DOCUMENTS}/users/${encodeURIComponent(payload.sub)}`, {headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(8000)});
  if (!response.ok) throw Error('Account unavailable');
  const user = fields((await response.json()).fields || {});
  if (user.status !== 'ACTIVE' || !['SUPER_ADMIN','ADMIN','EDITOR','SUB_EDITOR','REPORTER','VIDEO_REPORTER','PHOTOGRAPHER'].includes(user.role)) throw Error('Staff access required');
}
export function createHomepageWorker({fetcher=fetch,load=()=>loadHomepage(fetcher),authenticate=request=>authorize(request,fetcher)}={}) {
  const refresh = async env => {
    const snapshot = await load();
    await env.HOMEPAGE.put(KEY,JSON.stringify(snapshot));
    return snapshot;
  };
  return {
    async scheduled(_event,env,ctx) { ctx.waitUntil(refresh(env)); },
    async fetch(request,env,ctx) {
      const url = new URL(request.url);
      const api = url.pathname === '/api/homepage';
      const home = url.pathname === '/' || url.pathname === '/index.html';
      if (!api && !home) return fetcher(request);
      const json = (data,status=200) => Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
      if (api && request.method === 'POST') {
        if (request.headers.get('Origin') !== 'https://www.infonewsupdate24.com') return json({error:'Forbidden'},403);
        try { await authenticate(request); } catch { return json({error:'Staff login required'},403); }
        try { return json(await refresh(env)); } catch { return json({error:'Published homepage refresh failed; retry.'},503); }
      }
      if (!['GET','HEAD'].includes(request.method)) return json({error:'Method not allowed'},405);
      try {
        let snapshot = await env.HOMEPAGE.get(KEY,{type:'json',cacheTtl:60});
        if (!snapshot) snapshot = await refresh(env);
        if (api) return json(snapshot);
        const shell = await fetcher(`${ORIGIN}/index.html`,{signal:AbortSignal.timeout(10000),cache:'no-store'});
        if (!shell.ok) throw Error('Homepage shell unavailable');
        return new Response(request.method === 'HEAD' ? null : injectHomepage(await shell.text(),snapshot),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-InfoNews-Homepage':String(snapshot.generatedAt)}});
      } catch {
        if (api) return json({error:'Homepage temporarily unavailable'},503);
        // Hosting includes the last verified snapshot; never restore demo posts.
        return fetcher(`${ORIGIN}/index.html`);
      }
    },
  };
}
export default createHomepageWorker();
