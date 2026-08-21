import {readdirSync} from 'node:fs';
import {dirname,extname,join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const roots=['assets/js','scripts','tests'];
const extensions=new Set(['.js','.mjs']);

function filesUnder(directory){
 return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
  const path=join(directory,entry.name);
  return entry.isDirectory()?filesUnder(path):extensions.has(extname(entry.name))?[path]:[];
 });
}

const files=roots.flatMap(path=>filesUnder(resolve(root,path))).sort();
for(const file of files)execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
console.log(`JavaScript syntax checks passed (${files.length} files)`);
