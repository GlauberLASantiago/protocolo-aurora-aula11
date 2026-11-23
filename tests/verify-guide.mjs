import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const libraryHost={innerHTML:'',dataset:{},open:false,showModal(){this.open=true;},setAttribute(){},focus(){}};
const sandbox={document:{querySelector:()=>libraryHost,addEventListener(){}},window:{scrollTo(){},addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},setInterval(){},setTimeout(){},clearTimeout(){},Date,Math,Intl,Uint8Array};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(new URL('../dist/guide.js',import.meta.url),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8'),sandbox);
const run=s=>vm.runInContext(s,sandbox);
const source=fs.readFileSync(new URL('../content/guia-aula-11.html',import.meta.url),'utf8');
const rich=run('GUIDE_HTML');
for(const tag of ['table','thead','tbody','tr','th','td','h1','h2','h3','h4','svg','details','summary']){
 const count=s=>(s.match(new RegExp('<'+tag+'(?=\\s|>)','gi'))||[]).length;
 assert.equal(count(rich),count(source),'Preserve every original '+tag+' element');
}
assert.equal(run('GUIDE_SECTIONS.length'),13);
assert.doesNotMatch(rich,/<(?:script|iframe|object|embed)\b|\son\w+\s*=|javascript:/i);
run("library('full')");
assert.equal(libraryHost.dataset.view,'full');
assert.equal((libraryHost.innerHTML.match(/<table\b/g)||[]).length,3,'Render real tables, not escaped markup or plain text');
assert.equal((libraryHost.innerHTML.match(/<details\b/g)||[]).length,7,'Retain the six expandable answer explanations plus the section navigator');
assert.match(libraryHost.innerHTML,/Cronograma simplificado/);
assert.match(libraryHost.innerHTML,/Prompt contextualizado/);
assert.match(libraryHost.innerHTML,/Utilização assistiva/);
assert.match(libraryHost.innerHTML,/scope="col"/);
assert.match(libraryHost.innerHTML,/role="region"/);
run("library('glossary')");
assert.equal(libraryHost.dataset.view,'glossary');
assert.match(libraryHost.innerHTML,/<dl class="glossary">/);
console.log('OK: original guide structures, 3 rendered tables, 13 sections, expandable answers and glossary.');
