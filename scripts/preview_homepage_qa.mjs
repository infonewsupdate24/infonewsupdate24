// Local-only regression fixture: simulate a returning reader with obsolete data.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
const fixture=`<script>
localStorage.setItem('infonews_db_v7_posts',JSON.stringify([{id:'old-qa',title:'OLD CACHE MUST NOT APPEAR',slug:'old-qa',status:'PUBLISHED',visibility:'PUBLIC',createdAt:'2090-01-01',updatedAt:'2090-01-01'}]));
localStorage.setItem('infonews_homepage_layout_sections_v5_latest_news_standalone',JSON.stringify([{id:'hero',enabled:false,order:99}]));
const seen=[];
new MutationObserver(()=>{
  const root=document.getElementById('public-portal-root');
  const heading=root?.querySelector('h2')?.textContent;
  if(!heading)return;
  const output=document.getElementById('homepage-qa');
  const sample=JSON.stringify({heading,oldCacheVisible:root.textContent.includes('OLD CACHE MUST NOT APPEAR'),feed:[...root.querySelectorAll('h3')].find(e=>/latest news feed/i.test(e.textContent))?.textContent});
  if(seen[seen.length-1]!==sample){seen.push(sample);output.textContent=JSON.stringify(seen);}
}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
</script>`;
http.createServer(async(req,res)=>{
  try {
    const pathname=new URL(req.url,'http://localhost').pathname;
    if(pathname==='/api/homepage'){res.setHeader('Content-Type','application/json');res.end(await fs.readFile('.firebase/homepage.json'));return;}
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    let content=await fs.readFile(file);
    const ext=path.extname(file);
    res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'})[ext]||'application/octet-stream');
    if(pathname==='/')content=Buffer.from(content.toString().replace('</head>',fixture+'</head>').replace('</body>','<output hidden id="homepage-qa"></output></body>'));
    res.end(content);
  } catch {res.writeHead(404);res.end();}
}).listen(4174,'127.0.0.1',()=>console.log('Homepage stale-cache fixture: http://127.0.0.1:4174'));
