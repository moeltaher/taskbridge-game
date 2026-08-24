import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pages} from '../assets/js/core/routes.js';

const repoRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const runtimeRoot=path.join(repoRoot,'assets','js');
const toRepo=file=>path.relative(repoRoot,file).split(path.sep).join('/');

async function listJs(dir){
 const out=[];
 for(const entry of await fs.readdir(dir,{withFileTypes:true})){
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())out.push(...await listJs(full));
  else if(entry.isFile()&&entry.name.endsWith('.js'))out.push(path.resolve(full));
 }
 return out;
}

function importsFrom(source){
 const specs=[];
 const staticImport=/(?:import|export)\s+(?:[^'";]*?\s+from\s*)?['"]([^'"]+)['"]/g;
 const dynamicImport=/import\(\s*['"]([^'"]+)['"]\s*\)/g;
 for(const re of [staticImport,dynamicImport]){let match;while((match=re.exec(source)))specs.push(match[1])}
 return specs;
}

function resolveLocal(from,spec){
 if(!spec.startsWith('.'))return null;
 const base=path.resolve(path.dirname(from),spec);
 return path.extname(base)?base:`${base}.js`;
}

const all=await listJs(runtimeRoot),allSet=new Set(all);
const seeds=[path.join(runtimeRoot,'core','bootstrap.js'),...Object.keys(pages).map(page=>path.join(runtimeRoot,'pages',`${page}.js`))].map(file=>path.resolve(file));
const missingSeeds=seeds.filter(file=>!allSet.has(file));
if(missingSeeds.length){console.error('Missing runtime entry modules:',missingSeeds.map(toRepo).join(', '));process.exit(1)}

const reachable=new Set(),queue=[...seeds];
while(queue.length){
 const file=queue.shift();if(reachable.has(file))continue;reachable.add(file);
 const source=await fs.readFile(file,'utf8');
 for(const spec of importsFrom(source)){
  const target=resolveLocal(file,spec);if(!target)continue;
  if(!allSet.has(target)){console.error(`Broken local import: ${toRepo(file)} -> ${spec}`);process.exit(1)}
  if(!reachable.has(target))queue.push(target);
 }
}

const orphaned=all.filter(file=>!reachable.has(file)).map(toRepo).sort();
if(orphaned.length){
 console.error('Orphan runtime modules detected. Delete them or connect them to a current route:');
 orphaned.forEach(file=>console.error(` - ${file}`));
 process.exit(1);
}
console.log(`dead-code-check: ${reachable.size} runtime modules reachable; no orphan JavaScript found.`);
