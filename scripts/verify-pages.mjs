import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';
const args=process.argv.slice(2),i=args.indexOf('--directory');
const root=path.resolve(i<0?path.join(path.dirname(fileURLToPath(import.meta.url)),'..'):args[i+1]);
const catalog=JSON.parse(fs.readFileSync(path.join(root,'library-catalog.json'),'utf8'));
let total=0,max=0;const errors=[];
function count(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','_site','node_modules'].includes(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())count(p);else{const n=fs.statSync(p).size;total+=n;max=Math.max(max,n)}}}count(root);
for(const d of catalog.documents){assert(d.readUrl?.startsWith('./pdfs/'),'Missing local PDF path: '+d.title);const file=path.join(root,decodeURIComponent(d.readUrl));assert(fs.existsSync(file),'Missing PDF: '+file);const raw=fs.readFileSync(file),bytes=d.gzip?gunzipSync(raw):raw;assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert(raw.length<100*1024*1024,'PDF asset too large for regular Git');}
const pages=fs.readdirSync(root).filter(n=>n.endsWith('.html'));
for(const name of pages){const html=fs.readFileSync(path.join(root,name),'utf8');assert(html.includes('<base data-pages-base'),'Missing base-path support: '+name);assert(html.includes('mailto:ceo@aestus.ltd'));assert(!/\b(?:src|href)="\/(?!\/)/.test(html.replace(/<base[^>]*>/,'')),'Root-relative asset/link breaks project sites: '+name);for(const m of html.matchAll(/\b(?:src|href)="([^"#]+)"/g)){const url=m[1];if(/^(?:https?:|mailto:|data:|\/|#)/.test(url))continue;const file=decodeURIComponent(url.split(/[?#]/)[0]);if(!fs.existsSync(path.join(root,file)))errors.push(name+': '+url)}}
assert.equal(errors.length,0,errors.join('\n'));
assert(!fs.readFileSync(path.join(root,'library.js'),'utf8').includes('/api/'),'Server API remains in static reader');
assert(fs.existsSync(path.join(root,'.nojekyll')));assert(total<1000*1000*1000,'Site exceeds GitHub Pages 1 GB limit');
console.log(JSON.stringify({pages:pages.length,pdfs:catalog.documents.length,totalMB:Math.round(total/1048576),maxFileMB:Math.round(max/1048576),brokenLinks:errors.length,backendRequired:false}));
