import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Runs the real decision engine with a minimal DOM host. No browser state is modified.
const fake={innerHTML:'',textContent:'',setAttribute(){},focus(){}};
const sandbox={document:{querySelector:()=>fake,addEventListener(){},visibilityState:'visible'},window:{scrollTo(){},addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},setInterval(){},setTimeout(){},clearTimeout(){},Date,Math,Intl,Uint8Array,console};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(new URL('../dist/pdf.js',import.meta.url),'utf8'),sandbox);
const run=code=>vm.runInContext(code,sandbox);
run("state.name='Participante de Demonstração';state.started=true;state.startedAt=new Date().toISOString();");
const selections=[
 "state.drafts.prompt=['intent','context','repertoire','criteria']",
 "state.drafts.code=[3,4,5];state.drafts.plan=1",
 "state.drafts.claims=[0,2,4]",
 "state.drafts.pedagogy=1;state.drafts.reading=0",
 "state.drafts.eap=['0','1','2','3','0','1','3','2']",
 "state.drafts.schedule=[1,2,4,5,6,6];state.drafts.risk=0"
];
assert.throws(()=>run('AuroraPDF.create(state,missions)'),/seis salas/);
for(let i=0;i<6;i++){
 run('state.room='+i+';'+selections[i]);
 assert.equal(run('ready(state.room)'),true);
 assert.equal(run('evaluate(state.room).score'),100,'A coherent solution must be recognized in room '+i);
 run('recordResult(evaluate(state.room))');
}
assert.equal(run('done()'),6);
assert.ok(run('state.completedAt'));
assert.equal(run('checkSchedule([1,2,3,4,5,6])[1].ok'),false,'Unavailable recording week must be caught');
assert.equal(run('checkSchedule([1,2,4,4,5,6])[0].ok'),false,'Editing cannot begin in the same week as recording');
assert.equal(run('checkSchedule([1,1,4,5,6,6])[0].ok'),false,'The case requires research before the script');
assert.equal(run('checkSchedule([1,2,4,5,5,6])[2].ok'),false,'Weekly capacity must not be exceeded');
assert.equal(run('checkSchedule([1,2,4,5,6,6]).every(c=>c.ok)'),true,'Review and publication may share a week');
assert.equal(run('checkSchedule([1,2,4,5,6,7])[3].ok'),false,'The deadline must be checked');
run("state.room=0;state.drafts.prompt=['length','role','delegate','spectacle']");
assert.equal(run('evaluate(0).score'),0,'A long, decontextualized instruction is not automatically stronger');
const previous=run('state.attempts[0]');run('recordResult(evaluate(0))');
assert.equal(run('state.results[0].score'),0,'The final record must use the latest assessed decision');
assert.equal(run('state.attempts[0]'),previous+1);
assert.equal(run('done()'),6,'Participation remains complete regardless of score');
const bytes=run('AuroraPDF.create(state,missions)');
assert.equal(Buffer.from(bytes).subarray(0,8).toString(),'%PDF-1.4');
assert.ok(Buffer.from(bytes).includes(Buffer.from('xref')));
assert.ok(bytes.length>10000);
const temp=new URL('../tmp/pdfs/',import.meta.url);fs.mkdirSync(temp,{recursive:true});fs.writeFileSync(new URL('engine-test.pdf',temp),bytes);
run("state.name='Maria da Conceição Gonçalves de Albuquerque e Vasconcelos Santiago';state.reflection='Reflexão com acentuação: ação, evidência, criação. '.repeat(35).slice(0,1800)");
fs.writeFileSync(new URL('long-name-test.pdf',temp),run('AuroraPDF.create(state,missions)'));
run("state.name='   '");
assert.throws(()=>run('AuroraPDF.create(state,missions)'),/nome/);
console.log('OK: six rooms, alternative decisions, revisions, capacity, dependencies, deadline and PDF generation.');
