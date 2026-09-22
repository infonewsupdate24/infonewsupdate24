import { renderArticleSeo } from '../src/utils/articleSeo.mjs';
import { normalizeArticleSlug, isRoutableArticle, newestArticleFirst } from '../src/utils/articleUrls.mjs';

export function createArticleHandler({ baseHtml, notFoundHtml, findPosts, localStories = [], logger = console }) {
  return async (req, res) => {
    res.set('Cache-Control', 'private, no-store, max-age=0');
    res.set('X-Content-Type-Options', 'nosniff');
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.set('Allow', 'GET, HEAD');
      return res.status(405).send('Method not allowed');
    }
    const match = String(req.path || '').match(/^\/news\/([^/]+)\/?$/);
    let slug;
    try { slug = match && decodeURIComponent(match[1]).normalize('NFC'); } catch { slug = null; }
    if (!slug || normalizeArticleSlug(slug) !== slug || /[\/?#\\\u0000-\u001f]/.test(slug) || ['.', '..'].includes(slug) || slug.length > 500) {
      return res.status(404).type('html').send(notFoundHtml);
    }
    try {
      const posts = await findPosts(slug);
      // Admin SDK bypasses rules, so explicitly filter publication and visibility.
      // Never resurrect a local story over a private/deleted database record.
      const candidates = posts.length ? posts : localStories.filter(p => p.slug === slug);
      const post = candidates.filter(p => normalizeArticleSlug(p.slug) === slug && isRoutableArticle(p)).sort(newestArticleFirst)[0];
      if (!post) return res.status(404).type('html').send(notFoundHtml);
      const html = await renderArticleSeo(baseHtml, post);
      res.set('X-InfoNews-Preview', 'live');
      return res.status(200).type('html').send(html);
    } catch (error) {
      logger.error('Article preview lookup failed', { slug, message: error.message });
      // A transient backend failure must not become a cached missing-article page.
      res.set('Retry-After', '10');
      return res.status(503).type('text').send('Article temporarily unavailable. Please retry.');
    }
  };
}
