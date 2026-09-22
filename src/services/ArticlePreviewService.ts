import type { Post } from '../types';
import { articleUrl, isRoutableArticle, isPublicArticle } from '../utils/articleUrls.mjs';
import { getSeoImageUrl, normalizePublicImageUrl } from '../utils/articleSeo.mjs';

export type PreviewResult = { ready: boolean; message: string; url: string; live?: boolean };

export function verifyPreviewImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const finish = (error?: string) => {
      clearTimeout(timer);
      image.onload = image.onerror = null;
      if (error) reject(new Error(error)); else resolve();
    };
    const timer = setTimeout(() => finish('फोटो तपासणीला वेळ लागला. पुन्हा तपासा.'), 12000);
    image.onload = () => finish(image.naturalWidth < 200 || image.naturalHeight < 200
      ? 'Preview साठी किमान 200 × 200 pixels चा फोटो निवडा.' : undefined);
    image.onerror = () => finish('Thumbnail फोटो उघडत नाही. नवीन फोटो upload करून पुन्हा तपासा.');
    image.src = url;
  });
}

export async function validatePublishImage(post: Pick<Post, 'featuredImage'>): Promise<void> {
  if (!normalizePublicImageUrl(post.featuredImage)) {
    throw new Error('Publish करण्यापूर्वी उपलब्ध HTTPS featured image निवडा.');
  }
  await verifyPreviewImage(getSeoImageUrl(post));
}

// Used by the shared save path, including quick edit and bulk publication.
export async function preparePublishImage(post: Post): Promise<string> {
  if (!isPublicArticle(post)) return post.featuredImage;
  if (!isRoutableArticle(post)) throw new Error('Publish करण्यापूर्वी बातमीचे शीर्षक आणि योग्य slug भरा.');
  let featuredImage = post.featuredImage || '';
  if (featuredImage.startsWith('data:image/')) {
    const { dataUrlToBlob, uploadMediaBlobToStorage } = await import('./MediaStorageService');
    const blob = dataUrlToBlob(featuredImage);
    const uploaded = await uploadMediaBlobToStorage(blob, `preview-${Date.now()}.webp`, blob.type);
    featuredImage = uploaded.downloadUrl;
  }
  await validatePublishImage({ featuredImage });
  return featuredImage;
}

export async function refreshArticlePreview(post: Pick<Post, 'slug' | 'updatedAt'>): Promise<void> {
  // The Worker verifies public data itself; never send article text or trust a
  // browser-supplied publication status. A newer version refreshes the cache.
  try {
    await fetch(`${articleUrl(post.slug)}?v=${encodeURIComponent(post.updatedAt || new Date().toISOString())}`, {
      cache: 'no-store', signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    console.warn('Public preview refresh pending', error);
  }
}

export async function checkArticlePreview(post: Post): Promise<PreviewResult> {
  const url = articleUrl(post.slug);
  if (!isRoutableArticle(post)) return { ready: false, url, message: 'ही बातमी सध्या सार्वजनिकरीत्या प्रकाशित नाही.' };
  try {
    const response = await fetch(`${url}?v=${encodeURIComponent(post.updatedAt || post.createdAt || '')}`, {
      cache: 'no-store', signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`बातमीची सार्वजनिक लिंक अजून तयार नाही (HTTP ${response.status}).`);
    const html = new DOMParser().parseFromString(await response.text(), 'text/html');
    const meta = (key: string) => html.querySelector(`meta[property="${key}"],meta[name="${key}"]`)?.getAttribute('content');
    if (meta('infonews:post-id') !== post.id || meta('infonews:post-version') !== (post.updatedAt || post.createdAt || '')) {
      throw new Error('सार्वजनिक preview अजून या बातमीच्या नवीन आवृत्तीशी जुळत नाही.');
    }
    if (meta('og:title') !== (post.seo?.seoTitle || post.title) || meta('og:url') !== url || meta('og:image') !== getSeoImageUrl(post)) {
      throw new Error('Preview मधील शीर्षक किंवा thumbnail अद्ययावत नाही.');
    }
    await verifyPreviewImage(meta('og:image')!);
    return { ready: true, url, live: response.headers.get('X-InfoNews-Preview-Provider') === 'cloudflare-free' || response.headers.get('X-InfoNews-Preview') === 'live',
      message: 'WhatsApp preview तपासले: नवीन शीर्षक, लिंक आणि thumbnail उपलब्ध आहेत.' };
  } catch (error) {
    return { ready: false, url, message: error instanceof Error ? error.message : 'Preview तपासणी पूर्ण झाली नाही.' };
  }
}
