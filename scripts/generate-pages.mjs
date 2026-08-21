import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {pages} from '../assets/js/core/routes.js';
import {APP_NAME,APP_VERSION} from '../assets/js/core/config.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const checkOnly=process.argv.includes('--check');

function rootShell(){return `<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="theme-color" content="#0d2742">\n<title>${APP_NAME} v${APP_VERSION}</title>\n<link rel="stylesheet" href="./assets/css/base.css">\n<link rel="stylesheet" href="./assets/css/layout.css">\n<link rel="stylesheet" href="./assets/css/components.css">\n<link rel="stylesheet" href="./assets/css/game.css">\n</head>\n<body data-page="home">\n<div class="app" id="app"></div>\n<script type="module" src="./assets/js/core/bootstrap.js"></script>\n</body>\n</html>\n`}

function routeShell(id,page){return `<!doctype html>\n<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0d2742"><title>${page.title} | ${APP_NAME} v${APP_VERSION}</title><link rel="stylesheet" href="../assets/css/base.css"><link rel="stylesheet" href="../assets/css/layout.css"><link rel="stylesheet" href="../assets/css/components.css"><link rel="stylesheet" href="../assets/css/game.css"></head><body data-page="${id}"><div class="app" id="app"></div><script type="module" src="../assets/js/core/bootstrap.js"></script></body></html>\n`}

const expected=new Map([['index.html',rootShell()]]);
for(const [id,page] of Object.entries(pages)){
 if(id==='home')continue;
 expected.set(`${page.slug}/index.html`,routeShell(id,page));
}

let drift=false;
for(const [relative,content] of expected){
 const path=resolve(root,relative);
 if(checkOnly){
  if(!existsSync(path)||readFileSync(path,'utf8')!==content){console.error(`Route shell drift: ${relative}`);drift=true}
 }else writeFileSync(path,content,'utf8');
}

if(drift)process.exitCode=1;
else console.log(checkOnly?'Route shells match the route manifest':'Route shells generated from the route manifest');
