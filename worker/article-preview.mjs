import { renderArticleSeo } from '../src/utils/articleSeo.mjs';
import { isRoutableArticle, newestArticleFirst, normalizeArticleSlug, SITE_ORIGIN } from '../src/utils/articleUrls.mjs';
import { GADCHIROLI_SPOTLIGHT_STORIES } from '../src/data/gadchiroliSpotlightData.ts';

const FIREBASE_ORIGIN = 'https://in24-news-platform-6f802.web.app';
const DATABASE = 'https://firestore.googleapis.com/v1/projects/in24-news-platform-6f802/databases/(default)/documents:runQuery';
export const FIELDS = ['slug', 'title', 'excerpt', 'summary', 'seo', 'featuredImage', 'featuredImageUrl', 'imageUrl',
  'featuredImageAlt', 'authorName', 'status', 'visibility', 'isDeleted', 'isTest', 'isQa', 'scheduleDate',
  'scheduledDate', 'publishDate', 'publishedAt', 'createdAt', 'updatedAt'];

function decodeValue(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {});
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
  return null;
}
function decodeFields(fields) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}

export async function findLivePosts(slug, fetcher = fetch) {
  // Anonymous read governed by the existing Firestore rules. No admin key,
  // paid Firebase service or public write endpoint is needed.
  const response = await fetcher(DATABASE, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10000),
    body: JSON.stringify({ structuredQuery: {
      from: [{ collectionId: 'posts' }], select: { fields: FIELDS.map(fieldPath => ({ fieldPath })) },
      where: { fieldFilter: { field: { fieldPath: 'slug' }, op: 'EQUAL', value: { stringValue: slug } } }, limit: 10,
    } }),
  });
  if (!response.ok) throw new Error(`Firestore lookup HTTP ${response.status}`);
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error('Unexpected Firestore response');
  return rows.filter(row => row.document).map(({ document }) => ({
    ...decodeFields(document.fields || {}), id: document.name.split('/').pop(),
  }));
}

function versionTime(value) {
  if (/^\d{10,13}$/.test(value || '')) return Number(value) * (value.length === 10 ? 1000 : 1);
  return Date.parse(value || '') || 0;
}

export function createWorker({ fetcher = fetch, findPosts = slug => findLivePosts(slug, fetcher), cache = globalThis.caches?.default } = {}) {
  return {
    async fetch(request, env = {}) {
      const headers = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Content-Type-Options': 'nosniff' };
      const reply = (body, status = 200, extra = {}) => new Response(request.method === 'HEAD' ? null : body, {
        status, headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8', ...extra },
      });
      if (!['GET', 'HEAD'].includes(request.method)) return reply('Method not allowed', 405, { Allow: 'GET, HEAD' });
      const url = new URL(request.url);
      const match = url.pathname.match(/^\/news\/([^/]+)\/?$/);
      let slug;
      try { slug = match && decodeURIComponent(match[1]).normalize('NFC'); } catch { slug = null; }
      const notFound = '<!doctype html><html lang="mr"><head><meta name="robots" content="noindex,nofollow"><title>बातमी उपलब्ध नाही</title></head><body><h1>बातमी उपलब्ध नाही</h1><a href="/">मुख्य पृष्ठ</a></body></html>';
      if (!slug || slug.length > 500 || normalizeArticleSlug(slug) !== slug || /[\/?#\\\u0000-\u001f]/.test(slug) || ['.', '..'].includes(slug)) return reply(notFound, 404);
      const cacheKey = new Request(`${url.origin}/news/${encodeURIComponent(slug)}`);
      const suppliedVersion = versionTime(url.searchParams.get('v'));
      const requestedVersion = suppliedVersion <= Date.now() + 300000 ? suppliedVersion : 0;
      const kv = env.PREVIEW_ARTICLES;
      const kvKey = `article:${slug}`;
      let saved;
      if (kv) {
        try { saved = await kv.get(kvKey, { type: 'json', cacheTtl: 60 }); } catch { /* Read through on KV failure. */ }
      }
      // Repeated previews/readers share a short edge cache instead of consuming
      // a Firestore read each time. A newly edited share URL bypasses older data.
      if (cache && (!saved || saved.post)) {
        try {
          const cached = await cache.match(cacheKey);
          if (cached && Math.max(requestedVersion, versionTime(saved?.post?.updatedAt || saved?.post?.createdAt)) <= versionTime(cached.headers.get('X-InfoNews-Version'))) {
            return reply(await cached.text(), 200, {
              'X-InfoNews-Preview': cached.headers.get('X-InfoNews-Preview'),
              'X-InfoNews-Version': cached.headers.get('X-InfoNews-Version'),
              'X-InfoNews-Preview-Provider': 'cloudflare-free', 'X-InfoNews-Cache': 'hit',
            });
          }
        } catch { /* A cache failure must not prevent a live lookup. */ }
      }
      try {
        // Durable shared preview data keeps public reads off Spark. Revalidate
        // after six hours, or immediately when a newer publish/edit URL arrives.
        // CMS changes actively request the new version, including unpublication.
        const savedVersion = versionTime(saved?.post?.updatedAt || saved?.post?.createdAt) || saved?.checkedAt || 0;
        const fresh = saved && Date.now() - saved.checkedAt < 6 * 60 * 60 * 1000 && requestedVersion <= savedVersion;
        let posts;
        let verifiedLookup = false;
        let dataSource = fresh ? 'cache' : 'firestore';
        if (fresh) posts = saved.post ? [saved.post] : [];
        else {
          try { posts = await findPosts(slug); verifiedLookup = true; }
          catch (error) {
            // Keep the last confirmed public preview available during a quota
            // outage. Do not claim it matches a newer version requested by CMS.
            if (!saved) throw error;
            dataSource = 'quota-fallback';
            posts = saved.post ? [saved.post] : [];
          }
        }
        const local = GADCHIROLI_SPOTLIGHT_STORIES.find(story => story.slug === slug);
        const candidates = posts.length ? posts : !saved && local ? [{ ...local, featuredImage: local.image, authorName: local.author,
          status: 'PUBLISHED', visibility: 'PUBLIC', createdAt: '2026-08-29T08:00:00Z', updatedAt: '2026-08-29T08:00:00Z' }] : [];
        const post = candidates.filter(p => normalizeArticleSlug(p.slug) === slug && isRoutableArticle(p)).sort(newestArticleFirst)[0];
        if (kv && verifiedLookup) {
          // Only values verified from Firestore are persisted. A quota fallback
          // keeps its original timestamp, so it is retried after recovery.
          try { await kv.put(kvKey, JSON.stringify({ post: post || null, checkedAt: Date.now() })); }
          catch { /* Free KV write limits must not turn a valid read into 503. */ }
        }
        if (!post) return reply(notFound, 404);
        // Fetch the current Hosting shell, not a bundled copy with stale asset
        // hashes. Future Firebase deployments need no Worker redeployment.
        const shell = await fetcher(`${FIREBASE_ORIGIN}/index.html`, { signal: AbortSignal.timeout(10000), cache: 'no-store' });
        if (!shell.ok) throw new Error(`Hosting shell HTTP ${shell.status}`);
        let base = await shell.text();
        if (!base.includes('</head>') || !base.includes('id="root"')) throw new Error('Invalid Hosting shell');
        if (url.origin !== SITE_ORIGIN) base = base.replace('</head>', `<base href="${SITE_ORIGIN}/"></head>`);
        const html = await renderArticleSeo(base, post);
        const metadata = { 'X-InfoNews-Preview': dataSource === 'firestore' ? 'live' : 'cached', 'X-InfoNews-Preview-Provider': 'cloudflare-free',
          'X-InfoNews-Data': dataSource,
          'X-InfoNews-Version': String(post.updatedAt || post.createdAt || '') };
        if (cache) {
          try { await cache.put(cacheKey, new Response(html, { headers: { ...metadata, 'Cache-Control': 'public, max-age=60', 'Content-Type': 'text/html; charset=utf-8' } })); }
          catch { /* Rendering does not depend on the cache write succeeding. */ }
        }
        return reply(html, 200, metadata);
      } catch (error) {
        console.error('Article preview unavailable', { slug, message: error.message });
        // Spark quota exhaustion must not take existing published pages offline.
        // This is explicitly marked as the last Hosting version, not live data.
        try {
          const fallback = await fetcher(`${FIREBASE_ORIGIN}/news/${encodeURIComponent(slug)}`, { signal: AbortSignal.timeout(10000) });
          if (fallback.ok && fallback.headers.get('content-type')?.includes('text/html')) {
            const html = await fallback.text();
            if (html.includes('property="og:type" content="article"')) {
              return reply(html, 200, { 'X-InfoNews-Preview': 'static-fallback', 'X-InfoNews-Preview-Provider': 'cloudflare-free' });
            }
          }
        } catch { /* Do not disguise unavailable new content as a homepage. */ }
        return reply('Article temporarily unavailable. Please retry.', 503, { 'Retry-After': '10' });
      }
    },
  };
}
export default createWorker();
