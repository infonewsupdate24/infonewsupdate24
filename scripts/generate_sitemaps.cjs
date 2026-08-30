const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = 'C:\\Users\\ASUS\\antigravity\\Remix-infonewsupdate24';
const IMPORTED_POSTS_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'importedWordPressPosts.json');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');

const GLOBAL_STABLE_EPOCH = '2026-08-29T00:00:00.000Z';

function extractStableDate(post) {
  const candidate = post.updatedAt || post.publishedAt || post.publishDate || post.createdAt;
  if (!candidate) return GLOBAL_STABLE_EPOCH;

  if (typeof candidate === 'object') {
    if (typeof candidate.toDate === 'function') return candidate.toDate().toISOString();
    if (candidate.seconds) return new Date(candidate.seconds * 1000).toISOString();
  }

  const parsed = new Date(candidate);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return GLOBAL_STABLE_EPOCH;
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generateAll() {
  console.log('🚀 Generating Sitemaps & RSS Feeds...');

  // 1. Load Base Posts
  let basePosts = [];
  if (fs.existsSync(IMPORTED_POSTS_PATH)) {
    basePosts = JSON.parse(fs.readFileSync(IMPORTED_POSTS_PATH, 'utf8'));
  }

  // 2. Fetch live Firestore Cloud Posts if available
  let cloudPosts = [];
  try {
    const { initializeApp } = require(path.join(PROJECT_ROOT, 'node_modules', 'firebase', 'app'));
    const { getFirestore, collection, getDocs } = require(path.join(PROJECT_ROOT, 'node_modules', 'firebase', 'firestore'));
    const config = require(path.join(PROJECT_ROOT, 'firebase-applet-config.json'));
    const app = initializeApp(config, 'sitemap-builder-' + Date.now());
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'posts'));
    snap.forEach(d => cloudPosts.push({ id: d.id, ...d.data() }));
    console.log(`✅ Loaded ${cloudPosts.length} posts from Firestore cloud`);
  } catch (err) {
    console.warn(`⚠️ Cloud fetch skipped or offline, using base posts: ${err.message}`);
  }

  // 3. Deduplicate
  const postsMap = new Map();
  basePosts.forEach(p => postsMap.set(p.id, p));
  cloudPosts.forEach(p => postsMap.set(p.id, p));

  const now = Date.now();
  const validPublishedPosts = [];

  for (const post of postsMap.values()) {
    if (post.isDeleted === true || post.status === 'TRASH' || post.status === 'DRAFT') continue;
    if (post.scheduledDate) {
      const sch = new Date(post.scheduledDate).getTime();
      if (!isNaN(sch) && sch > now) continue;
    }
    if (!post.status || post.status === 'PUBLISHED' || post.status === 'publish') {
      if (post.slug && post.title) {
        validPublishedPosts.push(post);
      }
    }
  }

  // Sort by date desc
  validPublishedPosts.sort((a, b) => {
    const da = new Date(a.publishDate || a.createdAt || 0).getTime();
    const db = new Date(b.publishDate || b.createdAt || 0).getTime();
    return db - da;
  });

  console.log(`✅ Total Valid PUBLISHED Posts: ${validPublishedPosts.length}`);

  // Ensure public & feed dir exists
  const feedDir = path.join(PUBLIC_DIR, 'feed');
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  if (!fs.existsSync(feedDir)) fs.mkdirSync(feedDir, { recursive: true });

  // 4. Build sitemap.xml
  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
  sitemapXml += `  <url>\n    <loc>https://www.infonewsupdate24.com/</loc>\n    <lastmod>${GLOBAL_STABLE_EPOCH}</lastmod>\n    <changefreq>always</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  const categories = [
    'maharashtra', 'gadchiroli', 'politics', 'crime', 'agriculture',
    'stock-market', 'jobs', 'education', 'technology', 'sports', 'entertainment'
  ];
  for (const cat of categories) {
    sitemapXml += `  <url>\n    <loc>https://www.infonewsupdate24.com/category/${cat}</loc>\n    <lastmod>${GLOBAL_STABLE_EPOCH}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  }

  // Static Pages
  const pages = ['about-us', 'privacy-policy', 'contact-us', 'terms-and-conditions'];
  for (const p of pages) {
    sitemapXml += `  <url>\n    <loc>https://www.infonewsupdate24.com/page/${p}</loc>\n    <lastmod>${GLOBAL_STABLE_EPOCH}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
  }

  for (const post of validPublishedPosts) {
    const postUrl = `https://www.infonewsupdate24.com/${encodeURIComponent(post.slug)}/`;
    const lastMod = extractStableDate(post);
    sitemapXml += `  <url>\n    <loc>${escapeXml(postUrl)}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n`;
    if (post.featuredImage) {
      sitemapXml += `    <image:image>\n      <image:loc>${escapeXml(post.featuredImage)}</image:loc>\n      <image:title>${escapeXml(post.title)}</image:title>\n    </image:image>\n`;
    }
    sitemapXml += `  </url>\n`;
  }
  sitemapXml += `</urlset>\n`;

  // 5. Build sitemap-news.xml (Articles from past 48 hours, or top 10 recent)
  const recentNews = validPublishedPosts.slice(0, 10);
  let newsSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;
  for (const post of recentNews) {
    const postUrl = `https://www.infonewsupdate24.com/${encodeURIComponent(post.slug)}/`;
    const pubDate = extractStableDate(post);
    newsSitemapXml += `  <url>\n    <loc>${escapeXml(postUrl)}</loc>\n    <news:news>\n      <news:publication>\n        <news:name>InfoNewsUpdate24</news:name>\n        <news:language>mr</news:language>\n      </news:publication>\n      <news:publication_date>${pubDate}</news:publication_date>\n      <news:title>${escapeXml(post.title)}</news:title>\n    </news:news>\n  </url>\n`;
  }
  newsSitemapXml += `</urlset>\n`;

  // 6. Build RSS 2.0 Feed XML
  const rssList = validPublishedPosts.slice(0, 25);
  let rssXml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n`;
  rssXml += `    <title>InfoNewsUpdate24 | महाराष्ट्र व गडचिरोली ताज्या मराठी बातम्या</title>\n`;
  rssXml += `    <link>https://www.infonewsupdate24.com/</link>\n`;
  rssXml += `    <atom:link href="https://www.infonewsupdate24.com/feed/" rel="self" type="application/rss+xml" />\n`;
  rssXml += `    <description>सत्य, अचूक आणि वेगवान बातम्यांचे विश्वासार्ह व्यासपीठ</description>\n`;
  rssXml += `    <language>mr</language>\n`;
  rssXml += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;

  for (const post of rssList) {
    const postUrl = `https://www.infonewsupdate24.com/${encodeURIComponent(post.slug)}/`;
    const pubDate = new Date(post.publishDate || post.createdAt || GLOBAL_STABLE_EPOCH).toUTCString();
    const excerpt = post.excerpt || post.content?.substring(0, 250) || post.title;
    rssXml += `    <item>\n      <title>${escapeXml(post.title)}</title>\n      <link>${escapeXml(postUrl)}</link>\n      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>\n      <pubDate>${pubDate}</pubDate>\n      <dc:creator>${escapeXml(post.authorName || 'InfoNews24 Desk')}</dc:creator>\n      <description>${escapeXml(excerpt)}</description>\n`;
    if (post.featuredImage) {
      rssXml += `      <enclosure url="${escapeXml(post.featuredImage)}" type="image/jpeg" length="0" />\n`;
    }
    rssXml += `    </item>\n`;
  }
  rssXml += `  </channel>\n</rss>\n`;

  // Write files to public/
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-news.xml'), newsSitemapXml, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'feed.xml'), rssXml, 'utf8');
  fs.writeFileSync(path.join(feedDir, 'index.html'), rssXml, 'utf8');
  fs.writeFileSync(path.join(feedDir, 'index.xml'), rssXml, 'utf8');

  console.log('✅ Generated public/sitemap.xml');
  console.log('✅ Generated public/sitemap-news.xml');
  console.log('✅ Generated public/feed.xml, public/feed/index.html & public/feed/index.xml (Canonical RSS 2.0)');
}

generateAll().catch(err => {
  console.error('Error generating sitemaps:', err);
  process.exit(1);
});
