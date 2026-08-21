import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,join,normalize} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const port=Number(process.argv[2]||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8'};

createServer(async(req,res)=>{
  try{
    const rawPath=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const requestPath=rawPath.endsWith('/')?`${rawPath}index.html`:rawPath;
    const safe=normalize(requestPath).replace(/^([.][.][/\\])+/, '').replace(/^[/\\]+/,'');
    const file=join(root,safe||'index.html');
    if(!file.startsWith(root)){res.writeHead(403).end('Forbidden');return}
    const body=await readFile(file);
    res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'});
    res.end(body);
  }catch{
    res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});
    res.end('Not found');
  }
}).listen(port,'127.0.0.1',()=>console.log(`No Boss test server: http://127.0.0.1:${port}`));
