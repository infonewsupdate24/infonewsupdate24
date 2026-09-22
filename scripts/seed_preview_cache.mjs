// Seed only the last verified public snapshot. No credentials or private fields.
import fs from 'node:fs';
import { FIELDS } from '../worker/article-preview.mjs';
import { isRoutableArticle } from '../src/utils/articleUrls.mjs';
const snapshotPath = '.firebase/seo-posts.json';
const posts = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
const checkedAt = fs.statSync(snapshotPath).mtimeMs;
const entries = posts.filter(isRoutableArticle).map(post => ({
  key: `article:${post.slug}`,
  value: JSON.stringify({ checkedAt, post: Object.fromEntries(['id', ...FIELDS].filter(key => post[key] !== undefined).map(key => [key, post[key]])) }),
}));
fs.mkdirSync('build/preview-cache', { recursive: true });
fs.writeFileSync('build/preview-cache/seed.json', JSON.stringify(entries));
console.log(`Prepared ${entries.length} public preview entries from last verified snapshot (${new Date(checkedAt).toISOString()}).`);
