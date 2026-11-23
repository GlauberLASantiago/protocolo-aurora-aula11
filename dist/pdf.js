/* Gerador PDF local, sem bibliotecas remotas, telemetria ou submissão de dados. */
'use strict';
(function(root){
 const encMap={8364:128,8218:130,402:131,8222:132,8230:133,8224:134,8225:135,710:136,8240:137,352:138,8249:139,338:140,381:142,8216:145,8217:146,8220:147,8221:148,8226:149,8211:150,8212:151,732:152,8482:153,353:154,8250:155,339:156,382:158,376:159};
 const latin=s=>Array.from(String(s).normalize('NFC')).map(c=>{const n=c.codePointAt(0);return n<256?String.fromCharCode(n):encMap[n]?String.fromCharCode(encMap[n]):'?';}).join('');
 const lit=s=>'('+latin(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)').replace(/[\r\n]/g,' ')+')';
 // Standard Helvetica widths. Accented glyphs use the width of their base letter.
 const widths={a:556,b:556,c:500,d:556,e:556,f:278,g:556,h:556,i:222,j:222,k:500,l:222,m:833,n:556,o:556,p:556,q:556,r:333,s:500,t:278,u:556,v:500,w:722,x:500,y:500,z:500,A:667,B:667,C:722,D:722,E:667,F:611,G:778,H:722,I:278,J:500,K:667,L:556,M:833,N:722,O:778,P:667,Q:778,R:722,S:667,T:611,U:722,V:667,W:944,X:667,Y:667,Z:611,' ':278,'.':278,',':278,':':278,';':278,'!':278,'?':556,'/':278,'-':333,'(':333,')':333};
 function textWidth(s,size,bold=false){return Array.from(String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'')).reduce((a,c)=>a+(widths[c]||556),0)*size/1000*(bold?1.045:1);}
 function wrap(s,max,size,bold=false){const lines=[];for(const paragraph of String(s).split('\n')){if(!paragraph){lines.push('');continue;}let line='';for(const word of paragraph.split(/\s+/)){if(textWidth((line?line+' ':'')+word,size,bold)<=max){line+=(line?' ':'')+word;}else{if(line)lines.push(line);line='';if(textWidth(word,size,bold)>max){for(const c of word){if(textWidth(line+c,size,bold)>max){lines.push(line);line='';}line+=c;}}else line=word;}}if(line)lines.push(line);}return lines;}
 const colors={ink:[.16,.13,.23],muted:[.43,.39,.50],violet:[.38,.25,.57],light:[.94,.92,.97],line:[.83,.79,.88],mint:[.25,.48,.39],white:[1,1,1]};
 function rgb(c){return (colors[c]||c).map(n=>Number(n).toFixed(3)).join(' ');}
 class Doc{
  constructor(){this.pages=[];this.ops=[];this.y=0;this.pageNo=0;this.id='';}
  raw(s){this.ops.push(s);}
  rect(x,y,w,h,color,stroke){this.raw(`${rgb(color)} rg ${stroke?rgb(stroke)+' RG ':''}${x} ${842-y-h} ${w} ${h} re ${stroke?'B':'f'}`);}
  line(x,y,x2,y2,color='line',width=1){this.raw(`${rgb(color)} RG ${width} w ${x} ${842-y} m ${x2} ${842-y2} l S`);}
  text(s,x,y,size=10,bold=false,color='ink'){this.raw(`BT /${bold?'FB':'FR'} ${size} Tf ${rgb(color)} rg 1 0 0 1 ${x.toFixed(2)} ${(842-y).toFixed(2)} Tm ${lit(s)} Tj ET`);}
  block(s,x,y,max,size=10,leading=15,bold=false,color='ink'){const lines=wrap(s,max,size,bold);lines.forEach((l,i)=>this.text(l,x,y+i*leading,size,bold,color));return y+lines.length*leading;}
  newPage(kind='report'){if(this.ops.length)this.pages.push(this.ops.join('\n'));this.ops=[];this.pageNo++;if(kind==='report'){this.rect(0,0,595,73,'ink');this.text('PROTOCOLO AURORA',42,31,12,true,'white');this.text('Relatório de participação e decisões',42,53,9,false,[.82,.77,.91]);this.y=103;}return this;}
  ensure(h){if(this.y+h>760){this.footer();this.newPage();}}
  para(s,{size=10,bold=false,color='ink',gap=8}={}){const lines=wrap(s,507,size,bold);for(const line of lines){this.ensure(size*1.5);this.text(line,44,this.y,size,bold,color);this.y+=size*1.5;}this.y+=gap;}
  heading(s){this.ensure(50);this.y+=7;this.para(s,{size:14,bold:true,color:'violet',gap:10});}
  footer(){this.line(44,782,551,782);this.text(this.id,44,799,8,false,'muted');this.text('Registro local do jogo | '+this.pageNo,407,799,8,false,'muted');}
  finish(){if(this.ops.length)this.pages.push(this.ops.join('\n'));const objects=[null];const add=s=>{objects.push(s);return objects.length-1;};const catalog=add('');const pageTree=add('');const regular=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');const bold=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');const pageIds=[];for(const content of this.pages){const stream=add('<< /Length '+content.length+' >>\nstream\n'+content+'\nendstream');pageIds.push(add(`<< /Type /Page /Parent ${pageTree} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /FR ${regular} 0 R /FB ${bold} 0 R >> >> /Contents ${stream} 0 R >>`));}objects[catalog]=`<< /Type /Catalog /Pages ${pageTree} 0 R >>`;objects[pageTree]=`<< /Type /Pages /Kids [${pageIds.map(n=>n+' 0 R').join(' ')}] /Count ${pageIds.length} >>`;const info=add(`<< /Title ${lit('Protocolo Aurora - Comprovante e relatório')} /Creator ${lit('Protocolo Aurora - gerador local')} >>`);let out='%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';const offsets=[0];objects.slice(1).forEach((o,i)=>{offsets.push(out.length);out+=(i+1)+' 0 obj\n'+o+'\nendobj\n';});const start=out.length;out+='xref\n0 '+objects.length+'\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('');out+=`trailer\n<< /Size ${objects.length} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${start}\n%%EOF`;return Uint8Array.from(out,c=>c.charCodeAt(0)&255);}
 }
 function formatDate(iso,time=false){return new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'long',year:'numeric',...(time?{hour:'2-digit',minute:'2-digit'}:{})}).format(new Date(iso));}
 function createParticipationPdf(s,rooms){
  if(s.results.filter(Boolean).length!==6)throw Error('Conclua as seis salas antes de emitir o comprovante.');
  if(!s.name.trim())throw Error('Informe o nome do participante.');
  const doc=new Doc(),completed=s.completedAt||new Date().toISOString();doc.id=s.id;
  doc.newPage('certificate');
  doc.rect(0,0,595,842,'white');doc.rect(23,23,549,796,'white','line');doc.rect(23,23,549,11,'violet');
  doc.text('PROTOCOLO',51,72,11,true,'violet');doc.text('AURORA',51,101,26,true,'ink');doc.text('LABORATÓRIO DE DECISÕES COM IA',51,124,8,false,'muted');
  // Abstract laboratory motif, not an institutional seal.
  doc.line(464,72,519,127,'line',1.2);doc.line(519,72,464,127,'line',1.2);doc.rect(479,87,25,25,'light','violet');
  doc.line(51,151,544,151,'line');doc.text('REGISTRO DE CONCLUSÃO DO PERCURSO',51,183,9,true,'violet');
  doc.text('Comprovante de',51,224,28,true);doc.text('participação',51,259,28,true);
  doc.text('Este documento registra a participação de',51,304,11,false,'muted');
  const nameLines=wrap(s.name,480,24,true);let ny=344;nameLines.forEach(l=>{doc.text(l,51,ny,24,true,'violet');ny+=31;});
  let y=Math.max(397,ny+19);
  y=doc.block('no jogo Protocolo Aurora, com exploração das seis salas e registro de decisões sobre criatividade, autoria, automação, fontes, curadoria pedagógica e gestão de projetos com inteligência artificial.',51,y,480,11,18)+13;
  y=doc.block('Percurso concluído em '+formatDate(completed)+'.',51,y,480,11,18,true)+12;
  doc.rect(51,y,493,76,'light');doc.text('PERCURSO',68,y+24,8,true,'muted');doc.text('6 salas concluídas',68,y+48,13,true,'violet');doc.text('MODALIDADE',299,y+24,8,true,'muted');doc.text(s.team?'Discussão em grupo':'Individual',299,y+48,13,true,'violet');y+=102;
  doc.block('Base de estudo: Guia da Aula 11 - Laboratório Criativo de Inteligência Artificial para Mídias Multiplataformas, de 17 de novembro de 2026.',51,y,480,9,14,false,'muted');
  doc.line(51,704,544,704,'line');doc.text('IDENTIFICADOR DA PARTIDA',51,728,8,true,'muted');doc.text(s.id,51,749,12,true,'violet');doc.block('Comprovante gerado localmente pelo jogo, sem assinatura ou validação institucional. Não atribui carga horária, créditos acadêmicos ou certificação de domínio. O relatório a seguir detalha as escolhas registradas.',51,772,480,8,12,false,'muted');
  doc.newPage();doc.heading('Identificação e percurso');
  doc.para('Participante: '+s.name,{bold:true});doc.para('Partida: '+s.id);doc.para('Início: '+formatDate(s.startedAt||completed,true)+' (horário de Brasília).');doc.para('Conclusão do percurso: '+formatDate(completed,true)+' (horário de Brasília).');doc.para('Arquivo emitido em: '+formatDate(new Date().toISOString(),true)+' (horário de Brasília).');
  doc.para('Modalidade: '+(s.team?'discussão em grupo; comprovante individual das decisões compartilhadas.':'individual.'));
  doc.para('Conclusão das salas: 6 de 6. Rodadas de decisão registradas: '+s.attempts.reduce((a,n)=>a+n,0)+'.');
  const avg=Math.round(s.results.reduce((a,r)=>a+r.score,0)/6);doc.para('Síntese das decisões finais: '+avg+'/100. A pontuação é uma devolutiva didática e não equivale a nota ou medida de domínio.',{color:'muted'});
  doc.heading('Como ler este registro');doc.para('O relatório reúne as escolhas da última rodada avaliada de cada sala e a quantidade de revisões. A participação é reconhecida pela conclusão do percurso, independentemente da pontuação. Consultar o guia e revisar escolhas são parte da experiência.');doc.para('Todas as fontes do caso, personagens e respostas da IA no jogo são fictícios. Nenhum código foi executado em uma conta real. Os dados foram armazenados apenas neste navegador e neste arquivo.');
  doc.heading('Síntese por sala');rooms.forEach((m,i)=>{doc.para((i+1)+'. '+m.title+' | '+s.results[i].score+'/100 | '+s.attempts[i]+' rodada(s)',{size:10,bold:true,gap:3});doc.para(m.concept+' - '+m.ref+' do guia.',{size:9,color:'muted',gap:9});});
  for(let i=0;i<rooms.length;i++){const m=rooms[i],r=s.results[i];doc.ensure(140);doc.heading((i+1)+'. '+m.title);doc.para(m.question,{bold:true});doc.para('Última decisão avaliada em '+formatDate(r.at,true)+'. Pontuação: '+r.score+'/100. Rodadas: '+s.attempts[i]+'.',{size:9,color:'muted'});doc.para('Escolhas registradas',{bold:true});for(const selection of r.selection)doc.para('- '+selection,{size:10,gap:5});doc.para('Devolutiva: '+r.title+' '+r.summary,{size:10});for(const detail of (r.details||[]))doc.para('- '+detail,{size:9,gap:4});doc.para('Conexão com o guia: '+m.insight,{size:9,color:'muted',gap:16});}
  doc.ensure(100);doc.heading('Reflexão pessoal');doc.para(s.reflection.trim()||'O participante optou por não registrar uma reflexão pessoal. Esta etapa é facultativa e não recebe pontuação.');doc.ensure(130);doc.heading('Fonte e limites do comprovante');doc.para('Base: Guia de estudos - Aula 11, Laboratório Criativo de Inteligência Artificial para Mídias Multiplataformas, de 17/11/2026, fornecido pelo docente. O jogo adapta conceitos e cria um caso fictício para exploração.');doc.para('Este arquivo é um registro autogerado da partida. Não possui assinatura digital, consulta pública de autenticidade ou validação institucional. O identificador serve para relacionar as páginas e os registros desta partida. Não equivale a certificado emitido pela universidade.',{size:9,color:'muted'});doc.footer();return doc.finish();
 }
 root.AuroraPDF={create:createParticipationPdf};
})(globalThis);
function downloadPdf(){try{save();const bytes=AuroraPDF.create(state,missions);const blob=new Blob([bytes],{type:'application/pdf'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Comprovante_Protocolo_Aurora_'+state.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_').slice(0,65)+'_'+state.id+'.pdf';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('PDF gerado. Confira o arquivo nos downloads do navegador.');}catch(err){toast('Não foi possível gerar o PDF: '+err.message);}}
