import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createWorker, findLivePosts } from '../worker/article-preview.mjs';

const shell = '<html><head><title>Home</title></head><body><div id="root"></div><script src="/assets/current.js"></script></body></html>';
const story = { id: 'new-live', slug: 'new-live', title: 'New live article', status: 'PUBLISHED', featuredImage: 'https://res.cloudinary.com/demo/image/upload/v1/photo.webp', updatedAt: '2026-09-22T12:00:00Z' };
const req = (slug = 'new-live', method = 'GET') => new Request(`https://www.infonewsupdate24.com/news/${slug}`, { method });

test('free Worker serves new/edited/unpublished articles without a build and without credentials', async () => {
  let post = { ...story };
  const worker = createWorker({ findPosts: async () => [post], fetcher: async url => {
    assert.equal(url, 'https://in24-news-platform-6f802.web.app/index.html');
    return new Response(shell);
  } });
  let res = await worker.fetch(req());
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('X-InfoNews-Preview'), 'live');
  assert.match(await res.text(), /New live article/);
  post = { ...post, title: 'Edited immediately' };
  assert.match(await (await worker.fetch(req())).text(), /Edited immediately/);
  post = { ...post, visibility: 'PRIVATE' };
  res = await worker.fetch(req());
  assert.equal(res.status, 404);
  assert.doesNotMatch(await res.text(), /Edited immediately/);
});

test('REST projection reads only required fields and decodes nested Firestore types', async () => {
  const posts = await findLivePosts('मराठी', async (url, options) => {
    assert.match(url, /firestore.googleapis.com/);
    assert.equal(options.headers.Authorization, undefined);
    const query = JSON.parse(options.body).structuredQuery;
    assert.equal(query.where.fieldFilter.value.stringValue, 'मराठी');
    assert(!query.select.fields.some(f => f.fieldPath === 'content'));
    return Response.json([{ document: { name: 'projects/p/databases/(default)/documents/posts/id1', fields: {
      title: { stringValue: 'Title' }, updatedAt: { timestampValue: '2026-09-22T00:00:00Z' },
      isDeleted: { booleanValue: false }, seo: { mapValue: { fields: { seoTitle: { stringValue: 'SEO title' } } } },
    } } }]);
  });
  assert.equal(posts[0].id, 'id1');
  assert.equal(posts[0].seo.seoTitle, 'SEO title');
  assert.equal(posts[0].isDeleted, false);
});

test('missing/invalid routes do not become homepage previews; transient failure is 503', async () => {
  const worker = createWorker({ findPosts: async () => [] });
  for (const slug of ['missing', '%ZZ', 'a/b', '%2Fprivate']) assert.equal((await worker.fetch(req(slug))).status, 404);
  assert.equal((await worker.fetch(req('new-live', 'POST'))).status, 405);
  const broken = createWorker({ findPosts: async () => { throw new Error('Test-only outage'); }, fetcher: async () => new Response('', { status: 404 }) });
  const res = await broken.fetch(req());
  assert.equal(res.status, 503);
  assert.match(res.headers.get('Cache-Control'), /no-store/);
});

test('quota exhaustion falls back to available article HTML without claiming live readiness', async () => {
  const worker = createWorker({ findPosts: async () => { throw new Error('Firestore lookup HTTP 429'); },
    fetcher: async () => new Response('<meta property="og:type" content="article"><title>Published copy</title>', { headers: { 'content-type': 'text/html' } }) });
  const res = await worker.fetch(req());
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('X-InfoNews-Preview'), 'static-fallback');
  assert.match(await res.text(), /Published copy/);
});

test('edge cache saves reads; a newer shared version bypasses the cached article', async () => {
  let cached, reads = 0;
  const cache = { match: async () => cached?.clone(), put: async (_, response) => { cached = response; } };
  const worker = createWorker({ cache, findPosts: async () => { reads++; return [story]; }, fetcher: async () => new Response(shell) });
  await worker.fetch(req());
  const second = await worker.fetch(req());
  assert.equal(second.headers.get('X-InfoNews-Cache'), 'hit');
  assert.equal(reads, 1);
  await worker.fetch(new Request(`${req().url}?v=${Date.parse(story.updatedAt) + 1000}`));
  assert.equal(reads, 2);
});

test('shared KV serves readers without Firestore; edits and unpublication refresh it', async () => {
  let envelope = { post: story, checkedAt: Date.now() }, reads = 0;
  let current = { ...story, updatedAt: new Date().toISOString(), title: 'Changed' };
  const kv = { get: async () => envelope, put: async (_, value) => { envelope = JSON.parse(value); } };
  const worker = createWorker({ findPosts: async () => { reads++; return [current]; }, fetcher: async () => new Response(shell) });
  let response = await worker.fetch(req(), { PREVIEW_ARTICLES: kv });
  assert.equal(response.status, 200);
  assert.equal(reads, 0);
  response = await worker.fetch(new Request(`${req().url}?v=${encodeURIComponent(current.updatedAt)}`), { PREVIEW_ARTICLES: kv });
  assert.match(await response.text(), /Changed/);
  assert.equal(reads, 1);
  current = { ...current, visibility: 'PRIVATE', updatedAt: new Date(Date.now() + 1000).toISOString() };
  response = await worker.fetch(new Request(`${req().url}?v=${encodeURIComponent(current.updatedAt)}`), { PREVIEW_ARTICLES: kv });
  assert.equal(response.status, 404);
  assert.equal(envelope.post, null);
});

test('quota fallback preserves shared cache timestamp and clearly labels cached data', async () => {
  const envelope = { post: story, checkedAt: 1 };
  let writes = 0;
  const worker = createWorker({ findPosts: async () => { throw new Error('Quota exceeded'); }, fetcher: async () => new Response(shell) });
  const response = await worker.fetch(req(), { PREVIEW_ARTICLES: { get: async () => envelope, put: async () => { writes++; } } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('X-InfoNews-Data'), 'quota-fallback');
  assert.equal(writes, 0);
});

test('HEAD has no body and current Firebase asset paths are retained', async () => {
  const worker = createWorker({ findPosts: async () => [story], fetcher: async () => new Response(shell) });
  const head = await worker.fetch(req('new-live', 'HEAD'));
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.match(await (await worker.fetch(req())).text(), /\/assets\/current.js/);
});
