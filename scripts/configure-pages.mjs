import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),option=(key,fallback)=>{const i=args.indexOf(key);return i<0?fallback:args[i+1]};
const rawBase=option('--base-path',process.env.PAGES_BASE_PATH||'/');
const base='/'+rawBase.split('/').filter(Boolean).join('/')+(rawBase.split('/').filter(Boolean).length?'/':'');
const siteUrl=option('--site-url',process.env.PAGES_BASE_URL||'https://aestus.ltd').replace(/\/$/,'')+'/';
const output=path.resolve(option('--output',path.join(root,'_site')));
if(output===root||!output.startsWith(root+path.sep))throw Error('Build output must be a child folder of the static project.');
fs.mkdirSync(output,{recursive:true});
const excluded=new Set(['.git','.github','scripts','node_modules','_site','outputs','README.md','package.json','package-lock.json','.gitignore','static-export-report.json']);
for(const entry of fs.readdirSync(root,{withFileTypes:true})){if(excluded.has(entry.name)||path.join(root,entry.name)===output)continue;fs.cpSync(path.join(root,entry.name),path.join(output,entry.name),{recursive:true});}
const pages=fs.readdirSync(output).filter(n=>n.endsWith('.html'));
for(const name of pages){let html=fs.readFileSync(path.join(output,name),'utf8');
 html=html.replace(/<base data-pages-base href="[^"]*">/,'<base data-pages-base href="'+base+'">');
 html=html.replace(/https:\/\/aestus-inc\.bubbly-clove-4865\.chatgpt\.site\//g,siteUrl);
 if(name!=='404.html')html=html.replace(/<link rel="canonical" href="[^"]*">/,'<link rel="canonical" href="'+new URL(name==='index.html'?'':name,siteUrl).href+'">');
 html=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(_,text)=>{const data=JSON.parse(text);data.url=siteUrl;return '<script type="application/ld+json">'+JSON.stringify(data)+'</script>'});
 fs.writeFileSync(path.join(output,name),html);
}
fs.writeFileSync(path.join(output,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+new URL('sitemap.xml',siteUrl).href+'\n');
fs.writeFileSync(path.join(output,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.filter(n=>n!=='404.html').map(n=>'<url><loc>'+new URL(n==='index.html'?'':n,siteUrl).href+'</loc></url>').join('')+'</urlset>\n');
console.log(JSON.stringify({output,basePath:base,siteUrl}));
