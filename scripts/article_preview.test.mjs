import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createArticleHandler } from '../server/handler.mjs';
import { renderArticleSeo } from '../src/utils/articleSeo.mjs';

const baseHtml = '<html><head><title>Home</title><meta property="og:title" content="Home"></head><body><div id="root"></div></body></html>';
const missing = '<html><head><meta name="robots" content="noindex,nofollow"></head><body>Not found</body></html>';
const article = { id: 'new-article', slug: 'new-news', title: 'नवीन बातमी', status: 'PUBLISHED', visibility: 'PUBLIC',
  featuredImage: 'https://res.cloudinary.com/demo/image/upload/v1/news.webp', updatedAt: '2026-09-22T12:00:00Z' };

async function request(findPosts, path = '/news/new-news', method = 'GET') {
  const response = { headers: {}, statusCode: 200, body: '',
    set(k, v) { this.headers[k] = v; return this; },
    status(code) { this.statusCode = code; return this; },
    type(type) { this.contentType = type; return this; },
    send(body) { this.body = body; return this; },
  };
  await createArticleHandler({ baseHtml, notFoundHtml: missing, findPosts, logger: { error() {} } })({ path, method }, response);
  return response;
}

test('new article and subsequent edits render immediately without rebuilding', async () => {
  let live = { ...article };
  const lookup = async () => [live];
  let res = await request(lookup);
  assert.equal(res.statusCode, 200);
  assert.match(res.body, /नवीन बातमी/);
  assert.match(res.body, /c_fill,g_auto,w_1200,h_630,q_auto,f_jpg/);
  assert.match(res.body, /infonews:post-version/);
  assert.equal(res.headers['X-InfoNews-Preview'], 'live');
  assert.match(res.headers['Cache-Control'], /no-store/);
  live = { ...live, title: 'सुधारित बातमी', updatedAt: '2026-09-22T12:01:00Z' };
  res = await request(lookup);
  assert.match(res.body, /सुधारित बातमी/);
  assert.doesNotMatch(res.body, /नवीन बातमी/);
  live = { ...live, status: 'DRAFT' };
  assert.equal((await request(lookup)).statusCode, 404);
});

test('private, deleted, test and future articles are never exposed by Admin SDK', async () => {
  for (const change of [{ status: 'DRAFT' }, { visibility: 'PRIVATE' }, { isDeleted: true }, { isTest: true }, { isQa: true }, { scheduleDate: '2099-01-01' }]) {
    const res = await request(async () => [{ ...article, ...change }]);
    assert.equal(res.statusCode, 404);
    assert.doesNotMatch(res.body, /नवीन बातमी/);
  }
});

test('missing article gives 404, backend outage gives uncached 503', async () => {
  assert.equal((await request(async () => [])).statusCode, 404);
  const res = await request(async () => { throw new Error('Database unavailable'); });
  assert.equal(res.statusCode, 503);
  assert.equal(res.headers['Retry-After'], '10');
  assert.match(res.headers['Cache-Control'], /no-store/);
  assert.doesNotMatch(res.body, /noindex/);
});

test('malformed paths and write methods do not query Firestore', async () => {
  let calls = 0;
  const lookup = async () => { calls++; return [article]; };
  for (const path of ['/news/%ZZ', '/news/%2Fsecret', '/news/..', '/news/a/b', '/admin']) {
    assert.equal((await request(lookup, path)).statusCode, 404);
  }
  assert.equal((await request(lookup, '/news/new-news', 'POST')).statusCode, 405);
  assert.equal(calls, 0);
});

test('Marathi slugs decode once and metadata cannot inject HTML or scripts', async () => {
  const post = { ...article, slug: 'मराठी-बातमी', title: '</title><script>alert(1)</script>' };
  const res = await request(async slug => { assert.equal(slug, post.slug); return [post]; }, `/news/${encodeURIComponent(post.slug)}`);
  assert.equal(res.statusCode, 200);
  assert.doesNotMatch(res.body, /<script>alert/);
  const html = await renderArticleSeo(baseHtml, post);
  assert.equal((html.match(/property="og:title"/g) || []).length, 1);
});
