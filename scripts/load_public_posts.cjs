const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, '.firebase', 'seo-posts.json');

// One live snapshot per build keeps redirects, HTML and sitemaps in agreement.
async function loadPublicPosts({ refresh = false } = {}) {
  const { normalizeArticleSlug, isRoutableArticle, newestArticleFirst } = await import('../src/utils/articleUrls.mjs');
  if (!refresh && fs.existsSync(SNAPSHOT)) return JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const { initializeApp, deleteApp } = require('firebase/app');
  const { getFirestore, collection, getDocsFromServer, terminate } = require('firebase/firestore');
  const config = require('../firebase-applet-config.json');
  if (config.projectId !== 'in24-news-platform-6f802') throw new Error('Unexpected Firebase project');
  const app = initializeApp(config, `seo-build-${Date.now()}`);
  const db = getFirestore(app);
  let timer;
  try {
    const snapshot = await Promise.race([
      getDocsFromServer(collection(db, 'posts')),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Firestore SEO snapshot timed out')), 45000); }),
    ]);
    const { resolvePostAuthor } = await import('../src/utils/publicAuthors.mjs');
    const authorSnapshot = await getDocsFromServer(collection(db, 'public_authors'));
    const authors = authorSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    const imported = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/importedWordPressPosts.json'), 'utf8'));
    const importedById = new Map(imported.map(p => [p.id, p]));
    const importedBySlug = new Map(imported.map(p => [normalizeArticleSlug(p.slug), p]));
    const bySlug = new Map();
    snapshot.forEach(doc => {
      const post = resolvePostAuthor({ ...doc.data(), id: doc.id }, authors);
      const slug = normalizeArticleSlug(post.slug);
      const original = importedById.get(post.id) || importedBySlug.get(slug);
      // Firestore is authoritative: never resurrect deleted imports or old slugs.
      if (isRoutableArticle(post)) {
        if (bySlug.has(slug) && newestArticleFirst(bySlug.get(slug), post) <= 0) return;
        bySlug.set(slug, { ...post, slug, _importedFeaturedImage: original?.featuredImage || '' });
      }
    });
    // These existing local public stories are linked by the homepage too.
    const { require: tsRequire } = require('tsx/cjs/api');
    const { GADCHIROLI_SPOTLIGHT_STORIES } = tsRequire('../src/data/gadchiroliSpotlightData.ts', __filename);
    GADCHIROLI_SPOTLIGHT_STORIES.forEach(story => {
      if (!bySlug.has(story.slug)) bySlug.set(story.slug, {
        id: story.id, slug: story.slug, title: story.title, excerpt: story.excerpt,
        featuredImage: story.image, authorName: story.author, status: 'PUBLISHED',
        visibility: 'PUBLIC', createdAt: '2026-08-29T08:00:00Z', updatedAt: '2026-08-29T08:00:00Z',
      });
    });
    const posts = [...bySlug.values()].sort(newestArticleFirst);
    if (!posts.length) throw new Error('Refusing to build an empty published-article snapshot');
    fs.mkdirSync(path.dirname(SNAPSHOT), { recursive: true });
    fs.writeFileSync(SNAPSHOT, JSON.stringify(posts));
    console.log(`SEO snapshot: ${posts.length} public published articles`);
    return posts;
  } finally {
    clearTimeout(timer);
    await terminate(db);
    await deleteApp(app);
  }
}

module.exports = { loadPublicPosts };
