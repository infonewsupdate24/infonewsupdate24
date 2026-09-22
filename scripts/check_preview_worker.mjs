import fs from 'node:fs';
import { setDefaultResultOrder } from 'node:dns';
setDefaultResultOrder('ipv4first');
import worker from '../worker/article-preview.mjs';
const posts = JSON.parse(fs.readFileSync('.firebase/seo-posts.json', 'utf8'));
const origin = process.argv[2];
for (const post of posts.slice(0, 3)) {
  const url = `${origin || 'https://www.infonewsupdate24.com'}/news/${encodeURIComponent(post.slug)}`;
  const response = origin ? await fetch(url, { headers: { 'User-Agent': 'WhatsApp/2.24.1' } }) : await worker.fetch(new Request(url));
  const html = await response.text();
  const image = html.match(/property="og:image" content="([^"]+)"/)?.[1]?.replaceAll('&amp;', '&');
  const imageResponse = image ? await fetch(image, { headers: { 'User-Agent': 'WhatsApp/2.24.1' } }) : null;
  console.log(JSON.stringify({ slug: post.slug, status: response.status, live: response.headers.get('X-InfoNews-Preview'),
    title: html.match(/property="og:title" content="([^"]+)"/)?.[1], imageStatus: imageResponse?.status, imageType: imageResponse?.headers.get('content-type') }));
  if (response.status !== 200 || !['live', 'cached'].includes(response.headers.get('X-InfoNews-Preview')) || imageResponse?.status !== 200) process.exitCode = 1;
}
if (origin) {
  const missing = await fetch(`${origin}/news/preview-nonexistent-check-20260922`);
  console.log(JSON.stringify({ missingStatus: missing.status }));
  if (missing.status !== 404) process.exitCode = 1;
}
