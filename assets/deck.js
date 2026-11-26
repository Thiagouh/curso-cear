{
const COL={bg:'#0B1020',p1:'#141B33',p2:'#1B2442',ln:'#2A355C',tx:'#EAF0FF',mu:'#8A94B8',dim:'#5A6488',cy:'#22D3EE',am:'#F59E0B',vi:'#8B5CF6',gr:'#34D399',rd:'#F87171',pk:'#F472B6',or:'#FB923C',ye:'#FACC15'};
/* [número, nome curto, cor, nome completo] */
const BLK=[null,['00','Introdução','tx','Introdução'],['01','Dados','cy','Dados & Datasets'],['02','Regressão','am','Regressão Linear'],['03','Classificação','pk','KNN, Árvores & Random Forest'],['04','Clustering','gr','K-Means & Clustering'],['05','Visão','or','Visão Computacional'],['06','LLMs','vi','Modelos de Linguagem (LLMs)'],['07','Desafio','ye','Desafio Final']];
const MODS=[2,3,4,5,6,7,8];
const CFG=window.DECK||{day:1},DAY=CFG.day===2?2:1;
const DAYMODS=DAY===1?[2,3,4]:[5,6,7,8],OTHER=DAY===1?[5,6,7,8]:[2,3,4];
BLK[1]=DAY===1?['00','Introdução','tx','Introdução']:['00','Abertura','tx','Abertura do dia 2'];
const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
const fmt=(v,d=2)=>v.toFixed(d).replace('.',',');
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function gauss(r){let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function mapper(x,y,w,h,x0,x1,y0,y1){return{X:v=>x+(v-x0)/(x1-x0)*w,Y:v=>y+h-(v-y0)/(y1-y0)*h,ix:px=>x0+(px-x)/w*(x1-x0),iy:py=>y0+(y+h-py)/h*(y1-y0)}}
function axes(m,x,y,w,h,xl,yl){return `<path d="M${x} ${y} V${y+h} H${x+w}" fill="none" stroke="${COL.dim}" stroke-width="2"/>`+(xl?`<text x="${x+w}" y="${y+h+32}" text-anchor="end" font-size="18" fill="${COL.mu}">${xl}</text>`:'')+(yl?`<text x="${x}" y="${y-12}" font-size="18" fill="${COL.mu}">${yl}</text>`:'')}

/* ---------- fórmulas em LaTeX (MathJax SVG; sem MathJax, fica o texto original) ---------- */
const tn=v=>String(v).replace(/,/g,'{,}').replace(/\./g,'{.}');
const hasTex=()=>!!(window.MathJax&&MathJax.tex2svg);
function TX(tex,fallback){if(!hasTex())return fallback;try{return MathJax.tex2svg('\\displaystyle '+tex,{display:false}).outerHTML}catch(e){return fallback}}
function texAll(){if(!hasTex())return;$$('[data-tex]').forEach(el=>{if(el.dataset.done)return;try{el.replaceChildren(MathJax.tex2svg('\\displaystyle '+el.dataset.tex,{display:false}));el.dataset.done=1}catch(e){}})}
const stage=$('#stage'),slides=$$('.s');
const FX={};let FITD=null;

/* ---------- shared image (visão computacional) ---------- */
const PAT7=['              ','              ','  .########.  ','  ##########  ','         .##  ','         ##.  ','        .##   ','        ##.   ','       .##    ','       ##.    ','      .##     ','      ##.     ','      ##      ','              '];
const IMG=new Float32Array(196);
function loadPat(){PAT7.forEach((row,r)=>[...row].forEach((ch,c)=>IMG[r*14+c]={' ':0,'.':.45,'#':1}[ch]))}
loadPat();
const KER={v:[[-1,0,1],[-2,0,2],[-1,0,1]],h:[[-1,-2,-1],[0,0,0],[1,2,1]],blur:[[1,1,1],[1,1,1],[1,1,1]].map(r=>r.map(v=>v/9)),sharp:[[0,-1,0],[-1,5,-1],[0,-1,0]]};
function conv(src,n,k){const m=n-2,o=new Float32Array(m*m);for(let r=0;r<m;r++)for(let c=0;c<m;c++){let s=0;for(let i=0;i<3;i++)for(let j=0;j<3;j++)s+=src[(r+i)*n+c+j]*k[i][j];o[r*m+c]=s}return o}

/* ---------- module illustrations (viewBox 0 0 400 240) ---------- */
function ill(b){const c=COL[BLK[b][2]];let h='';
 if(b===2){for(let r=0;r<5;r++)for(let k=0;k<4;k++){const t=k===3,x=34+k*86,y=22+r*40;h+=`<rect x="${x}" y="${y}" width="76" height="32" rx="7" fill="${t?COL.am:(r?COL.p2:c)}" fill-opacity="${r?(t?.22:1):.5}"/>`;if(r)h+=`<rect x="${x+12}" y="${y+13}" width="${20+((r*7+k*13)%30)}" height="6" rx="3" fill="${t?COL.am:COL.mu}" opacity=".7"/>`}}
 else if(b===3){const P=[[40,196],[85,168],[130,182],[175,138],[220,130],[265,100],[310,98],[355,60]],Y=x=>214-(x-16)*.46;P.forEach(([x,y])=>h+=`<rect x="${x}" y="${Math.min(y,Y(x))}" width="${Math.abs(y-Y(x))}" height="${Math.abs(y-Y(x))}" fill="${c}" fill-opacity=".16"/><line x1="${x}" y1="${y}" x2="${x}" y2="${Y(x)}" stroke="${c}" stroke-width="3"/>`);h+=`<line x1="16" y1="${Y(16)}" x2="384" y2="${Y(384)}" stroke="${COL.cy}" stroke-width="5"/>`;P.forEach(([x,y])=>h+=`<circle cx="${x}" cy="${y}" r="9" fill="${COL.tx}"/>`)}
 else if(b===4){const A=[[70,70],[110,124],[56,156],[140,56],[96,196],[168,150]],B=[[262,58],[312,110],[344,172],[282,192],[232,104],[334,44]],q=[200,120];
  const nn=[...A.map(p=>[p,0]),...B.map(p=>[p,1])].sort((u,v)=>Math.hypot(u[0][0]-q[0],u[0][1]-q[1])-Math.hypot(v[0][0]-q[0],v[0][1]-q[1])).slice(0,3);
  h+=`<circle cx="200" cy="120" r="${Math.hypot(nn[2][0][0]-200,nn[2][0][1]-120)+16}" fill="${c}" fill-opacity=".08" stroke="${c}" stroke-width="2.5" stroke-dasharray="9 7"/>`;nn.forEach(([p])=>h+=`<line x1="200" y1="120" x2="${p[0]}" y2="${p[1]}" stroke="${COL.mu}" stroke-width="2" stroke-dasharray="5 5"/>`);
  A.forEach(([x,y])=>h+=`<circle cx="${x}" cy="${y}" r="11" fill="${COL.cy}"/>`);B.forEach(([x,y])=>h+=`<path d="M${x} ${y-13}L${x+13} ${y+9}L${x-13} ${y+9}Z" fill="${COL.am}"/>`);h+=`<text x="200" y="135" text-anchor="middle" font-size="44" fill="${c}">★</text>`}
 else if(b===5){const r=rng(2),C=[[100,80],[300,70],[205,180]],CC=[COL.cy,COL.am,c];C.forEach(([cx,cy],j)=>{for(let i=0;i<11;i++)h+=`<circle cx="${cx+gauss(r)*26}" cy="${cy+gauss(r)*22}" r="7" fill="${CC[j]}" opacity=".85"/>`;h+=`<g transform="translate(${cx},${cy})"><circle r="17" fill="${COL.bg}" stroke="${CC[j]}" stroke-width="4"/><path d="M-9 0H9M0 -9V9" stroke="${CC[j]}" stroke-width="4"/></g>`})}
 else if(b===6){const S=15,ox=95,oy=15;h+=`<rect x="${ox-2}" y="${oy-2}" width="${14*S+3}" height="${14*S+3}" rx="4" fill="${COL.ln}"/>`;PAT7.forEach((row,r)=>[...row].forEach((ch,k)=>{const v={' ':0,'.':.45,'#':1}[ch];h+=`<rect x="${ox+k*S}" y="${oy+r*S}" width="${S-1}" height="${S-1}" fill="${v?c:COL.p1}" fill-opacity="${v?v:1}"/>`}));h+=`<rect x="${ox-6}" y="${oy+5*S}" width="${14*S+11}" height="${3*S}" fill="none" stroke="${COL.tx}" stroke-width="2.5" stroke-dasharray="7 5"/>`}
 else if(b===7){const T=['O','céu','hoje','está','azul'];let x=25;const cx=[];T.forEach(t=>{const w=22+t.length*13;cx.push(x+w/2);h+=`<rect x="${x}" y="160" width="${w}" height="46" rx="23" fill="${c}" fill-opacity="${t==='azul'?.6:.18}" stroke="${c}" stroke-width="2.5"/><text x="${x+w/2}" y="190" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="17">${t}</text>`;x+=w+8});
  [0,1,2,3].forEach(i=>{const x1=cx[4],x2=cx[i],hh=30+Math.abs(x1-x2)*.45;h+=`<path d="M${x1} 156 C${x1} ${156-hh} ${x2} ${156-hh} ${x2} 156" fill="none" stroke="${c}" stroke-width="${[1.5,6,2,3][i]}" opacity="${[.4,1,.5,.7][i]}"/>`})}
 else if(b===8){[100,72,44,16].forEach((r,i)=>h+=`<circle cx="200" cy="124" r="${r}" fill="${i%2?COL.bg:c}" fill-opacity="${i%2?1:.25+i*.2}" stroke="${c}" stroke-width="3"/>`);h+=`<path d="M340 30 L214 114" stroke="${COL.tx}" stroke-width="5"/><path d="M340 30 l-4 22 M340 30 l-22 4" stroke="${COL.tx}" stroke-width="5"/><circle cx="210" cy="117" r="7" fill="${COL.tx}"/>`}
 return h}

/* ---------- chrome: module label, number, labs ---------- */
const minsOf=s=>{const m=(s.dataset.notes||'').match(/\((\d+) min\)/);return m?+m[1]:0};
const modMin={},modLabs={},firstOf={};
const isBreak=s=>s.dataset.pause&&!s.dataset.label;
let breakMin=0;
slides.forEach((s,i)=>{const b=+s.dataset.b;if(isBreak(s))breakMin+=+s.dataset.pause;else modMin[b]=(modMin[b]||0)+minsOf(s);if(!(b in firstOf))firstOf[b]=i;
  if(s.dataset.lab){const num=s.dataset.lab.split('|')[0];(modLabs[b]=modLabs[b]||[]).push((num==='04'?'Desafio ':'Lab ')+num)}});
slides.forEach((s,i)=>{
  const b=+s.dataset.b;s.style.setProperty('--acc',COL[(BLK[b]||[0,0,'cy'])[2]]);
  if(b&&!s.classList.contains('sec')){const B=BLK[b];const d=document.createElement('div');d.className='blk '+B[2];
    d.innerHTML=b>1?`<span class="mods">${MODS.map(k=>`<i class="${k===b?'on':k<b?'done':''}"></i>`).join('')}</span>MÓDULO ${B[0]} · ${B[3].toUpperCase()}`:`<span class="mods">${MODS.map(k=>`<i class="${DAY===2&&k<5?'done':''}"></i>`).join('')}</span>DIA ${DAY} · ${B[3].toUpperCase()}`;
    if(!s.dataset.nochrome)s.prepend(d)}
  if(s.classList.contains('sec')){const B=BLK[b];
    const items=s.dataset.items.split(';').map(t=>t.startsWith('lab:')?`<div class="labchip">▸ ${t.slice(4)}</div>`:`<div>${t}</div>`).join('');
    const map=`<div class="dayh">Dia ${DAY}</div>`+DAYMODS.map(k=>`<div class="${k===b?'now':k<b?'past':''}"><span class="mono">${BLK[k][0]}</span><span>${BLK[k][3]}</span><span class="mono" style="font-size:16px">${k<b?'✓':''}</span></div>`).join('')+`<div class="dayh" style="margin-top:10px">Dia ${3-DAY}</div><div class="other">${OTHER.map(k=>BLK[k][0]+' '+BLK[k][1]).join(' · ')}</div>`;
    s.insertAdjacentHTML('beforeend',`<div class="secL"><div class="kick">Módulo</div><div class="secn">${B[0]}</div><h1>${B[3]}</h1><div class="q">${s.dataset.q}</div><div class="items">${items}</div></div><div class="secR"><svg class="ill" viewBox="0 0 400 240">${ill(b)}</svg><div class="map">${map}</div></div>`)}
  const n=document.createElement('div');n.className='num';n.textContent=String(i+1).padStart(2,'0');s.append(n);
  if(s.dataset.lab){const [num,name,file,mins,c]=s.dataset.lab.split('|');const col=COL[c];
    const steps=s.dataset.steps.split(';').map(x=>x.split('|'));
    s.insertAdjacentHTML('beforeend',`<div class="side" style="background:${col}"><div class="lbl" style="letter-spacing:.4em">${num==='04'?'Desafio':'Lab'}</div><div class="n">${num}</div><h3>${name}</h3><div class="file" style="color:${col}">${file}</div><div class="t">Google Colab</div></div>
    <div class="steps" style="color:${col}"><div class="rail" style="background:${col}"></div>${steps.map((st,k)=>`<div class="st f" data-f="${k+1}"><span class="o"></span><b>${String(k+1).padStart(2,'0')}</b><span style="color:var(--tx)">${st[1]}</span></div>`).join('')}</div>
    <div class="q f" data-f="${steps.length+1}" style="border-color:${col}"><div class="lbl" style="color:${col}">Para discutir</div><p>${s.dataset.q}</p></div>`)}
});

/* ---------- navigation ---------- */
let cur=0,step=0;
const maxStep=s=>Math.max(0,...$$('.f',s).map(e=>+e.dataset.f||0));
function apply(){const s=slides[cur];$$('.f',s).forEach(e=>e.classList.toggle('on',(+e.dataset.f||0)<=step));
  const id=s.dataset.id;if(id&&FX[id]&&FX[id].step)FX[id].step(step);
  $('#bar i').style.width=((cur+1)/slides.length*100)+'%';$('#bar i').style.background=COL[(BLK[+s.dataset.b]||[0,0,'cy'])[2]];
  const B=BLK[+s.dataset.b];
  $('#notes').innerHTML=`<b>${cur+1}/${slides.length}</b>${B?' · Módulo '+B[0]+' — '+B[3]:''} · passo ${step}/${maxStep(s)}<br>${(s.dataset.notes||'').replace(/^SLIDE \d+\s*(—\s*)?/,'')}`}
function go(i,st=0){if(i<0||i>=slides.length)return;const prev=slides[cur];if(prev.dataset.id&&FX[prev.dataset.id]&&FX[prev.dataset.id].leave&&i!==cur)FX[prev.dataset.id].leave();
  slides.forEach((s,k)=>s.classList.toggle('cur',k===i));cur=i;
  const id=slides[i].dataset.id;if(id&&FX[id]){if(!FX[id]._init&&FX[id].init){FX[id].init();FX[id]._init=1}if(FX[id].enter)FX[id].enter()}
  step=st==='end'?maxStep(slides[i]):st;
  apply();try{history.replaceState(null,'','#s'+(i+1))}catch(e){}}
function next(){if(step<maxStep(slides[cur])){step++;apply()}else go(cur+1)}
function prev(){if(step>0){step--;apply()}else go(cur-1,'end')}
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'&&e.target.type!=='range')return;
  if(['ArrowRight','PageDown',' ','Enter'].includes(e.key)){e.preventDefault();next()}
  else if(['ArrowLeft','PageUp','Backspace'].includes(e.key)){e.preventDefault();prev()}
  else if(e.key==='n'||e.key==='N')$('#notes').classList.toggle('on');
  else if(e.key==='f'||e.key==='F')full();
  else if(e.key==='m'||e.key==='M')toggleOv();else if(e.key==='Escape')ov.classList.remove('on');
  else if(e.key==='Home')go(0);else if(e.key==='End')go(slides.length-1)});
function full(){try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen().catch(()=>{})}catch(e){}}
$('#bNext').onclick=next;$('#bPrev').onclick=prev;$('#bNotes').onclick=()=>$('#notes').classList.toggle('on');$('#bFull').onclick=full;
/* ---------- overview map ---------- */
const ov=document.createElement('div');ov.id='ov';document.body.append(ov);
const titleOf=s=>s.classList.contains('sec')?'Capa do módulo':s.dataset.lab?(s.dataset.lab.split('|')[0]==='04'?'Desafio: ':'Lab: ')+s.dataset.lab.split('|')[1]:s.dataset.pause?(s.dataset.label||'Pausa'):(($('h2',s)||$('h1',s)||{}).textContent||'').replace(/\s+/g,' ').trim();
function buildOv(){let h=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px"><b style="font:700 28px 'Space Grotesk'">Mapa da aula</b><span style="color:#8A94B8">clique para ir · M ou Esc fecha</span></div><div class="g">`;
  for(let b=1;b<=8;b++){if(!(b in modMin))continue;const B=BLK[b],c=COL[B[2]];h+=`<div><h4 style="color:${c}">${B[0]} · ${B[3]}</h4>`;
    slides.forEach((s,i)=>{const sb=+s.dataset.b;if(sb!==b&&!(b===1&&sb===0))return;h+=`<button data-i="${i}" class="${i===cur?'cur':''}" style="--c:${c}"><span style="color:#5A6488;font-family:'JetBrains Mono'">${String(i+1).padStart(2,'0')}</span><span>${titleOf(s)}</span></button>`});h+='</div>'}
  ov.innerHTML=h+'</div>';$$('button',ov).forEach(x=>x.onclick=()=>{go(+x.dataset.i);ov.classList.remove('on')})}
function toggleOv(){if(!ov.classList.contains('on'))buildOv();ov.classList.toggle('on')}
$('#bMap').onclick=toggleOv;
function fit(){const k=Math.min(innerWidth/1600,innerHeight/900);stage.style.transform=`scale(${k}) translate(-50%,-50%)`;stage.style.left='50%';stage.style.top='50%';stage.style.transform=`translate(-50%,-50%) scale(${k})`;stage.style.transformOrigin='50% 50%'}
addEventListener('resize',fit);fit();

/* ---------- 01 cover ---------- */
if($('#cover')){const pts=[[60,560],[110,500],[160,530],[210,440],[250,470],[300,390],[340,420]];let h='';
 pts.forEach((p,i)=>h+=`<circle cx="${p[0]}" cy="${p[1]}" r="9" fill="${COL.cy}" opacity=".7" style="animation:pulse 3s ${i*.2}s infinite"/>`);
 h+=`<path d="M30 600 L380 360" stroke="${COL.cy}" stroke-width="5" stroke-dasharray="430" stroke-dashoffset="430" style="animation:dash 1.6s .4s forwards"/>`;
 const L=[[440,[200,300,400,500]],[540,[150,250,350,450,550]],[640,[250,350,450]]];
 for(let i=0;i<2;i++)for(const a of L[i][1])for(const b of L[i+1][1])h+=`<line x1="${L[i][0]}" y1="${a}" x2="${L[i+1][0]}" y2="${b}" stroke="${COL.vi}" stroke-width="1.2" opacity=".55"/>`;
 h+=`<line x1="380" y1="360" x2="440" y2="${300}" stroke="${COL.cy}" stroke-width="3"/>`;
 L.forEach(([x,ys],i)=>ys.forEach((y,k)=>h+=`<circle cx="${x}" cy="${y}" r="14" fill="${COL.bg}" stroke="${COL.vi}" stroke-width="3" style="animation:pulse 2.2s ${(i*0.4+k*0.15)}s infinite"/>`));
 ['tok','en','s'].forEach((t,i)=>h+=`<rect x="${420+i*86}" y="620" width="76" height="40" rx="20" fill="${COL.vi}" fill-opacity=".2" stroke="${COL.vi}" stroke-width="2"/><text x="${458+i*86}" y="647" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="18" font-weight="700" fill="${COL.vi}">${t}</text>`);
 $('#cover').innerHTML=h}

/* ---------- cover module list ---------- */
if($('#coverMods'))$('#coverMods').innerHTML=MODS.map(b=>`<span style="display:flex;align-items:center;gap:8px;${DAYMODS.includes(b)?'color:var(--tx);font-weight:700':'opacity:.55'}"><i style="width:10px;height:10px;border-radius:50%;background:${COL[BLK[b][2]]}"></i>${BLK[b][3]}</span>`).join('');
const TOT=Object.values(modMin).reduce((a,v)=>a+v,0)+breakMin,hm=v=>`${Math.floor(v/60)}h${String(v%60).padStart(2,'0')}`;

/* ---------- agenda (módulos do dia, pausas e tópicos) ---------- */
if($('#agSvg')){const seq=[];slides.forEach((s,i)=>{if(s.classList.contains('sec'))seq.push({b:+s.dataset.b,i});else if(isBreak(s))seq.push({p:+s.dataset.pause,i})});
 const n=seq.filter(x=>x.b).length,W=1408/n;let h='',k=0;
 h+=`<line x1="${W/2}" y1="150" x2="${1408-W/2}" y2="150" stroke="${COL.ln}" stroke-width="6" stroke-linecap="round"/>`;
 seq.forEach(x=>{if(x.p){const px=k*W;h+=`<rect x="${px-58}" y="62" width="116" height="32" rx="16" fill="${COL.p2}" stroke="${COL.ln}"/><text x="${px}" y="84" text-anchor="middle" font-size="15" fill="${COL.mu}">☕ pausa</text><line x1="${px}" y1="94" x2="${px}" y2="140" stroke="${COL.ln}" stroke-width="2" stroke-dasharray="4 4"/>`;return}
  const B=BLK[x.b],c=COL[B[2]],cx=k*W+W/2,sec=slides[x.i],items=sec.dataset.items.split(';');k++;
  h+=`<g class="st" data-go="${x.i}"><rect x="${cx-W/2+8}" y="0" width="${W-16}" height="600" rx="20" fill="transparent"/>
   <svg x="${cx-70}" y="0" width="140" height="84" viewBox="0 0 400 240">${ill(x.b)}</svg>
   <circle class="o" cx="${cx}" cy="150" r="34" fill="${COL.bg}" stroke="${c}" stroke-width="5"/><text x="${cx}" y="160" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="25" fill="${c}">${B[0]}</text>
   <foreignObject x="${cx-W/2+14}" y="198" width="${W-28}" height="400"><div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;font-family:Inter,sans-serif;color:#EAF0FF">
    <div style="font:700 23px/1.15 'Space Grotesk',Inter,sans-serif;min-height:54px">${B[3]}</div>
    <div style="height:14px"></div>
    ${items.map(t=>t.startsWith('lab:')?`<div style="display:inline-block;margin-top:8px;padding:5px 14px;border-radius:99px;border:1.5px solid ${c};color:${c};font-weight:700;font-size:16px">${t.slice(4)}</div>`:`<div style="font-size:18px;color:#c9d1ee;padding:4px 0;border-bottom:1px solid #ffffff10">${t}</div>`).join('')}</div></foreignObject></g>`});
 $('#agSvg').innerHTML=h;$$('#agSvg .st').forEach(g=>g.onclick=()=>go(+g.dataset.go));
 $('#agSub').textContent=`Dia ${DAY} de 2 · ${n} módulos · clique num módulo para ir até ele`}

/* ---------- datasets ---------- */
if($('#dsGrid')){const D=[['Regressão','am','Alunos (limpo)','392 alunos × 6 features','alvo: a nota final','Lab 01'],['Classificação','pk','Iris','150 flores × 4 medidas','alvo: espécie (3 classes)','Lab 02'],['Clustering','gr','Consumo (sintético)','clientes × hábitos de compra','sem alvo: descobrir grupos','Lab 03'],['Classificação','ye','Wine','178 vinhos × 13 medidas químicas','alvo: cultivar (3 classes)','Desafio 04'],['Visão','or','MNIST (exemplo)','70.000 imagens de 28 × 28 pixels','alvo: dígito de 0 a 9','Módulo 05'],['Linguagem','vi','Texto','frases → tokens','alvo: o próximo token','Lab 05']];
 $('#dsGrid').innerHTML=D.map(([t,c,n,s,a,w])=>`<div class="card" style="border-top:4px solid var(--${c})"><div class="row" style="justify-content:space-between;align-items:center"><span class="lbl ${c}" style="font-size:14px">${t}</span><span class="pill ${c}" style="font-size:14px;padding:4px 12px">${w}</span></div><div class="big" style="font-size:38px;margin:18px 0 12px">${n}</div><div class="mono mu" style="font-size:19px">${s}</div><div style="font-size:21px;margin-top:12px">${a}</div></div>`).join('')}

/* ---------- 06 table highlight ---------- */
FX.tblx={step:k=>{$('#tbl').classList.toggle('c0',k>=1);$('#tbl').classList.toggle('c1',k>=2)}};

/* ---------- 07 leakage rows ---------- */
if($('#wrongRow')){const row=(steps,col)=>steps.map((t,i)=>{const x=34+i*345;return `<rect x="${x}" y="90" width="300" height="90" rx="14" fill="${COL.p2}"/><text x="${x+150}" y="143" text-anchor="middle" font-size="22" ${/\(/.test(t)?'font-family="JetBrains Mono,monospace"':''}>${t}</text>`+(i<3?`<path d="M${x+305} 135 H${x+338}" stroke="${COL.mu}" stroke-width="3" marker-end="url(#ar)"/>`:'')}).join('');
 $('#wrongRow').innerHTML=row(['scaler.fit(X)','dividir treino/teste','treinar','avaliar']);
 $('#rightRow').innerHTML=row(['dividir treino/teste','scaler.fit(X_treino)','transform(treino, teste)','treinar e avaliar'])}

/* ---------- 08 polynomial fit ---------- */
{const r=rng(7),g=x=>0.8*Math.sin(2.6*x)+0.35*x;
 const tr=[],va=[];for(let i=0;i<12;i++){const x=-0.95+1.9*i/11+(r()-.5)*.08;tr.push([x,g(x)+gauss(r)*0.18])}
 for(let i=0;i<30;i++){const x=-0.97+1.94*r();va.push([x,g(x)+gauss(r)*0.18])}
 function solve(A,b){const n=b.length;A=A.map((r,i)=>[...r,b[i]]);for(let c=0;c<n;c++){let p=c;for(let i=c+1;i<n;i++)if(Math.abs(A[i][c])>Math.abs(A[p][c]))p=i;[A[c],A[p]]=[A[p],A[c]];for(let i=0;i<n;i++)if(i!==c){const f=A[i][c]/A[c][c];for(let j=c;j<=n;j++)A[i][j]-=f*A[c][j]}}return A.map((r,i)=>r[n]/r[i])}
 function polyfit(d){const n=d+1,A=Array.from({length:n},()=>Array(n).fill(0)),b=Array(n).fill(0);for(const[x,y]of tr){const p=[];for(let k=0;k<n;k++)p.push(x**k);for(let i=0;i<n;i++){b[i]+=p[i]*y;for(let j=0;j<n;j++)A[i][j]+=p[i]*p[j]}}for(let i=0;i<n;i++)A[i][i]+=1e-7;return solve(A,b)}
 const ev=(c,x)=>c.reduce((s,ck,k)=>s+ck*x**k,0),mse=(c,D)=>D.reduce((s,[x,y])=>s+(ev(c,x)-y)**2,0)/D.length;
 FITD={tr,va,solve,ev,mse};
 const fits=[];for(let d=1;d<=11;d++){const c=polyfit(d);fits[d]={c,tr:mse(c,tr),va:mse(c,va)}}
 const best=fits.reduce((b,f,d)=>f&&(!b||f.va<fits[b].va)?d:b,0);
 const m=mapper(70,20,730,470,-1,1,-1.8,1.8);
 function draw(d){const f=fits[d];let h=axes(m,70,20,730,470,'x','y');
  let p='';for(let i=0;i<=300;i++){const x=-1+2*i/300;let y=ev(f.c,x);y=Math.max(-3,Math.min(3,y));p+=(i?'L':'M')+m.X(x).toFixed(1)+' '+m.Y(y).toFixed(1)}
  const tag=d<=2?['underfitting',COL.am]:(f.va<=fits[best].va*1.6&&f.tr>fits[best].tr*0.3?['bom ajuste',COL.gr]:['overfitting',COL.rd]);
  h+=`<path d="${p}" fill="none" stroke="${tag[1]}" stroke-width="4" clip-path="url(#clipFit)"/>`;
  va.forEach(([x,y])=>h+=`<circle cx="${m.X(x)}" cy="${m.Y(y)}" r="7" fill="none" stroke="${COL.am}" stroke-width="2.5"/>`);
  tr.forEach(([x,y])=>h+=`<circle cx="${m.X(x)}" cy="${m.Y(y)}" r="8" fill="${COL.tx}"/>`);
  h+=`<circle cx="100" cy="530" r="8" fill="${COL.tx}"/><text x="116" y="536" font-size="18">treino</text><circle cx="210" cy="530" r="7" fill="none" stroke="${COL.am}" stroke-width="2.5"/><text x="226" y="536" font-size="18">validação</text>`;
  $('#fitPlot').innerHTML=h;$('#degv').textContent='grau '+d;$('#fitTag').textContent=tag[0];$('#fitTag').style.color=tag[1];
  const e=mapper(60,50,440,160,0.5,11.5,0,0.25);let g2=axes(e,60,50,440,160,'grau','erro (MSE)'),pt='',pv='';
  for(let k=1;k<=11;k++){pt+=(k>1?'L':'M')+e.X(k)+' '+e.Y(Math.min(.25,fits[k].tr));pv+=(k>1?'L':'M')+e.X(k)+' '+e.Y(Math.min(.25,fits[k].va))}
  g2+=`<path d="${pt}" fill="none" stroke="${COL.tx}" stroke-width="3"/><path d="${pv}" fill="none" stroke="${COL.am}" stroke-width="3"/>`;
  g2+=`<line x1="${e.X(d)}" y1="50" x2="${e.X(d)}" y2="210" stroke="${tag[1]}" stroke-width="2" stroke-dasharray="6 5"/>`;
  g2+=`<line x1="330" y1="22" x2="356" y2="22" stroke="${COL.tx}" stroke-width="3"/><text x="364" y="28" font-size="16">treino</text><line x1="420" y1="22" x2="446" y2="22" stroke="${COL.am}" stroke-width="3"/><text x="454" y="28" font-size="16" fill="${COL.am}">validação</text>`;
  $('#fitErr').innerHTML=g2}
 FX.fit={init(){$('#deg').oninput=e=>draw(+e.target.value);draw(1)}}}

/* ---------- 09 line ---------- */
{const m=mapper(70,20,690,470,0,10,0,120);
 function draw(){const w=+$('#lw').value,b=+$('#lb').value,x=+$('#lx').value,y=w*x+b;
  $('#lwv').textContent=w;$('#lbv').textContent=b;$('#lxv').textContent=x;
  $('#lcalc').innerHTML=TX(`\\am{\\hat{y}} = \\cy{${tn(w)}}\\cdot ${x} + \\vi{${b}} = \\am{${tn(fmt(y,y%1?1:0))}}`,`ŷ = <span class="cy">${w}</span>·${x} + <span class="vi">${b}</span> = <span class="am">${fmt(y,y%1?1:0)}</span>`);
  let h=axes(m,70,20,690,470,'','ŷ')+`<text x="780" y="496" font-size="18" fill="${COL.mu}">x</text>`;for(let v=0;v<=120;v+=20)h+=`<text x="58" y="${m.Y(v)+6}" text-anchor="end" font-size="15" fill="${COL.dim}">${v}</text>`;
  for(let v=0;v<=10;v+=2)h+=`<text x="${m.X(v)}" y="514" text-anchor="middle" font-size="15" fill="${COL.dim}">${v}</text>`;
  const ye=Math.min(120,w*10+b),xe=ye<w*10+b?(120-b)/w:10;
  h+=`<line x1="${m.X(0)}" y1="${m.Y(b)}" x2="${m.X(xe)}" y2="${m.Y(ye)}" stroke="${COL.cy}" stroke-width="5"/>`;
  if(y<=120){h+=`<line x1="${m.X(x)}" y1="${m.Y(0)}" x2="${m.X(x)}" y2="${m.Y(y)}" stroke="${COL.am}" stroke-dasharray="7 6" stroke-width="2"/><line x1="${m.X(0)}" y1="${m.Y(y)}" x2="${m.X(x)}" y2="${m.Y(y)}" stroke="${COL.am}" stroke-dasharray="7 6" stroke-width="2"/><circle cx="${m.X(x)}" cy="${m.Y(y)}" r="12" fill="${COL.am}"/><text x="${m.X(x)+18}" y="${m.Y(y)+30}" font-family="JetBrains Mono,monospace" font-weight="700" font-size="20" fill="${COL.am}">(${x}, ${fmt(y,y%1?1:0)})</text>`}
  h+=`<circle cx="${m.X(0)}" cy="${m.Y(b)}" r="10" fill="${COL.vi}"/><text x="${m.X(0)+18}" y="${m.Y(b)+30}" font-family="JetBrains Mono,monospace" font-size="18" fill="${COL.vi}">b = ${b}</text>`;
  $('#linePlot').innerHTML=h}
 FX.line={init(){['#lw','#lb','#lx'].forEach(q=>$(q).oninput=draw);draw()}}}

/* ---------- 10 residuals ---------- */
{const D=[[1,2.1],[2,3.9],[3,3.2],[4,5.6],[5,5.0],[6,7.1],[7,6.4],[8,8.6],[9,8.9]];
 const m=mapper(70,20,720,470,0,10,0,11);let showR=0,showQ=0;
 function draw(){const w=+$('#rw').value,b=+$('#rb').value;$('#rwv').textContent=fmt(w);$('#rbv').textContent=fmt(b,1);
  let h=axes(m,70,20,720,470,'x','y'),mse=0;const px=m.X(1)-m.X(0),py=m.Y(0)-m.Y(1);
  D.forEach(([x,y])=>{const yh=w*x+b,e=y-yh;mse+=e*e;const a=m.Y(y),c=m.Y(yh);
   if(showQ){const s=Math.abs(a-c);h+=`<rect x="${m.X(x)}" y="${Math.min(a,c)}" width="${s}" height="${s}" fill="${COL.am}" fill-opacity=".18" stroke="${COL.am}" stroke-opacity=".5"/>`}
   if(showR)h+=`<line x1="${m.X(x)}" y1="${a}" x2="${m.X(x)}" y2="${c}" stroke="${COL.am}" stroke-width="3.5"/>`});
  h+=`<line x1="${m.X(0)}" y1="${m.Y(b)}" x2="${m.X(10)}" y2="${m.Y(w*10+b)}" stroke="${COL.cy}" stroke-width="4.5"/>`;
  D.forEach(([x,y])=>h+=`<circle cx="${m.X(x)}" cy="${m.Y(y)}" r="9" fill="${COL.tx}"/>`);
  $('#resPlot').innerHTML=h;$('#mseV').textContent=fmt(mse/D.length)}
 function opt(){const n=D.length,mx=D.reduce((s,d)=>s+d[0],0)/n,my=D.reduce((s,d)=>s+d[1],0)/n;let sxy=0,sxx=0;D.forEach(([x,y])=>{sxy+=(x-mx)*(y-my);sxx+=(x-mx)**2});const w=sxy/sxx,b=my-w*mx;anim(w,b)}
 function anim(w1,b1){const w0=+$('#rw').value,b0=+$('#rb').value,t0=performance.now();const f=t=>{const k=Math.min(1,(t-t0)/900),e=1-(1-k)**3;$('#rw').value=w0+(w1-w0)*e;$('#rb').value=b0+(b1-b0)*e;draw();if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)}
 FX.resid={init(){$('#rw').oninput=draw;$('#rb').oninput=draw;$('#rOpt').onclick=opt;$('#rRst').onclick=()=>anim(0.4,4);draw()},step(k){showR=1;showQ=k>=1;draw()}}}

/* ---------- 11 gradient descent ---------- */
{/* um aluno (x = 6 h, y = 4,6), b fixo em 0: L(w) = (y − w·x)², ∂L/∂w = −2·x·(y − w·x). Mínimo em w* = y/x ≈ 0,767; α limite = 1/x² ≈ 0,028 */
 const X=6,Y=4.6,WS=Y/X,W0=-0.5,W1=2.05,m=mapper(70,20,760,470,W0,W1,0,62),L=w=>(Y-w*X)**2,G=w=>-2*X*(Y-w*X);
 let a=0.01,w=0,k=0,trail=[],timer=null,last=null;
 const br=v=>String(v).replace('.',',');
 const nf=(v,d=2)=>br((Math.abs(v)<5e-4?0:v).toFixed(d)),ps=(v,d=2)=>v<0?`(${nf(v,d)})`:nf(v,d);
 function calc(){const el=$('#gdCalc');if(!el)return;const c=last||{w,e:Y-w*X,g:G(w),w1:null};
  el.innerHTML=`<div>erro = 4,6 − ${ps(c.w)}·6 = <b>${nf(c.e)}</b></div><div><span class="cy">∂L/∂w</span> = −2·6·${ps(c.e)} = <b class="cy">${nf(c.g,1)}</b></div>`+
   (c.w1===null?`<div class="mu">w novo = ${nf(c.w)} − <span class="am">α</span>·${ps(c.g,1)} = ?</div>`:`<div>w novo = ${nf(c.w)} − <span class="am">${br(String(a))}</span>·${ps(c.g,1)} = <b class="am">${nf(c.w1)}</b></div>`)}
 function draw(){let h=axes(m,70,20,760,470,'parâmetro w','perda L(w)');let p='';for(let i=0;i<=200;i++){const x=W0+(W1-W0)*i/200;p+=(i?'L':'M')+m.X(x)+' '+m.Y(Math.min(62,L(x)))}
  h+=`<path d="${p}" fill="none" stroke="${COL.cy}" stroke-width="4"/>`;h+=`<circle cx="${m.X(WS)}" cy="${m.Y(0)}" r="9" fill="${COL.gr}"/><text x="${m.X(WS)}" y="${m.Y(0)+34}" text-anchor="middle" font-size="18" fill="${COL.gr}">mínimo (w ≈ 0,77)</text>`;
  const inR=v=>v>=W0&&v<=W1&&L(v)<=62,vis=trail.filter(inR);for(let i=1;i<vis.length;i++)h+=`<line x1="${m.X(vis[i-1])}" y1="${m.Y(L(vis[i-1]))-14}" x2="${m.X(vis[i])}" y2="${m.Y(L(vis[i]))-14}" stroke="${COL.am}" stroke-width="2.5" marker-end="url(#ara)" opacity=".8"/>`;
  vis.forEach((v,i)=>h+=`<circle cx="${m.X(v)}" cy="${m.Y(L(v))-14}" r="${i===vis.length-1?14:6}" fill="${COL.am}" opacity="${i===vis.length-1?1:.5}"/>`);
  if(inR(w)){const g=G(w),d=0.2;h+=`<line x1="${m.X(w-d)}" y1="${m.Y(L(w)-g*d)}" x2="${m.X(w+d)}" y2="${m.Y(L(w)+g*d)}" stroke="${COL.tx}" stroke-width="2" stroke-dasharray="6 5"/>`}
  $('#gdPlot').innerHTML=h;$('#gdK').textContent=k;$('#gdW').textContent=Math.abs(w)>50?'∞':nf(w);$('#gdL').textContent=Math.abs(w)>50?'∞':fmt(L(w));calc()}
 function reset(){clearInterval(timer);timer=null;w=0;k=0;last=null;trail=[w];$('#gdMsg').textContent='';$('#gdGo').textContent='▶ Descer';draw()}
 function stepOnce(){const g=G(w),w1=w-a*g;last={w,e:Y-w*X,g,w1};w=w1;k++;trail.push(w);draw();
  const msg=$('#gdMsg');if(w<W0||w>W1){msg.innerHTML='<span class="rd">Divergiu: cada passo piora o erro</span>';stop()}
  else if(Math.abs(w-WS)<0.004){msg.innerHTML='<span class="gr">Convergiu para o mínimo</span>';stop()}
  else if(k>=40){msg.innerHTML=a*X*X>0.5?'<span class="am">Oscila e demora a assentar</span>':'<span class="mu">Ainda descendo… α pequeno é lento</span>';stop()}
  else if(a*X*X>0.5)msg.innerHTML='<span class="am">Oscila de um lado para o outro</span>'}
 function stop(){clearInterval(timer);timer=null;$('#gdGo').textContent='▶ Descer'}
 FX.gd={init(){$$('#gdA button').forEach(b=>b.onclick=()=>{$$('#gdA button').forEach(x=>x.classList.toggle('on',x===b));a=+b.dataset.a;reset()});
  $('#gdStep').onclick=()=>{stop();if(w<W0||w>W1||Math.abs(w-WS)<0.004)reset();stepOnce()};
  $('#gdGo').onclick=()=>{if(timer){stop();return}if(w<W0||w>W1||Math.abs(w-WS)<0.004||k>=40)reset();$('#gdGo').textContent='❚❚ Pausar';timer=setInterval(stepOnce,a<0.005?160:600)};$('#gdRst').onclick=reset;reset()},leave:stop}}

/* ---------- 14 KNN ---------- */
{const r=rng(3),P=[];for(let i=0;i<26;i++)P.push([2.8+gauss(r)*1.3,2.8+gauss(r)*1.1,0].map((v,j)=>j<2?Math.max(.3,Math.min(j?6.7:9.7,v)):v));for(let i=0;i<26;i++)P.push([6.6+gauss(r)*1.3,4.2+gauss(r)*1.1,1].map((v,j)=>j<2?Math.max(.3,Math.min(j?6.7:9.7,v)):v));
 const m=mapper(70,20,760,470,0,10,0,7);let K=3,q=[5.1,3.5];
 const pred=(x,y,k)=>{const d=P.map(p=>[(p[0]-x)**2+(p[1]-y)**2,p[2]]).sort((a,b)=>a[0]-b[0]).slice(0,k);const v=d.reduce((s,a)=>s+a[1],0);return[v>k/2?1:0,k-v,v,d]};
 function draw(){let h='';const nx=50,ny=30;for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const x=(i+.5)/nx*10,y=(j+.5)/ny*7,c=pred(x,y,K)[0];h+=`<rect x="${70+i*760/nx}" y="${20+(ny-1-j)*470/ny}" width="${760/nx+.5}" height="${470/ny+.5}" fill="${c?COL.am:COL.cy}" opacity=".1"/>`}
  h+=axes(m,70,20,760,470,'feature 1','feature 2');const [c,n0,n1,d]=pred(q[0],q[1],K);const qx=m.X(q[0]),qy=m.Y(q[1]);
  const R=Math.sqrt(d[d.length-1][0]);h+=`<ellipse cx="${qx}" cy="${qy}" rx="${R*76+12}" ry="${R*470/7+12}" fill="${COL.tx}" fill-opacity=".05" stroke="${COL.tx}" stroke-dasharray="8 7" stroke-width="2"/>`;
  P.forEach(p=>{if(d.some(z=>Math.abs(z[0]-((p[0]-q[0])**2+(p[1]-q[1])**2))<1e-12))h+=`<line x1="${qx}" y1="${qy}" x2="${m.X(p[0])}" y2="${m.Y(p[1])}" stroke="${COL.mu}" stroke-width="2" stroke-dasharray="5 5"/>`});
  P.forEach(p=>{const X=m.X(p[0]),Y=m.Y(p[1]);h+=p[2]?`<path d="M${X} ${Y-11}L${X+11} ${Y+8}L${X-11} ${Y+8}Z" fill="${COL.am}"/>`:`<circle cx="${X}" cy="${Y}" r="9" fill="${COL.cy}"/>`});
  h+=`<text x="${qx}" y="${qy+13}" text-anchor="middle" font-size="40" fill="${COL.tx}">★</text>`;$('#knnPlot').innerHTML=h;
  $('#knnVote').innerHTML=`<span class="cy">● ${n0}</span> &nbsp; <span class="am">▲ ${n1}</span>`;$('#knnRes').innerHTML=c?'<span class="am">→ classe ▲</span>':'<span class="cy">→ classe ●</span>'}
 FX.knn={init(){$$('#knnK button').forEach(b=>b.onclick=()=>{$$('#knnK button').forEach(x=>x.classList.toggle('on',x===b));K=+b.dataset.k;draw()});
  $('#knnPlot').addEventListener('click',e=>{const pt=$('#knnPlot').createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const p=pt.matrixTransform($('#knnPlot').getScreenCTM().inverse());const x=m.ix(p.x),y=m.iy(p.y);if(x>0&&x<10&&y>0&&y<7){q=[x,y];draw()}});draw()}}}

/* ---------- 15 tree ---------- */
{const r=rng(11),D=[];const sp=[[1.46,.17,.25,.1,0],[4.26,.47,1.33,.2,1],[5.55,.55,2.03,.27,2]];
 sp.forEach(([ml,sl,mw,sw,c])=>{for(let i=0;i<30;i++)D.push([Math.max(1,ml+gauss(r)*sl),Math.max(.1,mw+gauss(r)*sw),c])});
 const CC=[COL.pk,COL.gr,COL.vi],NM=['Setosa','Versicolor','Virginica'];
 const gini=S=>{const n=S.length;if(!n)return 0;let g=1;for(let c=0;c<3;c++){const p=S.filter(d=>d[2]===c).length/n;g-=p*p}return g};
 const cnt=S=>[0,1,2].map(c=>S.filter(d=>d[2]===c).length);
 const m=mapper(70,20,600,470,0.5,7.5,0,2.8);
 const A=D,Lft=D.filter(d=>d[0]<2.45),Rgt=D.filter(d=>d[0]>=2.45),RL=Rgt.filter(d=>d[1]<1.75),RR=Rgt.filter(d=>d[1]>=1.75);
 function draw(k){let h='';if(k>=1)h+=`<rect x="${m.X(.5)}" y="20" width="${m.X(2.45)-m.X(.5)}" height="470" fill="${COL.pk}" opacity=".1"/><line x1="${m.X(2.45)}" y1="20" x2="${m.X(2.45)}" y2="490" stroke="${COL.cy}" stroke-width="3" stroke-dasharray="9 6"/>`;
  if(k>=2)h+=`<rect x="${m.X(2.45)}" y="${m.Y(1.75)}" width="${m.X(7.5)-m.X(2.45)}" height="${m.Y(0)-m.Y(1.75)}" fill="${COL.gr}" opacity=".1"/><rect x="${m.X(2.45)}" y="20" width="${m.X(7.5)-m.X(2.45)}" height="${m.Y(1.75)-20}" fill="${COL.vi}" opacity=".12"/><line x1="${m.X(2.45)}" y1="${m.Y(1.75)}" x2="${m.X(7.5)}" y2="${m.Y(1.75)}" stroke="${COL.cy}" stroke-width="3" stroke-dasharray="9 6"/>`;
  h+=axes(m,70,20,600,470,'comprimento da pétala (cm)','largura (cm)');D.forEach(d=>h+=`<circle cx="${m.X(d[0])}" cy="${m.Y(d[1])}" r="7" fill="${CC[d[2]]}" opacity=".9"/>`);$('#treePlot').innerHTML=h;
  const node=(x,y,w,t,S,col,leaf)=>{const c=cnt(S);return `<rect x="${x}" y="${y}" width="${w}" height="92" rx="14" fill="${leaf?col+'33':COL.p2}" stroke="${col}" stroke-width="2.5"/><text x="${x+w/2}" y="${y+36}" text-anchor="middle" font-size="21" font-weight="700" ${leaf?'':'font-family="JetBrains Mono,monospace"'}>${t}</text><text x="${x+w/2}" y="${y+70}" text-anchor="middle" font-size="16" font-family="JetBrains Mono,monospace" fill="${COL.mu}">[${c.join(', ')}] gini ${fmt(gini(S))}</text>`};
  let t=node(150,10,380,k>=1?'pétala comp. < 2,45?':'todas as flores',A,COL.cy,0);
  if(k>=1)t+=`<path d="M260 102 L120 220 M420 102 L470 220" stroke="${COL.mu}" stroke-width="2.5"/><text x="138" y="160" font-size="17" fill="${COL.mu}">sim</text><text x="460" y="160" font-size="17" fill="${COL.mu}">não</text>`+node(0,220,250,'Setosa',Lft,COL.pk,1)+node(300,220,370,k>=2?'pétala larg. < 1,75?':'resto',Rgt,COL.cy,0);
  if(k>=2)t+=`<path d="M420 312 L300 430 M560 312 L560 430" stroke="${COL.mu}" stroke-width="2.5"/><text x="300" y="370" font-size="17" fill="${COL.mu}">sim</text><text x="572" y="370" font-size="17" fill="${COL.mu}">não</text>`+node(170,430,250,'Versicolor',RL,COL.gr,1)+node(450,430,220,'Virginica',RR,COL.vi,1);
  if(k>=3)t+=`<text x="0" y="560" font-size="19" fill="${COL.rd}" font-weight="700">Profunda demais? Decora o treino → overfitting</text>`;
  $('#treeDiag').innerHTML=t}
 (slides.find(s=>s.dataset.id==='tree')||document.createElement('i')).insertAdjacentHTML('beforeend','<i class="f" data-f="3"></i>');
 FX.tree={init(){draw(0)},step:draw}}

/* ---------- 16 forest ---------- */
if($('#forestSvg')){const votes=[1,2,1,1,2];const CC=[COL.pk,COL.gr,COL.vi];let h='';
 for(let i=0;i<5;i++){const x=40+i*275,cx=x+110;h+=`<g class="tf"><rect x="${x}" y="10" width="220" height="270" rx="18" fill="${COL.p1}"/><text x="${cx}" y="42" text-anchor="middle" font-size="17" fill="${COL.mu}">árvore ${i+1}</text>`;
  const n=[[cx,80],[cx-50,150],[cx+50,150]],l=i%2?[[cx+25,215],[cx+75,215]]:[[cx-75,215],[cx-25,215]],par=i%2?n[2]:n[1];
  h+=`<path d="M${n[0][0]} ${n[0][1]}L${n[1][0]} ${n[1][1]}M${n[0][0]} ${n[0][1]}L${n[2][0]} ${n[2][1]}M${par[0]} ${par[1]}L${l[0][0]} ${l[0][1]}M${par[0]} ${par[1]}L${l[1][0]} ${l[1][1]}" stroke="${COL.ln}" stroke-width="2.5"/>`;
  n.forEach(p=>h+=`<circle cx="${p[0]}" cy="${p[1]}" r="13" fill="${COL.cy}" opacity=".7"/>`);l.forEach(p=>h+=`<circle cx="${p[0]}" cy="${p[1]}" r="13" fill="${CC[votes[i]]}"/>`);
  h+=`<text x="${cx}" y="262" text-anchor="middle" font-size="14" fill="${COL.dim}">${i%2?'amostra B · features 1, 3':'amostra A · features 2, 4'}</text></g>`;
  h+=`<g class="f" data-f="1"><path d="M${cx} 311 L704 395" stroke="${CC[votes[i]]}" stroke-width="2.5" stroke-dasharray="7 6" style="animation:flow 1s linear infinite"/><circle cx="${cx}" cy="300" r="11" fill="${CC[votes[i]]}"/></g>`}
 h+=`<g class="f" data-f="2"><rect x="544" y="395" width="320" height="80" rx="16" fill="${COL.gr}" fill-opacity=".25" stroke="${COL.gr}" stroke-width="2.5"/><text x="704" y="445" text-anchor="middle" font-size="27" font-weight="700">Versicolor · 3 × 2</text></g>`;
 $('#forestSvg').innerHTML=h}

/* ---------- 19 pause ---------- */
$$('[data-pause]').forEach(s=>{const M=+s.dataset.pause,lab=s.dataset.label||'Pausa';
 s.insertAdjacentHTML('beforeend',`<div style="text-align:center;margin-top:110px"><div class="lbl" style="letter-spacing:.5em;font-size:22px;color:var(--acc)">${lab==='Pausa'?'☕ ':''}${lab}</div><div class="big mono clock" style="font-size:240px;margin:30px 0"></div><div class="row" style="justify-content:center;gap:14px"><button class="b go">▶ Iniciar</button><button class="b rst">Reiniciar</button></div><div class="pill" style="margin-top:46px;color:var(--acc)">${s.dataset.next||''}</div></div>`);
 let t=M*60,timer=null;const ck=$('.clock',s),bg=$('.go',s),stop=()=>{clearInterval(timer);timer=null};
 const show=()=>ck.textContent=String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');
 bg.onclick=()=>{if(timer){stop();bg.textContent='▶ Continuar';return}bg.textContent='❚❚ Pausar';timer=setInterval(()=>{t=Math.max(0,t-1);show();if(!t){stop();ck.style.color=COL.am;bg.textContent='▶ Iniciar'}},1000)};
 $('.rst',s).onclick=()=>{stop();t=M*60;ck.style.color='';bg.textContent='▶ Iniciar';show()};show()});

/* ---------- 20/21 K-Means & elbow ---------- */
const KD=(()=>{const r=rng(21),P=[];[[2,2.2],[6,3],[3.6,6.4]].forEach(([cx,cy])=>{for(let i=0;i<30;i++)P.push([cx+gauss(r)*.8,cy+gauss(r)*.8])});return P})();
const d2=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2;
function kmeansFull(P,k,r){let best=null;for(let rep=0;rep<8;rep++){const C=[P[Math.floor(r()*P.length)]];while(C.length<k){const ds=P.map(p=>Math.min(...C.map(c=>d2(p,c))));let s=ds.reduce((a,b)=>a+b,0)*r(),i=0;for(;i<P.length-1;i++){s-=ds[i];if(s<=0)break}C.push(P[i])}
  let A=[];for(let it=0;it<60;it++){A=P.map(p=>{let b=0;C.forEach((c,j)=>{if(d2(p,c)<d2(p,C[b]))b=j});return b});for(let j=0;j<k;j++){const g=P.filter((_,i)=>A[i]===j);if(g.length)C[j]=[g.reduce((s,p)=>s+p[0],0)/g.length,g.reduce((s,p)=>s+p[1],0)/g.length]}}
  const inr=P.reduce((s,p,i)=>s+d2(p,C[A[i]]),0);if(!best||inr<best.inr)best={inr,A,C:C.map(c=>[...c])}}return best}
function silhouette(P,A,k){let s=0;P.forEach((p,i)=>{const dist=j=>{const g=P.filter((_,t)=>A[t]===j&&t!==i);return g.length?g.reduce((a,q)=>a+Math.sqrt(d2(p,q)),0)/g.length:0};const a=dist(A[i]);let b=Infinity;for(let j=0;j<k;j++)if(j!==A[i])b=Math.min(b,dist(j));const same=A.filter(x=>x===A[i]).length;s+=same>1?(b-a)/Math.max(a,b):0});return s/P.length}
{const m=mapper(60,20,680,470,0,8.5,0,8.5),CC=[COL.cy,COL.am,COL.vi,COL.pk,COL.gr];let K=3,C=[],A=null,phase=0,it=0,trail=[],timer=null,r=rng(5);
 function draw(){let h=axes(m,60,20,680,470);KD.forEach((p,i)=>h+=`<circle cx="${m.X(p[0])}" cy="${m.Y(p[1])}" r="8" fill="${A?CC[A[i]]:COL.mu}" style="transition:fill .4s"/>`);
  trail.forEach((tr,j)=>{for(let i=1;i<tr.length;i++)h+=`<line x1="${m.X(tr[i-1][0])}" y1="${m.Y(tr[i-1][1])}" x2="${m.X(tr[i][0])}" y2="${m.Y(tr[i][1])}" stroke="${CC[j]}" stroke-width="2.5" stroke-dasharray="6 5"/>`});
  C.forEach((c,j)=>h+=`<g transform="translate(${m.X(c[0])},${m.Y(c[1])})"><circle r="20" fill="${COL.bg}" stroke="${CC[j]}" stroke-width="4"/><path d="M-10 0H10M0 -10V10" stroke="${CC[j]}" stroke-width="4"/></g>`);$('#kmPlot').innerHTML=h}
 function init(){stop();C=[];for(let j=0;j<K;j++)C.push([0.8+r()*7,0.8+r()*7]);A=null;phase=0;it=0;trail=C.map(c=>[[...c]]);$('#kmPhase').innerHTML='<span class="gr">1</span> Centroides sorteados';$('#kmIt').textContent='iteração 0';draw()}
 function stepK(){if(phase===0){const nA=KD.map(p=>{let b=0;C.forEach((c,j)=>{if(d2(p,c)<d2(p,C[b]))b=j});return b});const same=A&&nA.every((v,i)=>v===A[i]);A=nA;phase=1;
   if(same){$('#kmPhase').innerHTML='<span class="gr">4</span> Estabilizou: nada mudou';stop();draw();return false}$('#kmPhase').innerHTML='<span class="gr">2</span> Cada ponto vai ao centroide mais próximo'}
  else{C=C.map((c,j)=>{const g=KD.filter((_,i)=>A[i]===j);return g.length?[g.reduce((s,p)=>s+p[0],0)/g.length,g.reduce((s,p)=>s+p[1],0)/g.length]:c});trail.forEach((t,j)=>t.push([...C[j]]));phase=0;it++;$('#kmPhase').innerHTML='<span class="gr">3</span> Centroide vira a média do grupo';$('#kmIt').textContent='iteração '+it}
  draw();return true}
 function stop(){clearInterval(timer);timer=null;$('#kmRun').textContent='▶ Rodar'}
 FX.km={init(){$('#kmInit').onclick=init;$('#kmStep').onclick=()=>{stop();stepK()};$('#kmRun').onclick=()=>{if(timer){stop();return}$('#kmRun').textContent='❚❚ Pausar';timer=setInterval(()=>{if(!stepK())stop()},800)};
  $$('#kmPlot~.col button[data-k]').forEach(b=>b.onclick=()=>{$$('#kmPlot~.col button[data-k]').forEach(x=>x.classList.toggle('on',x===b));K=+b.dataset.k;init()});init()},leave:stop}}
{let done=0;FX.elbow={init(){if(done)return;done=1;const r=rng(9),inr=[],sil=[];for(let k=1;k<=8;k++){const res=kmeansFull(KD,k,r);inr[k]=res.inr;if(k>1)sil[k]=silhouette(KD,res.A,k)}
  const m=mapper(70,20,520,330,0.5,8.5,0,inr[1]*1.05);let h=axes(m,70,20,520,330,'K','inércia');let p='';for(let k=1;k<=8;k++)p+=(k>1?'L':'M')+m.X(k)+' '+m.Y(inr[k]);
  const bestS=sil.reduce((b,v,k)=>v!==undefined&&(b<0||v>sil[b])?k:b,-1);
  h+=`<path d="${p}" fill="none" stroke="${COL.gr}" stroke-width="4"/>`;for(let k=1;k<=8;k++)h+=`<circle cx="${m.X(k)}" cy="${m.Y(inr[k])}" r="${k===3?13:7}" fill="${k===3?COL.am:COL.gr}"/><text x="${m.X(k)}" y="386" text-anchor="middle" font-size="17" fill="${COL.mu}">${k}</text>`;
  h+=`<text x="${m.X(3)+20}" y="${m.Y(inr[3])-20}" font-size="20" font-weight="700" fill="${COL.am}">cotovelo?</text>`;$('#elbowSvg').innerHTML=h;
  const mm=mapper(70,20,520,330,1.5,8.5,0,Math.max(...sil.filter(x=>x!==undefined))*1.15);let g=axes(mm,70,20,520,330,'K','silhouette');
  for(let k=2;k<=8;k++){const x=mm.X(k)-24,y=mm.Y(sil[k]);g+=`<rect x="${x}" y="${y}" width="48" height="${350-y}" rx="6" fill="${k===bestS?COL.am:COL.cy}" opacity="${k===bestS?1:.6}"/><text x="${x+24}" y="${y-10}" text-anchor="middle" font-size="16" font-family="JetBrains Mono,monospace" fill="${COL.mu}">${fmt(sil[k])}</text><text x="${x+24}" y="386" text-anchor="middle" font-size="17" fill="${COL.mu}">${k}</text>`}
  $('#silSvg').innerHTML=g}}}

/* ---------- 23 neuron & activations ---------- */
if($('#netSmall')){const L=[[60,[20,60,100]],[220,[0,40,80,120]],[380,[20,60,100]],[520,[60]]];let h='';
 for(let i=0;i<3;i++)for(const a of L[i][1])for(const b of L[i+1][1])h+=`<line x1="${L[i][0]+250}" y1="${a+10}" x2="${L[i+1][0]+250}" y2="${b+10}" stroke="${COL.vi}" stroke-width="1.2" opacity=".6"/>`;
 L.forEach(([x,ys],i)=>ys.forEach(y=>h+=`<circle cx="${x+250}" cy="${y+10}" r="12" fill="${COL.bg}" stroke="${i?COL.vi:COL.cy}" stroke-width="3"/>`));
 h+=`<path d="M560 -40 L560 -10" stroke="${COL.mu}" stroke-width="3" marker-end="url(#arw)"/><text x="0" y="80" font-size="22" font-weight="700" fill="${COL.vi}">camadas</text><text x="0" y="108" font-size="17" fill="${COL.mu}">neurônios empilhados</text>`;
 $('#netSmall').innerHTML=h;
 const r=rng(4),H=12,W1=[],B1=[],V=[];for(let i=0;i<H;i++){W1.push(gauss(r)*1.6);B1.push(gauss(r)*1.8);V.push(gauss(r))}
 const act={lin:z=>z,relu:z=>Math.max(0,z),sig:z=>1/(1+Math.exp(-z))};const msg={lin:'<span class="rd">Sem não linearidade, 12 neurônios viram uma única reta</span>',relu:'<span class="gr">ReLU: a rede desenha uma curva por partes</span>',sig:'<span class="gr">Sigmoide: a rede desenha uma curva suave</span>'};
 function draw(a){const f=x=>W1.reduce((s,w,i)=>s+V[i]*act[a](w*x+B1[i]),0);const xs=[],ys=[];for(let i=0;i<=200;i++){const x=-3+6*i/200;xs.push(x);ys.push(f(x))}
  const lo=Math.min(...ys),hi=Math.max(...ys),pad=(hi-lo)*.1+1e-6,m=mapper(40,10,420,270,-3,3,lo-pad,hi+pad);let p='';xs.forEach((x,i)=>p+=(i?'L':'M')+m.X(x)+' '+m.Y(ys[i]));
  $('#actPlot').innerHTML=axes(m,40,10,420,270,'entrada x','saída')+`<path d="${p}" fill="none" stroke="${COL.vi}" stroke-width="4"/>`;$('#actMsg').innerHTML=msg[a]}
 FX.neuron={init(){$$('#actBtns button').forEach(b=>b.onclick=()=>{$$('#actBtns button').forEach(x=>x.classList.toggle('on',x===b));draw(b.dataset.a)});draw('relu')}}}

/* ---------- 25 next token bars ---------- */
if($('#ntBars')){const o=[['azul',.41],['nublado',.27],['limpo',.14],['escuro',.09],['lindo',.06],['…',.03]];
 $('#ntBars').innerHTML=o.map(([t,p],i)=>`<div style="display:grid;grid-template-columns:150px 1fr 70px;align-items:center;gap:16px;font-size:26px"><span class="mono" style="text-align:right;${i?'':'font-weight:700'}">${t}</span><div style="height:34px"><div class="ntb" style="height:100%;width:${p/.41*100}%;background:${COL.vi};opacity:${i?.55:1};border-radius:8px;transform-origin:left;transition:transform .8s ${i*.1}s"></div></div><span class="mono mu" style="font-size:21px">${Math.round(p*100)}%</span></div>`).join('')}

/* ---------- 26 tokenizer ---------- */
{const pal=[COL.cy,COL.vi,COL.gr,COL.am,COL.pk];const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.codePointAt(0),16777619);return h>>>0};
 const tokenize=t=>{const out=[];t.split(/(\s+)/).filter(Boolean).reduce((pre,w)=>{if(/^\s+$/.test(w))return '␣';const word=pre+w;let i=0;while(i<word.length){const n=word.length-i>6?4:word.length-i;out.push(word.slice(i,i+n));i+=n}return ''},'');return out.slice(0,9)};
 function draw(){const toks=tokenize($('#tokIn').value||' ');
  $('#tokOut').innerHTML=`<div style="display:grid;grid-template-columns:200px repeat(${toks.length},minmax(0,1fr));gap:16px 14px;align-items:center">`+
  `<span class="lbl mu" style="font-size:14px">Tokens</span>`+toks.map((t,i)=>`<div class="mono" style="text-align:center;font-size:24px;font-weight:700;padding:12px 4px;border-radius:12px;border:2px solid ${pal[i%5]};background:${pal[i%5]}33;white-space:nowrap;overflow:hidden">${t}</div>`).join('')+
  `<span class="lbl mu" style="font-size:14px">IDs</span>`+toks.map((t,i)=>`<div class="mono" style="text-align:center;font-size:26px;color:${pal[i%5]}">${hash(t)%50000}</div>`).join('')+
  `<span class="lbl mu" style="font-size:14px">Embedding</span>`+toks.map((t,i)=>{const h=hash(t);return `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">${Array.from({length:12},(_,k)=>`<i style="height:26px;border-radius:4px;background:${pal[i%5]};opacity:${.15+((h>>>(k*2))&7)/8.5}"></i>`).join('')}</div>`}).join('')+
  `<span class="lbl mu" style="font-size:14px">Posição</span>`+toks.map((t,i)=>`<div class="mono mu" style="text-align:center;font-size:19px">+ pos ${i}</div>`).join('')+`</div>`}
 FX.tok={init(){$('#tokIn').oninput=draw;draw()}}}

/* ---------- 27 attention ---------- */
{const W=['O','robô','não','pegou','a','caixa','porque','ele','estava','sem','bateria'];let sel=7;
 const preset={7:[.03,.55,.02,.08,.02,.18,.04,.08]};
 const weights=i=>{if(preset[i])return preset[i];const s=[];for(let j=0;j<=i;j++)s.push(Math.cos(i*1.7+j*2.3)*1.6+(j===i?1.2:0));const mx=Math.max(...s),e=s.map(v=>Math.exp(v-mx)),z=e.reduce((a,b)=>a+b,0);return e.map(v=>v/z)};
 function draw(){const ws=W.map(w=>34+w.length*15),gap=14,tot=ws.reduce((a,b)=>a+b,0)+gap*(W.length-1);let x=(1408-tot)/2;const cx=[];ws.forEach(w=>{cx.push(x+w/2);x+=w+gap});
  const by=272,wt=weights(sel);let h=`<defs><marker id="arvF" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="18" markerHeight="18" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${COL.vi}"/></marker></defs>`;
  wt.forEach((v,j)=>{if(j===sel)return;const x1=cx[sel],x2=cx[j],hh=40+Math.abs(x1-x2)*.32;h+=`<path d="M${x1} ${by-6} C${x1} ${by-hh*1.3} ${x2} ${by-hh*1.3} ${x2} ${by-8}" fill="none" stroke="${COL.vi}" stroke-width="${1+v*16}" opacity="${.35+v*.65}" marker-end="url(#arvF)"/>`});
  W.forEach((w,i)=>{const fut=i>sel,me=i===sel;h+=`<g class="tk" data-i="${i}" style="cursor:pointer"><rect x="${cx[i]-ws[i]/2}" y="${by}" width="${ws[i]}" height="72" rx="12" fill="${me?COL.vi:COL.p2}" opacity="${fut?.35:1}"/><text x="${cx[i]}" y="${by+32}" text-anchor="middle" font-size="24" font-weight="${me?700:500}" fill="${fut?COL.dim:COL.tx}">${w}</text>${i<sel?`<text x="${cx[i]}" y="${by+58}" text-anchor="middle" font-size="15" font-family="JetBrains Mono,monospace" font-weight="700" fill="${COL.vi}">${fmt(wt[i])}</text>`:i===sel?`<text x="${cx[i]}" y="${by+58}" text-anchor="middle" font-size="15" font-family="JetBrains Mono,monospace" fill="${COL.tx}" opacity=".8">${fmt(wt[i])}</text>`:''}</g>`});
  h+=`<text x="${cx[Math.min(W.length-1,sel+1)]-ws[Math.min(W.length-1,sel+1)]/2}" y="${by+100}" font-size="17" font-style="italic" fill="${COL.dim}">${sel<W.length-1?'tokens futuros: bloqueados pela máscara causal':''}</text>`;
  $('#attSvg').innerHTML=h;$$('#attSvg .tk').forEach(g=>g.onclick=()=>{sel=+g.dataset.i;draw()})}
 let mk='';for(let r=0;r<6;r++)for(let c=0;c<6;c++)mk+=`<rect x="${c*28}" y="${r*28}" width="24" height="24" rx="4" fill="${c<=r?COL.vi:COL.ln}" opacity="${c<=r?.85:1}"/>`;if($('#maskSvg'))$('#maskSvg').innerHTML=mk;
 FX.att={init(){draw()}}}

/* ---------- 28 generation loop ---------- */
{const start=['O','céu','hoje','está'],cont=[[['azul',.41],['nublado',.27],['limpo',.14]],[['e',.38],[',',.30],['.',.18]],[['sem',.33],['com',.25],['muito',.12]],[['nuvens',.62],['vento',.14],['chuva',.09]],[['.',.71],['hoje',.08],['!',.06]]];
 const boxes=[['Tokens + posições',COL.cy],['Embeddings',COL.cy],['N × Bloco Transformer',COL.vi],['Logits',COL.am],['Softmax',COL.am],['Próximo token',COL.gr]];
 let ctx=[...start],busy=0;
 function drawBoxes(active){let h='';const bw=196,g=46;boxes.forEach(([t,c],i)=>{const x=i*(bw+g),big=i===2,on=i===active;h+=`<rect x="${x}" y="${big?20:50}" width="${bw}" height="${big?160:100}" rx="16" fill="${c}" fill-opacity="${on?.55:.14}" stroke="${c}" stroke-width="${on?4:2}" style="transition:all .2s"/><foreignObject x="${x}" y="${big?20:50}" width="${bw}" height="${big?160:100}"><div xmlns="http://www.w3.org/1999/xhtml" style="height:100%;display:grid;place-items:center;text-align:center;font:700 21px Inter;color:#EAF0FF;padding:8px">${t}</div></foreignObject>`;if(i<5)h+=`<path d="M${x+bw+6} 100 H${x+bw+g-8}" stroke="${COL.mu}" stroke-width="3" marker-end="url(#ar)"/>`});
  const xl=5*(bw+g)+bw/2;h+=`<path d="M${xl} 152 V250 H${bw/2} V158" fill="none" stroke="${COL.gr}" stroke-width="3" stroke-dasharray="10 8" marker-end="url(#arc)" style="animation:flow 1s linear infinite"/><text x="704" y="282" text-anchor="middle" font-size="19" font-style="italic" fill="${COL.gr}">o token escolhido volta ao contexto: laço autorregressivo</text>`;
  $('#genSvg').innerHTML=h}
 function show(newIdx){$('#genCtx').innerHTML=ctx.map((t,i)=>`<span style="${i>=start.length?`color:${COL.gr};font-weight:700`:''}${i===newIdx?';border-bottom:4px solid '+COL.gr:''}">${t}</span>`).join(' ')}
 function gen(){const k=ctx.length-start.length;if(busy||k>=cont.length)return;busy=1;let i=0;const opts=cont[k];$('#genTop').innerHTML='';
  const t=setInterval(()=>{drawBoxes(i);if(i===4)$('#genTop').innerHTML=opts.map((o,j)=>`<span style="color:${j?COL.mu:COL.am}">${o[0]} ${Math.round(o[1]*100)}%</span>`).join(' &nbsp; ');i++;if(i>5){clearInterval(t);ctx.push(opts[0][0]);show(ctx.length-1);setTimeout(()=>{drawBoxes(-1);busy=0},400)}},300)}
 FX.gen={init(){$('#genGo').onclick=gen;$('#genRst').onclick=()=>{ctx=[...start];show();$('#genTop').innerHTML='';drawBoxes(-1)};drawBoxes(-1);show()}}}

/* ---------- 29 temperature ---------- */
{const toks=['azul','nublado','limpo','escuro','lindo','cinza'],lg=[3.0,2.4,1.6,1.0,0.6,0.3];let T=1,r=rng(42);
 const probs=()=>{const e=lg.map(l=>Math.exp(l/T)),z=e.reduce((a,b)=>a+b,0);return e.map(v=>v/z)};
 function draw(){const p=probs();$('#tTv').textContent=fmt(T);
  $('#tBars').innerHTML=p.map((v,i)=>`<div style="display:grid;grid-template-columns:150px 1fr 90px;gap:16px;align-items:center;font-size:25px"><span class="mono" style="text-align:right">${toks[i]}</span><div style="height:36px;background:${COL.p1};border-radius:8px"><div style="height:100%;width:${v*100}%;background:${COL.am};opacity:${i?.6:1};border-radius:8px;transition:width .25s"></div></div><span class="mono mu" style="font-size:21px">${Math.round(v*100)}%</span></div>`).join('')}
 function sample(){const p=probs();const out=[];for(let n=0;n<10;n++){let u=r(),i=0;for(;i<p.length-1;i++){u-=p[i];if(u<=0)break}out.push(toks[i])}
  $('#tOut').insertAdjacentHTML('beforeend',`<div><span class="am">T=${fmt(T,1)}</span> ${out.join(' · ')}</div>`);const o=$('#tOut');while(o.children.length>4)o.firstChild.remove()}
 FX.temp={init(){$('#tT').oninput=e=>{T=+e.target.value;draw()};$('#tS').onclick=sample;$('#tR').onclick=()=>{$('#tOut').innerHTML='';r=rng(42)};draw()}}}

/* ---------- 32 chain ---------- */
if($('#chain')){const ch=[['dados',COL.cy],['previsão',COL.cy],['erro',COL.am],['ajuste',COL.vi],['avaliação',COL.gr],['generalização',COL.gr]];
 $('#chain').innerHTML=ch.map(([t,c],i)=>`<div class="f" data-f="${i+1}" style="display:flex;align-items:center"><div style="text-align:center;width:180px"><div style="width:96px;height:96px;margin:0 auto 14px;border-radius:50%;border:4px solid ${c};background:${c}33;display:grid;place-items:center;font:700 34px 'JetBrains Mono',monospace;color:${c}">${i+1}</div><b style="font-size:24px">${t}</b></div>${i<5?`<svg width="50" height="20" style="margin-top:-40px"><path d="M0 10H40" stroke="${COL.mu}" stroke-width="3" marker-end="url(#ar)"/></svg>`:''}</div>`).join('')}

/* ---------- VC: pixels ---------- */
{const N=14,S=36;let showN=1,drawing=0,erase=0;
 function draw(){let h=`<rect x="-1" y="-1" width="${N*S+1}" height="${N*S+1}" fill="${COL.ln}"/>`;
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){const v=IMG[r*N+c],g=Math.round(v*255);h+=`<rect x="${c*S}" y="${r*S}" width="${S-1}" height="${S-1}" fill="rgb(${g},${g},${g})"/>`;if(showN)h+=`<text x="${c*S+S/2-.5}" y="${r*S+S/2+4}" text-anchor="middle" font-size="11" font-family="JetBrains Mono,monospace" fill="${v>.5?COL.bg:COL.dim}">${g}</text>`}
  $('#pxGrid').innerHTML=h;
  let vh='';const cw=760/98;for(let i=0;i<196;i++){const g=Math.round(IMG[i]*255);vh+=`<rect x="${(i%98)*cw}" y="${Math.floor(i/98)*31}" width="${cw-1}" height="29" fill="rgb(${g},${g},${g})" stroke="${COL.ln}" stroke-width=".5"/>`}$('#pxVec').innerHTML=vh}
 function paint(e){const svg=$('#pxGrid'),pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const p=pt.matrixTransform(svg.getScreenCTM().inverse());const c=Math.floor(p.x/S),r=Math.floor(p.y/S);if(c<0||r<0||c>=N||r>=N)return;
  for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const rr=r+dr,cc=c+dc;if(rr<0||cc<0||rr>=N||cc>=N)continue;const w=dr||dc?(dr&&dc?.08:.25):.9,k=rr*N+cc;IMG[k]=erase?Math.max(0,IMG[k]-w*1.3):Math.min(1,IMG[k]+w)}draw()}
 FX.px={init(){const svg=$('#pxGrid');
  svg.addEventListener('pointerdown',e=>{drawing=1;erase=e.shiftKey;try{svg.setPointerCapture(e.pointerId)}catch(_){}paint(e)});
  svg.addEventListener('pointermove',e=>{if(drawing)paint(e)});['pointerup','pointercancel','pointerleave'].forEach(t=>svg.addEventListener(t,()=>drawing=0));
  $('#pxEx').onclick=()=>{loadPat();draw()};$('#pxClr').onclick=()=>{IMG.fill(0);draw()};$('#pxNum').onclick=()=>{showN^=1;$('#pxNum').classList.toggle('on',!!showN);draw()}},enter(){draw()}}}

/* ---------- VC: convolução ---------- */
{let kk='v',pos=144,timer=null;const S=28,KX=480,KY=91,KS=70,OX=840,OY=28;
 function draw(){const k=KER[kk],out=conv(IMG,14,k);let mx=1e-6;out.forEach(v=>mx=Math.max(mx,Math.abs(v)));const a=pos<144?pos:-1;
  let h=`<rect x="-1" y="-1" width="${14*S+1}" height="${14*S+1}" fill="${COL.ln}"/>`;
  for(let i=0;i<196;i++){const g=Math.round(IMG[i]*255);h+=`<rect x="${(i%14)*S}" y="${Math.floor(i/14)*S}" width="${S-1}" height="${S-1}" fill="rgb(${g},${g},${g})"/>`}
  h+=`<rect x="${OX-1}" y="${OY-1}" width="${12*S+1}" height="${12*S+1}" fill="${COL.ln}"/>`;
  for(let i=0;i<144;i++){const x=OX+(i%12)*S,y=OY+Math.floor(i/12)*S;if(a>=0&&i>a){h+=`<rect x="${x}" y="${y}" width="${S-1}" height="${S-1}" fill="${COL.p1}"/>`;continue}
   const v=out[i];h+=`<rect x="${x}" y="${y}" width="${S-1}" height="${S-1}" fill="${COL.bg}"/>`;if(Math.abs(v)>1e-3)h+=`<rect x="${x}" y="${y}" width="${S-1}" height="${S-1}" fill="${v>0?COL.cy:COL.am}" opacity="${(Math.abs(v)/mx).toFixed(2)}"/>`}
  let mk=0;k.forEach(r=>r.forEach(v=>mk=Math.max(mk,Math.abs(v))));
  k.forEach((row,i)=>row.forEach((v,j)=>{const x=KX+j*KS,y=KY+i*KS;h+=`<rect x="${x}" y="${y}" width="${KS-4}" height="${KS-4}" rx="10" fill="${v>0?COL.cy:v<0?COL.am:COL.p2}" fill-opacity="${v?(.25+.55*Math.abs(v)/mk).toFixed(2):1}"/><text x="${x+KS/2-2}" y="${y+KS/2+6}" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="21">${kk==='blur'?'1/9':v}</text>`}));
  h+=`<text x="436" y="224" text-anchor="middle" font-size="54" fill="${COL.mu}">∗</text><text x="765" y="220" text-anchor="middle" font-size="54" fill="${COL.mu}">=</text>`;
  if(a>=0){const r=Math.floor(a/12),c=a%12;h+=`<line x1="${c*S+1.5*S}" y1="${r*S+1.5*S}" x2="${OX+c*S+S/2}" y2="${OY+r*S+S/2}" stroke="${COL.or}" stroke-width="2" stroke-dasharray="6 6" opacity=".55"/><rect x="${c*S-2}" y="${r*S-2}" width="${3*S+3}" height="${3*S+3}" fill="${COL.or}" fill-opacity=".2" stroke="${COL.or}" stroke-width="4"/><rect x="${OX+c*S-2}" y="${OY+r*S-2}" width="${S+3}" height="${S+3}" fill="none" stroke="${COL.or}" stroke-width="4"/>`}
  const lab=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="18" fill="${COL.mu}">${t}</text>`;
  h+=lab(196,424,'imagem 14 × 14')+lab(KX+3*KS/2-2,KY+3*KS+34,'filtro 3 × 3 (pesos)')+lab(OX+168,OY+336+34,'mapa de características 12 × 12');
  h+=`<rect x="1220" y="150" width="28" height="28" rx="6" fill="${COL.cy}"/><text x="1260" y="171" font-size="19">positivo</text><rect x="1220" y="196" width="28" height="28" rx="6" fill="${COL.am}"/><text x="1260" y="217" font-size="19">negativo</text>`;
  $('#convSvg').innerHTML=h;
  $('#convCalc').innerHTML=a>=0?`posição (${Math.floor(a/12)+1}, ${a%12+1}) · Σ pixel × peso = <b style="color:${out[a]>=0?COL.cy:COL.am}">${fmt(out[a])}</b>`:'<span class="mu">cada saída = soma de 9 multiplicações (pixel × peso)</span>'}
 function stop(){clearInterval(timer);timer=null;$('#convGo').textContent='▶ Deslizar'}
 FX.conv={init(){$$('#convK button').forEach(b=>b.onclick=()=>{$$('#convK button').forEach(x=>x.classList.toggle('on',x===b));kk=b.dataset.k;draw()});
  $('#convGo').onclick=()=>{if(timer){stop();return}if(pos>=144)pos=0;$('#convGo').textContent='❚❚ Pausar';timer=setInterval(()=>{pos++;draw();if(pos>=144)stop()},50)}},enter(){draw()},leave(){stop();pos=144}}}

/* ---------- VC: CNN ---------- */
{const r=rng(13),K2=Array.from({length:6},()=>[0,1,2].map(()=>[0,1,2].map(()=>gauss(r))));
 const K1=[KER.v,KER.h,[[2,1,0],[1,0,-1],[0,-1,-2]],[[0,1,2],[-1,0,1],[-2,-1,0]]];
 const relu=a=>a.map(v=>Math.max(0,v));
 const pool=(a,n)=>{const m=n/2,o=new Float32Array(m*m);for(let i=0;i<m;i++)for(let j=0;j<m;j++)o[i*m+j]=Math.max(a[2*i*n+2*j],a[2*i*n+2*j+1],a[(2*i+1)*n+2*j],a[(2*i+1)*n+2*j+1]);return o};
 const fmap=(a,n,x,y,cs,col)=>{let mx=1e-6;a.forEach(v=>mx=Math.max(mx,v));let h=`<rect x="${x-3}" y="${y-3}" width="${n*cs+6}" height="${n*cs+6}" rx="5" fill="${COL.bg}" stroke="${col}" stroke-width="1.5"/>`;for(let i=0;i<n*n;i++){const v=a[i]/mx;if(v>.03)h+=`<rect x="${x+(i%n)*cs}" y="${y+Math.floor(i/n)*cs}" width="${cs}" height="${cs}" fill="${col}" opacity="${v.toFixed(2)}"/>`}return h};
 const arrow=(x1,x2,y=250)=>`<path d="M${x1} ${y} H${x2}" stroke="${COL.mu}" stroke-width="3" marker-end="url(#ar)"/>`;
 const lab=(x,t,s)=>`<text x="${x}" y="392" text-anchor="middle" font-size="20" font-weight="700">${t}</text><text x="${x}" y="418" text-anchor="middle" font-size="16" fill="${COL.mu}">${s}</text>`;
 const PR=[.005,.04,.01,.005,.01,.003,.002,.9,.005,.02];
 function draw(){const L1=K1.map(k=>relu(conv(IMG,14,k))),P1=L1.map(a=>pool(a,12)),L2=K2.map((k,j)=>{const a=conv(P1[j%4],6,k),b=conv(P1[(j+1)%4],6,k);return relu(a.map((v,i)=>v+.6*b[i]))});
  let h=`<rect x="-3" y="147" width="202" height="202" rx="5" fill="${COL.ln}"/>`;
  for(let i=0;i<196;i++){const g=Math.round(IMG[i]*255);h+=`<rect x="${(i%14)*14}" y="${150+Math.floor(i/14)*14}" width="13" height="13" fill="rgb(${g},${g},${g})"/>`}
  h+=lab(98,'Imagem','14 × 14 pixels')+arrow(210,250);
  let g1='';L1.forEach((a,i)=>g1+=fmap(a,12,262+i*24,128+i*24,10,COL.or));P1.forEach((a,i)=>g1+=fmap(a,6,522+i*18,172+i*18,12,COL.or));
  h+=`<g class="f" data-f="1">${g1}${lab(358,'Conv + ReLU','4 filtros 3 × 3')}${arrow(466,510)}${lab(580,'Pooling','máximo 2 × 2')}<text x="460" y="470" text-anchor="middle" font-size="22" font-weight="700" fill="${COL.or}">bordas e traços</text></g>`;
  let g2='';L2.forEach((a,i)=>g2+=fmap(a,4,712+i*14,170+i*14,14,COL.pk));
  const all=[].concat(...L2.map(a=>[...a]));let fm=1e-6;all.forEach(v=>fm=Math.max(fm,v));
  let g3='';for(let i=0;i<14;i++){const v=all[(i*7)%all.length]/fm;g3+=`<rect x="900" y="${152+i*14}" width="12" height="12" fill="${COL.pk}" opacity="${(.15+.85*v).toFixed(2)}"/>`}
  h+=`<g class="f" data-f="2">${arrow(652,700)}${g2}${lab(772,'Conv + ReLU','6 filtros')}${arrow(850,890)}${g3}${lab(906,'Achatar','vira vetor')}<text x="830" y="470" text-anchor="middle" font-size="22" font-weight="700" fill="${COL.pk}">curvas e formas</text></g>`;
  let g4='';for(let i=0;i<14;i++)for(let j=0;j<8;j++)g4+=`<line x1="912" y1="${158+i*14}" x2="1008" y2="${152+j*28}" stroke="${COL.vi}" stroke-width=".7" opacity=".35"/>`;for(let j=0;j<8;j++)g4+=`<circle cx="1018" cy="${152+j*28}" r="10" fill="${COL.bg}" stroke="${COL.vi}" stroke-width="2.5"/>`;
  h+=`<g class="f" data-f="3">${g4}${lab(1018,'Densa','combina tudo')}</g>`;
  let g5='';PR.forEach((p,d)=>{const y=100+d*27,top=d===7,w=Math.max(3,p*230);g5+=`<line x1="1028" y1="${152+(d%8)*28}" x2="1088" y2="${y+11}" stroke="${COL.vi}" stroke-width=".7" opacity=".3"/><text x="1104" y="${y+17}" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="18" font-weight="${top?700:400}" fill="${top?COL.gr:COL.mu}">${d}</text><rect x="1120" y="${y+3}" width="${w}" height="17" rx="5" fill="${top?COL.gr:COL.dim}"/><text x="${1128+w}" y="${y+17}" font-family="JetBrains Mono,monospace" font-size="15" fill="${top?COL.gr:COL.dim}">${Math.round(p*100)}%</text>`});
  h+=`<g class="f" data-f="4">${g5}${lab(1200,'Saída','probabilidade por classe')}<text x="1200" y="470" text-anchor="middle" font-size="22" font-weight="700" fill="${COL.gr}">“é um 7”</text></g>`;
  $('#cnnSvg').innerHTML=h}
 FX.cnn={enter(){draw()}}}

/* ---------- VC: tarefas ---------- */
if($('#vcTasks')){const car=(f,s)=>`<path d="M54 110 L72 82 H118 L136 110" fill="${f}" stroke="${s}" stroke-width="2.5"/><rect x="28" y="108" width="128" height="42" rx="12" fill="${f}" stroke="${s}" stroke-width="2.5"/><circle cx="60" cy="152" r="13" fill="${COL.bg}" stroke="${s}" stroke-width="3"/><circle cx="124" cy="152" r="13" fill="${COL.bg}" stroke="${s}" stroke-width="3"/>`;
 const per=(f,s)=>`<circle cx="222" cy="70" r="16" fill="${f}" stroke="${s}" stroke-width="2.5"/><rect x="205" y="92" width="34" height="68" rx="14" fill="${f}" stroke="${s}" stroke-width="2.5"/>`;
 const gnd=`<line x1="0" y1="166" x2="300" y2="166" stroke="${COL.ln}" stroke-width="3"/>`,N=COL.p2,S=COL.mu;
 const T=[['Classificação','o que tem na imagem?',gnd+car(N,S)+`<rect x="176" y="22" width="114" height="40" rx="20" fill="${COL.or}"/><text x="233" y="49" text-anchor="middle" font-size="19" font-weight="700" fill="${COL.bg}">carro 94%</text>`],
  ['Detecção','onde está cada objeto?',gnd+car(N,S)+per(N,S)+`<rect x="18" y="72" width="150" height="94" fill="none" stroke="${COL.or}" stroke-width="3" stroke-dasharray="8 5"/><rect x="18" y="48" width="70" height="24" fill="${COL.or}"/><text x="53" y="66" text-anchor="middle" font-size="15" font-weight="700" fill="${COL.bg}">carro</text><rect x="196" y="46" width="52" height="120" fill="none" stroke="${COL.cy}" stroke-width="3" stroke-dasharray="8 5"/><rect x="196" y="22" width="76" height="24" fill="${COL.cy}"/><text x="234" y="40" text-anchor="middle" font-size="15" font-weight="700" fill="${COL.bg}">pessoa</text>`],
  ['Segmentação','a que objeto pertence cada pixel?',`<rect x="0" y="166" width="300" height="34" fill="${COL.gr}" opacity=".35"/>`+gnd+car(COL.or+'cc',COL.or)+per(COL.cy+'cc',COL.cy)],
  ['Leitura de texto (OCR)','transformar pixels em letras',`<rect x="40" y="50" width="220" height="74" rx="10" fill="#EAF0FF"/><rect x="48" y="58" width="204" height="58" rx="6" fill="none" stroke="#0B1020" stroke-width="2"/><text x="150" y="101" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="34" fill="#0B1020">BRA2E19</text><rect x="34" y="44" width="232" height="86" rx="12" fill="none" stroke="${COL.or}" stroke-width="3" stroke-dasharray="8 5"/><text x="150" y="176" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="24" fill="${COL.or}">→ "BRA2E19"</text>`]];
 $('#vcTasks').innerHTML=T.map(([t,d,s])=>`<div class="card"><div class="lbl or" style="font-size:15px">${t}</div><svg viewBox="0 0 300 200" style="width:100%;height:200px;margin:16px 0 12px">${s}</svg><div class="mu" style="font-size:19px">${d}</div></div>`).join('')}

/* ---------- LLM: embeddings ---------- */
{const Wd=[['azul',2,5.6],['vermelho',1.2,6.2],['verde',2.7,6.4],['amarelo',2.4,4.9],['gato',7.4,5.9],['cachorro',8.2,6.3],['cavalo',8.7,5.3],['leão',7.1,5.0],['nublado',1.8,1.6],['chuva',1.0,1.0],['sol',2.6,2.0],['vento',1.3,2.4],['céu',2.6,3.0],['banana',7.0,1.7],['maçã',7.9,1.2],['uva',8.6,2.1],['morango',6.8,2.9],['laranja',4.6,3.9]];
 const m=mapper(40,20,800,500,0,10,0,7.2),CC=[COL.cy,COL.am,COL.gr,COL.pk];let sel=0,km=null;
 function draw(){const q=Wd[sel],nn=Wd.map((w,i)=>[i,Math.hypot(w[1]-q[1],w[2]-q[2])]).filter(a=>a[0]!==sel).sort((a,b)=>a[1]-b[1]).slice(0,3);
  let h=`<rect x="20" y="0" width="840" height="550" rx="20" fill="${COL.p1}" opacity=".55"/>`;const R=nn[2][1],qx=m.X(q[1]),qy=m.Y(q[2]);
  h+=`<ellipse cx="${qx}" cy="${qy}" rx="${R*80+24}" ry="${R*500/7.2+24}" fill="${COL.vi}" fill-opacity=".07" stroke="${COL.vi}" stroke-dasharray="8 7" stroke-width="2"/>`;
  nn.forEach(([i])=>h+=`<line x1="${qx}" y1="${qy}" x2="${m.X(Wd[i][1])}" y2="${m.Y(Wd[i][2])}" stroke="${COL.vi}" stroke-width="2.5" stroke-dasharray="6 5"/>`);
  Wd.forEach((w,i)=>{const X=m.X(w[1]),Y=m.Y(w[2]),isQ=i===sel,isN=nn.some(a=>a[0]===i),col=km?CC[km[i]]:(isQ||isN?COL.vi:COL.mu);
   h+=`<g class="ew" data-i="${i}" style="cursor:pointer"><circle cx="${X}" cy="${Y}" r="26" fill="transparent"/><circle cx="${X}" cy="${Y}" r="${isQ?12:8}" fill="${col}"/><text x="${X}" y="${Y-18}" text-anchor="middle" font-size="${isQ?24:20}" font-weight="${isQ||isN?700:500}" fill="${isQ||isN||km?COL.tx:COL.mu}">${w[0]}</text></g>`});
  $('#embSvg').innerHTML=h;$$('#embSvg .ew').forEach(g=>g.onclick=()=>{sel=+g.dataset.i;draw()});
  $('#embQ').textContent=q[0];$('#embNN').innerHTML=nn.map(([i,d],k)=>`<div><span class="mu">${k+1}.</span> ${Wd[i][0]} <span class="mu">· distância ${fmt(d)}</span></div>`).join('')}
 FX.emb={init(){$('#embKm').onclick=()=>{km=kmeansFull(Wd.map(w=>[w[1],w[2]]),4,rng(3)).A;draw()};$('#embRst').onclick=()=>{km=null;draw()};draw()}}}

/* ---------- LLM: multimodal ---------- */
if($('#multiSvg')){let h=`<defs><linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E2466"/><stop offset="1" stop-color="#F59E0B" stop-opacity=".8"/></linearGradient><g id="scene"><rect width="240" height="240" fill="url(#skyG)"/><circle cx="165" cy="118" r="32" fill="#FDE68A"/><path d="M0 196 L68 112 L118 168 L172 98 L240 186 V240 H0Z" fill="#1B2442"/><path d="M0 222 L58 172 L128 214 L196 162 L240 198 V240 H0Z" fill="#0F1530"/></g></defs>`;
 h+=`<use href="#scene" x="0" y="140"/><text x="120" y="122" text-anchor="middle" font-size="18" fill="${COL.mu}">imagem</text>`;
 let g='';for(let i=1;i<4;i++)g+=`<line x1="${i*60}" y1="140" x2="${i*60}" y2="380" stroke="#fff" stroke-width="2" opacity=".75"/><line x1="0" y1="${140+i*60}" x2="240" y2="${140+i*60}" stroke="#fff" stroke-width="2" opacity=".75"/>`;
 let p='';for(let k=0;k<16;k++){const x=320+k*52,pr=Math.floor(k/4),pc=k%4;p+=`<svg x="${x}" y="150" width="44" height="44" viewBox="${pc*60} ${pr*60} 60 60"><use href="#scene"/></svg><rect x="${x}" y="150" width="44" height="44" rx="4" fill="none" stroke="${COL.or}" stroke-width="1.5"/>`;for(let j=0;j<4;j++)p+=`<rect x="${x+2+j*10.5}" y="204" width="8" height="22" rx="2" fill="${COL.vi}" opacity="${(.25+((k*5+j*3)%7)/9).toFixed(2)}"/>`}
 h+=`<g class="f" data-f="1">${g}<path d="M250 230 C292 230 288 172 312 172" fill="none" stroke="${COL.or}" stroke-width="3" marker-end="url(#ar)"/>${p}<text x="320" y="132" font-size="19" font-weight="700" fill="${COL.or}">16 pedaços (patches) → 16 vetores, como tokens</text></g>`;
 let x=320,t='';['Descreva','esta','imagem'].forEach(w=>{const wd=30+w.length*13;t+=`<rect x="${x}" y="266" width="${wd}" height="44" rx="22" fill="${COL.vi}" fill-opacity=".2" stroke="${COL.vi}" stroke-width="2"/><text x="${x+wd/2}" y="295" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="19" font-weight="700">${w}</text>`;x+=wd+10});
 h+=`<g class="f" data-f="2"><text x="320" y="254" font-size="19" font-weight="700" fill="${COL.vi}">+ tokens de texto</text>${t}</g>`;
 let ar='';[360,520,680,840,1000,1120].forEach(v=>ar+=`<path d="M${v} 314 V336" stroke="${COL.mu}" stroke-width="2.5" marker-end="url(#ar)"/>`);
 h+=`<g class="f" data-f="3">${ar}<rect x="320" y="342" width="826" height="78" rx="18" fill="${COL.vi}" fill-opacity=".18" stroke="${COL.vi}" stroke-width="2.5"/><text x="733" y="390" text-anchor="middle" font-size="24" font-weight="700">Transformer · atenção sobre imagem e texto juntos</text></g>`;
 x=320;let o='';['Montanhas','com','o','sol','se','pondo'].forEach(w=>{const wd=28+w.length*13;o+=`<rect x="${x}" y="468" width="${wd}" height="44" rx="22" fill="${COL.gr}" fill-opacity=".2" stroke="${COL.gr}" stroke-width="2"/><text x="${x+wd/2}" y="497" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="19" font-weight="700" fill="${COL.gr}">${w}</text>`;x+=wd+10});
 h+=`<g class="f" data-f="4"><path d="M733 424 V460" stroke="${COL.gr}" stroke-width="3" marker-end="url(#arc)"/>${o}<text x="${x+10}" y="497" font-size="18" font-style="italic" fill="${COL.mu}">gerada token a token</text></g>`;
 const cap=(y,f,c,a,b)=>`<g class="f" data-f="${f}"><foreignObject x="1186" y="${y}" width="222" height="90"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 19px/1.25 Inter,sans-serif;color:${c}">${a}<div style="font-weight:400;color:#8A94B8;font-size:16px;margin-top:4px">${b}</div></div></foreignObject></g>`;
 h+=cap(146,1,COL.or,'Vision Transformer','cada pedaço vira um vetor')+cap(262,2,COL.vi,'Texto','tokens, como antes')+cap(346,3,COL.vi,'Uma só sequência','a atenção mistura tudo')+cap(464,4,COL.gr,'Saída','o mesmo laço autorregressivo');
 $('#multiSvg').innerHTML=h}

/* ---------- LLM: síntese ---------- */
if($('#synRows')){const R=[[2,'trilhões de tokens de texto: qualidade, viés e vazamento continuam importando'],[3,'perda + descida do gradiente: a mesma regra ajusta bilhões de parâmetros'],[4,'vizinhos mais próximos entre embeddings: busca semântica e RAG'],[5,'agrupar embeddings para organizar e deduplicar textos'],[6,'imagens cortadas em pedaços viram tokens: modelos multimodais']];
 $('#synRows').innerHTML=R.map(([b,t],i)=>{const B=BLK[b],c=COL[B[2]];return `<div class="card f" data-f="${i+1}" style="display:grid;grid-template-columns:80px 420px 60px 1fr;align-items:center;padding:18px 26px;border-left:5px solid ${c}"><span class="mono big" style="font-size:32px;color:${c}">${B[0]}</span><b style="font-size:26px">${B[3]}</b><span class="mu" style="font-size:30px">→</span><span style="font-size:22px">${t}</span></div>`}).join('')}

/* =================== DIA 1 · novos =================== */
const tbl=(head,rows)=>`<table class="dt"><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr>${rows.join('')}</table>`;

/* ---------- dados bagunçados ---------- */
if($('#messyTbl')){
 const R=[[2,6,'noite','4,1'],[5,2,'manhã','7,3'],[8,null,'Manhã','8,9'],[3,4,'tarde','5,2'],[5,2,'manhã','7,3'],[80,1,'MANHÃ ','9,1'],[null,3,'manha','6,0'],[6,0,'tarde',null]];
 const C=[[2,6,'noite','4,1'],[5,2,'manhã','7,3'],[8,'~2,5','~manhã','8,9'],[3,4,'tarde','5,2'],['~8,0',1,'~manhã','9,1'],['~5,0',3,'~manhã','6,0']];
 const P=[['Valores faltantes','am','imputar (ex.: mediana) ou remover · sem o alvo, a linha sai do treino'],['Duplicados','rd','remover: a mesma linha conta duas vezes'],['Outliers','pk','investigar: 80 h por semana? provável erro de digitação (8,0)'],['Categorias inconsistentes','vi','padronizar: minúsculas, sem acento solto nem espaços'],['Tabela limpa','gr','8 linhas → 6 · cada decisão registrada no notebook']];
 const H=['#','Horas','Faltas','Turno','Nota'];
 function draw(k){const td=(v,st)=>`<td style="${st||''}">${v===null?'NaN':v}</td>`;let rows;
  if(k<5)rows=R.map((r,i)=>{const dup=k>=2&&i===4,inc=!['manhã','noite','tarde'].includes(r[2]);
    const st=j=>{if(dup)return`background:${COL.rd}33;color:${COL.rd}`;if(k>=1&&r[j]===null)return`background:${COL.am}40;color:${COL.am};font-weight:700`;if(k>=3&&i===5&&j===0)return`background:${COL.pk}40;color:${COL.pk};font-weight:700`;if(k>=4&&inc&&j===2)return`background:${COL.vi}40;color:${COL.vi};font-weight:700`;return''};
    return `<tr>${td(i+1,(dup?`background:${COL.rd}33;`:'')+'color:var(--dim)')}${r.map((v,j)=>td(v,st(j))).join('')}</tr>`});
  else rows=C.map((r,i)=>`<tr>${td(i+1,'color:var(--dim)')}${r.map(v=>typeof v==='string'&&v[0]==='~'?td(v.slice(1),`background:${COL.gr}33;color:${COL.gr};font-weight:700`):td(v)).join('')}</tr>`);
  $('#messyTbl').innerHTML=tbl(H,rows);
  $('#messyCards').innerHTML=P.map(([t,c,d],i)=>`<div class="card" style="padding:16px 20px;border-left:4px solid ${k>i?COL[c]:COL.ln};opacity:${k>i?1:.35};transition:opacity .3s"><b style="color:${COL[c]};font-size:22px">${t}</b><div class="mu" style="font-size:18px;margin-top:4px">${d}</div></div>`).join('')}
 FX.messy={init(){draw(0)},step:draw}}

/* ---------- EDA ---------- */
if($('#edaHist')){const r=rng(31),Hs=[],Ns=[];for(let i=0;i<200;i++){const h=Math.max(.5,Math.min(14,6+gauss(r)*2.2));Hs.push(h);Ns.push(Math.max(0,Math.min(10,1.9+.55*h+gauss(r)*1.1)))}
 const OH=[38,45,80],ON=[6.2,7.0,9.1];let out=0;
 const med=a=>{const s=[...a].sort((x,y)=>x-y),n=s.length;return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2},mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
 const q=(a,p)=>{const s=[...a].sort((x,y)=>x-y),i=(s.length-1)*p,lo=Math.floor(i);return s[lo]+(s[Math.ceil(i)]-s[lo])*(i-lo)};
 function draw(){const H=out?[...Hs,...OH]:Hs,N=out?[...Ns,...ON]:Ns,mu=mean(H),md=med(H);
  const bins=Array(16).fill(0);Hs.forEach(v=>bins[Math.min(15,Math.floor(v))]++);
  const m=mapper(50,40,640,260,0,16,0,Math.max(...bins)*1.08);let h=axes(m,50,40,640,260,'','alunos');
  bins.forEach((c,i)=>h+=`<rect x="${m.X(i)+1}" y="${m.Y(c)}" width="${m.X(1)-m.X(0)-2}" height="${m.Y(0)-m.Y(c)}" rx="3" fill="${COL.cy}" opacity=".55"/>`);
  for(let v=0;v<=16;v+=4)h+=`<text x="${m.X(v)}" y="322" text-anchor="middle" font-size="15" fill="${COL.dim}">${v}${v===16?' h':''}</text>`;
  const ln=(v,c,t,dy)=>`<line x1="${m.X(Math.min(16,v))}" y1="40" x2="${m.X(Math.min(16,v))}" y2="300" stroke="${c}" stroke-width="3" stroke-dasharray="${c===COL.am?'8 6':'0'}"/><text x="${m.X(Math.min(16,v))+8}" y="${40+dy}" font-size="16" font-weight="700" fill="${c}">${t}</text>`;
  h+=ln(md,COL.cy,'mediana',0)+ln(mu,COL.am,'média',22);
  if(out)h+=`<text x="690" y="70" text-anchor="end" font-size="16" font-weight="700" fill="${COL.rd}">+3 alunos: 38, 45 e 80 h →</text>`;
  const q1=q(H,.25),q3=q(H,.75),iqr=q3-q1,lo=Math.max(Math.min(...H),q1-1.5*iqr),hi=Math.min(Math.max(...H.filter(v=>v<=q3+1.5*iqr)),q3+1.5*iqr),by=390,X=v=>m.X(Math.min(16,v));
  h+=`<text x="50" y="352" font-size="15" fill="${COL.mu}">boxplot</text><line x1="${X(lo)}" y1="${by}" x2="${X(hi)}" y2="${by}" stroke="${COL.mu}" stroke-width="2"/><rect x="${X(q1)}" y="${by-22}" width="${X(q3)-X(q1)}" height="44" rx="6" fill="${COL.cy}" fill-opacity=".25" stroke="${COL.cy}" stroke-width="2"/><line x1="${X(md)}" y1="${by-22}" x2="${X(md)}" y2="${by+22}" stroke="${COL.cy}" stroke-width="4"/>`;
  H.filter(v=>v>q3+1.5*iqr||v<q1-1.5*iqr).forEach((v,i)=>h+=`<circle cx="${X(v)-(v>16?i*4:0)}" cy="${by}" r="6" fill="none" stroke="${COL.rd}" stroke-width="2.5"/>`);
  h+=`<text x="690" y="440" text-anchor="end" font-size="15" fill="${COL.dim}">caixa = 50% do meio · círculos = pontos extremos</text>`;
  $('#edaHist').innerHTML=h;$('#edaMean').textContent=fmt(mu,1)+' h';$('#edaMed').textContent=fmt(md,1)+' h';
  const xm=Math.max(16,...H),s=mapper(40,10,460,200,0,xm,0,10);let g=axes(s,40,10,460,200);H.forEach((v,i)=>g+=`<circle cx="${s.X(v)}" cy="${s.Y(N[i])}" r="${v>16?6:3.5}" fill="${v>16?COL.rd:COL.cy}" opacity="${v>16?1:.6}"/>`);
  g+=`<text x="500" y="244" text-anchor="end" font-size="14" fill="${COL.dim}">horas →</text><text x="44" y="24" font-size="14" fill="${COL.dim}">nota</text>`;$('#edaSc').innerHTML=g;
  const mx=mean(H),my=mean(N);let sxy=0,sxx=0,syy=0;H.forEach((v,i)=>{sxy+=(v-mx)*(N[i]-my);sxx+=(v-mx)**2;syy+=(N[i]-my)**2});$('#edaR').innerHTML=`r = <b class="cy">${fmt(sxy/Math.sqrt(sxx*syy))}</b>`}
 FX.eda={init(){$('#edaOut').onclick=()=>{out^=1;$('#edaOut').textContent=out?'Remover outliers':'Adicionar outliers';$('#edaOut').classList.toggle('on',!!out);draw()};draw()}}}

/* ---------- encoding ---------- */
if($('#encTbl')){const R=[['Ana','noite','médio'],['Bruno','manhã','superior'],['Carla','tarde','fundamental'],['Davi','manhã','médio']];
 const LBL={noite:0,'manhã':1,tarde:2},ORD={fundamental:0,'médio':1,superior:2},hl=c=>`style="background:${COL[c]}33;color:${COL[c]};font-weight:700"`;
 const MSG={raw:[['tx','Texto não entra em conta','o modelo precisa de números em todas as colunas']],
  label:[['rd','Ordem falsa','para o modelo, tarde (2) > manhã (1) > noite (0)?'],['mu','Quando serve','em árvores, às vezes funciona; em modelos lineares e KNN, distorce']],
  onehot:[['gr','Uma coluna por categoria','0/1, sem ordem: OneHotEncoder · pd.get_dummies'],['am','Cuidado','categorias demais (ex.: CEP) = colunas demais']],
  ord:[['gr','Aqui a ordem é real','fundamental < médio < superior'],['mu','No código','OrdinalEncoder(categories=[[…]])']]};
 function draw(md){let H,rows;
  if(md==='onehot'){H=['Nome','turno_manhã','turno_noite','turno_tarde','Escolaridade'];rows=R.map(r=>`<tr><td>${r[0]}</td>${['manhã','noite','tarde'].map(t=>`<td ${r[1]===t?hl('cy'):''}>${r[1]===t?1:0}</td>`).join('')}<td>${r[2]}</td></tr>`)}
  else{H=['Nome','Turno','Escolaridade'];rows=R.map(r=>`<tr><td>${r[0]}</td><td ${md==='label'?hl('rd'):''}>${md==='label'?LBL[r[1]]+' <small style="opacity:.6">('+r[1]+')</small>':r[1]}</td><td ${md==='ord'?hl('gr'):''}>${md==='ord'?ORD[r[2]]+' <small style="opacity:.6">('+r[2]+')</small>':r[2]}</td></tr>`)}
  $('#encTbl').innerHTML=tbl(H,rows);$('#encMsg').innerHTML=MSG[md].map(([c,t,d])=>`<div class="card" style="border-left:4px solid ${COL[c]}"><b style="color:${COL[c]};font-size:24px">${t}</b><div class="mu" style="font-size:19px;margin-top:6px">${d}</div></div>`).join('')}
 FX.enc={init(){$$('#encBtns button').forEach(b=>b.onclick=()=>{$$('#encBtns button').forEach(x=>x.classList.toggle('on',x===b));draw(b.dataset.m)});draw('raw')}}}

/* ---------- escala ---------- */
if($('#scSvg')){const PP=[['Você',25,3000,'tx'],['A',62,3200,'am'],['B',27,4500,'cy']],MU=[40,4000],SD=[15,2000];let std=0;
 const brl=v=>'R$ '+v.toLocaleString('pt-BR');
 function draw(){const z=p=>std?[(p[1]-MU[0])/SD[0],(p[2]-MU[1])/SD[1]]:[p[1],p[2]],me=z(PP[0]);
  $('#scPeople').innerHTML=PP.map(p=>{const v=z(p);return `<div class="card row" style="justify-content:space-between;align-items:center;padding:18px 24px;border-left:5px solid ${COL[p[3]]}"><b style="font-size:28px;color:${COL[p[3]]}">${p[0]}</b><span class="mono" style="font-size:22px">${std?`z = ${fmt(v[0])}`:p[1]+' anos'}</span><span class="mono" style="font-size:22px">${std?`z = ${fmt(v[1])}`:brl(p[2])}</span></div>`}).join('');
  const D=PP.slice(1).map(p=>{const v=z(p),a=(v[0]-me[0])**2,b=(v[1]-me[1])**2;return{p,a,b,d:Math.sqrt(a+b)}}),mx=Math.max(...D.map(x=>x.a+x.b));let h='';
  D.forEach((x,i)=>{const y=40+i*150,wa=x.a/mx*560,wb=x.b/mx*560;h+=`<text x="0" y="${y+42}" font-size="30" font-weight="700" fill="${COL[x.p[3]]}">${x.p[0]}</text><rect x="60" y="${y}" width="${Math.max(2,wa)}" height="64" rx="6" fill="${COL.cy}"/><rect x="${60+wa}" y="${y}" width="${Math.max(2,wb)}" height="64" rx="6" fill="${COL.am}"/><text x="${70+wa+wb}" y="${y+42}" font-family="JetBrains Mono,monospace" font-size="22" font-weight="700">d = ${fmt(x.d,std?2:0)}</text>`});
  h+=`<rect x="60" y="330" width="22" height="22" rx="5" fill="${COL.cy}"/><text x="92" y="348" font-size="18">idade²</text><rect x="200" y="330" width="22" height="22" rx="5" fill="${COL.am}"/><text x="232" y="348" font-size="18">renda²</text>`;
  $('#scSvg').innerHTML=h;const w=D[0].d<D[1].d?D[0]:D[1];
  $('#scVerdict').innerHTML=std?`<span class="gr">Mais parecido: B</span> <span class="mu" style="font-size:22px">idade e renda pesam igual</span>`:`<span class="rd">Mais parecido: ${w.p[0]}, de 62 anos?!</span> <span class="mu" style="font-size:22px">a renda domina</span>`}
 FX.scale={init(){$('#scBtn').onclick=()=>{std^=1;$('#scBtn').classList.toggle('on',!!std);$('#scBtn').textContent=std?'Voltar ao original':'Padronizar';draw()};draw()}}}

/* ---------- validação cruzada ---------- */
if($('#cvSvg')){const S=[.82,.79,.85,.80,.83],m=S.reduce((a,b)=>a+b)/5,sd=Math.sqrt(S.reduce((a,b)=>a+(b-m)**2,0)/5);let h='';
 h+=`<rect x="1190" y="30" width="218" height="352" rx="14" fill="${COL.p1}" stroke="${COL.dim}" stroke-dasharray="8 6" stroke-width="2"/><text x="1299" y="190" text-anchor="middle" font-size="24" font-weight="700" fill="${COL.mu}">Teste</text><text x="1299" y="220" text-anchor="middle" font-size="16" fill="${COL.dim}">guardado até o fim</text>`;
 h+=`<text x="150" y="18" font-size="16" fill="${COL.mu}">dados de treino divididos em 5 partes (folds)</text>`;
 S.forEach((s,k)=>{const y=34+k*72;let g=`<text x="0" y="${y+38}" font-size="20" font-weight="700">Rodada ${k+1}</text>`;
  for(let f=0;f<5;f++){const x=150+f*182,v=f===k;g+=`<rect x="${x}" y="${y}" width="176" height="56" rx="8" fill="${v?COL.am:COL.cy}" fill-opacity="${v?.85:.28}"/><text x="${x+88}" y="${y+35}" text-anchor="middle" font-size="16" font-weight="700" fill="${v?COL.bg:COL.tx}">${v?'validação':'treino'}</text>`}
  g+=`<text x="1080" y="${y+38}" font-family="JetBrains Mono,monospace" font-size="24" font-weight="700" fill="${COL.am}">${fmt(s)}</text>`;h+=`<g class="f" data-f="${k+1}">${g}</g>`});
 h+=`<g class="f" data-f="6"><text x="150" y="440" font-size="30" font-weight="700">Resultado: <tspan fill="${COL.am}" font-family="JetBrains Mono,monospace">${fmt(m)} ± ${fmt(sd)}</tspan></text><text x="640" y="440" font-size="20" fill="${COL.mu}">média e desvio das 5 rodadas · notas ilustrativas</text></g>`;
 $('#cvSvg').innerHTML=h}

/* ---------- regressão múltipla ---------- */
if($('#mrSvg')){const W1=.6,W2=-.35,B0=4;
 function draw(){const hs=+$('#mrH').value,fa=+$('#mrF').value,a=W1*hs,b=W2*fa,y=B0+a+b;$('#mrHv').textContent=hs;$('#mrFv').textContent=fa;
  $('#mrCalc').innerHTML=TX(`\\am{\\hat{y}} = \\cy{0{,}6\\cdot ${tn(fmt(hs,1))}}\\;\\rd{-\\,0{,}35\\cdot ${fa}} + \\vi{4{,}0} = \\am{${tn(fmt(y))}}`,`ŷ = <span class="cy">0,6·${fmt(hs,1)}</span> <span class="rd">− 0,35·${fa}</span> + <span class="vi">4,0</span> = <span class="am">${fmt(y)}</span>`);
  const m=mapper(80,20,640,440,0,4,0,12);let h=axes(m,80,20,640,440);for(let v=0;v<=12;v+=2)h+=`<text x="68" y="${m.Y(v)+5}" text-anchor="end" font-size="15" fill="${COL.dim}">${v}</text><line x1="80" y1="${m.Y(v)}" x2="720" y2="${m.Y(v)}" stroke="${COL.ln}" stroke-width="1" opacity=".5"/>`;
  const bars=[['b',0,B0,COL.vi,'4,0'],['horas',B0,B0+a,COL.cy,'+'+fmt(a)],['faltas',B0+a,y,COL.rd,fmt(b)],['ŷ',0,y,COL.am,fmt(y)]];
  bars.forEach(([t,y0,y1,c,l],i)=>{const x=m.X(i+.18),w=m.X(.64)-m.X(0),top=m.Y(Math.max(y0,y1));h+=`<rect x="${x}" y="${top}" width="${w}" height="${Math.max(2,Math.abs(m.Y(y0)-m.Y(y1)))}" rx="8" fill="${c}" fill-opacity="${i===3?.9:.75}"/><text x="${x+w/2}" y="${top-12}" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="21" font-weight="700" fill="${c}">${l}</text><text x="${x+w/2}" y="492" text-anchor="middle" font-size="19" font-weight="700">${t}</text>`;
   if(i<2)h+=`<line x1="${x+w}" y1="${m.Y(y1)}" x2="${m.X(i+1.18)}" y2="${m.Y(y1)}" stroke="${COL.mu}" stroke-dasharray="5 5" stroke-width="2"/>`});
  $('#mrSvg').innerHTML=h}
 FX.mreg={init(){$('#mrH').oninput=draw;$('#mrF').oninput=draw;draw()}}}

/* ---------- regularização ---------- */
if($('#regPlot')&&FITD){const {tr,va,solve,ev,mse}=FITD,D=11,m=mapper(70,20,730,470,-1,1,-1.8,1.8);
 function ridge(lam){const n=D+1,A=Array.from({length:n},()=>Array(n).fill(0)),b=Array(n).fill(0);for(const[x,y]of tr){const p=[];for(let k=0;k<n;k++)p.push(x**k);for(let i=0;i<n;i++){b[i]+=p[i]*y;for(let j=0;j<n;j++)A[i][j]+=p[i]*p[j]}}for(let i=0;i<n;i++)A[i][i]+=i?lam:1e-9;return solve(A,b)}
 const grid=[];for(let l=-7;l<=2.001;l+=.1)grid.push([l,mse(ridge(10**l),va)]);const best=grid.reduce((a,b)=>b[1]<a[1]?b:a);
 const c0=ridge(1e-7),cmax=Math.max(...c0.slice(1).map(Math.abs));
 function draw(){const L=+$('#regL').value,c=ridge(10**L),ftr=mse(c,tr),fva=mse(c,va);let h=axes(m,70,20,730,470,'','y'),p='';
  for(let i=0;i<=300;i++){const x=-1+2*i/300,y=Math.max(-3,Math.min(3,ev(c,x)));p+=(i?'L':'M')+m.X(x).toFixed(1)+' '+m.Y(y).toFixed(1)}
  const tag=fva<=best[1]*1.3?['bom ajuste',COL.gr]:L<best[0]?['overfitting',COL.rd]:['underfitting',COL.am];
  h+=`<path d="${p}" fill="none" stroke="${tag[1]}" stroke-width="4" clip-path="url(#clipFit)"/>`;
  va.forEach(([x,y])=>h+=`<circle cx="${m.X(x)}" cy="${m.Y(y)}" r="7" fill="none" stroke="${COL.am}" stroke-width="2.5"/>`);tr.forEach(([x,y])=>h+=`<circle cx="${m.X(x)}" cy="${m.Y(y)}" r="8" fill="${COL.tx}"/>`);
  h+=`<circle cx="100" cy="530" r="8" fill="${COL.tx}"/><text x="116" y="536" font-size="18">treino</text><circle cx="210" cy="530" r="7" fill="none" stroke="${COL.am}" stroke-width="2.5"/><text x="226" y="536" font-size="18">validação</text><text x="800" y="536" text-anchor="end" font-size="18" fill="${COL.mu}">polinômio de grau 11</text>`;
  $('#regPlot').innerHTML=h;$('#regLv').textContent=L<=-6.95?'≈ 0':'10^'+fmt(L,1);$('#regTr').textContent=fmt(ftr,3);$('#regVa').textContent=fmt(fva,3);$('#regTag').textContent=tag[0];$('#regTag').style.color=tag[1];
  let g='';const lg=v=>Math.max(0,(Math.log10(v+1e-3)+3)/(Math.log10(cmax+1e-3)+3));c.slice(1).forEach((w,k)=>{const hh=lg(Math.abs(w))*120;g+=`<rect x="${10+k*46}" y="${130-hh}" width="34" height="${Math.max(2,hh)}" rx="4" fill="${COL.am}" opacity=".8"/><text x="${27+k*46}" y="148" text-anchor="middle" font-size="12" fill="${COL.dim}">w${k+1}</text>`});$('#regCoef').innerHTML=g}
 FX.reg={init(){$('#regL').oninput=draw;draw()}}}

/* ---------- distâncias ---------- */
if($('#distSvg')){const r=rng(17),P=[];for(let i=0;i<34;i++)P.push([.4+r()*9.2,.4+r()*6.4]);const A=[4,3.6],m=mapper(30,10,700,500,0,10,0,500/70);let B=[7.5,5.6],M='e';
 function draw(){const R=3,s=70;let h=`<rect x="30" y="10" width="700" height="500" rx="14" fill="${COL.p1}" opacity=".5"/>`;
  for(let x=0;x<=10;x++)h+=`<line x1="${m.X(x)}" y1="10" x2="${m.X(x)}" y2="510" stroke="${COL.ln}" opacity=".45"/>`;for(let y=0;y<=7;y++)h+=`<line x1="30" y1="${m.Y(y)}" x2="730" y2="${m.Y(y)}" stroke="${COL.ln}" opacity=".45"/>`;
  const c=M==='e'?COL.cy:COL.am,ax=m.X(A[0]),ay=m.Y(A[1]);
  h+=M==='e'?`<circle cx="${ax}" cy="${ay}" r="${R*s}" fill="${c}" fill-opacity=".1" stroke="${c}" stroke-width="2.5" stroke-dasharray="9 7"/>`:`<path d="M${ax} ${ay-R*s} L${ax+R*s} ${ay} L${ax} ${ay+R*s} L${ax-R*s} ${ay}Z" fill="${c}" fill-opacity=".1" stroke="${c}" stroke-width="2.5" stroke-dasharray="9 7"/>`;
  const inside=p=>M==='e'?Math.hypot(p[0]-A[0],p[1]-A[1])<=R:Math.abs(p[0]-A[0])+Math.abs(p[1]-A[1])<=R;let n=0;
  P.forEach(p=>{const k=inside(p);n+=k;h+=`<circle cx="${m.X(p[0])}" cy="${m.Y(p[1])}" r="7" fill="${k?c:COL.dim}" opacity="${k?1:.7}"/>`});
  const bx=m.X(B[0]),by=m.Y(B[1]);h+=`<path d="M${ax} ${ay} H${bx} V${by}" fill="none" stroke="${COL.am}" stroke-width="4" stroke-dasharray="${M==='m'?'0':'10 6'}" opacity="${M==='m'?1:.6}"/><line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${COL.cy}" stroke-width="4" stroke-dasharray="${M==='e'?'0':'10 6'}" opacity="${M==='e'?1:.6}"/>`;
  h+=`<circle cx="${ax}" cy="${ay}" r="13" fill="${COL.tx}"/><text x="${ax-22}" y="${ay-16}" font-size="24" font-weight="700">A</text><circle cx="${bx}" cy="${by}" r="13" fill="${COL.vi}"/><text x="${bx+16}" y="${by-14}" font-size="24" font-weight="700" fill="${COL.vi}">B</text>`;
  $('#distSvg').innerHTML=h;const dx=B[0]-A[0],dy=B[1]-A[1];$('#dE').textContent=fmt(Math.hypot(dx,dy));$('#dM').textContent=fmt(Math.abs(dx)+Math.abs(dy));$('#dCnt').innerHTML=`pontos na região: <b style="color:${c}">${n}</b>`}
 FX.dist={init(){$$('#distM button').forEach(b=>b.onclick=()=>{$$('#distM button').forEach(x=>x.classList.toggle('on',x===b));M=b.dataset.m;draw()});
  $('#distSvg').addEventListener('click',e=>{const svg=$('#distSvg'),pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const p=pt.matrixTransform(svg.getScreenCTM().inverse());const x=m.ix(p.x),y=m.iy(p.y);if(x>0&&x<10&&y>0&&y<7.14){B=[x,y];draw()}});draw()}}}

/* ---------- limiar ---------- */
if($('#thrSvg')){const r=rng(23),S=[];for(let i=0;i<22;i++)S.push([Math.max(.03,Math.min(.97,.68+gauss(r)*.17)),1,r()]);for(let i=0;i<22;i++)S.push([Math.max(.03,Math.min(.97,.33+gauss(r)*.17)),0,r()]);
 const X=v=>220+v*1150;
 function draw(){const t=+$('#thrT').value;let h=`<rect x="${X(t)}" y="20" width="${X(1)-X(t)}" height="250" rx="10" fill="${COL.pk}" opacity=".08"/>`;
  h+=`<text x="0" y="98" font-size="20" font-weight="700" fill="${COL.pk}">real positivo</text><text x="0" y="214" font-size="20" font-weight="700" fill="${COL.cy}">real negativo</text>`;
  h+=`<line x1="${X(0)}" y1="270" x2="${X(1)}" y2="270" stroke="${COL.dim}" stroke-width="2"/>`;[0,.25,.5,.75,1].forEach(v=>h+=`<text x="${X(v)}" y="296" text-anchor="middle" font-size="16" fill="${COL.dim}">${fmt(v,2)}</text>`);h+=`<text x="${X(1)}" y="318" text-anchor="end" font-size="16" fill="${COL.mu}">score do modelo →</text>`;
  let tp=0,fp=0,fn=0,tn=0;S.forEach(([s,c,j])=>{const p=s>=t;if(c&&p)tp++;else if(c)fn++;else if(p)fp++;else tn++;const y=(c?92:208)+(j-.5)*56,col=c?COL.pk:COL.cy;h+=p?`<circle cx="${X(s)}" cy="${y}" r="9" fill="${col}"/>`:`<circle cx="${X(s)}" cy="${y}" r="8" fill="none" stroke="${col}" stroke-width="2.5"/>`});
  h+=`<line x1="${X(t)}" y1="10" x2="${X(t)}" y2="276" stroke="${COL.tx}" stroke-width="4"/><text x="${X(t)+10}" y="34" font-size="17" font-weight="700">previsto positivo →</text><text x="${X(t)-10}" y="34" text-anchor="end" font-size="17" fill="${COL.mu}">← previsto negativo</text>`;
  $('#thrSvg').innerHTML=h;$('#thrTv').textContent=fmt(t);
  const P=tp+fp?tp/(tp+fp):0,R=tp/(tp+fn),F=P+R?2*P*R/(P+R):0,card=(l,v,c,s)=>`<div class="card" style="flex:1;padding:18px 22px"><div class="lbl" style="font-size:14px;color:${c}">${l}</div><div class="big mono" style="font-size:44px;margin-top:6px;color:${c}">${v}</div><div class="mu" style="font-size:16px;margin-top:4px">${s}</div></div>`;
  $('#thrStats').innerHTML=card('VP · FN',tp+' · '+fn,COL.pk,'positivos achados · perdidos')+card('FP · VN',fp+' · '+tn,COL.cy,'alarmes falsos · negativos certos')+card('Precision',Math.round(P*100)+'%',COL.gr,'dos previstos ✓, quantos eram')+card('Recall',Math.round(R*100)+'%',COL.am,'dos ✓ reais, quantos achei')+card('F1',fmt(F),COL.vi,'equilíbrio entre os dois')}
 FX.thr={init(){$('#thrT').oninput=draw;draw()}}}

/* ---------- fim do dia 1 ---------- */
if($('#d1recap')){const T={2:'Limpar, explorar, transformar e dividir antes de tudo. O teste é uma prova inédita.',3:'A perda mede o erro, o gradiente diz para onde ajustar e a regularização segura a complexidade.',4:'O KNN vota, as árvores perguntam, as florestas combinam. A métrica e o limiar dependem do custo do erro.'};
 $('#d1recap').innerHTML=[2,3,4].map(b=>`<div class="card" style="border-top:4px solid ${COL[BLK[b][2]]}"><span class="mono big" style="font-size:30px;color:${COL[BLK[b][2]]}">${BLK[b][0]}</span> <b style="font-size:24px">${BLK[b][3]}</b><div class="mu" style="font-size:20px;margin-top:12px">${T[b]}</div></div>`).join('');
 $('#d1next').innerHTML=`<span class="lbl mu" style="font-size:15px;margin-right:6px">Amanhã</span>`+[5,6,7,8].map(b=>`<span class="pill" style="color:${COL[BLK[b][2]]}">${BLK[b][0]} · ${BLK[b][3]}</span>`).join('')}

/* =================== DIA 2 · novos =================== */
if($('#recapChain')){const ch=[['dados','cy'],['limpeza','cy'],['split','cy'],['modelo','am'],['perda','am'],['gradiente','am'],['avaliação','pk']];
 $('#recapChain').innerHTML=ch.map(([t,c],i)=>`<div style="display:flex;align-items:center"><div class="pill" style="color:var(--${c});font-size:22px;padding:12px 22px">${t}</div>${i<ch.length-1?`<svg width="40" height="20"><path d="M4 10H32" stroke="${COL.mu}" stroke-width="3" marker-end="url(#ar)"/></svg>`:''}</div>`).join('')}

/* ---------- K-Means × DBSCAN ---------- */
if($('#kfKm')){const r=rng(41),G={};const cl=v=>Math.max(.15,Math.min(9.85,v)),cy=v=>Math.max(.15,Math.min(6.7,v));
 G.blobs={K:3,eps:.6,P:[]};[[2.5,2],[7,2.2],[5,5.1]].forEach(([x,y])=>{for(let i=0;i<80;i++)G.blobs.P.push([cl(x+gauss(r)*.6),cy(y+gauss(r)*.6)])});
 G.moons={K:2,eps:.5,P:[]};for(let i=0;i<120;i++){const t=Math.PI*i/119;G.moons.P.push([3+2.2*Math.cos(t)+gauss(r)*.13,2.6+2.2*Math.sin(t)+gauss(r)*.13]);G.moons.P.push([5.2-2.2*Math.cos(t)+gauss(r)*.13,3.7-2.2*Math.sin(t)+gauss(r)*.13])}
 G.rings={K:2,eps:.55,P:[]};for(let i=0;i<240;i++){const o=i>=80,t=r()*2*Math.PI,R=(o?2.7:1)+gauss(r)*.12;G.rings.P.push([5+R*Math.cos(t),3.45+R*Math.sin(t)])}
 G.dens={K:2,eps:.5,P:[]};for(let i=0;i<130;i++)G.dens.P.push([cl(3+gauss(r)*.4),cy(3.4+gauss(r)*.4)]);for(let i=0;i<70;i++)G.dens.P.push([cl(6.9+gauss(r)*1.25),cy(3.4+gauss(r)*1.25)]);
 const NOTE={blobs:['bolhas redondas: o K-Means vai bem','também acerta'],moons:['corta as luas ao meio','segue o formato pela densidade'],rings:['não separa anel de dentro e de fora','separa os anéis'],dens:['a fronteira fica no meio: erra o grupo esparso','o grupo esparso vira parte ruído']};
 function dbscan(P,eps,mp){const n=P.length,L=Array(n).fill(-2),nb=i=>{const o=[];for(let j=0;j<n;j++)if(Math.hypot(P[i][0]-P[j][0],P[i][1]-P[j][1])<=eps)o.push(j);return o};let c=0;
  for(let i=0;i<n;i++){if(L[i]!==-2)continue;const N=nb(i);if(N.length<mp){L[i]=-1;continue}L[i]=c;const Q=[...N];while(Q.length){const j=Q.pop();if(L[j]===-1)L[j]=c;if(L[j]!==-2)continue;L[j]=c;const M=nb(j);if(M.length>=mp)Q.push(...M)}c++}return L}
 const m=mapper(10,10,620,410,0,10,0,6.85),CC=[COL.gr,COL.am,COL.cy,COL.pk,COL.vi,COL.ye];
 const plot=(P,L,t)=>{let h='';P.forEach((p,i)=>h+=`<circle cx="${m.X(p[0])}" cy="${m.Y(p[1])}" r="5" fill="${L[i]<0?COL.dim:CC[L[i]%6]}" opacity="${L[i]<0?.6:.9}"/>`);return h+`<text x="320" y="436" text-anchor="middle" font-size="18" fill="${COL.mu}">${t}</text>`};
 const cache={};function draw(d){const g=G[d];if(!cache[d]){const km=kmeansFull(g.P,g.K,rng(2)).A,db=dbscan(g.P,g.eps,5);cache[d]={km,db}}const {km,db}=cache[d];
  $('#kfK').textContent=g.K;$('#kfKm').innerHTML=plot(g.P,km,NOTE[d][0]);const nc=Math.max(...db)+1,nz=db.filter(v=>v<0).length;$('#kfDb').innerHTML=plot(g.P,db,`${NOTE[d][1]} · ${nc} grupos, ${nz} ruído`)}
 FX.kmfail={init(){$$('#kfSet button').forEach(b=>b.onclick=()=>{$$('#kfSet button').forEach(x=>x.classList.toggle('on',x===b));draw(b.dataset.d)});draw('blobs')}}}

/* ---------- hierárquico ---------- */
if($('#dgTree')){const P=[[1.5,7.8],[2.4,8.5],[1.8,6.8],[2.9,7.3],[6.9,8.2],[7.7,7.5],[7.2,8.9],[3.1,2.3],[4.0,1.7],[3.6,3.2],[7.9,2.5],[8.7,3.4]],NM='ABCDEFGHIJKL';
 let cl=P.map((p,i)=>({m:[i],h:0,leaf:i}));const dist=(A,B)=>{let s=0;A.m.forEach(i=>B.m.forEach(j=>s+=Math.hypot(P[i][0]-P[j][0],P[i][1]-P[j][1])));return s/(A.m.length*B.m.length)};
 while(cl.length>1){let bi=0,bj=1,bd=1e9;for(let i=0;i<cl.length;i++)for(let j=i+1;j<cl.length;j++){const d=dist(cl[i],cl[j]);if(d<bd){bd=d;bi=i;bj=j}}const C={m:[...cl[bi].m,...cl[bj].m],a:cl[bi],b:cl[bj],h:bd};cl=cl.filter((_,k)=>k!==bi&&k!==bj);cl.push(C)}
 const root=cl[0],HM=root.h,order=(n=>{const o=[];(function f(x){x.a?(f(x.a),f(x.b)):o.push(x.leaf)})(n);return o})(root),lx={};order.forEach((l,i)=>lx[l]=60+i*(730/11));
 const Y=h=>400-h/HM*370,CC=[COL.gr,COL.am,COL.cy,COL.pk,COL.vi,COL.ye,COL.rd,COL.or,COL.tx,COL.mu,COL.dim,COL.ln],pm=mapper(20,10,500,480,0,10,0,9.6);
 function draw(){const cut=+$('#dgCut').value*HM,col={},nodeC=new Map();let k=0;
  (function asg(n){if(!n.a||n.h<=cut){const c=CC[k++%12];n.m.forEach(i=>col[i]=c);(function mark(x){nodeC.set(x,c);if(x.a){mark(x.a);mark(x.b)}})(n)}else{asg(n.a);asg(n.b)}})(root);
  let h='';const X=n=>n.a?(X(n.a)+X(n.b))/2:lx[n.leaf];
  (function dr(n){if(!n.a)return;const xa=X(n.a),xb=X(n.b),y=Y(n.h),c=nodeC.get(n)||COL.mu;h+=`<path d="M${xa} ${Y(n.a.h)} V${y} H${xb} V${Y(n.b.h)}" fill="none" stroke="${c}" stroke-width="3"/>`;dr(n.a);dr(n.b)})(root);
  order.forEach(l=>h+=`<text x="${lx[l]}" y="430" text-anchor="middle" font-size="20" font-weight="700" fill="${col[l]}">${NM[l]}</text>`);
  h+=`<line x1="30" y1="${Y(cut)}" x2="810" y2="${Y(cut)}" stroke="${COL.rd}" stroke-width="2.5" stroke-dasharray="10 7"/><text x="810" y="${Y(cut)-10}" text-anchor="end" font-size="16" fill="${COL.rd}">corte</text><text x="30" y="24" font-size="16" fill="${COL.mu}">distância da fusão ↑</text>`;
  $('#dgTree').innerHTML=h;let g=`<rect x="20" y="10" width="500" height="480" rx="14" fill="${COL.p1}" opacity=".5"/>`;P.forEach((p,i)=>g+=`<circle cx="${pm.X(p[0])}" cy="${pm.Y(p[1])}" r="20" fill="${col[i]}" fill-opacity=".25" stroke="${col[i]}" stroke-width="3"/><text x="${pm.X(p[0])}" y="${pm.Y(p[1])+7}" text-anchor="middle" font-size="19" font-weight="700">${NM[i]}</text>`);$('#dgPts').innerHTML=g;$('#dgK').textContent=k+(k>1?' grupos':' grupo')}
 FX.dendro={init(){$('#dgCut').oninput=draw;draw()}}}

/* ---------- PCA ---------- */
if($('#pcaSvg')){const r=rng(52),P=[],c=[5,3.85];for(let i=0;i<110;i++){const a=gauss(r)*1.9,b=gauss(r)*.55,t=.6;P.push([c[0]+a*Math.cos(t)-b*Math.sin(t),c[1]+a*Math.sin(t)+b*Math.cos(t)])}
 const m=mapper(30,10,700,540,0,10,0,540/70);let sxx=0,syy=0,sxy=0;P.forEach(([x,y])=>{sxx+=(x-c[0])**2;syy+=(y-c[1])**2;sxy+=(x-c[0])*(y-c[1])});const best=((.5*Math.atan2(2*sxy,sxx-syy)*180/Math.PI)+180)%180,tot=sxx+syy;
 function draw(){const A=+$('#pcaA').value,t=A*Math.PI/180,u=[Math.cos(t),Math.sin(t)];let h=`<rect x="30" y="10" width="700" height="540" rx="14" fill="${COL.p1}" opacity=".5"/>`,v=0;
  const L=8;h+=`<line x1="${m.X(c[0]-u[0]*L)}" y1="${m.Y(c[1]-u[1]*L)}" x2="${m.X(c[0]+u[0]*L)}" y2="${m.Y(c[1]+u[1]*L)}" stroke="${COL.gr}" stroke-width="4"/><line x1="${m.X(c[0]+u[1]*L)}" y1="${m.Y(c[1]-u[0]*L)}" x2="${m.X(c[0]-u[1]*L)}" y2="${m.Y(c[1]+u[0]*L)}" stroke="${COL.gr}" stroke-width="1.5" stroke-dasharray="6 6" opacity=".5"/>`;
  P.forEach(([x,y])=>{const s=(x-c[0])*u[0]+(y-c[1])*u[1];v+=s*s;const px=c[0]+s*u[0],py=c[1]+s*u[1];h+=`<line x1="${m.X(x)}" y1="${m.Y(y)}" x2="${m.X(px)}" y2="${m.Y(py)}" stroke="${COL.mu}" stroke-width="1" opacity=".45"/><circle cx="${m.X(x)}" cy="${m.Y(y)}" r="5" fill="${COL.cy}" opacity=".75"/><circle cx="${m.X(px)}" cy="${m.Y(py)}" r="3.5" fill="${COL.gr}"/>`});
  $('#pcaSvg').innerHTML=`<defs><clipPath id="pcaClip"><rect x="30" y="10" width="700" height="540" rx="14"/></clipPath></defs><g clip-path="url(#pcaClip)">${h}</g>`;$('#pcaAv').textContent=A+'°';const p=v/tot;$('#pcaV').textContent=Math.round(p*100)+'%';$('#pcaBar').style.width=(p*100)+'%'}
 let anim=null;FX.pca={init(){$('#pcaA').oninput=()=>{cancelAnimationFrame(anim);draw()};$('#pcaGo').onclick=()=>{const a0=+$('#pcaA').value,t0=performance.now(),tg=Math.round(best);const f=t=>{const k=Math.min(1,(t-t0)/900),e=1-(1-k)**3;$('#pcaA').value=Math.round(a0+(tg-a0)*e);draw();if(k<1)anim=requestAnimationFrame(f)};anim=requestAnimationFrame(f)};draw()},leave(){cancelAnimationFrame(anim)}}}

/* ---------- data augmentation ---------- */
if($('#augGrid')){let r=rng(61);const smp=(x,y)=>{const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0,g=(i,j)=>i<0||j<0||i>13||j>13?0:IMG[j*14+i];return g(x0,y0)*(1-fx)*(1-fy)+g(x0+1,y0)*fx*(1-fy)+g(x0,y0+1)*(1-fx)*fy+g(x0+1,y0+1)*fx*fy};
 const warp=f=>{const o=new Float32Array(196);for(let j=0;j<14;j++)for(let i=0;i<14;i++){const [x,y]=f(i,j);o[j*14+i]=smp(x,y)}return o};
 const pix=(a,S)=>{const c=S/14;let h=`<rect width="${S}" height="${S}" fill="${COL.ln}"/>`;for(let i=0;i<196;i++){const g=Math.round(Math.max(0,Math.min(1,a[i]))*255);h+=`<rect x="${(i%14)*c}" y="${Math.floor(i/14)*c}" width="${c-.6}" height="${c-.6}" fill="rgb(${g},${g},${g})"/>`}return h};
 function draw(){const dx=Math.round(r()*4-2)||1,dy=Math.round(r()*4-2),an=(r()<.5?-1:1)*(8+r()*14)*Math.PI/180,sc=r()<.5?.72+r()*.13:1.15+r()*.15,ct=.45+r()*1.1,br=r()*.5-.25,ca=Math.cos(an),sa=Math.sin(an);
  const V=[['Deslocar',`${dx>0?'+':''}${dx}, ${dy>0?'+':''}${dy} px`,warp((i,j)=>[i-dx,j-dy])],['Girar',`${Math.round(an*180/Math.PI)}°`,warp((i,j)=>[6.5+(i-6.5)*ca+(j-6.5)*sa,6.5-(i-6.5)*sa+(j-6.5)*ca])],['Zoom',`× ${fmt(sc)}`,warp((i,j)=>[6.5+(i-6.5)/sc,6.5+(j-6.5)/sc])],
   ['Ruído','σ = 0,25',IMG.map(v=>v+gauss(r)*.25)],['Contraste e brilho',`× ${fmt(ct,1)} · ${br>0?'+':''}${fmt(br,1)}`,IMG.map(v=>(v-.5)*ct+.5+br)],['Espelhar','✕ não é mais um 7',warp((i,j)=>[13-i,j])]];
  $('#augGrid').innerHTML=V.map(([t,s,a],k)=>`<div class="card" style="padding:16px 18px;${k===5?`border:2px solid ${COL.rd}`:''}"><svg viewBox="0 0 168 168" style="width:100%;height:168px">${pix(a,168)}</svg><b style="display:block;margin-top:10px;font-size:20px;color:${k===5?COL.rd:COL.or}">${t}</b><div class="mono mu" style="font-size:15px">${s}</div></div>`).join('');
  $('#augOrig').innerHTML=pix(IMG,280)}
 FX.aug={init(){$('#augGo').onclick=draw},enter(){draw()}}}

/* ---------- transfer learning ---------- */
if($('#tlSvg')){const L=['bordas','texturas','partes','objetos'];const blocks=(y,frz)=>L.map((t,i)=>{const x=40+i*172;return `<rect x="${x}" y="${y}" width="150" height="110" rx="14" fill="${COL.or}" fill-opacity="${frz?.12:.15+i*.13}" stroke="${COL.or}" stroke-width="2.5" ${frz?'stroke-dasharray="8 6"':''}/><text x="${x+75}" y="${y+46}" text-anchor="middle" font-size="18" font-weight="700">camada ${i+1}</text><text x="${x+75}" y="${y+74}" text-anchor="middle" font-size="16" fill="${COL.mu}">${t}</text>${frz?`<text x="${x+130}" y="${y+28}" text-anchor="middle" font-size="22">❄</text>`:''}${i<3?`<path d="M${x+152} ${y+55} H${x+168}" stroke="${COL.mu}" stroke-width="3" marker-end="url(#ar)"/>`:''}`}).join('');
 let h=`<text x="40" y="34" font-size="20" font-weight="700" fill="${COL.or}">Rede pré-treinada (ex.: ImageNet)</text>`+blocks(50,0)+`<path d="M710 105 H752" stroke="${COL.mu}" stroke-width="3" marker-end="url(#ar)"/><rect x="760" y="50" width="200" height="110" rx="14" fill="${COL.p2}" stroke="${COL.dim}" stroke-width="2.5"/><text x="860" y="98" text-anchor="middle" font-size="20" font-weight="700">1.000 classes</text><text x="860" y="124" text-anchor="middle" font-size="16" fill="${COL.mu}">cabeça original</text><text x="1010" y="96" font-size="20" font-weight="700">~1,2 milhão de imagens</text><text x="1010" y="124" font-size="18" fill="${COL.mu}">dias de GPU · feito uma vez</text>`;
 h+=`<g class="f" data-f="1"><path d="M380 172 V236" stroke="${COL.mu}" stroke-width="3" stroke-dasharray="7 6" marker-end="url(#ar)"/><text x="396" y="212" font-size="17" fill="${COL.mu}">copia os pesos</text><text x="40" y="270" font-size="20" font-weight="700" fill="${COL.or}">Seu modelo</text>${blocks(290,1)}<text x="40" y="432" font-size="17" fill="${COL.mu}">❄ congeladas: não treinam</text></g>`;
 h+=`<g class="f" data-f="2"><path d="M710 345 H752" stroke="${COL.mu}" stroke-width="3" marker-end="url(#ar)"/><rect x="760" y="290" width="200" height="110" rx="14" fill="${COL.gr}" fill-opacity=".25" stroke="${COL.gr}" stroke-width="3"/><text x="860" y="334" text-anchor="middle" font-size="18" font-weight="700">gato · cachorro</text><text x="860" y="360" text-anchor="middle" font-size="18" font-weight="700">· pássaro</text><text x="860" y="386" text-anchor="middle" font-size="15" fill="${COL.gr}">só esta parte treina</text><text x="1010" y="336" font-size="20" font-weight="700" fill="${COL.gr}">~ centenas de imagens</text><text x="1010" y="364" font-size="18" fill="${COL.mu}">minutos no Colab</text></g>`;
 $('#tlSvg').innerHTML=h}

/* ---------- RAG ---------- */
if($('#ragSvg')){const r=rng(8),Q=[500,240],Pts=[[Q[0]-70,Q[1]-38],[Q[0]+62,Q[1]-52],[Q[0]+40,Q[1]+66]];while(Pts.length<28){const p=[310+r()*360,70+r()*330];if(Math.hypot(p[0]-Q[0],p[1]-Q[1])>130)Pts.push(p)}const nn=[0,1,2];
 const cap=(x,y,w,c,n,t)=>`<foreignObject x="${x}" y="${y}" width="${w}" height="80"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 18px/1.3 Inter,sans-serif;color:${c}">${n} <span style="font-weight:400;color:#8A94B8">${t}</span></div></foreignObject>`;
 let h=`<g class="f" data-f="1">${['Regulamento.pdf','FAQ.md','Manual do aluno.pdf'].map((t,i)=>{const y=60+i*120;return `<path d="M0 ${y} h130 l30 30 v42 h-160z" fill="${COL.p2}" stroke="${COL.mu}" stroke-width="2"/><path d="M130 ${y} v30 h30" fill="none" stroke="${COL.mu}" stroke-width="2"/>${[0,1,2].map(k=>`<rect x="16" y="${y+18+k*16}" width="${90-k*20}" height="7" rx="3" fill="${COL.dim}"/>`).join('')}<text x="80" y="${y+96}" text-anchor="middle" font-size="15" fill="${COL.mu}">${t}</text>`}).join('')}<path d="M175 230 H284" stroke="${COL.mu}" stroke-width="3" marker-end="url(#ar)"/><rect x="290" y="40" width="400" height="380" rx="16" fill="${COL.p1}" stroke="${COL.ln}" stroke-width="2"/>${Pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="${COL.cy}" opacity=".7"/>`).join('')}<text x="490" y="30" text-anchor="middle" font-size="16" fill="${COL.mu}">trechos como embeddings</text>${cap(0,440,270,COL.cy,'1 ·','documentos → trechos → vetores')}</g>`;
 h+=`<g class="f" data-f="2"><rect x="290" y="450" width="400" height="74" rx="14" fill="${COL.vi}" fill-opacity=".18" stroke="${COL.vi}" stroke-width="2.5"/><text x="490" y="494" text-anchor="middle" font-size="19" font-weight="700">Qual o prazo para trancar a matrícula?</text><path d="M${Q[0]} 448 V${Q[1]+22}" stroke="${COL.vi}" stroke-width="2.5" stroke-dasharray="6 6" marker-end="url(#arv)"/><text x="${Q[0]}" y="${Q[1]+12}" text-anchor="middle" font-size="36" fill="${COL.vi}">★</text>${cap(0,530,280,COL.vi,'2 ·','a pergunta também vira vetor')}</g>`;
 h+=`<g class="f" data-f="3">${nn.map(i=>`<line x1="${Q[0]}" y1="${Q[1]}" x2="${Pts[i][0]}" y2="${Pts[i][1]}" stroke="${COL.am}" stroke-width="3"/><circle cx="${Pts[i][0]}" cy="${Pts[i][1]}" r="11" fill="${COL.am}"/>`).join('')}<text x="736" y="196" text-anchor="middle" font-size="18" font-weight="700" fill="${COL.am}">3 · KNN</text><text x="736" y="218" text-anchor="middle" font-size="15" fill="${COL.mu}">3 mais</text><text x="736" y="262" text-anchor="middle" font-size="15" fill="${COL.mu}">próximos</text><path d="M694 230 H776" stroke="${COL.am}" stroke-width="3" marker-end="url(#ara)"/></g>`;
 h+=`<g class="f" data-f="4"><rect x="782" y="40" width="400" height="250" rx="16" fill="${COL.p2}" stroke="${COL.dim}" stroke-width="2"/><foreignObject x="800" y="54" width="366" height="230"><div xmlns="http://www.w3.org/1999/xhtml" style="font:16px/1.45 'JetBrains Mono',monospace;color:#c9d1ee"><b style="color:#EAF0FF">Contexto:</b><div style="color:${COL.am}">[Regulamento, art. 12] O trancamento pode ser pedido até a 4ª semana…</div><div style="color:${COL.am}">[FAQ] O pedido é feito pelo portal…</div><div style="color:${COL.am}">[Manual] Prazos do calendário…</div><b style="color:#EAF0FF">Pergunta:</b> Qual o prazo para trancar?</div></foreignObject><path d="M982 292 V326" stroke="${COL.mu}" stroke-width="3" marker-end="url(#ar)"/><rect x="782" y="332" width="400" height="66" rx="14" fill="${COL.vi}" fill-opacity=".25" stroke="${COL.vi}" stroke-width="2.5"/><text x="982" y="373" text-anchor="middle" font-size="22" font-weight="700">LLM</text><path d="M982 400 V434" stroke="${COL.gr}" stroke-width="3" marker-end="url(#arc)"/><rect x="782" y="440" width="626" height="84" rx="14" fill="${COL.gr}" fill-opacity=".15" stroke="${COL.gr}" stroke-width="2.5"/><foreignObject x="800" y="452" width="596" height="66"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 19px/1.35 Inter,sans-serif;color:${COL.gr}">Até a 4ª semana de aula, pelo portal. <span style="font-weight:400;color:#8A94B8">Fonte: Regulamento, art. 12</span></div></foreignObject>${cap(1206,60,200,COL.gr,'4 ·','o LLM responde com base nos trechos e cita a fonte')}</g>`;
 $('#ragSvg').innerHTML=h}

/* ---------- extensões (ex.: assets/comandos.js), carregadas antes deste arquivo ---------- */
(window.DECK_EXT||[]).forEach(f=>{try{f({FX,COL,BLK,slides,go,$,$$,rng,gauss,mapper,axes,fmt,TX,tn})}catch(e){console.error(e)}});

window.deck={go,next,prev};
const texGo=()=>{texAll();['#lw','#mrH'].forEach(q=>{const e=$(q);if(e)e.dispatchEvent(new Event('input'))})};
if(hasTex())texGo();else addEventListener('mathjax-ready',texGo,{once:true});
/* ---------- start ---------- */
const h0=parseInt((location.hash||'').replace('#s',''),10);go(h0>0&&h0<=slides.length?h0-1:0);
addEventListener('hashchange',()=>{const h=parseInt(location.hash.replace('#s',''),10);if(h>0&&h<=slides.length&&h-1!==cur)go(h-1)});
}
