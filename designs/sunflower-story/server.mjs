import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const filename = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!filename.startsWith(root + path.sep) && filename !== path.join(root,'index.html')) { res.writeHead(403); res.end(); return; }
    const body = await readFile(filename);
    res.writeHead(200, {'Content-Type': types[path.extname(filename)] || 'application/octet-stream'}); res.end(body);
  } catch {res.writeHead(404); res.end('Not found');}
}).listen(5175,'127.0.0.1',()=>console.log('Sunflower Story: http://127.0.0.1:5175'));


