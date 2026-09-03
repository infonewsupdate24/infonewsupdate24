const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const DIST_INDEX = path.join(DIST_DIR, 'index.html');
const IMPORTED_POSTS_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'importedWordPressPosts.json');
const SITE_ORIGIN = 'https://www.infonewsupdate24.com';

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function normalizePublicImageUrl(value) {
  const img = String(value || '').trim();
  if (!img) return '';

  // Social crawlers require a fetchable public URL. Never emit inline/local-only sources.
  if (/^(data:|blob:|javascript:|file:)/i.test(img)) return '';

  if (/^https?:\/\//i.test(img)) {
    try {
      const parsed = new URL(img);
      if (parsed.protocol !== 'https:') return '';

      // The retired non-WWW WordPress host returns "Site Not Found". Never
      // expose it to WhatsApp; use this article's canonical media mirror below.
      if (parsed.hostname.toLowerCase() === 'infonewsupdate24.com') return '';

      return parsed.href;
    } catch (_) {
      return '';
    }
  }
  if (img.startsWith('//')) return `https:${img}`;
  if (img.startsWith('/')) return `${SITE_ORIGIN}${img}`;

  // Existing imported media can be stored as a site-relative path without a leading slash.
  if (!/^[a-z][a-z0-9+.-]*:/i.test(img)) {
    return `${SITE_ORIGIN}/${img.replace(/^\/+/, '')}`;
  }

  return '';
}

function getSeoImageUrl(post) {
  const candidates = [
    post.featuredImage,
    post.featuredImageUrl,
    post.imageUrl,
    post.seo?.ogImage,
    post.seo?.image,
    post.seo?.socialImage,
    post._importedFeaturedImage,
  ];

  for (const candidate of candidates) {
    const normalized = normalizePublicImageUrl(candidate);
    if (normalized) return normalized;
  }

  return `${SITE_ORIGIN}/icon-512.svg`;
}

function getImageMimeType(imageUrl) {
  try {
    const pathname = new URL(imageUrl).pathname.toLowerCase();

    if (pathname.endsWith('.webp')) return 'image/webp';
    if (pathname.endsWith('.png')) return 'image/png';
    if (pathname.endsWith('.gif')) return 'image/gif';
    if (pathname.endsWith('.avif')) return 'image/avif';
    if (pathname.endsWith('.svg')) return 'image/svg+xml';
    if (pathname.endsWith('.jpeg') || pathname.endsWith('.jpg')) return 'image/jpeg';
  } catch (_) {}

  // Cloudinary URLs can include transformation segments and sometimes omit a useful extension.
  if (/res\.cloudinary\.com/i.test(imageUrl)) {
    if (/f_webp/i.test(imageUrl) || /\.webp(?:$|\?)/i.test(imageUrl)) return 'image/webp';
    if (/f_png/i.test(imageUrl) || /\.png(?:$|\?)/i.test(imageUrl)) return 'image/png';
    if (/f_avif/i.test(imageUrl) || /\.avif(?:$|\?)/i.test(imageUrl)) return 'image/avif';
    if (/f_jpg|f_jpeg/i.test(imageUrl) || /\.(?:jpe?g)(?:$|\?)/i.test(imageUrl)) return 'image/jpeg';
  }

  return 'image/jpeg';
}

function toIso(value, fallback) {
  if (value && typeof value === 'object' && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (value && typeof value === 'object' && value.seconds) {
    return new Date(value.seconds * 1000).toISOString();
  }
  const date = new Date(value || fallback || Date.now());
  return Number.isNaN(date.getTime()) ? new Date(fallback || Date.now()).toISOString() : date.toISOString();
}

function textExcerpt(post) {
  const raw =
    post.seo?.metaDescription ||
    post.excerpt ||
    post.summary ||
    post.content ||
    post.title ||
    '';
  return String(raw)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

function setTitle(html, value) {
  const tag = `<title>${escapeHtml(value)}</title>`;
  return /<title>[\s\S]*?<\/title>/i.test(html)
    ? html.replace(/<title>[\s\S]*?<\/title>/i, tag)
    : html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function setMeta(html, keyType, key, content) {
  const escaped = escapeHtml(content);
  const keyEsc = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<meta\\s+[^>]*${keyType}=["']${keyEsc}["'][^>]*>`, 'i');
  const tag = `<meta ${keyType}="${key}" content="${escaped}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function setCanonical(html, href) {
  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;
  const re = /<link\s+[^>]*rel=["']canonical["'][^>]*>/i;
  return re.test(html) ? html.replace(re, tag) : html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function injectArticleJsonLd(html, data) {
  const block = `  <script type="application/ld+json" data-infonews-static-article-seo>${safeJson(data)}</script>\n`;
  return html.replace(/<\/head>/i, `${block}</head>`);
}

async function loadPosts() {
  let importedPosts = [];
  if (fs.existsSync(IMPORTED_POSTS_PATH)) {
    importedPosts = JSON.parse(fs.readFileSync(IMPORTED_POSTS_PATH, 'utf8'));
  }

  let cloudPosts = [];
  try {
    const { initializeApp } = require(path.join(PROJECT_ROOT, 'node_modules', 'firebase', 'app'));
    const { getFirestore, collection, getDocs } = require(path.join(PROJECT_ROOT, 'node_modules', 'firebase', 'firestore'));
    const config = require(path.join(PROJECT_ROOT, 'firebase-applet-config.json'));
    const app = initializeApp(config, `article-seo-builder-${Date.now()}`);
    const db = getFirestore(app);
    const snapshot = await getDocs(collection(db, 'posts'));
    snapshot.forEach((doc) => cloudPosts.push({ id: doc.id, ...doc.data() }));
    console.log(`✅ SEO pages: loaded ${cloudPosts.length} Firestore posts`);
  } catch (error) {
    console.warn(`⚠️ SEO pages: Firestore fetch skipped; using imported posts: ${error.message}`);
  }

  const bySlug = new Map();
  importedPosts.forEach((post) => {
    const slug = normalizeSlug(post.slug);
    if (slug) bySlug.set(slug, { ...post, slug });
  });
  cloudPosts.forEach((post) => {
    const slug = normalizeSlug(post.slug);
    if (slug) {
      const importedPost = bySlug.get(slug);
      bySlug.set(slug, {
        ...importedPost,
        ...post,
        slug,
        _importedFeaturedImage:
          importedPost?._importedFeaturedImage || importedPost?.featuredImage || '',
      });
    }
  });

  const now = Date.now();
  return [...bySlug.values()].filter((post) => {
    const status = String(post.status || '').toUpperCase();
    const visibility = String(post.visibility || 'PUBLIC').toUpperCase();
    const scheduledValue = post.scheduleDate || post.scheduledDate;
    if (!post.slug || !post.title) return false;
    if (post.isDeleted === true || post.isTest === true || post.isQa === true) return false;
    if (post.indexable === false || post.seo?.indexable === false) return false;
    if (status !== 'PUBLISHED' && status !== 'PUBLISH') return false;
    if (visibility !== 'PUBLIC') return false;
    if (/^(test-persistence|live-acceptance)(-|$)/i.test(post.slug)) return false;
    if (scheduledValue) {
      const scheduledAt = new Date(scheduledValue).getTime();
      if (!Number.isNaN(scheduledAt) && scheduledAt > now) return false;
    }
    return true;
  });
}

async function main() {
  if (!fs.existsSync(DIST_INDEX)) {
    throw new Error('dist/index.html not found. Run this as npm postbuild after Vite build.');
  }

  const baseHtml = fs.readFileSync(DIST_INDEX, 'utf8');
  const posts = await loadPosts();

  let generated = 0;
  for (const post of posts) {
    const slug = normalizeSlug(post.slug);
    const canonical = `${SITE_ORIGIN}/${encodeURIComponent(slug)}/`;
    const title = post.seo?.seoTitle || post.title;
    const fullTitle = `${title} | InfoNewsUpdate24`;
    const description = textExcerpt(post) || post.title;
    const image = getSeoImageUrl(post);
    const imageType = getImageMimeType(image);
    const imageAlt = post.featuredImageAlt || post.title;
    const published = toIso(post.publishDate || post.publishedAt || post.createdAt);
    const modified = toIso(
      post.updatedAt || post.publishedAt || post.publishDate || post.createdAt,
      published
    );

    let html = baseHtml;
    html = setTitle(html, fullTitle);
    html = setMeta(html, 'name', 'title', title);
    html = setMeta(html, 'name', 'description', description);
    html = setMeta(html, 'property', 'og:type', 'article');
    html = setMeta(html, 'property', 'og:url', canonical);
    html = setMeta(html, 'property', 'og:site_name', 'InfoNewsUpdate24');
    html = setMeta(html, 'property', 'og:locale', 'mr_IN');
    html = setMeta(html, 'property', 'og:title', title);
    html = setMeta(html, 'property', 'og:description', description);
    html = setMeta(html, 'property', 'og:image', image);
    html = setMeta(html, 'property', 'og:image:secure_url', image);
    html = setMeta(html, 'property', 'og:image:type', imageType);
    html = setMeta(html, 'property', 'og:image:alt', imageAlt);
    html = setMeta(html, 'property', 'article:published_time', published);
    html = setMeta(html, 'property', 'article:modified_time', modified);
    html = setMeta(html, 'name', 'twitter:card', 'summary_large_image');
    html = setMeta(html, 'name', 'twitter:title', title);
    html = setMeta(html, 'name', 'twitter:description', description);
    html = setMeta(html, 'name', 'twitter:image', image);
    html = setCanonical(html, canonical);

    html = injectArticleJsonLd(html, {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonical,
      },
      headline: title,
      description,
      image: [image],
      datePublished: published,
      dateModified: modified,
      author: {
        '@type': 'Person',
        name: post.authorName || 'InfoNewsUpdate24 विशेष प्रतिनिधी',
      },
      publisher: {
        '@type': 'NewsMediaOrganization',
        name: 'InfoNewsUpdate24',
        url: `${SITE_ORIGIN}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_ORIGIN}/icon-512.svg`,
          width: 512,
          height: 512,
        },
      },
      inLanguage: 'mr-IN',
    });

    const outDir = path.join(DIST_DIR, slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
    generated += 1;
  }

  console.log(`✅ Generated ${generated} crawler-readable article SEO pages in dist/<slug>/index.html`);
}

main().catch((error) => {
  console.error('❌ Article SEO page generation failed:', error);
  process.exit(1);
});
