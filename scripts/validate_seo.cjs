const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const escape = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

async function main() {
  const { articleUrl, normalizeArticleSlug, isIndexableArticle } = await import('../src/utils/articleUrls.mjs');
  assert.equal(normalizeArticleSlug('/%E0%A4%AE%E0%A4%B0%E0%A4%BE%E0%A4%A0%E0%A5%80/'), 'मराठी');
  assert.doesNotThrow(() => normalizeArticleSlug('%invalid'));
  assert.equal(isIndexableArticle({ slug: '../x', title: 'x', status: 'PUBLISHED' }), false);
  for (const fields of [{status:'DRAFT'}, {status:'REVIEW_PENDING'}, {isDeleted:true}, {visibility:'PRIVATE'}, {indexable:false}, {scheduleDate:'2099-01-01'}]) {
    assert.equal(isIndexableArticle({slug:'example',title:'Example',status:'PUBLISHED',...fields}), false);
  }
  const posts = JSON.parse(read('.firebase/seo-posts.json'));
  const config = JSON.parse(read('firebase.hosting.generated.json')).hosting;
  assert(!config.predeploy, 'Deploy must use the validated build without rebuilding it');
  assert(!config.rewrites.some(r => r.source === '**'), 'Missing paths must retain HTTP 404');
  assert.match(read('dist/index.html'), /Breaking News Portal<\/title>/);
  const sitemap = read('dist/sitemap.xml');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  assert.equal(new Set(urls).size, urls.length);
  assert(urls.every(u => /^https:\/\/www\.infonewsupdate24\.com\/(?:$|news\/|category\/|page\/)/.test(u) && !/[?#]/.test(u)));
  assert.equal(urls.filter(u => u.includes('/news/')).length, posts.filter(isIndexableArticle).length);
  for (const post of posts) {
    const canonical = articleUrl(post.slug);
    assert.equal(urls.includes(canonical), isIndexableArticle(post));
    const html = read(`dist/news/${post.slug}/index.html`);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    assert(html.includes(`<title>${escape(post.seo?.seoTitle || post.title)}</title>`));
    assert(html.includes(`rel="canonical" href="${canonical}"`));
    for (const tag of ['og:title','og:description','og:image','og:url','twitter:card','twitter:title','twitter:description','twitter:image']) {
      assert(new RegExp(`(?:name|property)="${tag}" content="[^"]+"`).test(html), `${post.slug}: missing ${tag}`);
    }
    assert(html.includes(`property="og:url" content="${canonical}"`));
    assert(html.includes('property="og:type" content="article"'));
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json" data-infonews-static-article-seo>(.*?)<\/script>/s)[1]);
    for (const key of ['@context','headline','description','image','datePublished','dateModified','author','publisher','mainEntityOfPage']) assert(schema[key], key);
    assert.equal(schema['@type'], 'NewsArticle');
    assert.equal(schema.mainEntityOfPage['@id'], canonical);
    assert.equal(schema.publisher.logo.url, 'https://www.infonewsupdate24.com/icon-512.svg');
    assert(!schema.image[0].endsWith('.svg'));
    if (post.featuredImage?.startsWith('https://') && !post.featuredImage.startsWith('https://infonewsupdate24.com/')) assert.equal(schema.image[0], new URL(post.featuredImage).href);
    for (const legacy of [`/${post.slug}`, `/${post.slug}/`, `/article/${post.slug}`, `/2024/05/20/${post.slug}/`]) {
      const rule = config.redirects.find(r => r.regex && new RegExp(r.regex).test(legacy));
      assert(rule && rule.type === 301 && rule.destination === canonical, legacy);
    }
    assert(!fs.existsSync(path.join(ROOT, 'dist', post.slug, 'index.html')), 'Duplicate legacy HTML');
  }
  const missing = '/definitely-nonexistent-seo-check-20260906';
  assert(!config.redirects.some(r => r.regex && new RegExp(r.regex).test(missing)));
  const notFound = read('dist/404.html');
  assert.match(notFound, /<title>Article Not Found/);
  assert(!notFound.includes('rel="canonical"'));
  assert(!notFound.includes('property="og:title"'));
  assert.match(notFound, /name="robots" content="noindex, follow"/);
  assert.match(read('dist/robots.txt'), /Sitemap: https:\/\/www\.infonewsupdate24\.com\/sitemap.xml/);
  console.log(`PASS: ${posts.length} article HTML pages, metadata, schemas, exact redirects, sitemap, robots and 404 output`);
}
main().catch(error => { console.error(error); process.exit(1); });
