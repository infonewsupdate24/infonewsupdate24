const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const DIST_INDEX = path.join(DIST_DIR, 'index.html');
const { loadPublicPosts } = require('./load_public_posts.cjs');
const SITE_ORIGIN = 'https://www.infonewsupdate24.com';

// Kept as async wrappers so this CommonJS build script shares the runtime renderer.
let setTitle, setMeta;


async function renderArticleSeo(baseHtml, post) {
  const renderer = await import("../src/utils/articleSeo.mjs");
  return renderer.renderArticleSeo(baseHtml, post);
}

async function main() {
  ({ setTitle, setMeta } = await import('../src/utils/articleSeo.mjs'));
  if (!fs.existsSync(DIST_INDEX)) {
    throw new Error('dist/index.html not found. Run this as npm postbuild after Vite build.');
  }

  const baseHtml = fs.readFileSync(DIST_INDEX, 'utf8');
  const posts = await loadPublicPosts();
  const { normalizeArticleSlug, articleUrl, PRIVATE_ROBOTS } = await import('../src/utils/articleUrls.mjs');
  const hosting = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'firebase.json'), 'utf8')).hosting;
  delete hosting.predeploy;
  const redirects = [...hosting.redirects];

  let generated = 0;
  for (const post of posts) {
    const slug = normalizeArticleSlug(post.slug);
    const canonical = articleUrl(slug);
    const html = await renderArticleSeo(baseHtml, post);
    const outDir = path.join(DIST_DIR, 'news', slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
    // Exact published destinations only; missing slugs must remain HTTP 404.
    const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    redirects.push({ regex: '^/(?:article/|post/|[0-9]{4}/[0-9]{2}/(?:[0-9]{2}/)?)?' + escapedSlug + '/?$', destination: canonical, type: 301 });
    generated += 1;
  }

  hosting.redirects = redirects;
  const sourceConfig = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'firebase.json'), 'utf8'));
  fs.writeFileSync(path.join(PROJECT_ROOT, 'firebase.hosting.generated.json'), JSON.stringify({
    hosting, ...(sourceConfig.functions ? { functions: sourceConfig.functions } : {}),
  }, null, 2) + '\n');
  let notFound = setTitle(baseHtml, 'Article Not Found | InfoNewsUpdate24');
  notFound = notFound.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<meta\s+[^>]*(?:property=["']og:[^"']+["']|name=["']twitter:[^"']+["'])[^>]*>/gi, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');
  for (const name of ['robots', 'googlebot', 'googlebot-news']) notFound = setMeta(notFound, 'name', name, PRIVATE_ROBOTS);
  notFound = setMeta(notFound, 'name', 'title', 'Article Not Found | InfoNewsUpdate24');
  notFound = setMeta(notFound, 'name', 'description', 'The requested article could not be found.');
  fs.writeFileSync(path.join(DIST_DIR, '404.html'), notFound);
  let privateHtml = setTitle(notFound, 'Private area | InfoNewsUpdate24');
  privateHtml = setMeta(privateHtml, 'name', 'description', 'Private area');
  fs.writeFileSync(path.join(DIST_DIR, 'private.html'), privateHtml);
  for (const route of ['admin', 'cms', 'login']) {
    const directory = path.join(DIST_DIR, route);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, 'index.html'), privateHtml);
  }
  console.log(
    `✅ Generated ${generated} crawler-readable article SEO pages with matching legacy 301 redirects`
  );
}

module.exports = { renderArticleSeo };

if (require.main === module) main().catch((error) => {
  console.error('❌ Article SEO page generation failed:', error);
  process.exit(1);
});
