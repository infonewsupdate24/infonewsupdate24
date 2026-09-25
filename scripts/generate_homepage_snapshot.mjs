import fs from 'node:fs/promises';
import { loadHomepage, injectHomepage } from '../worker/homepage.mjs';
const cached = process.argv.includes('--cached');
const snapshot = cached ? JSON.parse(await fs.readFile('.firebase/homepage.json','utf8')) : await loadHomepage();
await fs.mkdir('.firebase',{recursive:true});
await fs.writeFile('.firebase/homepage.json',JSON.stringify(snapshot));
const path = 'dist/index.html';
await fs.writeFile(path,injectHomepage(await fs.readFile(path,'utf8'),snapshot));
console.log(`Prepared ${cached ? 'last verified (not fresh)' : 'verified'} homepage: ${snapshot.posts.length} published articles, ${snapshot.sections.length} sections.`);
