import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const rootDefault=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),option=(key,fallback)=>{const i=args.indexOf(key);return i<0?fallback:args[i+1]};
const root=path.resolve(option('--directory',rootDefault)),port=Number(option('--port','4173'));
const rawBase=option('--base-path','/'),base='/'+rawBase.split('/').filter(Boolean).join('/')+(rawBase.split('/').filter(Boolean).length?'/':'');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.pdf':'application/pdf','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.wasm':'application/wasm','.bcmap':'application/octet-stream','.pfb':'application/octet-stream','.ttf':'font/ttf'};
http.createServer((req,res)=>{let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end();return}
 if(!pathname.startsWith(base)){res.writeHead(404);res.end('Not found');return}
 let target=path.resolve(root,pathname.slice(base.length)||'index.html');
 if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
 let status=200;
 if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
 if(!fs.existsSync(target)){target=path.join(root,'404.html');status=404}
 if(!fs.existsSync(target)){res.writeHead(404);res.end('Not found');return}
 const length=fs.statSync(target).size,headers={'Content-Type':types[path.extname(target)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
 const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
 if(range&&status===200){const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),length-1):length-1;if(start>=length||end<start){res.writeHead(416,{'Content-Range':'bytes */'+length});res.end();return}res.writeHead(206,{...headers,'Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${length}`});if(req.method==='HEAD')res.end();else fs.createReadStream(target,{start,end}).pipe(res);return}
 res.writeHead(status,{...headers,'Content-Length':length});if(req.method==='HEAD')res.end();else fs.createReadStream(target).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`Static preview: http://127.0.0.1:${port}${base}`));
