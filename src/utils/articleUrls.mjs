export const SITE_ORIGIN = 'https://www.infonewsupdate24.com';
export const PUBLISHED_ROBOTS = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
export const PRIVATE_ROBOTS = 'noindex,nofollow';
export const ARTICLE_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80';

export function normalizeArticleSlug(value) {
  let slug = String(value || '').trim();
  try { slug = decodeURIComponent(slug); } catch { /* Malformed URLs must not crash routing. */ }
  return slug.replace(/^\/+|\/+$/g, '').normalize('NFC');
}

export function articleUrl(slug) {
  return `${SITE_ORIGIN}/news/${encodeURIComponent(normalizeArticleSlug(slug))}`;
}

export function isPublicArticle(post) {
  const status = String(post.status || '').toUpperCase();
  const schedule = post.scheduleDate || post.scheduledDate;
  const scheduledAt = schedule?.seconds ? schedule.seconds * 1000 : Date.parse(schedule);
  return ['PUBLISHED', 'PUBLISH'].includes(status) &&
    String(post.visibility || 'PUBLIC').toUpperCase() === 'PUBLIC' &&
    !post.isDeleted && !post.isTest && !post.isQa &&
    (!Number.isFinite(scheduledAt) || scheduledAt <= Date.now());
}

export function isRoutableArticle(post) {
  const slug = normalizeArticleSlug(post.slug);
  return isPublicArticle(post) && Boolean(slug && post.title) &&
    !/[\/?#\\\u0000-\u001f]/.test(slug) && slug !== '.' && slug !== '..' &&
    !/^(test-persistence|live-acceptance)(-|$)/i.test(slug);
}

export function isIndexableArticle(post) {
  // Publication state is authoritative, including posts with stale SEO flags.
  return isRoutableArticle(post);
}

export function articleRobots(post, lookupPending = false) {
  if (post) return isIndexableArticle(post) ? PUBLISHED_ROBOTS : PRIVATE_ROBOTS;
  // An unresolved or failed lookup is not evidence that an article is missing.
  return lookupPending ? null : PRIVATE_ROBOTS;
}

export function newestArticleFirst(a, b) {
  const date = p => {
    const value = p.updatedAt || p.publishedAt || p.publishDate || p.createdAt;
    return value?.seconds ? value.seconds * 1000 : Date.parse(value) || 0;
  };
  return date(b) - date(a) || String(a.id).localeCompare(String(b.id));
}
