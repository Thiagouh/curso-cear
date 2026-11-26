/* ============================================================
   COMANDOS NO NOTEBOOK · dia 1
   Slides interativos que explicam as bibliotecas e cada comando usado
   nos labs 00, 01 e 02. As saídas são as reais dos notebooks (gabarito);
   onde a saída usa a tabelinha de exemplo do slide "dados bagunçados",
   ela é calculada aqui mesmo.
   Uso no HTML:  <section class="s" data-b="2" data-cmd="insp" data-notes="…"><h2>…</h2></section>
   Carregue este arquivo ANTES de deck.js.
   ============================================================ */
(window.DECK_EXT=window.DECK_EXT||[]).push(function(D){
const {FX,COL,slides,go,$,$$,rng,gauss,mapper}=D;
const CMD={};

/* ---------------- utilidades ---------------- */
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const NA=null,isNA=v=>v===null||v===undefined||(typeof v==='number'&&isNaN(v));
const HI=c=>`background:${COL[c]}33;color:${COL[c]};font-weight:700`;
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
const quant=(a,p)=>{const s=[...a].sort((x,y)=>x-y),i=(s.length-1)*p,lo=Math.floor(i);return s[lo]+(s[Math.ceil(i)]-s[lo])*(i-lo)};
const br=v=>String(v).replace('.',',');

/* destaque de sintaxe Python; ⟨…⟩ marca o parâmetro que os controles mudam */
const PYK=new Set(['import','from','as','for','in','def','return','if','else','lambda','None','True','False','and','or','not']);
function hl1(s){const re=/(#[^\n]*)|('[^'\n]*'|"[^"\n]*")|(\b\d+(?:\.\d+)?(?:e-?\d+)?\b)|([A-Za-z_]\w*)(?=\s*\()|([A-Za-z_]\w*)/g;let o='',i=0,m;
 while((m=re.exec(s))){o+=esc(s.slice(i,m.index));i=re.lastIndex;
  if(m[1])o+=`<span class="cm">${esc(m[1])}</span>`;else if(m[2])o+=`<span class="st">${esc(m[2])}</span>`;else if(m[3])o+=`<span class="nu">${m[3]}</span>`;
  else if(m[4])o+=PYK.has(m[4])?`<span class="kw">${m[4]}</span>`:`<span class="fn">${m[4]}</span>`;else o+=PYK.has(m[5])?`<span class="kw">${m[5]}</span>`:m[5]}
 return o+esc(s.slice(i))}
const hlPy=src=>src.split(/(⟨[^⟩]*⟩)/).map(p=>p[0]==='⟨'?`<span class="pa">${hl1(p.slice(1,-1))}</span>`:hl1(p)).join('');

/* saídas no estilo do Jupyter/Colab */
const sv=v=>isNA(v)?'<span class="na">NaN</span>':typeof v==='string'?esc(v).replace(/^ +| +$/g,m=>`<span class="sp">${'␣'.repeat(m.length)}</span>`):esc(v);
function pdT(cols,rows,o={}){return `<table class="pdf">${o.cap?`<caption>${o.cap}</caption>`:''}<thead><tr><th>${o.idx||''}</th>${cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((r,ri)=>`<tr${o.row&&o.row(ri,r)?` style="${o.row(ri,r)}"`:''}><th>${sv(r[0])}</th>${r.slice(1).map((v,ci)=>{const st=o.hi&&o.hi(ri,ci,v,r);return `<td${st?` style="${st}"`:''}>${sv(v)}</td>`}).join('')}</tr>`).join('')}</tbody></table>`}
function pdS(pairs,o={}){const w=Math.max(...pairs.map(p=>String(p[0]).length),(o.name||'').length)+4;
 return `<pre class="otxt">${o.name?esc(o.name)+'\n':''}${pairs.map(([k,v],i)=>{const t=sv(String(k))+' '.repeat(Math.max(1,w-String(k).length))+esc(v),st=o.hi&&o.hi(i,k,v);return st?`<span style="${st}">${t}</span>`:t}).join('\n')}${o.foot?`\n<span class="mu">${esc(o.foot)}</span>`:''}</pre>`}
const T=(s,st)=>`<pre class="otxt"${st?` style="${st}"`:''}>${s}</pre>`;
const cap=s=>`<div class="ocap">${s}</div>`;
const svgO=(w,h,inner,st='')=>`<svg class="osvg" viewBox="0 0 ${w} ${h}" style="${st}">${inner}</svg>`;
const ax=(x,y,w,h)=>`<path d="M${x} ${y} V${y+h} H${x+w}" fill="none" stroke="${COL.dim}" stroke-width="1.5"/>`;
const tx=(x,y,t,o='')=>`<text x="${x}" y="${y}" ${o}>${t}</text>`;
const libCard=(name,c,desc,cmds,where)=>`<div class="libc"><div class="big" style="font-size:38px;color:${COL[c]}">${name}</div><div style="font-size:19px;margin:6px 0 12px">${desc}</div><div class="lbl mu" style="font-size:13px;margin-bottom:10px">No notebook você vai usar</div><div class="libcmds">${cmds.map(x=>`<code style="border-color:${COL[c]}77">${esc(x)}</code>`).join('')}</div><div class="mu" style="font-size:16px;margin-top:10px">Aparece em: <b style="color:var(--tx)">${where}</b></div></div>`;
const LIBC={numpy:'cy',pandas:'gr',matplotlib:'or','scikit-learn':'vi'};

/* gráficos pequenos */
function histSvg(vals,bins,W,H,title){const mn=Math.min(...vals),mx=Math.max(...vals),bw=(mx-mn)/bins,c=Array(bins).fill(0);vals.forEach(v=>c[Math.min(bins-1,Math.floor((v-mn)/bw))]++);
 const top=Math.max(...c)*1.1,m=mapper(56,34,W-76,H-74,mn,mx,0,top);let h=tx(W/2,20,title,`text-anchor="middle" font-size="17" font-weight="700"`);
 for(let k=0;k<=4;k++){const v=top/4*k*.9;h+=`<line x1="56" y1="${m.Y(v)}" x2="${W-20}" y2="${m.Y(v)}" stroke="${COL.ln}" opacity=".6"/>`+tx(48,m.Y(v)+5,Math.round(v),`text-anchor="end" font-size="13" fill="${COL.dim}"`)}
 c.forEach((n,i)=>h+=`<rect x="${m.X(mn+i*bw)}" y="${m.Y(n)}" width="${Math.max(1,m.X(mn+bw)-m.X(mn)-1)}" height="${m.Y(0)-m.Y(n)}" fill="${COL.cy}" opacity=".75"/>`);
 for(let v=Math.ceil(mn/2)*2;v<=mx;v+=2)h+=tx(m.X(v),H-22,v,`text-anchor="middle" font-size="13" fill="${COL.dim}"`);
 return h+ax(56,34,W-76,H-74)}
function boxSvg(vals,W,H,title,top){const s=[...vals].sort((a,b)=>a-b),q1=quant(s,.25),q2=quant(s,.5),q3=quant(s,.75),iq=q3-q1,lo=s.find(v=>v>=q1-1.5*iq),hi=[...s].reverse().find(v=>v<=q3+1.5*iq);
 const m=mapper(60,34,W-80,H-60,0,1,0,top),cx=m.X(.5);let h=tx(W/2,20,title,`text-anchor="middle" font-size="17" font-weight="700"`);
 for(let v=0;v<=top;v+=top>40?20:5)h+=`<line x1="60" y1="${m.Y(v)}" x2="${W-20}" y2="${m.Y(v)}" stroke="${COL.ln}" opacity=".5"/>`+tx(52,m.Y(v)+5,v,`text-anchor="end" font-size="13" fill="${COL.dim}"`);
 h+=`<line x1="${cx}" y1="${m.Y(lo)}" x2="${cx}" y2="${m.Y(q1)}" stroke="${COL.tx}" stroke-width="2"/><line x1="${cx}" y1="${m.Y(q3)}" x2="${cx}" y2="${m.Y(hi)}" stroke="${COL.tx}" stroke-width="2"/>`;
 h+=`<line x1="${cx-30}" y1="${m.Y(lo)}" x2="${cx+30}" y2="${m.Y(lo)}" stroke="${COL.tx}" stroke-width="2"/><line x1="${cx-30}" y1="${m.Y(hi)}" x2="${cx+30}" y2="${m.Y(hi)}" stroke="${COL.tx}" stroke-width="2"/>`;
 h+=`<rect x="${cx-60}" y="${m.Y(q3)}" width="120" height="${m.Y(q1)-m.Y(q3)}" fill="none" stroke="${COL.tx}" stroke-width="2"/><line x1="${cx-60}" y1="${m.Y(q2)}" x2="${cx+60}" y2="${m.Y(q2)}" stroke="${COL.or}" stroke-width="3"/>`;
 s.filter(v=>v<lo||v>hi).forEach(v=>h+=`<circle cx="${cx}" cy="${m.Y(v)}" r="6" fill="none" stroke="${COL.tx}" stroke-width="1.8"/>`);
 return {h:h+ax(60,34,W-80,H-60),q:[q1,q2,q3],out:s.filter(v=>v<lo||v>hi)}}
function lineCmp(labels,tr,cv,sel,W,H,xl){const m=mapper(70,20,W-110,H-70,-.3,labels.length-.7,.6,1.02);let h='';
 [.6,.7,.8,.9,1].forEach(v=>h+=`<line x1="70" y1="${m.Y(v)}" x2="${W-40}" y2="${m.Y(v)}" stroke="${COL.ln}" opacity=".5"/>`+tx(62,m.Y(v)+5,v.toFixed(1),`text-anchor="end" font-size="13" fill="${COL.dim}"`));
 h+=`<rect x="${m.X(sel)-24}" y="20" width="48" height="${H-70}" rx="8" fill="${COL.pk}" opacity=".12"/>`;
 const pth=(a,c)=>`<path d="${a.map((v,i)=>(i?'L':'M')+m.X(i)+' '+m.Y(v)).join('')}" fill="none" stroke="${c}" stroke-width="3"/>`+a.map((v,i)=>`<circle cx="${m.X(i)}" cy="${m.Y(v)}" r="${i===sel?8:5}" fill="${c}"/>`).join('');
 h+=pth(tr,COL.tx)+pth(cv,COL.pk);labels.forEach((l,i)=>h+=tx(m.X(i),H-30,l,`text-anchor="middle" font-size="15" font-family="JetBrains Mono,monospace" fill="${i===sel?COL.tx:COL.mu}" font-weight="${i===sel?700:400}"`));
 h+=tx(W-40,H-6,xl,`text-anchor="end" font-size="14" fill="${COL.mu}"`)+`<line x1="80" y1="${H-8}" x2="104" y2="${H-8}" stroke="${COL.tx}" stroke-width="3"/>`+tx(110,H-3,'treino','font-size="14"')+`<line x1="180" y1="${H-8}" x2="204" y2="${H-8}" stroke="${COL.pk}" stroke-width="3"/>`+tx(210,H-3,'validação cruzada',`font-size="14" fill="${COL.pk}"`);
 return h+ax(70,20,W-110,H-70)}

/* ---------------- dados compartilhados ---------------- */
/* tabelinha do slide "dados bagunçados" (mesmos valores) */
const TOY=[[2,6,'noite',4.1],[5,2,'manhã',7.3],[8,NA,'Manhã',8.9],[3,4,'tarde',5.2],[5,2,'manhã',7.3],[80,1,'MANHÃ ',9.1],[NA,3,'manha',6.0],[6,0,'tarde',NA]].map((r,i)=>({i,h:r[0],f:r[1],t:r[2],n:r[3]}));
const TC=['horas_estudo','faltas','turno','nota_final'];
const f1=v=>isNA(v)?NA:(+v).toFixed(1);
const rowsOf=R=>R.map(r=>[r.i,f1(r.h),f1(r.f),r.t,f1(r.n)]);
const normT=(t,c)=>{let v=t;if(c>=1)v=v.trim();if(c>=2)v=v.toLowerCase();if(c>=3&&v==='manha')v='manhã';return v};
const L1=()=>TOY.filter(r=>r.i!==4),L2=()=>L1().map(r=>({...r,t:normT(r.t,3)})),L3=lim=>L2().map(r=>({...r,h:!isNA(r.h)&&r.h>lim?NA:r.h}));
const vcount=a=>{const c=new Map();a.forEach(v=>c.set(v,(c.get(v)||0)+1));return [...c.entries()].sort((x,y)=>y[1]-x[1])};
/* mesmos 200 alunos sintéticos do slide de EDA */
const EH=[],EN=[];{const r=rng(31);for(let i=0;i<200;i++){const h=Math.max(.5,Math.min(14,6+gauss(r)*2.2));EH.push(h);EN.push(Math.max(0,Math.min(10,1.9+.55*h+gauss(r)*1.1)))}}
/* os 10 primeiros alunos do treino do Lab 01 (x_tr[:10], y_tr[:10]) */
const X10=[2.1,6.5,6.5,4.0,5.3,6.6,6.0,7.8,9.3,3.6],Y10=[0.8,5.3,5.9,4.0,4.7,3.8,3.9,5.3,5.1,4.4];
const LSQ=(()=>{const mx=mean(X10),my=mean(Y10);let a=0,b=0;X10.forEach((x,i)=>{a+=(x-mx)*(Y10[i]-my);b+=(x-mx)**2});const w=a/b;return [w,my-w*mx]})();
const RW=0.38143126,RB=1.77155816;   /* LinearRegression do Lab 01 (296 alunos) */
/* Iris: comprimento e largura da pétala (×10), 50 de cada espécie */
const IRS='140214021302150214021704140315021402150115021602140111011202150413041403170315031702150410021705190216021604150214021602160215041501140215021202130214011302150213031303130216061904140316021402150214024714451549154013461545134716331046133914351042154010471436134414451541104515391148184013491547124313441448145017451535103811371039125116451545164715441341134013441246144012331042134212421343133011411360255119592156185822662145176318581861255120531955215020512453235518672269235015572349206720491857216018481849185621581661196420562251155614612356245518481854215624512351195923572552235019522054235118';
const IRIS=Array.from({length:150},(_,i)=>[+IRS.substr(i*4,2)/10,+IRS.substr(i*4+2,2)/10,Math.floor(i/50)]);
const SPC=[COL.pk,COL.gr,COL.vi],SPN=['setosa','versicolor','virginica'];
const arr=(a,d=2)=>`array([${a.map(v=>v.toFixed(d)).join(', ')}])`;

/* =====================================================================
   MÓDULO 01 · LAB 00
   ===================================================================== */
CMD.lib00={libs:['numpy','pandas','matplotlib','scikit-learn'],lab:'Lab 00 · célula 0',outLbl:'BIBLIOTECA',
 cell:`import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

pd.set_option('display.max_columns', 20)
plt.rcParams['figure.figsize'] = (8, 4)
print('Tudo pronto!')`,
 items:[
 {chip:'numpy as np',lbl:'números e vetores',lines:[0],out:()=>libCard('NumPy','cy','Arrays: listas de números com contas rápidas, feitas elemento a elemento.',['np.nan','np.sqrt()','arr.mean()','arr.std()'],'Labs 00, 01 e 02'),say:'<b>import</b> carrega a biblioteca e <b>as np</b> dá um apelido curto. Todo mundo usa os mesmos: <span class="mono">np</span>, <span class="mono">pd</span>, <span class="mono">plt</span>.'},
 {chip:'pandas as pd',lbl:'tabelas',lines:[1],out:()=>libCard('pandas','gr','DataFrame (a tabela) e Series (uma coluna): ler, inspecionar, limpar e resumir dados.',['pd.read_csv()','df.head()','df.info()','df.describe()','df.isna()','value_counts()','drop_duplicates()','.str','df.loc[]','dropna()','groupby()','df.corr()','get_dummies()','to_csv()'],'Lab 00 inteiro'),say:'É a biblioteca principal do Lab 00: quase toda a limpeza e a exploração são comandos do pandas.'},
 {chip:'matplotlib.pyplot as plt',lbl:'gráficos',lines:[2],out:()=>libCard('Matplotlib','or','Gráficos: histograma, dispersão, boxplot. O pandas também desenha com ela por baixo.',['plt.scatter()','plt.boxplot()','df.hist()','plt.xlabel()','plt.title()','plt.show()'],'etapas 2 e 3'),say:'<b>pyplot</b> é a parte da Matplotlib com funções prontas de gráfico; <b>plt.show()</b> desenha o gráfico embaixo da célula.'},
 {chip:'sklearn.model_selection',lbl:'separar os dados',lines:[4],out:()=>libCard('scikit-learn','vi','A biblioteca de Machine Learning. O módulo model_selection divide os dados e valida modelos.',['train_test_split()'],'etapa 4.2'),say:'Do scikit-learn importamos <b>só as peças</b> que vamos usar: <span class="mono">from módulo import Peça</span>.'},
 {chip:'compose · pipeline',lbl:'organizar o preparo',lines:[5,6],out:()=>libCard('scikit-learn','vi','ColumnTransformer aplica um tratamento por tipo de coluna; Pipeline encadeia as etapas na ordem certa.',['ColumnTransformer([…])','Pipeline([…])','fit_transform()','transform()'],'etapa 4.3'),say:'São as “caixas” que organizam o preparo e impedem que o teste vaze para o treino.'},
 {chip:'impute · preprocessing',lbl:'preencher, escalar, codificar',lines:[7,8],out:()=>libCard('scikit-learn','vi','SimpleImputer preenche faltantes; StandardScaler padroniza; OneHotEncoder transforma categorias em colunas 0/1.',["SimpleImputer(strategy='median')",'StandardScaler()',"OneHotEncoder(handle_unknown='ignore')"],'etapa 4.3'),say:'Cada peça <b>aprende</b> algo no <span class="mono">fit</span> (mediana, média, categorias) e <b>aplica</b> no <span class="mono">transform</span>.'},
 {chip:'ajustes de exibição',lbl:'opcional',lines:[10,11,12],out:()=>T('Tudo pronto!'),say:'<span class="mono">set_option</span> mostra até 20 colunas sem cortar; <span class="mono">rcParams</span> define o tamanho padrão dos gráficos.',tip:'Tudo já vem instalado no Colab: não precisa de pip install.'}]};

const infoTxt=()=>{const nn=[7,7,8,7],dt=['float64','float64','object ','float64'];return T(`&lt;class 'pandas.core.frame.DataFrame'&gt;
RangeIndex: 8 entries, 0 to 7
Data columns (total 4 columns):
 #   Column        Non-Null Count  Dtype
---  ------        --------------  -----
${TC.map((c,i)=>{const t=` ${i}   ${c.padEnd(14)}${(nn[i]+' non-null').padEnd(16)}${dt[i]}`;return nn[i]<8?`<span style="color:${COL.am};font-weight:700">${t}</span>`:t}).join('\n')}
dtypes: float64(3), object(1)
memory usage: 388.0+ bytes`)};
const describeT=()=>{const st=['count','mean','std','min','25%','50%','75%','max'],cols=[TOY.map(r=>r.h),TOY.map(r=>r.f),TOY.map(r=>r.n)].map(a=>{const v=a.filter(x=>!isNA(x)),m=mean(v),sd=Math.sqrt(v.reduce((s,x)=>s+(x-m)**2,0)/(v.length-1));return [v.length,m,sd,Math.min(...v),quant(v,.25),quant(v,.5),quant(v,.75),Math.max(...v)].map(x=>x.toFixed(6))});
 return pdT(['horas_estudo','faltas','nota_final'],st.map((s,i)=>[s,cols[0][i],cols[1][i],cols[2][i]]),{hi:(ri,ci)=>ci===0&&(ri===7)?HI('rd'):ci===0&&(ri===1||ri===5)?HI('am'):''})};

CMD.insp={libs:['pandas'],lab:'Lab 00 · etapa 1',state:{n:5,na:'s',vn:'0'},items:[
 {chip:"pd.read_csv() · head()",lbl:'ler e espiar a tabela',ctl:[{k:'n',t:'range',l:'n =',min:1,max:8,step:1}],code:s=>`df = pd.read_csv('alunos.csv')\ndf.head(⟨${s.n}⟩)`,
  out:s=>pdT(TC,rowsOf(TOY.slice(0,s.n)))+cap(`${s.n} de 8 linhas · exemplo do slide anterior`),say:'<b>read_csv</b> lê o arquivo e devolve um <b>DataFrame</b>: tabela com índice (à esquerda) e colunas com nome. <b>head(n)</b> mostra as n primeiras linhas (padrão: 5).'},
 {chip:'df.shape',lbl:'tamanho da tabela',code:'df.shape',out:()=>T('(8, 4)','font-size:44px;font-weight:700')+cap('(linhas, colunas)'),say:'Devolve (linhas, colunas). É um <b>atributo</b>, por isso vem <b>sem parênteses</b>.',tip:'No notebook aparece (412, 8): 412 alunos e 8 colunas.'},
 {chip:'df.info()',lbl:'tipos e não nulos',code:'df.info()',out:infoTxt,say:'Mostra o tipo de cada coluna e quantos valores <b>não nulos</b> ela tem. Se o Non-Null for menor que o total de linhas, há faltantes.',tip:'Texto aparece como object (ou str, nas versões mais novas do pandas).'},
 {chip:'df.describe()',lbl:'estatísticas',code:'df.describe()',out:describeT,say:'Contagem, média, desvio, mínimo, quartis e máximo das colunas numéricas. Média de 15,6 h com mediana (50%) de 5 h? O máximo de 80 h denuncia um outlier.',tip:'No notebook, o máximo de horas_estudo é 70.'},
 {chip:'df.isna().sum()',lbl:'faltantes por coluna',ctl:[{k:'na',t:'opts',l:'',o:[['m','df.isna()'],['s','df.isna().sum()']]}],code:s=>s.na==='m'?'df.isna()':'df.isna()⟨.sum()⟩',
  out:s=>s.na==='m'?pdT(TC,TOY.map(r=>[r.i,...[r.h,r.f,r.t,r.n].map(v=>isNA(v)?'True':'False')]),{hi:(ri,ci,v)=>v==='True'?HI('am'):''}):pdS(TC.map(c=>[c,c==='turno'?0:1]),{foot:'dtype: int64',hi:(i,k,v)=>v?`color:${COL.am};font-weight:700`:''}),
  say:s=>s.na==='m'?'<b>isna()</b> devolve uma tabela do mesmo tamanho com <b>True</b> onde falta valor.':'<b>.sum()</b> soma cada coluna: True vale 1 e False vale 0, então o resultado é quantos faltam. Encadear métodos assim é muito comum no pandas.',tip:'No notebook: horas_estudo 19, faltas 17, nota_final 8.'},
 {chip:"df['turno'].value_counts()",lbl:'contar categorias',ctl:[{k:'vn',t:'opts',l:'',o:[['0','contagem'],['1','normalize=True']]}],code:s=>`df['turno'].value_counts(${s.vn==='1'?'⟨normalize=True⟩':''})`,
  out:s=>pdS(vcount(TOY.map(r=>r.t)).map(([k,v])=>[k,s.vn==='1'?(v/8).toFixed(3):v]),{name:'turno',foot:s.vn==='1'?'Name: proportion, dtype: float64':'Name: count, dtype: int64',hi:(i,k)=>['manhã','tarde','noite'].includes(k)?'':`color:${COL.vi};font-weight:700`}),
  say:'<b>df[\'turno\']</b> pega uma coluna (uma Series); <b>value_counts()</b> conta quantas vezes cada valor aparece. Aparecem 4 jeitos de escrever “manhã”!',tip:'No notebook: manhã 188, manha 4, Manhã 4, Noite 3, MANHÃ 2…'}]};

CMD.limp={libs:['pandas','numpy','matplotlib'],lab:'Lab 00 · etapa 2',state:{d:'m',c:3,bx:'a',lim:24,sub:'1'},items:[
 {chip:'df.duplicated()',lbl:'achar linhas repetidas',ctl:[{k:'d',t:'opts',l:'',o:[['m','df.duplicated()'],['s','.duplicated().sum()']]}],code:s=>s.d==='m'?'df.duplicated()':'df.duplicated()⟨.sum()⟩',
  out:s=>`<div class="orow">${s.d==='m'?pdS(TOY.map(r=>[r.i,r.i===4?'True':'False']),{foot:'dtype: bool',hi:i=>i===4?`color:${COL.rd};font-weight:700`:''}):T('1','font-size:44px;font-weight:700')}${pdT(TC,rowsOf(TOY),{row:ri=>ri===1||ri===4?`background:${COL.rd}22`:''})}</div>`,
  say:'Marca <b>True</b> na linha que repete inteira uma linha anterior: a linha 4 é cópia da linha 1. Com <b>.sum()</b>, conta quantas são.',tip:'No notebook: 12 duplicados.'},
 {chip:'df.drop_duplicates()',lbl:'remover as cópias',code:'df = df.drop_duplicates()\nlen(df)',out:()=>T('7','font-size:30px;font-weight:700')+pdT(TC,rowsOf(L1())),say:'Devolve a tabela sem as cópias. Repare: o índice 4 sumiu e <b>não é renumerado</b>.',tip:'Sem o “df = …” na frente, o resultado não fica salvo!'},
 {chip:".str.strip().str.lower()",lbl:'padronizar texto',ctl:[{k:'c',t:'opts',l:'',num:1,o:[[0,'original'],[1,'.strip()'],[2,'+ .lower()'],[3,'+ .replace()']]}],
  code:s=>['df[\'turno\']','df[\'turno\']⟨.str.strip()⟩','df[\'turno\']⟨.str.strip().str.lower()⟩',"df['turno'] = df['turno'].str.strip().str.lower()\ndf['turno'] = df['turno']⟨.replace({'manha': 'manhã'})⟩\ndf['turno'].value_counts()"][s.c],
  out:s=>`<div class="orow">${pdT(['antes','depois'],L1().map(r=>[r.i,r.t,normT(r.t,s.c)]),{hi:(ri,ci,v,r)=>ci===1&&r[1]!==r[2]?HI('gr'):''})}${pdS(vcount(L1().map(r=>normT(r.t,s.c))),{name:'turno',foot:'Name: count'})}</div>`,
  say:'<b>.str</b> dá acesso aos métodos de texto: <b>strip()</b> tira os espaços das pontas e <b>lower()</b> deixa tudo minúsculo. <b>replace</b> troca um valor inteiro por outro.',tip:'Os espaços invisíveis aparecem aqui como ␣.'},
 {chip:'plt.boxplot()',lbl:'ver o outlier',ctl:[{k:'bx',t:'opts',l:'',o:[['a','antes da limpeza'],['d','depois (> 24 → NaN)']]}],code:"plt.boxplot(df['horas_estudo'].dropna())\nplt.title('horas_estudo antes da limpeza'); plt.show()",
  out:s=>{const v=s.bx==='a'?[...EH,38,45,80]:EH,b=boxSvg(v,520,330,'horas_estudo',s.bx==='a'?90:16);return `<div class="orow">${svgO(520,330,b.h,'width:520px')}<div class="col" style="gap:8px;font-size:18px;padding-top:30px"><div><span class="or">━</span> mediana ${br(b.q[1].toFixed(1))} h</div><div>caixa: de ${br(b.q[0].toFixed(1))} a ${br(b.q[2].toFixed(1))} h</div><div>○ pontos extremos: <b>${b.out.length}</b></div>${s.bx==='a'?`<div class="rd" style="font-weight:700">38, 45 e 80 h esmagam o gráfico</div>`:''}<div class="mu" style="font-size:15px">200 alunos sintéticos do slide de EDA</div></div></div>`},
  say:'A caixa vai do 1º ao 3º quartil e a linha laranja é a mediana; os círculos isolados são pontos extremos. <b>.dropna()</b> tira os NaN, que o boxplot não aceita.'},
 {chip:"df.loc[cond, col] = np.nan",lbl:'apagar valores impossíveis',ctl:[{k:'lim',t:'range',l:'limite',min:4,max:90,step:1}],code:s=>`df.loc[df['horas_estudo'] > ⟨${s.lim}⟩, 'horas_estudo'] = np.nan`,
  out:s=>{const R=L2();return pdT(['horas_estudo',`> ${s.lim} ?`,'depois'],R.map(r=>[r.i,f1(r.h),isNA(r.h)?'False':String(r.h>s.lim?'True':'False'),f1(!isNA(r.h)&&r.h>s.lim?NA:r.h)]),{hi:(ri,ci,v,r)=>r[2]==='True'?(ci===1?HI('pk'):ci===2?HI('am'):''):''})},
  say:s=>`<b>loc[linhas, coluna]</b>: a condição escolhe as linhas (as que dão True) e, depois da vírgula, a coluna. Quem for True recebe <b>np.nan</b> (o “vazio” do NumPy).`,tip:s=>{const n=L2().filter(r=>!isNA(r.h)&&r.h>s.lim).length;return s.lim<8?`⚠ Limite baixo demais: ${n} valores apagados, inclusive horas normais!`:`${n} valor(es) virou NaN. Ninguém estuda mais de 24 h por dia… nem por semana extra.`}},
 {chip:"df.dropna(subset=[…])",lbl:'tirar quem não tem alvo',ctl:[{k:'sub',t:'opts',l:'',o:[['1',"subset=['nota_final']"],['0','sem subset']]}],code:s=>s.sub==='1'?"df = df.dropna(⟨subset=['nota_final']⟩)\nlen(df)":'df = df.dropna()\nlen(df)',
  out:s=>{const R=L3(s.lim),K=R.filter(r=>s.sub==='1'?!isNA(r.n):![r.h,r.f,r.n].some(isNA));return T(String(K.length),'font-size:30px;font-weight:700')+pdT(TC,rowsOf(K))+cap(`${R.length} → ${K.length} linhas`)},
  say:'Remove linhas que têm NaN. Com <b>subset</b>, olha só as colunas indicadas: sai apenas quem não tem nota, o alvo.',tip:s=>s.sub==='1'?'Os NaN de horas e faltas ficam: o Pipeline vai preenchê-los depois, usando só o treino.':'⚠ Sem subset, você joga fora alunos que só não informaram as horas.'}]};

const CORR=[[1,0,.01,.02,.62],[0,1,.01,.06,-.31],[.01,.01,1,-.05,.03],[.02,.06,-.05,1,-.07],[.62,-.31,.03,-.07,1]],CN=['horas_estudo','faltas','idade','renda_familiar','nota_final'];
const MM={h:['horas_estudo',6.0,6.0,0.5,15],r:['renda_familiar',4175.4,3690.0,920,17060]};
CMD.expl={libs:['pandas','matplotlib'],lab:'Lab 00 · etapa 3',state:{bins:20,col:'r',al:.5,by:'tm'},items:[
 {chip:'df.hist(bins=…)',lbl:'histogramas',ctl:[{k:'bins',t:'range',l:'bins =',min:3,max:40,step:1}],code:s=>`df.hist(bins=⟨${s.bins}⟩, figsize=(12, 6))\nplt.tight_layout(); plt.show()`,
  out:s=>svgO(820,320,histSvg(EH,s.bins,820,320,'horas_estudo')),say:'Desenha um histograma para <b>cada</b> coluna numérica. <b>bins</b> é o número de faixas: poucas escondem o formato, muitas viram ruído.',tip:'Aqui, só a coluna horas_estudo (200 alunos sintéticos).'},
 {chip:'.mean() × .median()',lbl:'média e mediana',ctl:[{k:'col',t:'opts',l:'',o:[['h','horas_estudo'],['r','renda_familiar']]}],code:"for col in ['horas_estudo', 'renda_familiar']:\n    print(f\"{col}: média = {df[col].mean():.1f} | mediana = {df[col].median():.1f}\")",
  out:s=>{const [n,mu,md,lo,hi]=MM[s.col],m=mapper(30,0,760,1,lo,hi,0,1);const mk=(v,c,t,y)=>`<line x1="${m.X(v)}" y1="60" x2="${m.X(v)}" y2="130" stroke="${c}" stroke-width="4"/>`+tx(m.X(v),y,t,`text-anchor="middle" font-size="18" font-weight="700" fill="${c}"`);
   return T(`horas_estudo: média = 6.0 | mediana = 6.0\nrenda_familiar: média = 4175.4 | mediana = 3690.0`)+svgO(820,190,`${tx(790,30,n,`text-anchor="end" font-size="17" fill="${COL.mu}"`)}<line x1="30" y1="95" x2="790" y2="95" stroke="${COL.ln}" stroke-width="6" stroke-linecap="round"/>${tx(30,165,lo,`font-size="15" fill="${COL.dim}"`)}${tx(790,165,hi,`text-anchor="end" font-size="15" fill="${COL.dim}"`)}${mk(md,COL.cy,'mediana',(mu===md)?175:182)}${mu!==md?mk(mu,COL.am,'média',52):''}`,'height:190px')},
  say:s=>s.col==='r'?'Na renda, poucas famílias muito ricas puxam a <b>média</b> para cima; a <b>mediana</b> (o valor do meio) quase não se mexe.':'Em horas (depois da limpeza), média e mediana coincidem: a distribuição é simétrica.'},
 {chip:'plt.scatter(x, y, alpha=…)',lbl:'dispersão',ctl:[{k:'al',t:'range',l:'alpha =',min:.05,max:1,step:.05}],code:s=>`plt.scatter(df['horas_estudo'], df['nota_final'], alpha=⟨${(+s.al).toFixed(2)}⟩)\nplt.xlabel('horas de estudo'); plt.ylabel('nota final')\nplt.show()`,
  out:s=>{const m=mapper(60,14,720,250,0,14.5,0,10);let h=EH.map((v,i)=>`<circle cx="${m.X(v)}" cy="${m.Y(EN[i])}" r="6" fill="#4C9BE8" fill-opacity="${s.al}"/>`).join('');for(let v=0;v<=14;v+=2)h+=tx(m.X(v),288,v,`text-anchor="middle" font-size="13" fill="${COL.dim}"`);for(let v=0;v<=10;v+=2)h+=tx(52,m.Y(v)+5,v,`text-anchor="end" font-size="13" fill="${COL.dim}"`);return svgO(800,320,h+ax(60,14,720,250)+tx(420,314,'horas de estudo',`text-anchor="middle" font-size="15" fill="${COL.mu}"`)+tx(14,150,'nota final',`font-size="15" fill="${COL.mu}" transform="rotate(-90 14 150)" text-anchor="middle"`))},
  say:'Um ponto por aluno. <b>alpha</b> é a transparência: com muitos pontos sobrepostos, um alpha baixo revela onde eles se concentram. <b>xlabel/ylabel</b> dão nome aos eixos.'},
 {chip:'df.corr(numeric_only=True)',lbl:'correlação',code:'df.corr(numeric_only=True).round(2)',
  out:()=>pdT(CN,CORR.map((r,i)=>[CN[i],...r.map(v=>v.toFixed(2))]),{hi:(ri,ci,v)=>{const x=+v;return ri===ci?`color:${COL.dim}`:`background:${x>=0?'rgba(34,211,238,':'rgba(248,113,113,'}${Math.min(.85,Math.abs(x)*1.2)});${Math.abs(x)>.25?'font-weight:700;color:#fff':''}`}}),
  say:'Correlação entre cada par de colunas numéricas, de −1 a 1. <b>numeric_only=True</b> ignora as colunas de texto; <b>round(2)</b> arredonda para ler melhor.',tip:'horas_estudo × nota_final = 0,62 é a relação mais forte. Correlação não é causalidade.'},
 {chip:"groupby(…)['nota_final'].mean()",lbl:'média por grupo',ctl:[{k:'by',t:'opts',l:'',o:[['t',"'turno'"],['m',"'monitoria'"],['tm',"['turno', 'monitoria']"]]}],code:s=>`df.groupby(⟨${{t:"'turno'",m:"'monitoria'",tm:"['turno', 'monitoria']"}[s.by]}⟩)['nota_final'].mean().round(2)`,
  out:s=>s.by==='t'?pdS([['manhã','4.19'],['noite','3.62'],['tarde','4.33']],{name:'turno',foot:'Name: nota_final, dtype: float64'}):s.by==='m'?pdS([['não','3.89'],['sim','4.51']],{name:'monitoria',foot:'Name: nota_final, dtype: float64'}):T(`turno  monitoria\nmanhã  não          3.96\n       sim          <b class="gr">4.71</b>\nnoite  não          <b class="rd">3.53</b>\n       sim          3.90\ntarde  não          4.19\n       sim          4.59\n<span class="mu">Name: nota_final, dtype: float64</span>`),
  say:'Separa as linhas em grupos, calcula a média da nota em cada um e junta o resultado. Lê-se: “para cada turno, a média da nota final”.'},
 {chip:".agg(['min', 'max'])",lbl:'várias contas por grupo',code:"df.groupby('situacao')['nota_final'].agg(['min', 'max'])",
  out:()=>pdT(['min','max'],[['aprovado','6.0','8.0'],['reprovado','0.0','5.9']],{idx:'situacao',hi:()=>HI('am')}),say:'<b>agg</b> aplica várias funções de uma vez. A coluna situacao entrega a nota: aprovado ⇔ nota ≥ 6.',tip:'Por isso ela não pode ser feature: seria vazamento (etapa 4.1).'}]};

const ENC=[['noite'],['manhã'],['tarde'],['manhã']];
const HV=[[0,2],[1,5],[2,8],[3,3],[5,NA],[6,NA]];
const PEO=[['Você',25,3000],['A',62,3200],['B',27,4500]];
CMD.prep={libs:['pandas','scikit-learn'],lab:'Lab 00 · etapas 4.3 e 5',state:{enc:'oh',hu:'ignore',st:'median'},items:[
 {chip:'pd.get_dummies()',lbl:'one-hot no pandas',ctl:[{k:'enc',t:'opts',l:'',o:[['oh','one-hot'],['lb','label (.map)']]}],code:s=>s.enc==='oh'?"pd.get_dummies(df['turno'], prefix='turno', dtype=int)":"df['turno'].map({'noite': 0, 'manhã': 1, 'tarde': 2})",
  out:s=>s.enc==='oh'?pdT(['turno_manhã','turno_noite','turno_tarde'],ENC.map((r,i)=>[i,...['manhã','noite','tarde'].map(t=>r[0]===t?1:0)]),{hi:(ri,ci,v)=>v===1?HI('cy'):''})+cap('turno original: noite, manhã, tarde, manhã'):`<div class="orow">${pdS(ENC.map((r,i)=>[i,{noite:0,'manhã':1,tarde:2}[r[0]]]),{foot:'Name: turno, dtype: int64',hi:()=>`color:${COL.rd};font-weight:700`})}<div style="font-size:20px;padding-top:10px">tarde (2) = 2 × manhã (1)?<br><span class="mu">uma ordem que não existe</span></div></div>`,
  say:s=>s.enc==='oh'?'Uma coluna 0/1 por categoria. <b>prefix</b> dá nome às colunas; <b>dtype=int</b> mostra 0/1 em vez de True/False.':'<b>map</b> troca cada valor pelo número do dicionário. Rápido, mas cria uma ordem falsa entre as categorias.'},
 {chip:"OneHotEncoder(handle_unknown=…)",lbl:'one-hot no scikit-learn',ctl:[{k:'hu',t:'opts',l:'handle_unknown =',o:[['ignore',"'ignore'"],['error',"'error'"]]}],code:s=>`enc = OneHotEncoder(handle_unknown=⟨'${s.hu}'⟩)\nenc.fit(treino[['turno']])          # manhã, noite, tarde\nenc.transform(teste[['turno']]).toarray()  # noite, integral`,
  out:s=>`<div class="orow">${pdT(['turno'],[[0,'noite'],[1,'integral']],{cap:'teste',hi:(ri)=>ri===1?HI('am'):''})}${s.hu==='ignore'?T(`array([[0., 1., 0.],\n       <span style="${HI('am')}">[0., 0., 0.]</span>])`):T(`<span class="rd" style="font-weight:700">ValueError: Found unknown categories\n['integral'] in column 0 during transform</span>`)}</div>`+cap("enc.categories_ → [array(['manhã', 'noite', 'tarde'])] · aprendido no fit, só com o treino"),
  say:'A versão do scikit-learn: aprende as categorias no <b>fit</b> e cria as colunas no <b>transform</b>. Com <b>\'ignore\'</b>, uma categoria nunca vista vira só zeros em vez de quebrar o código.',tip:'.toarray() é só para visualizar: a saída padrão é uma matriz esparsa.'},
 {chip:"SimpleImputer(strategy=…)",lbl:'preencher faltantes',ctl:[{k:'st',t:'opts',l:'strategy =',o:[['mean',"'mean'"],['median',"'median'"],['most_frequent',"'most_frequent'"]]}],code:s=>`imp = SimpleImputer(strategy=⟨'${s.st}'⟩)\nimp.fit_transform(df[['horas_estudo']])\nimp.statistics_`,
  out:s=>{const v=HV.map(r=>r[1]).filter(x=>!isNA(x)),fill={mean:mean(v),median:quant(v,.5),most_frequent:Math.min(...v)}[s.st];return `<div class="orow">${pdT(['antes','depois'],HV.map(([i,h])=>[i,f1(h),f1(isNA(h)?fill:h)]),{hi:(ri,ci,x,r)=>ci===1&&r[1]===null?HI('gr'):''})}<div>${T(`array([${fill.toFixed(1)}])`,'font-size:28px;font-weight:700')}${cap('imp.statistics_: o valor aprendido no fit')}</div></div>`},
  say:'No <b>fit</b>, calcula a média, a mediana ou o valor mais frequente de cada coluna; no <b>transform</b>, coloca esse valor nos NaN.',tip:"df[['col']] com dois colchetes = tabela com 1 coluna: o scikit-learn espera 2D. No Lab 00 (treino): média 5,98 · mediana 5,95."},
 {chip:'StandardScaler()',lbl:'padronizar',code:"scaler = StandardScaler()\nZ = scaler.fit_transform(df[['idade', 'renda']])\nscaler.mean_, scaler.scale_",
  out:()=>{const cols=[1,2].map(j=>{const a=PEO.map(p=>p[j]),m=mean(a),sd=Math.sqrt(mean(a.map(x=>(x-m)**2)));return {m,sd,z:a.map(x=>(x-m)/sd)}});return `<div class="orow">${pdT(['idade','renda'],PEO.map(p=>[p[0],p[1],p[2]]),{cap:'antes'})}${pdT(['idade','renda'],PEO.map((p,i)=>[p[0],cols[0].z[i].toFixed(2),cols[1].z[i].toFixed(2)]),{cap:'Z (depois)',hi:()=>`color:${COL.cy};font-weight:700`})}</div>`+T(`(array([  38.  , 3566.67]), array([ 16.99,  665.0 ]))`)+cap('as 3 pessoas do slide anterior')},
  say:'<b>fit</b> aprende a média (<span class="mono">mean_</span>) e o desvio (<span class="mono">scale_</span>) de cada coluna; <b>transform</b> aplica z = (x − μ) / σ. Agora idade e renda pesam igual.'},
 {chip:'pd.concat([…], axis=1)',lbl:'juntar colunas lado a lado',code:"label = df['turno'].map({'noite': 0, 'manhã': 1, 'tarde': 2})\nonehot = pd.get_dummies(df['turno'], prefix='turno', dtype=int)\npd.concat([df['turno'], label.rename('label'), onehot], axis=⟨1⟩).head()",
  out:()=>pdT(['turno','label','turno_manhã','turno_noite','turno_tarde'],ENC.map((r,i)=>[i,r[0],{noite:0,'manhã':1,tarde:2}[r[0]],...['manhã','noite','tarde'].map(t=>r[0]===t?1:0)]),{hi:(ri,ci)=>ci===1?HI('rd'):ci>=2?`color:${COL.cy};font-weight:700`:''})+cap('desafio 5.2 do Lab 00: original, label e one-hot lado a lado'),
  say:'Coloca a coluna original, o label encoding e o one-hot lado a lado para comparar. No label, “tarde” (2) parece valer o dobro de “manhã” (1).'},]};

const TS=[0.1,0.15,0.2,0.25,0.3,0.4,0.5],SPL={0.1:[352,40],0.15:[333,59],0.2:[313,79],0.25:[294,98],0.3:[274,118],0.4:[235,157],0.5:[196,196]};
const CTN=['num__horas_estudo','num__faltas','num__idade','num__renda_familiar','cat__turno_manhã','cat__turno_noite','cat__turno_tarde','cat__monitoria_não','cat__monitoria_sim'];
const box=(x,y,w,h,c,t,sub,o={})=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${c}" fill-opacity="${o.fo||.16}" stroke="${c}" stroke-width="2.5" ${o.dash?'stroke-dasharray="8 6"':''}/>${tx(x+w/2,y+h/2+(sub?-4:6),t,`text-anchor="middle" font-size="${o.fs||18}" font-weight="700" ${o.mono?'font-family="JetBrains Mono,monospace"':''}`)}${sub?tx(x+w/2,y+h/2+20,sub,`text-anchor="middle" font-size="14" fill="${COL.mu}"`):''}`;
const arw=(x1,y1,x2,y2,c,o={})=>`<path d="M${x1} ${y1} ${o.q?`Q${o.q}`:'L'} ${x2} ${y2}" fill="none" stroke="${c}" stroke-width="2.5" marker-end="url(#${o.m||'ar'})" ${o.dash?'stroke-dasharray="8 6" style="animation:flow 1s linear infinite"':''}/>`;
CMD.pipe={libs:['scikit-learn','pandas'],lab:'Lab 00 · etapas 4.1 a 4.3',state:{ti:2,rs:'42',m:'ok',p:'num',ph:'fit'},items:[
 {chip:'df.drop(columns=[…])',lbl:'separar features e alvo',code:"alvo = 'nota_final'\nX = df.drop(columns=[alvo, ⟨'situacao'⟩])\ny = df[alvo]\nX.shape, y.shape",
  out:()=>T('((392, 6), (392,))','font-size:24px;font-weight:700')+pdT(['horas_estudo','faltas','turno','monitoria','idade','renda_familiar'],[[0,'5.8','2.0','noite','não',30,'4150.0'],[1,'4.6','3.0','manhã','não',18,'3670.0'],[2,'3.7','4.0','tarde','não',24,'6070.0'],[3,'4.2','6.0','manhã','não',27,'1680.0'],[4,'6.6','2.0','manhã','sim',28,'2630.0']],{cap:'X.head()'})+cap('situacao saiu junto com o alvo: ela é calculada a partir da nota'),
  say:'X fica com as 6 features e y com a nota. A coluna <b>situacao</b> sai junto porque entrega a resposta (vazamento).'},
 {chip:'train_test_split()',lbl:'separar treino e teste',ctl:[{k:'ti',t:'range',l:'test_size',min:0,max:6,step:1},{k:'rs',t:'opts',l:'random_state =',o:[['42','42'],['0','0'],['None','None']]}],
  code:s=>`X_tr, X_te, y_tr, y_te = train_test_split(\n    X, y, test_size=⟨${TS[s.ti]}⟩, random_state=⟨${s.rs}⟩)\nprint(X_tr.shape, X_te.shape)`,
  out:s=>{const t=TS[s.ti],[a,b]=SPL[t],r=rng(s.rs==='None'?Math.floor(Math.random()*1e9):(+s.rs+7)*7919),ids=[...Array(40).keys()];for(let i=39;i>0;i--){const j=Math.floor(r()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}const te=new Set(ids.slice(0,Math.round(40*t)));
   return T(`(${a}, 6) (${b}, 6)`,'font-size:28px;font-weight:700')+`<div class="lbl mu" style="font-size:13px;margin:16px 0 8px">as 40 primeiras linhas: quem foi para cada lado</div><div class="strip">${ids.sort((x,y)=>x-y).map(i=>`<i class="${te.has(i)?'te':''}">${i}</i>`).join('')}</div><div class="row" style="gap:22px;margin-top:12px;font-size:17px"><span><i class="sw" style="background:${COL.cy}"></i>treino ${a}</span><span><i class="sw" style="background:${COL.am}"></i>teste ${b}</span></div>`},
  say:'Sorteia as linhas: <b>test_size</b> é a fração que vai para o teste; <b>random_state</b> fixa o sorteio, para todo mundo obter o mesmo resultado. Devolve 4 coisas, sempre nesta ordem.',tip:s=>s.rs==='None'?'Com None, cada execução sorteia diferente: clique em None de novo.':'Mesmo número → mesmo sorteio, em qualquer computador.'},
 {chip:'fit × transform',lbl:'quem aprende com quem',ctl:[{k:'m',t:'opts',l:'',o:[['ok','certo'],['bad','errado']]}],
  code:s=>s.m==='ok'?'scaler = StandardScaler()\nscaler.fit(⟨X_tr⟩)              # aprende μ e σ só no treino\nZ_tr = scaler.transform(X_tr)\nZ_te = scaler.transform(X_te)    # usa o μ do treino':'scaler = StandardScaler()\nscaler.fit(⟨X⟩)                 # treino + teste juntos ✕\nZ_tr = scaler.transform(X_tr)\nZ_te = scaler.transform(X_te)',
  out:s=>{const ok=s.m==='ok';let h='';
   h+=ok?box(0,10,220,70,COL.cy,'X_tr','313 linhas')+box(0,170,220,70,COL.am,'X_te','79 linhas'):box(0,10,220,70,COL.rd,'X','treino + teste: 392')+box(0,170,220,70,COL.am,'X_te','79 linhas',{dash:1})+arw(110,168,110,86,COL.rd,{dash:1,m:'ara'})+tx(124,135,'o teste entrou no fit',`font-size="15" fill="${COL.rd}" font-weight="700"`);
   h+=arw(224,45,286,45,ok?COL.cy:COL.rd)+box(292,10,150,70,ok?COL.cy:COL.rd,'fit','',{mono:1,fs:22})+arw(446,45,500,45,COL.mu);
   h+=box(506,10,320,70,ok?COL.gr:COL.rd,ok?'μ horas = 5.98':'μ horas = 6.03',ok?'aprendido só no treino':'contaminado pelo teste',{mono:1,fs:19});
   h+=arw(224,205,286,205,COL.am)+box(292,170,150,70,COL.vi,'transform','',{mono:1,fs:20})+arw(446,205,500,205,COL.mu)+box(506,170,320,70,COL.vi,'Z_te','teste padronizado com o μ acima',{mono:1});
   h+=arw(666,84,380,166,COL.gr,{dash:1,q:'560 130',m:'arc'});
   return svgO(840,250,h)+cap(ok?'fit_transform(X_tr) = fit + transform de uma vez: só no treino':'diferença pequena aqui, mas com poucos dados ou estatísticas sensíveis o resultado infla')},
  say:'<b>fit</b> = aprender (média, desvio, categorias…). <b>transform</b> = aplicar o que foi aprendido. O teste só pode passar pelo <b>transform</b>.',tip:'No notebook, compare μ só treino (certo) × μ treino + teste (errado).'},
 {chip:'ColumnTransformer([…])',lbl:'um preparo por tipo de coluna',ctl:[{k:'p',t:'opts',l:'',o:[['num','num'],['cat','cat'],['out','get_feature_names_out()']]}],
  code:s=>`preparo = ColumnTransformer([\n    ('num', Pipeline([('imputar', SimpleImputer(strategy='median')),\n                      ('padronizar', StandardScaler())]), num),\n    ('cat', OneHotEncoder(handle_unknown='ignore'), cat),\n])${s.p==='out'?'\nZ_tr = preparo.fit_transform(X_tr)\n⟨preparo.get_feature_names_out()⟩':''}`,
  out:s=>{const cols=['horas_estudo','faltas','idade','renda_familiar','turno','monitoria'];let h='';const on=g=>s.p==='out'||s.p===g;
   cols.forEach((c,i)=>{const g=i<4?'num':'cat',cl=i<4?COL.cy:COL.gr,y=8+i*40+(i>3?18:0);h+=`<g opacity="${on(g)?1:.3}"><rect x="0" y="${y}" width="190" height="32" rx="8" fill="${cl}" fill-opacity=".2" stroke="${cl}" stroke-width="1.5"/>${tx(95,y+22,c,`text-anchor="middle" font-size="15" font-family="JetBrains Mono,monospace"`)}${arw(194,y+16,262,i<4?80:226,cl)}</g>`});
   h+=`<g opacity="${on('num')?1:.3}">${box(268,30,250,100,COL.cy,'imputar → padronizar','mediana · z = (x − μ)/σ',{fs:17})}</g><g opacity="${on('cat')?1:.3}">${box(268,196,250,60,COL.gr,'OneHotEncoder','',{fs:17})}</g>`;
   CTN.forEach((c,i)=>{const g=i<4?'num':'cat',cl=i<4?COL.cy:COL.gr,y=4+i*28.5;h+=`<g opacity="${on(g)?1:.3}"><rect x="590" y="${y}" width="250" height="24" rx="6" fill="${cl}" fill-opacity="${s.p==='out'?.3:.14}"/>${tx(600,y+17,c,`font-size="13" font-family="JetBrains Mono,monospace"`)}</g>`});
   h+=arw(522,80,584,60,COL.cy)+arw(522,226,584,200,COL.gr);return svgO(840,262,h)+cap(s.p==='out'?'6 colunas entram, 9 saem: o one-hot criou uma coluna por categoria':`tupla = (nome, transformador, colunas) · ${s.p==='num'?"num = ['horas_estudo', 'faltas', 'idade', 'renda_familiar']":"cat = ['turno', 'monitoria']"}`)},
  say:'Cada tupla diz <b>(nome, transformador, colunas)</b>. As numéricas passam por imputação e padronização; as categóricas, por one-hot. No fim, tudo é juntado lado a lado.'},
 {chip:'Pipeline([…])',lbl:'encadear preparo e modelo',ctl:[{k:'ph',t:'opts',l:'',o:[['fit','.fit(X_tr, y_tr)'],['predict','.predict(X_te)']]}],code:s=>`modelo = Pipeline([\n    ('preparo', preparo),\n    ('regressao', LinearRegression()),\n])\nmodelo⟨${s.ph==='fit'?'.fit(X_tr, y_tr)':'.predict(X_te)'}⟩`,
  out:s=>{const f=s.ph==='fit',c=f?COL.cy:COL.am;let h=box(0,70,150,80,c,f?'X_tr':'X_te','',{mono:1})+arw(154,110,214,110,c,{dash:1,m:f?'arc':'ara'})+box(220,70,230,80,COL.cy,'preparo','ColumnTransformer')+arw(454,110,514,110,c,{dash:1,m:f?'arc':'ara'})+box(520,70,190,80,COL.am,'regressao','LinearRegression')+arw(714,110,760,110,c,{dash:1,m:f?'arc':'ara'})+tx(800,118,f?'✓':'ŷ',`text-anchor="middle" font-size="34" font-weight="700" fill="${c}"`);
   h+=tx(335,52,f?'fit_transform':'transform',`text-anchor="middle" font-size="19" font-family="JetBrains Mono,monospace" font-weight="700" fill="${c}"`)+tx(615,52,f?'fit':'predict',`text-anchor="middle" font-size="19" font-family="JetBrains Mono,monospace" font-weight="700" fill="${c}"`);
   h+=tx(420,200,f?'cada etapa aprende, em ordem, só com o treino':'nada é reaprendido: o teste só é transformado e previsto',`text-anchor="middle" font-size="18" fill="${COL.mu}"`);return svgO(840,220,h)},
  say:s=>s.ph==='fit'?'<b>Pipeline.fit</b> chama <span class="mono">fit_transform</span> em cada etapa de preparo e <span class="mono">fit</span> no modelo final, em ordem.':'<b>Pipeline.predict</b> só transforma, com o que aprendeu no treino, e prevê. Assim é impossível vazar o teste.',tip:"Para olhar uma etapa por dentro: modelo.named_steps['regressao']"},]};

const PEO6=[['Você',25,3000],['A',62,3200],['B',27,4500],['C',45,6100],['D',33,2400],['E',51,8200]];
CMD.conf={libs:['numpy','pandas','scikit-learn'],lab:'Lab 00 · etapas 4.4 a 5.1',state:{ix:'False',sc:'0'},items:[
 {chip:'Z_tr[:, :4].mean(axis=0)',lbl:'conferir a padronização',code:"n_num = len(num)\npd.DataFrame({\n    'média treino':  Z_tr[:, :n_num].mean(axis=0),\n    'desvio treino': Z_tr[:, :n_num].std(axis=0),\n    'média teste':   Z_te[:, :n_num].mean(axis=0),\n}, index=num).round(3)",
  out:()=>pdT(['média treino','desvio treino','média teste'],[['horas_estudo','-0.0','1.0','0.118'],['faltas','0.0','1.0','0.058'],['idade','0.0','1.0','0.058'],['renda_familiar','-0.0','1.0','-0.136']],{hi:(ri,ci)=>ci===2?HI('am'):''})+cap('treino: média 0 e desvio 1 exatos · teste: perto, mas não igual, porque é dado novo'),
  say:'O treino fica com média 0 e desvio 1 porque o scaler aprendeu com ele. O teste fica <b>perto</b> de 0, não exatamente: sinal de que ele não participou do fit.'},
 {chip:"named_transformers_[…].mean_",lbl:'ler o que o fit aprendeu',code:"mu_certo = preparo.named_transformers_['num'].named_steps['padronizar'].mean_\nmu_certo",
  out:()=>T('array([   5.98,    3.03,   23.27, 4239.3 ])','font-size:22px;font-weight:700')+`<div class="chain">${[['preparo','ColumnTransformer: o preparo inteiro'],[".named_transformers_['num']",'Pipeline: imputar → padronizar'],[".named_steps['padronizar']",'StandardScaler'],['.mean_','as médias aprendidas no fit']].map(([c,t],i)=>`<div style="margin-left:${i*28}px"><code>${c}</code><span>${t}</span></div>`).join('')}</div>`+cap('horas, faltas, idade e renda: médias calculadas só com os 313 alunos de treino'),
  say:'Cada nível guarda o próximo: o ColumnTransformer guarda o Pipeline numérico, que guarda o scaler, que guarda as médias aprendidas.'},
 {chip:'fillna(X.median())',lbl:'o jeito errado, de propósito',code:"mu_errado = StandardScaler().fit(X[num].fillna(X[num].median())).mean_\npd.DataFrame({'μ só treino (certo)': mu_certo,\n              'μ treino + teste (errado)': mu_errado}, index=num).round(2)",
  out:()=>pdT(['μ só treino (certo)','μ treino + teste (errado)'],[['horas_estudo','5.98','6.03'],['faltas','3.03','3.05'],['idade','23.27','23.31'],['renda_familiar','4239.30','4175.43']],{hi:(ri,ci)=>ci===1?HI('rd'):HI('gr')})+cap('valores reais do Lab 00'),
  say:'Aqui o scaler é ajustado com <b>todo</b> o X, treino e teste juntos. As médias mudam: informação do teste entrou no ajuste. É isso que o Pipeline evita.'},

 {chip:"df.to_csv(…, index=False)",lbl:'salvar os dados limpos',ctl:[{k:'ix',t:'opts',l:'index =',o:[['False','False'],['True','True']]}],code:s=>`df.to_csv('alunos_limpo.csv', index=⟨${s.ix}⟩)`,
  out:s=>{const R=L3(24).filter(r=>!isNA(r.n)),ix=s.ix==='True',c=v=>isNA(v)?'':(+v).toFixed(1);return cap('conteúdo de alunos_limpo.csv')+T(`${ix?`<span class="am">,</span>`:''}horas_estudo,faltas,turno,nota_final\n${R.map(r=>`${ix?`<span class="am">${r.i},</span>`:''}${c(r.h)},${c(r.f)},${r.t},${c(r.n)}`).join('\n')}`)},
  say:'Grava a tabela num arquivo CSV. <b>index=False</b> evita salvar o índice como uma coluna extra, sem nome.',tip:'No Colab, o arquivo some quando a sessão reinicia. O Lab 01 começa lendo este arquivo.'},
 {chip:'iloc · np.sqrt · idxmin()',lbl:'desafio: quem é mais parecido',ctl:[{k:'sc',t:'opts',l:'',o:[['0','sem padronizar'],['1','padronizando']]}],
  code:s=>`${s.sc==='1'?'⟨Az = (A - A.mean()) / A.std()⟩\nvoce, outros = Az.iloc[0], Az.iloc[1:]':'voce, outros = A.iloc[0], A.iloc[1:]'}\ndist = np.sqrt(((outros - voce) ** 2).sum(axis=1))\nA.loc[dist.idxmin()].to_dict()`,
  out:s=>{const col=j=>PEO6.map(p=>p[j]),z=j=>{const a=col(j),m=mean(a),sd=Math.sqrt(a.reduce((t,x)=>t+(x-m)**2,0)/(a.length-1));return a.map(x=>(x-m)/sd)},I=s.sc==='1'?z(1):col(1),R=s.sc==='1'?z(2):col(2);
   const d=PEO6.map((p,i)=>Math.hypot(I[i]-I[0],R[i]-R[0])),k=d.slice(1).reduce((b,v,i)=>v<d[b]?i+1:b,1);
   return `<div class="orow">${pdT(['idade','renda','dist'],PEO6.map((p,i)=>[p[0],s.sc==='1'?I[i].toFixed(2):p[1],s.sc==='1'?R[i].toFixed(2):p[2],i?d[i].toFixed(s.sc==='1'?2:1):'—']),{hi:(ri,ci)=>ri===k?HI('gr'):ri===0?`color:${COL.mu}`:''})}<div style="padding-top:20px">${T(`{'idade': ${PEO6[k][1]}, 'renda': ${PEO6[k][2]}}`,'font-size:20px;font-weight:700')}<div style="font-size:18px;margin-top:10px">mais parecido: <b class="gr">${PEO6[k][0]}</b>${s.sc==='1'?'':' <span class="rd">(62 anos!)</span>'}</div></div></div>`+cap('exemplo com 6 pessoas e 2 colunas · no notebook: faltas, idade e renda dos alunos de treino')},
  say:s=>s.sc==='1'?'Padronizando, idade e renda pesam igual e o vizinho passa a ser alguém de idade e renda próximas.':'Sem padronizar, a renda (milhares) esmaga a idade (dezenas): a pessoa “mais parecida” tem 62 anos.'}]};

/* =====================================================================
   MÓDULO 02 · LAB 01
   ===================================================================== */
CMD.lib01={libs:['numpy','pandas','matplotlib','scikit-learn'],lab:'Lab 01 · célula 0',outLbl:'BIBLIOTECA',
 cell:`import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, PolynomialFeatures
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

plt.rcParams['figure.figsize'] = (8, 4)`,
 items:[
 {chip:'numpy · pandas · plt',lbl:'as mesmas do Lab 00',lines:[0,1,2],out:()=>libCard('NumPy + pandas + Matplotlib','cy','Agora o NumPy ganha destaque: a descida do gradiente é escrita com contas de arrays.',['.to_numpy()','w * x + b','(erro ** 2).mean()','x.reshape(-1, 1)','np.linspace()','plt.plot()',"plt.yscale('log')"],'etapas 1 e 2'),say:'As três bibliotecas de sempre. Nenhuma linha nova aqui.'},
 {chip:'model_selection',lbl:'+ cross_val_score',lines:[4],out:()=>libCard('scikit-learn','vi','Além de separar treino e teste, agora vamos validar com vários cortes do treino.',['train_test_split()',"cross_val_score(…, cv=5, scoring=…)"],'etapas 3.3 e 5'),say:'<b>cross_val_score</b> faz a validação cruzada do slide de k-fold em uma linha.'},
 {chip:'compose · pipeline · impute',lbl:'o preparo do Lab 00',lines:[5,6,7],out:()=>libCard('scikit-learn','vi','O mesmo preparo do Lab 00, agora já montado numa célula pronta.',['ColumnTransformer','Pipeline','SimpleImputer'],'etapa 3.3'),say:'Você já montou isso no Lab 00: aqui ele aparece pronto.'},
 {chip:'preprocessing',lbl:'+ PolynomialFeatures',lines:[8],out:()=>libCard('scikit-learn','vi','PolynomialFeatures cria as colunas x², x³… para a reta virar curva.',['StandardScaler()','OneHotEncoder()','PolynomialFeatures(degree=10)'],'etapa 5 (desafio)'),say:'Uma peça nova: gera potências das features.'},
 {chip:'linear_model',lbl:'os modelos',lines:[9],out:()=>libCard('scikit-learn','vi','Regressão linear (mínimos quadrados) e sua versão regularizada, a Ridge.',['LinearRegression()','Ridge(alpha=…)','.fit(X, y)','.predict(X)','.coef_','.intercept_'],'etapas 2, 3 e 5'),say:'O primeiro modelo do curso. Todos os modelos do scikit-learn têm <b>fit</b> e <b>predict</b>.'},
 {chip:'metrics',lbl:'MAE, MSE e R²',lines:[10],out:()=>libCard('scikit-learn','vi','Funções que comparam o valor real com o previsto.',['mean_absolute_error(y, ŷ)','mean_squared_error(y, ŷ)','r2_score(y, ŷ)'],'etapa 3.2'),say:'Sempre na ordem <b>(real, previsto)</b>.'}]};

const vecT=rows=>`<table class="vec">${rows.map(([lab,vals,st])=>`<tr><th>${lab}</th>${vals.map((v,i)=>`<td style="${st?st(v,i):''}">${v}</td>`).join('')}</tr>`).join('')}</table>`;
const npPlot=(w,b,res)=>{const m=mapper(40,8,760,150,0,10,0,7);let h=ax(40,8,760,150);X10.forEach((x,i)=>{const yh=w*x+b;if(res===2){const y1=m.Y(Y10[i]),y2=m.Y(Math.max(0,Math.min(7,yh))),d=Math.abs(y2-y1);h+=`<rect x="${m.X(x)}" y="${Math.min(y1,y2)}" width="${d}" height="${d}" fill="${COL.am}" fill-opacity=".22" stroke="${COL.am}" stroke-width="1.5"/>`}if(res)h+=`<line x1="${m.X(x)}" y1="${m.Y(Y10[i])}" x2="${m.X(x)}" y2="${m.Y(Math.max(0,Math.min(7,yh)))}" stroke="${COL.am}" stroke-width="2.5"/>`});
 const y0=b,y1=w*10+b;h+=`<line x1="${m.X(0)}" y1="${m.Y(y0)}" x2="${m.X(10)}" y2="${m.Y(y1)}" stroke="${COL.cy}" stroke-width="3.5" clip-path="url(#npClip)"/>`;X10.forEach((x,i)=>h+=`<circle cx="${m.X(x)}" cy="${m.Y(Y10[i])}" r="7" fill="${COL.tx}"/>`);
 return svgO(820,170,`<defs><clipPath id="npClip"><rect x="40" y="8" width="760" height="150"/></clipPath></defs>${h}`,'height:170px')};
const WB=[{k:'w',t:'range',l:'w =',min:0,max:1,step:.01},{k:'b',t:'range',l:'b =',min:0,max:4,step:.1}];
CMD.np={libs:['numpy','matplotlib'],lab:'Lab 01 · etapas 1, 2 e 4',state:{w:.3,b:2,r:'1d',ys:'log'},items:[
 {chip:'w * x + b',lbl:'a reta, de uma vez',ctl:WB,code:s=>`x, y = x_tr[:10], y_tr[:10]   # 10 alunos do treino\ny_hat = ⟨${(+s.w).toFixed(2)}⟩ * x + ⟨${(+s.b).toFixed(1)}⟩\ny_hat`,out:s=>{const yh=X10.map(x=>s.w*x+s.b);return vecT([['x',X10.map(v=>v.toFixed(1))],['ŷ = w·x + b',yh.map(v=>v.toFixed(2)),()=>`color:${COL.cy};font-weight:700`]])+npPlot(+s.w,+s.b,0)},
  say:'<b>Vetorização</b>: a mesma conta vale para os 10 elementos de uma vez, sem escrever um <span class="mono">for</span>. Mova w e b.'},
 {chip:'erro = y - y_hat',lbl:'o resíduo de cada aluno',ctl:WB,code:'erro = y - y_hat\nerro',out:s=>{const e=X10.map((x,i)=>Y10[i]-(s.w*x+s.b));return vecT([['y',Y10.map(v=>v.toFixed(1))],['ŷ',X10.map(x=>(s.w*x+s.b).toFixed(2))],['erro',e.map(v=>v.toFixed(2)),v=>`color:${+v>=0?COL.gr:COL.rd};font-weight:700`]])+npPlot(+s.w,+s.b,1)},
  say:'Subtração elemento a elemento. Erro <b class="gr">positivo</b>: o modelo previu baixo; <b class="rd">negativo</b>: previu alto.'},
 {chip:'(erro ** 2).mean()',lbl:'a MSE em uma linha',ctl:WB,code:'(erro ** 2).mean()',out:s=>{const e=X10.map((x,i)=>Y10[i]-(s.w*x+s.b)),e2=e.map(v=>v*v),ms=mean(e2);return vecT([['erro',e.map(v=>v.toFixed(2))],['erro ** 2',e2.map(v=>v.toFixed(2)),()=>`color:${COL.am}`]])+`<div class="row" style="align-items:baseline;gap:18px;margin-top:10px">${T(ms.toFixed(4),`font-size:46px;font-weight:700;color:${COL.am}`)}<span class="mu" style="font-size:18px">.mean() = média dos 10 quadrados</span></div>`+npPlot(+s.w,+s.b,2)},
  say:'<b>** 2</b> eleva cada erro ao quadrado e <b>.mean()</b> tira a média: é a MSE do slide anterior. Tente achar o w e o b que a deixam menor.',tip:`O mínimo para estes 10 pontos: w = ${br(LSQ[0].toFixed(2))}, b = ${br(LSQ[1].toFixed(1))} (MSE = ${br(mean(X10.map((x,i)=>(Y10[i]-LSQ[0]*x-LSQ[1])**2)).toFixed(4))}).`},
 {chip:'x.reshape(-1, 1)',lbl:'de fileira para coluna',ctl:[{k:'r',t:'opts',l:'',o:[['1d','x.shape'],['2d','x.reshape(-1, 1).shape']]}],code:s=>s.r==='1d'?'x.shape':'x⟨.reshape(-1, 1)⟩.shape',
  out:s=>s.r==='1d'?T('(10,)','font-size:40px;font-weight:700')+`<div class="strip">${X10.map(v=>`<i>${v}</i>`).join('')}</div>`+cap('1D: uma fileira só'):`<div class="orow">${T('(10, 1)','font-size:40px;font-weight:700')}<div class="colv">${X10.map(v=>`<i>${v}</i>`).join('')}</div><div class="mu" style="font-size:18px;padding-top:12px">2D: 10 linhas × 1 coluna<br>= uma tabela com uma feature</div></div>`,
  say:'O scikit-learn quer <b>X em 2D</b>: linhas = exemplos, colunas = features. <b>reshape(-1, 1)</b> significa “uma coluna, e quantas linhas forem precisas”.',tip:'Esquecer o reshape dá: “Expected 2D array, got 1D array instead”.'},
 {chip:'for alpha in […]: plt.plot(…)',lbl:'comparar taxas de aprendizado',ctl:[{k:'ys',t:'opts',l:'',o:[['log',"plt.yscale('log')"],['lin','escala linear']]}],
  code:s=>`for alpha in [0.001, 0.01, 0.023, 0.03]:\n    _, _, h = descida_gradiente(x_tr, y_tr, alpha=alpha, epocas=300)\n    plt.plot(np.clip(h, None, 1e3), label=f'α = {alpha}')\n${s.ys==='log'?"⟨plt.yscale('log')⟩; ":''}plt.legend(); plt.show()`,
  out:s=>{const A=[0.001,0.01,0.023,0.03],C=[COL.cy,COL.gr,COL.am,COL.rd],H=A.map(a=>{let w=0,b=0;const h=[];for(let e=0;e<300;e++){const er=Y10.map((y,i)=>y-(w*X10[i]+b));h.push(Math.min(1e3,mean(er.map(v=>v*v))));const dw=-2*mean(X10.map((x,i)=>x*er[i])),db=-2*mean(er);w-=a*dw;b-=a*db}return h});
   const lg=s.ys==='log',lo=lg?Math.log10(Math.min(...H.flat())):0,hi=lg?3:1e3,m=mapper(70,10,700,240,0,299,lo,hi);let g=`<line x1="70" y1="250" x2="770" y2="250" stroke="${COL.dim}"/><line x1="70" y1="10" x2="70" y2="250" stroke="${COL.dim}"/>`;
   (lg?[0,1,2,3]:[0,250,500,750,1000]).forEach(v=>g+=tx(62,m.Y(v)+5,lg?'10'+'⁰¹²³'[v]:v,`text-anchor="end" font-size="13" fill="${COL.dim}"`));[0,100,200,299].forEach(v=>g+=tx(m.X(v),270,v===299?300:v,`text-anchor="middle" font-size="13" fill="${COL.dim}"`));
   H.forEach((h,j)=>g+=`<path d="${h.map((v,i)=>(i?'L':'M')+m.X(i).toFixed(1)+' '+m.Y(lg?Math.log10(Math.max(v,1e-9)):v).toFixed(1)).join('')}" fill="none" stroke="${C[j]}" stroke-width="2.5"/>`);
   g+=`<rect x="600" y="16" width="160" height="104" rx="8" fill="${COL.bg}" stroke="${COL.ln}"/>`+A.map((a,j)=>`<line x1="612" y1="${36+j*24}" x2="636" y2="${36+j*24}" stroke="${C[j]}" stroke-width="3"/>`+tx(644,41+j*24,'α = '+a,'font-size="14" font-family="JetBrains Mono,monospace"')).join('');
   return svgO(800,280,g+tx(420,292,'época',`text-anchor="middle" font-size="14" fill="${COL.mu}"`))+cap('curvas calculadas aqui com os 10 alunos do slide; no notebook, com os 296')},
  say:s=>s.ys==='log'?'Em escala log dá para ver as quatro histórias: lenta, boa, oscilando e explodindo (a curva cortada em 1000 pelo np.clip).':'Em escala linear, a curva que explode achata todas as outras: por isso o notebook usa escala log.'},]};

CMD.skl={libs:['scikit-learn','numpy','matplotlib'],lab:'Lab 01 · etapas 2 e 3',state:{h:10,lw:3,mt:'mae'},items:[
 {chip:'LinearRegression()',lbl:'criar o modelo',code:'reg = LinearRegression()\nreg',out:()=>T('LinearRegression()')+`<div class="api"><div><b>1 · criar</b><code>modelo = Classe(…)</code><small>hiperparâmetros entre parênteses</small></div><i>→</i><div><b>2 · treinar</b><code>modelo.fit(X, y)</code><small>aprende os parâmetros</small></div><i>→</i><div><b>3 · usar</b><code>modelo.predict(X_novo)</code><small>ou .transform(X) no preparo</small></div></div>`,
  say:'Cria o modelo <b>vazio</b>: ainda não aprendeu nada. Todo o scikit-learn segue o mesmo roteiro: criar, <b>fit</b>, <b>predict</b>. Aprendeu um, aprendeu todos.'},
 {chip:'reg.fit(X, y)',lbl:'treinar',code:'reg.fit(x_tr.reshape(-1, 1), y_tr)',out:()=>{const m=mapper(50,10,740,230,0,15,0,7);let h=ax(50,10,740,230)+X10.map((x,i)=>`<circle cx="${m.X(x)}" cy="${m.Y(Y10[i])}" r="7" fill="${COL.tx}" opacity=".85"/>`).join('');h+=`<line x1="${m.X(0)}" y1="${m.Y(RB)}" x2="${m.X(15)}" y2="${m.Y(RW*15+RB)}" stroke="${COL.am}" stroke-width="4" stroke-dasharray="900" stroke-dashoffset="900" style="animation:dash 1.2s forwards"/>`;for(let v=0;v<=15;v+=5)h+=tx(m.X(v),262,v,`text-anchor="middle" font-size="13" fill="${COL.dim}"`);return T('LinearRegression()')+svgO(820,270,h)+cap('reta aprendida com os 296 alunos de treino · pontos: 10 deles')},
  say:'<b>fit</b> encontra o w e o b que minimizam a MSE, direto pela fórmula dos mínimos quadrados, sem épocas. X vai com <b>reshape(-1, 1)</b> porque precisa ser 2D.'},
 {chip:'reg.coef_, reg.intercept_',lbl:'o que ele aprendeu',code:'reg.coef_, reg.intercept_',out:()=>T('(array([0.38143126]), 1.7715581600979630)','font-size:24px')+`<div class="row" style="gap:22px;margin-top:14px"><div class="card" style="flex:1"><div class="lbl cy" style="font-size:13px">coef_ → w</div><div class="big mono" style="font-size:40px">0,381</div><div class="mu" style="font-size:16px">+0,38 ponto por hora de estudo</div></div><div class="card" style="flex:1"><div class="lbl vi" style="font-size:13px">intercept_ → b</div><div class="big mono" style="font-size:40px">1,772</div><div class="mu" style="font-size:16px">nota prevista com 0 h</div></div></div>`,
  say:'Atributos que terminam em <b>_</b> só existem <b>depois</b> do fit: são o que o modelo aprendeu. <b>coef_</b> é um array, com um peso por feature.',tip:'A sua descida do gradiente chega aos mesmos 0,381 e 1,772.'},
 {chip:'reg.predict() · zip()',lbl:'prever alunos novos',ctl:[{k:'h',t:'range',l:'3º aluno =',min:0,max:14,step:1}],code:s=>`novos = np.array([2, 6, ⟨${s.h}⟩])\nfor h, nota in zip(novos, reg.predict(novos.reshape(-1, 1))):\n    print(f'{h:>2} h de estudo → nota prevista {nota:.2f}')`,
  out:s=>{const N=[2,6,+s.h],P=N.map(h=>RW*h+RB),m=mapper(50,10,740,170,0,15,0,7.5);let h=ax(50,10,740,170)+`<line x1="${m.X(0)}" y1="${m.Y(RB)}" x2="${m.X(15)}" y2="${m.Y(RW*15+RB)}" stroke="${COL.am}" stroke-width="3"/>`;
   N.forEach((x,i)=>h+=`<line x1="${m.X(x)}" y1="${m.Y(0)}" x2="${m.X(x)}" y2="${m.Y(P[i])}" stroke="${COL.cy}" stroke-dasharray="5 4" stroke-width="2"/><circle cx="${m.X(x)}" cy="${m.Y(P[i])}" r="9" fill="${COL.cy}"/>`);
   for(let v=0;v<=15;v+=5)h+=tx(m.X(v),200,v,`text-anchor="middle" font-size="13" fill="${COL.dim}"`);return T(N.map((x,i)=>`${String(x).padStart(2)} h de estudo → nota prevista ${P[i].toFixed(2)}`).join('\n'),'font-size:20px')+svgO(820,210,h)},
  say:'<b>predict</b> recebe X em 2D e devolve um array com uma previsão por linha. O <b>zip</b> anda pelas duas listas juntas para imprimir cada par.',tip:'No notebook: 2 h → 2,53 · 6 h → 4,06 · 10 h → 5,59.'},
 {chip:'mean_absolute_error(y, ŷ)',lbl:'métricas no teste',ctl:[{k:'mt',t:'opts',l:'',o:[['mae','MAE'],['mse','MSE'],['r2','R²']]}],code:s=>`pred = reg.predict(x_te.reshape(-1, 1))\n⟨${{mae:'mean_absolute_error',mse:'mean_squared_error',r2:'r2_score'}[s.mt]}⟩(y_te, pred)`,
  out:s=>{const M={mae:['0.79','erra 0,79 ponto de nota, em média','cy'],mse:['0.97','em “pontos²”: pune mais os erros grandes','am'],r2:['0.47','explica 47% da variação, em relação a chutar a média','vi']}[s.mt];return T(M[0],`font-size:72px;font-weight:700;color:${COL[M[2]]}`)+`<div style="font-size:24px;margin-top:6px">${M[1]}</div>`+cap('valores reais do Lab 01, no teste, com uma feature (horas)')},
  say:'As funções de métrica recebem <b>(valor real, valor previsto)</b>, sempre nessa ordem, e devolvem um número.',tip:'Com todas as features (regressão múltipla) o MAE cai para 0,71.'}]};

const CVR={3:[0.708,0.804,0.689],5:[0.694,0.824,0.73,0.655,0.778],10:[0.724,0.669,0.759,0.992,0.767,0.672,0.816,0.503,0.798,0.764]};
const COEF=[['num__faltas',-0.39],['cat__turno_noite',-0.36],['cat__monitoria_não',-0.27],['num__renda_familiar',-0.07],['num__idade',0.07],['cat__turno_manhã',0.15],['cat__turno_tarde',0.22],['cat__monitoria_sim',0.27],['num__horas_estudo',0.84]];
CMD.cv={libs:['scikit-learn','pandas'],lab:'Lab 01 · etapas 3.3 e 5',state:{k:5,sg:'pos',d:3,lam:'0.1'},items:[
 {chip:'cross_val_score(…, cv=5)',lbl:'validação cruzada',ctl:[{k:'k',t:'opts',l:'cv =',num:1,o:[[3,'3'],[5,'5'],[10,'10']]},{k:'sg',t:'opts',l:'',o:[['neg','sem o −'],['pos','com o −']]}],
  code:s=>`mae_cv = ${s.sg==='pos'?'⟨-⟩':''}cross_val_score(multipla, X_tr, Y_tr, cv=⟨${s.k}⟩,\n                          scoring='neg_mean_absolute_error')\nmae_cv`,
  out:s=>{const v=CVR[s.k],sg=s.sg==='pos'?1:-1,mu=mean(v),sd=Math.sqrt(mean(v.map(x=>(x-mu)**2))),W=820,bw=Math.min(90,(W-120)/v.length-12),m=mapper(60,10,W-80,170,0,v.length,0,1.05);let h=ax(60,10,W-80,170);
   v.forEach((x,i)=>{const X=m.X(i+.5)-bw/2;h+=`<rect x="${X}" y="${m.Y(x)}" width="${bw}" height="${m.Y(0)-m.Y(x)}" rx="6" fill="${COL.am}" opacity=".75"/>`+tx(X+bw/2,m.Y(x)-8,(sg*x).toFixed(2),`text-anchor="middle" font-size="14" font-family="JetBrains Mono,monospace" fill="${COL.tx}"`)+tx(X+bw/2,200,'fold '+(i+1),`text-anchor="middle" font-size="13" fill="${COL.dim}"`)});
   h+=`<line x1="60" y1="${m.Y(mu)}" x2="${W-20}" y2="${m.Y(mu)}" stroke="${COL.cy}" stroke-width="2" stroke-dasharray="7 6"/>`;
   return T(`array([${v.map(x=>(sg*x).toFixed(3)).join(', ')}])`,'font-size:17px;white-space:pre-wrap')+svgO(820,210,h)+`<div style="font-size:22px">MAE = <b class="cy mono">${br(mu.toFixed(2))} ± ${br(sd.toFixed(2))}</b> <span class="mu" style="font-size:17px">mae_cv.mean() ± mae_cv.std()</span></div>`},
  say:'Treina e avalia o modelo <b>cv</b> vezes, cada vez com um fold diferente como validação, e devolve um array com uma nota por fold.',tip:s=>s.sg==='neg'?'O scikit-learn sempre maximiza o score: por isso o erro vem negativo (neg_…). O − na frente desfaz o sinal.':'Mais folds: cada nota usa menos dados e elas variam mais (veja o fold de 0,99 com cv=10).'},
 {chip:'PolynomialFeatures(degree=…)',lbl:'potências de x',ctl:[{k:'d',t:'range',l:'degree =',min:1,max:10,step:1}],code:s=>`PolynomialFeatures(degree=⟨${s.d}⟩).fit_transform([[2]])`,
  out:s=>{const p=Array.from({length:+s.d+1},(_,k)=>2**k);return T(`array([[${p.map(v=>v+'.').join(', ')}]])`,'white-space:pre-wrap;font-size:20px')+`<table class="vec" style="margin-top:14px"><tr>${p.map((_,k)=>`<th style="text-align:center">${k===0?'1':k===1?'x':'x'+String(k).split('').map(c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[c]).join('')}</th>`).join('')}</tr><tr>${p.map(v=>`<td style="color:${COL.am};font-weight:700">${v}</td>`).join('')}</tr></table>`+cap(`x = 2 vira ${p.length} colunas`)},
  say:'Cria novas colunas com as potências de x. O modelo continua linear nos <b>pesos</b>, mas passa a desenhar <b>curvas</b>.',tip:s=>s.d>=8?'Grau alto: muitas colunas, fácil decorar o treino (overfitting).':'No desafio do Lab 01 o grau é 10.'},
 {chip:'Ridge(alpha=…)',lbl:'regularização',ctl:[{k:'lam',t:'opts',l:'alpha =',o:[['0','0 (sem)'],['0.1','0.1'],['10','10'],['1000','1000']]}],code:s=>`def poli(lam):\n    passos = [('poli', PolynomialFeatures(degree=10)), ('padronizar', StandardScaler())]\n    passos.append(('reg', LinearRegression() if lam == 0 else Ridge(alpha=lam)))\n    return Pipeline(passos)\n\n-cross_val_score(poli(⟨${s.lam}⟩), x_tr.reshape(-1, 1), y_tr, cv=5,\n                scoring='neg_mean_absolute_error').mean()`,
  out:s=>{const V=[['0',2.596],['0.1',0.825],['10',0.845],['1000',0.992]],m=mapper(130,10,620,230,0,2.8,0,4);let h='';V.forEach(([l,v],i)=>{const y=m.Y(4-i)-6,on=l===s.lam;h+=tx(120,y+30,`λ = ${l}`,`text-anchor="end" font-size="18" font-family="JetBrains Mono,monospace" font-weight="${on?700:400}" fill="${on?COL.tx:COL.mu}"`)+`<rect x="130" y="${y+8}" width="${m.X(v)-130}" height="34" rx="6" fill="${i?COL.am:COL.rd}" opacity="${on?1:.35}"/>`+tx(m.X(v)+10,y+31,'MAE '+v.toFixed(3),`font-size="16" font-family="JetBrains Mono,monospace" fill="${on?COL.tx:COL.mu}"`)});return svgO(840,250,h)+cap('MAE da validação cruzada · polinômio de grau 10 · valores reais do Lab 01')},
  say:'Ridge = regressão linear + penalidade nos pesos. O <b>alpha</b> do Ridge é o <b>λ</b> do slide: quanto maior, mais a curva é freada.',tip:'⚠ Não confunda: alpha do Ridge (λ) ≠ alpha da descida do gradiente (taxa de aprendizado).'},]};

/* =====================================================================
   MÓDULO 03 · LAB 02
   ===================================================================== */
CMD.lib02={libs:['numpy','pandas','matplotlib','scikit-learn'],lab:'Lab 02 · célula 0',outLbl:'BIBLIOTECA',
 cell:`import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.datasets import load_iris, load_breast_cancer
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (ConfusionMatrixDisplay, classification_report,
                             precision_score, recall_score)`,
 items:[
 {chip:'datasets',lbl:'dados prontos',lines:[4],out:()=>libCard('scikit-learn · datasets','vi','Datasets clássicos que já vêm com a biblioteca: nada de download.',['load_iris(as_frame=True)','load_breast_cancer()'],'etapas 0 e 5.1'),say:'O Iris (150 flores) é o dataset principal; o de câncer de mama aparece no desafio de limiar.'},
 {chip:'model_selection · pipeline',lbl:'separar, validar, encadear',lines:[5,6,7],out:()=>libCard('scikit-learn','vi','As mesmas peças dos labs anteriores, agora com estratificação.',['train_test_split(…, stratify=y)','cross_val_score(…, cv=5)','Pipeline([…])','StandardScaler()'],'etapas 1 a 3'),say:'Nada novo, só o parâmetro <b>stratify</b>.'},
 {chip:'neighbors',lbl:'KNN',lines:[8],out:()=>libCard('KNN','pk','Classifica pela votação dos K vizinhos mais próximos.',['KNeighborsClassifier(n_neighbors=5)',"metric='manhattan'"],'etapas 2, 3 e 5.2'),say:'Usa distâncias: por isso vai num Pipeline com StandardScaler.'},
 {chip:'tree',lbl:'árvore de decisão',lines:[9],out:()=>libCard('Árvore de decisão','pk','Faz perguntas do tipo “pétala < 2,45?” até chegar numa classe.',['DecisionTreeClassifier(max_depth=…)','plot_tree(…)'],'etapas 2 e 3'),say:'<b>plot_tree</b> desenha a árvore treinada.'},
 {chip:'ensemble',lbl:'Random Forest',lines:[10],out:()=>libCard('Random Forest','pk','Muitas árvores, cada uma com uma amostra sorteada, votando juntas.',['RandomForestClassifier(n_estimators=200)','.predict_proba()'],'etapas 2, 4 e 5.1'),say:'“Ensemble” = combinar vários modelos.'},
 {chip:'metrics',lbl:'avaliar a classificação',lines:[11,12],out:()=>libCard('scikit-learn · metrics','vi','Matriz de confusão, relatório por classe, precision e recall.',['ConfusionMatrixDisplay.from_predictions()','classification_report()','precision_score()','recall_score()'],'etapas 4 e 5.1'),say:'Os parênteses deixam quebrar um import longo em duas linhas.'}]};

CMD.iris={libs:['scikit-learn','pandas','matplotlib'],lab:'Lab 02 · etapas 0 e 1',state:{af:'1',st:'y'},items:[
 {chip:'load_iris(as_frame=True)',lbl:'carregar o dataset',ctl:[{k:'af',t:'opts',l:'',o:[['1','as_frame=True'],['0','sem as_frame']]}],code:s=>`iris = load_iris(${s.af==='1'?'⟨as_frame=True⟩':''})\nX, y = iris.data, iris.target\nnomes = iris.target_names`,
  out:s=>s.af==='1'?pdT(['atributo','tipo','tamanho'],[['iris.data','DataFrame','150 × 4'],['iris.target','Series','150'],['iris.target_names','array','setosa, versicolor, virginica']],{hi:(r,c)=>c===0?`color:${COL.cy};font-weight:700`:''}):T(`array([[5.1, 3.5, 1.4, 0.2],\n       [4.9, 3. , 1.4, 0.2],\n       [4.7, 3.2, 1.3, 0.2],\n       ...\n       [5.9, 3. , 5.1, 1.8]])`)+cap('sem nomes de colunas: só números'),
  say:'Datasets clássicos já vêm no scikit-learn. <b>as_frame=True</b> devolve tabelas do pandas, com nomes de colunas, em vez de arrays.'},
 {chip:'X.head()',lbl:'as 4 medidas',code:'X.head()',out:()=>pdT(['sepal length (cm)','sepal width (cm)','petal length (cm)','petal width (cm)'],[[0,5.1,3.5,1.4,0.2],[1,4.9,3.0,1.4,0.2],[2,4.7,3.2,1.3,0.2],[3,4.6,3.1,1.5,0.2],[4,5.0,3.6,1.4,0.2]].map(r=>[r[0],...r.slice(1).map(v=>v.toFixed(1))])),say:'Quatro medidas em centímetros. Sem faltantes e sem texto: dados prontos para modelar.'},
 {chip:'y.value_counts()',lbl:'as classes',code:'print(y.value_counts())',out:()=>`<div class="orow">${pdS([[0,50],[1,50],[2,50]],{name:'target',foot:'Name: count, dtype: int64'})}<div class="col" style="gap:8px;font-size:21px;padding-top:26px">${SPN.map((n,i)=>`<div><b class="mono" style="color:${SPC[i]}">${i}</b> = ${n}</div>`).join('')}</div></div>`,say:'As espécies vêm como números: 0, 1 e 2. <b>nomes</b> (target_names) traduz de volta. São 50 de cada: classes balanceadas.'},
 {chip:"plt.scatter(…, c=y)",lbl:'pétalas por espécie',code:"plt.scatter(X['petal length (cm)'], X['petal width (cm)'],\n            c=y, cmap='viridis', alpha=.8)",out:()=>{const m=mapper(50,10,740,240,0.8,7.2,0,2.7);let h=ax(50,10,740,240)+IRIS.map(([l,w,c])=>`<circle cx="${m.X(l)}" cy="${m.Y(w)}" r="7" fill="${SPC[c]}" opacity=".8"/>`).join('');SPN.forEach((n,i)=>h+=`<circle cx="${80+i*150}" cy="282" r="7" fill="${SPC[i]}"/>`+tx(94+i*150,288,n,'font-size="15"'));return svgO(820,295,h)},say:'<b>c=y</b> pinta cada ponto pela classe; <b>cmap</b> escolhe a paleta de cores. A setosa se separa sozinha.',tip:'No notebook as cores são as do viridis (roxo, verde-água e amarelo).'},
 {chip:'train_test_split(…, stratify=y)',lbl:'separar com estratificação',ctl:[{k:'st',t:'opts',l:'stratify =',o:[['y','y'],['None','None']]}],code:s=>`X_tr, X_te, y_tr, y_te = train_test_split(\n    X, y, test_size=0.25, random_state=42, stratify=⟨${s.st}⟩)`,
  out:s=>{const R={y:[[38,37,37],[12,13,13]],None:[[35,39,38],[15,11,12]]}[s.st];let h='';['treino','teste'].forEach((t,k)=>{const y=k*120,tot=R[k][0]+R[k][1]+R[k][2];h+=tx(0,y+22,`${t} (${tot})`,'font-size="18" font-weight="700"');let x=0;R[k].forEach((n,c)=>{const w=n/tot*820;h+=`<rect x="${x}" y="${y+34}" width="${w-3}" height="56" rx="8" fill="${SPC[c]}" opacity=".8"/>`+tx(x+w/2,y+70,`${n} · ${(n/tot*100).toFixed(0)}%`,`text-anchor="middle" font-size="17" font-weight="700" fill="${COL.bg}"`);x+=w})});return svgO(820,220,h)},
  say:'<b>stratify=y</b> mantém a proporção de cada espécie no treino e no teste. Importante quando há poucos exemplos.',tip:s=>s.st==='None'?'Sem estratificar, o teste ficou com 15 setosas e só 11 versicolor.':'Teste com 12, 13 e 13: quase um terço de cada.'}]};

const KN={1:[1,.946],3:[.964,.946],5:[.982,.946],9:[.964,.955],15:[.973,.946],31:[.902,.866],61:[.866,.725]},TD={1:[.67,.652],2:[.964,.928],3:[.964,.938],4:[.991,.929],6:[1,.929],None:[1,.929]},RF={1:[.991,.919,.072],10:[1,.938,.053],50:[1,.946,.044],200:[1,.946,.034]};
const PRED5=[[[4.4,3.2,1.3,0.2],0,0,[1,0,0]],[[6.3,3.3,4.7,1.6],1,1,[0,.88,.12]],[[5.7,2.8,4.1,1.3],1,1,[0,1,0]],[[5.5,2.3,4.0,1.3],1,1,[.01,.99,.01]],[[4.4,3.0,1.3,0.2],0,0,[1,0,0]]];
const tnode=(x,y,w,lines,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${lines.length*17+14}" rx="8" fill="${c}" fill-opacity=".22" stroke="${c}" stroke-width="2"/>`+lines.map((l,i)=>tx(x+w/2,y+20+i*17,esc(l),`text-anchor="middle" font-size="13.5" font-family="JetBrains Mono,monospace"`)).join('');
CMD.clf={libs:['scikit-learn'],lab:'Lab 02 · etapas 2 e 3',state:{k:'5',d:'3',n:'200'},items:[
 {chip:'modelos = {…} · .items()',lbl:'avaliar os três de uma vez',code:"modelos = {\n    'KNN (K=5)': Pipeline([('padronizar', StandardScaler()),\n                           ('knn', KNeighborsClassifier(n_neighbors=5))]),\n    'Árvore': DecisionTreeClassifier(random_state=42),\n    'Random Forest': RandomForestClassifier(n_estimators=200, random_state=42),\n}\nfor nome, modelo in modelos.items():\n    acc = cross_val_score(modelo, X_tr, y_tr, cv=5, scoring='accuracy')\n    print(f'{nome:<14} {acc.mean():.3f} ± {acc.std():.3f}')",
  out:()=>T('KNN (K=5)      0.946 ± 0.034\nÁrvore         0.929 ± 0.044\nRandom Forest  0.946 ± 0.034','font-size:24px;font-weight:700')+cap('acurácia média ± desvio dos 5 folds, só no treino · valores reais do Lab 02'),
  say:'Os três modelos têm a mesma interface, então um único <b>for</b> avalia todos. KNN e floresta empatam; a árvore sozinha fica um pouco atrás.'},
 {chip:'KNeighborsClassifier(n_neighbors=…)',lbl:'KNN',ctl:[{k:'k',t:'opts',l:'K =',o:Object.keys(KN).map(k=>[k,k])}],code:s=>`knn = Pipeline([('padronizar', StandardScaler()),\n                ('knn', KNeighborsClassifier(n_neighbors=⟨${s.k}⟩))])\ncross_val_score(knn, X_tr, y_tr, cv=5).mean()`,
  out:s=>{const ks=Object.keys(KN),i=ks.indexOf(s.k);return `<div class="row" style="gap:26px;align-items:baseline">${T(KN[s.k][1].toFixed(3),`font-size:40px;font-weight:700;color:${COL.pk}`)}<span class="mu" style="font-size:18px">validação cruzada · treino: ${KN[s.k][0].toFixed(3)}</span></div>`+svgO(820,250,lineCmp(ks,ks.map(k=>KN[k][0]),ks.map(k=>KN[k][1]),i,820,250,'K'))},
  say:'O KNN usa distâncias, por isso vai num <b>Pipeline</b> com padronização. <b>n_neighbors</b> é o K: com K = 1 o treino dá 100%, mas isso é decorar.',tip:"metric='manhattan' troca a distância (no Iris, com K = 5, dá 0,946 nas duas)."},
 {chip:'DecisionTreeClassifier(max_depth=…)',lbl:'árvore',ctl:[{k:'d',t:'opts',l:'max_depth =',o:Object.keys(TD).map(k=>[k,k])}],code:s=>`arvore = DecisionTreeClassifier(max_depth=⟨${s.d}⟩, random_state=42)\ncross_val_score(arvore, X_tr, y_tr, cv=5).mean()`,
  out:s=>{const ks=['1','2','3','4','6','None'],i=ks.indexOf(s.d);return `<div class="row" style="gap:26px;align-items:baseline">${T(TD[s.d][1].toFixed(3),`font-size:40px;font-weight:700;color:${COL.pk}`)}<span class="mu" style="font-size:18px">validação cruzada · treino: ${TD[s.d][0].toFixed(3)}</span></div>`+svgO(820,250,lineCmp(ks,ks.map(k=>TD[k][0]),ks.map(k=>TD[k][1]),i,820,250,'max_depth'))},
  say:'<b>max_depth</b> limita quantas perguntas seguidas a árvore pode fazer. <b>None</b> = sem limite: acerta 100% do treino. <b>random_state</b> fixa os desempates.'},
 {chip:'RandomForestClassifier(n_estimators=…)',lbl:'floresta',ctl:[{k:'n',t:'opts',l:'n_estimators =',o:Object.keys(RF).map(k=>[k,k])}],code:s=>`rf = RandomForestClassifier(n_estimators=⟨${s.n}⟩, random_state=42)\nacc = cross_val_score(rf, X_tr, y_tr, cv=5)\nacc.mean(), acc.std()`,
  out:s=>{const ks=Object.keys(RF),i=ks.indexOf(s.n),m=mapper(80,10,700,200,-.5,3.5,.8,1.02);let h=ax(80,10,700,200);[.8,.9,1].forEach(v=>h+=tx(72,m.Y(v)+5,v.toFixed(1),`text-anchor="end" font-size="13" fill="${COL.dim}"`));ks.forEach((k,j)=>{const [_,mu,sd]=RF[k],on=j===i;h+=`<line x1="${m.X(j)}" y1="${m.Y(Math.min(1.02,mu+sd))}" x2="${m.X(j)}" y2="${m.Y(mu-sd)}" stroke="${COL.pk}" stroke-width="${on?4:2}" opacity="${on?1:.5}"/><circle cx="${m.X(j)}" cy="${m.Y(mu)}" r="${on?10:6}" fill="${COL.pk}" opacity="${on?1:.5}"/>`+tx(m.X(j),240,k+(j?'':' árvore'),`text-anchor="middle" font-size="15" font-family="JetBrains Mono,monospace" fill="${on?COL.tx:COL.mu}"`)});
   return T(`(${RF[s.n][1].toFixed(3)}, ${RF[s.n][2].toFixed(3)})`,`font-size:34px;font-weight:700;color:${COL.pk}`)+svgO(820,250,h)+cap('média ± desvio dos 5 folds')},
  say:'<b>n_estimators</b> = quantas árvores votam. Mais árvores deixam o voto mais estável: o desvio entre os folds (as barrinhas) diminui.'},]};

CMD.cmp={libs:['scikit-learn','matplotlib'],lab:'Lab 02 · etapas 3 e 4',state:{xs:'log',pp:'p'},items:[
 {chip:'.fit(…).score(…)',lbl:'treino × validação',code:"def treino_vs_cv(modelo):\n    acc_tr = modelo.fit(X_tr, y_tr).score(X_tr, y_tr)\n    acc_cv = cross_val_score(modelo, X_tr, y_tr, cv=5).mean()\n    return acc_tr, acc_cv",
  out:()=>pdT(['treino (score)','validação cruzada','diferença'],Object.keys(KN).map(k=>['K = '+k,KN[k][0].toFixed(3),KN[k][1].toFixed(3),(KN[k][0]-KN[k][1]).toFixed(3)]),{hi:(ri,ci,v)=>ci===2&&+v>.03?HI('am'):''})+cap('KNN com padronização · valores reais do Lab 02'),
  say:'<b>score</b> compara as previsões com as respostas e devolve a acurácia. No treino, mede memória; a validação cruzada mede o que vale para dados novos.'},
 {chip:'plt.subplots(1, 2)',lbl:'dois gráficos lado a lado',ctl:[{k:'xs',t:'opts',l:'',o:[['log',"set_xscale('log')"],['lin','escala linear']]}],
  code:s=>`fig, ax = plt.subplots(1, 2, figsize=(12, 4))\nax[0].plot(ks, treino, 'o-', label='treino')\nax[0].plot(ks, cv, 'o-', label='validação cruzada')\n${s.xs==='log'?"⟨ax[0].set_xscale('log')⟩; ":''}ax[0].set_xlabel('K'); ax[0].set_title('KNN'); ax[0].legend()\nax[1].plot(…)   # o mesmo para a árvore, em ax[1]\nplt.show()`,
  out:s=>{const panel=(x0,title,xl,xs,tr,cv,X)=>{const m=mapper(x0+40,30,330,180,0,1,.6,1.02);let h=`<rect x="${x0}" y="0" width="400" height="270" rx="10" fill="${COL.bg}" opacity=".5"/>`+ax(x0+40,30,330,180);
     [.6,.8,1].forEach(v=>h+=tx(x0+34,m.Y(v)+5,v.toFixed(1),`text-anchor="end" font-size="12" fill="${COL.dim}"`));
     const pts=a=>a.map((v,i)=>[m.X(X[i]),m.Y(v)]),ln=(a,c)=>`<path d="${pts(a).map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join('')}" fill="none" stroke="${c}" stroke-width="2.5"/>`+pts(a).map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="${c}"/>`).join('');
     h+=ln(tr,COL.cy)+ln(cv,COL.am)+xs.map((l,i)=>tx(m.X(X[i]),226,l,`text-anchor="middle" font-size="12" fill="${COL.mu}"`)).join('');
     h+=tx(x0+205,20,title,`text-anchor="middle" font-size="16" font-weight="700"`)+tx(x0+205,250,xl,`text-anchor="middle" font-size="14"`);
     h+=`<rect x="${x0+230}" y="150" width="140" height="48" rx="6" fill="${COL.bg}" stroke="${COL.ln}"/><line x1="${x0+238}" y1="164" x2="${x0+256}" y2="164" stroke="${COL.cy}" stroke-width="3"/>`+tx(x0+262,168,'treino','font-size="12"')+`<line x1="${x0+238}" y1="184" x2="${x0+256}" y2="184" stroke="${COL.am}" stroke-width="3"/>`+tx(x0+262,188,'validação cruzada','font-size="12"');return h};
   const ks=Object.keys(KN),kv=ks.map(Number),lg=s.xs==='log',Xk=kv.map(k=>lg?Math.log10(k)/Math.log10(61):k/61),td=['1','2','3','4','6','None'];
   let g=panel(0,'KNN','K',ks,ks.map(k=>KN[k][0]),ks.map(k=>KN[k][1]),Xk)+panel(440,'Árvore','profundidade máxima',td,td.map(k=>TD[k][0]),td.map(k=>TD[k][1]),td.map((_,i)=>i/5));
   const tag=(x,y,t)=>tx(x,y,t,`font-size="11.5" font-family="JetBrains Mono,monospace" fill="${COL.vi}"`);
   g+=tag(4,14,'ax[0]')+tag(444,14,'ax[1]')+tag(250,20,'set_title()')+tag(250,264,'set_xlabel()')+tag(232,144,'legend()');if(lg)g+=tag(46,242,"set_xscale('log')");
   return svgO(840,272,g)+cap(lg?'escala log: K = 1, 3, 5 e 9 ficam visíveis':'escala linear: K = 1, 3, 5 e 9 ficam espremidos à esquerda')},
  say:'<b>subplots(1, 2)</b> cria 1 linha com 2 gráficos; <b>ax[0]</b> e <b>ax[1]</b> são cada um, e cada um tem seus próprios métodos de título, eixo e legenda.'},

 {chip:'plot_tree(arvore, …)',lbl:'desenhar a árvore',code:"arvore = DecisionTreeClassifier(max_depth=2, random_state=42).fit(X_tr, y_tr)\nplot_tree(arvore, feature_names=X.columns, class_names=nomes, filled=True)",
  out:()=>svgO(840,316,tnode(300,0,240,['petal length (cm) <= 2.45','gini = 0.667','samples = 112','value = [38, 37, 37]','class = setosa'],COL.dim)+`<path d="M360 99 L130 140 M480 99 L600 140" stroke="${COL.mu}" stroke-width="2"/>`+tx(220,120,'True',`font-size="14" fill="${COL.mu}"`)+tx(560,120,'False',`font-size="14" fill="${COL.mu}"`)+tnode(20,140,220,['gini = 0.0','samples = 38','value = [38, 0, 0]','class = setosa'],COL.pk)+tnode(480,140,240,['petal length (cm) <= 4.85','gini = 0.5','samples = 74','value = [0, 37, 37]','class = versicolor'],COL.dim)+`<path d="M560 239 L440 262 M660 239 L730 262" stroke="${COL.mu}" stroke-width="2"/>`+tnode(340,262,200,['gini = 0.056 · n = 35','value = [0, 34, 1]'],COL.gr)+tnode(620,262,210,['gini = 0.142 · n = 39','value = [0, 3, 36]'],COL.vi)),
  say:'Cada caixa mostra a <b>pergunta</b>, o <b>gini</b>, quantas amostras chegam ali e a contagem por classe (<b>value</b>). <b>filled=True</b> pinta pela classe da maioria.',tip:'Real do Lab 02: duas perguntas, ambas sobre o comprimento da pétala.'},

 {chip:'.predict() · .predict_proba()',lbl:'usar o modelo treinado',ctl:[{k:'pp',t:'opts',l:'',o:[['p','predict'],['pr','predict_proba']]}],code:s=>`escolhido = modelos['Random Forest'].fit(X_tr, y_tr)\nescolhido.${s.pp==='p'?'⟨predict⟩':'⟨predict_proba⟩'}(X_te[:5])`,
  out:s=>pdT(['sépala c.','sépala l.','pétala c.','pétala l.','real',...(s.pp==='p'?['previsto']:['setosa','versic.','virgin.'])],PRED5.map((r,i)=>[i,...r[0].map(v=>v.toFixed(1)),r[1],...(s.pp==='p'?[r[2]]:r[3].map(v=>v.toFixed(2)))]),{hi:(ri,ci,v,r)=>ci===4?`color:${COL.mu}`:ci>=5?(s.pp==='p'?HI('pk'):+v>=.5?HI('pk'):''):''})+cap(s.pp==='p'?'array([0, 1, 1, 1, 0])':'cada linha soma 1 · a 2ª flor: 88% versicolor, 12% virginica'),
  say:s=>s.pp==='p'?'<b>predict</b> devolve a classe de cada flor. <b>.score(X, y)</b> compara com o real e devolve a acurácia.':'<b>predict_proba</b> devolve a probabilidade de cada classe. O predict escolhe a maior.'},
]};

const CM=[[12,0,0],[0,12,1],[0,3,10]],THR={'0.05':[53,23,0,67],'0.10':[53,12,0,78],'0.15':[52,8,1,82],'0.20':[52,7,1,83],'0.25':[50,6,3,84],'0.30':[50,2,3,88],'0.35':[50,1,3,89],'0.40':[50,1,3,89],'0.45':[49,0,4,90],'0.50':[47,0,6,90],'0.55':[46,0,7,90],'0.60':[45,0,8,90],'0.65':[45,0,8,90],'0.70':[44,0,9,90],'0.75':[43,0,10,90],'0.80':[39,0,14,90],'0.85':[38,0,15,90],'0.90':[36,0,17,90],'0.95':[33,0,20,90]};
const PB=[.97,.01,.93,0,.32,0],YB=[1,0,1,0,0,0];
CMD.aval={libs:['scikit-learn'],lab:'Lab 02 · etapas 4 e 5.1',state:{t:.5},items:[
 {chip:'ConfusionMatrixDisplay',lbl:'matriz de confusão',code:"ConfusionMatrixDisplay.from_predictions(y_te, pred,\n                                        display_labels=nomes)\nplt.show()",
  out:()=>{let h=tx(470,16,'Predicted label',`text-anchor="middle" font-size="15" fill="${COL.mu}"`)+tx(20,170,'True label',`font-size="15" fill="${COL.mu}" transform="rotate(-90 20 170)" text-anchor="middle"`);CM.forEach((r,i)=>{h+=tx(150,78+i*82,SPN[i],`text-anchor="end" font-size="16"`);r.forEach((v,j)=>{const x=170+j*200,y=30+i*82;h+=`<rect x="${x}" y="${y}" width="194" height="76" rx="8" fill="${i===j?COL.gr:v?COL.rd:COL.p2}" fill-opacity="${v?.25+v/16:1}"/>`+tx(x+97,y+50,v,`text-anchor="middle" font-size="30" font-weight="700"`)})});SPN.forEach((n,j)=>h+=tx(267+j*200,296,n,`text-anchor="middle" font-size="16"`));return svgO(800,305,h)},
  say:'Linhas = classe <b>real</b>; colunas = classe <b>prevista</b>. A diagonal são os acertos. <b>from_predictions</b> monta tudo a partir de y real e y previsto.',tip:'Real do Lab 02: 3 virginicas foram confundidas com versicolor.'},
 {chip:'classification_report()',lbl:'métricas por classe',code:'print(classification_report(y_te, pred, target_names=nomes))',out:()=>T(`              precision    recall  f1-score   support

      setosa       1.00      1.00      1.00        12
  versicolor       0.80      0.92      0.86        13
   virginica       <b class="gr">0.91</b>      <b class="rd">0.77</b>      0.83        13

    accuracy                           <b>0.89</b>        38
   macro avg       0.90      0.90      0.90        38
weighted avg       0.90      0.89      0.89        38`),
  say:'Precision, recall e F1 de <b>cada classe</b>. <b>support</b> = quantos exemplos reais há no teste. <b>accuracy</b> = acertos / total.',tip:'Virginica: quando o modelo diz virginica, acerta 91%; mas só encontra 77% delas.'},
 {chip:'load_breast_cancer()',lbl:'o problema médico',code:"bc = load_breast_cancer()\nXb, yb = bc.data, (bc.target == 0).astype(int)   # 1 = maligno\nXb_tr, Xb_te, yb_tr, yb_te = train_test_split(\n    Xb, yb, test_size=0.25, random_state=42, stratify=yb)\nrf = RandomForestClassifier(n_estimators=200, random_state=42).fit(Xb_tr, yb_tr)",
  out:()=>`<div class="orow">${pdT(['bc.target','== 0','.astype(int)'],[[0,0,'True',1],[1,1,'False',0],[2,0,'True',1]],{cap:'como o rótulo é invertido (exemplo)',hi:(ri,ci)=>ci===2?HI('pk'):''})}<div class="col" style="gap:8px;font-size:19px;padding-top:26px"><div><b>569</b> exames × <b>30</b> medidas</div><div><b>212</b> malignos · <b>357</b> benignos</div><div>teste: <b>143</b> pacientes, <b>53</b> malignos</div></div></div>`+cap('no dataset original, 0 = maligno; invertemos para que maligno seja a classe positiva (1)'),
  say:'Agora um problema em que errar custa caro. A troca de rótulo faz “positivo” significar “tumor maligno”, a classe que queremos encontrar.'},
 {chip:'predict_proba(X)[:, 1]',lbl:'probabilidade do positivo',code:"proba = rf.predict_proba(Xb_te)[:, 1]   # 1 = maligno\nproba[:6]",
  out:()=>`<div class="orow">${T(`array([[${PB.map(p=>`${(1-p).toFixed(2)}, <b style="${HI('pk')}">${p.toFixed(2)}</b>`).join('],\n       [')}]])`)}<div style="font-size:42px;padding-top:70px" class="mu">→</div>${T(`array([${PB.map(p=>p.toFixed(2)).join(', ')}])`,`color:${COL.pk};font-weight:700;padding-top:84px`)}</div>`+cap('dataset de câncer de mama · coluna 0 = benigno, coluna 1 = maligno'),
  say:'predict_proba devolve uma coluna por classe. <b>[:, 1]</b> = “todas as linhas, coluna 1”: a probabilidade de ser maligno.'},
 {chip:'(proba >= limiar).astype(int)',lbl:'escolher o limiar',ctl:[{k:'t',t:'range',l:'limiar =',min:.05,max:.95,step:.05}],code:s=>`prev = (proba >= ⟨${(+s.t).toFixed(2)}⟩).astype(int)\nprecision_score(yb_te, prev), recall_score(yb_te, prev)`,
  out:s=>{const k=(+s.t).toFixed(2),[tp,fp,fn,tn]=THR[k],P=tp/(tp+fp),R=tp/(tp+fn);const card=(l,v,c,sub)=>`<div class="card" style="flex:1;padding:14px 18px"><div class="lbl" style="font-size:13px;color:${COL[c]}">${l}</div><div class="big mono" style="font-size:36px;color:${COL[c]};margin-top:4px">${v}</div><div class="mu" style="font-size:14px">${sub}</div></div>`;
   return pdT(['proba','proba >= '+k,'prev','real'],PB.map((p,i)=>[i,p.toFixed(2),String(p>=+k?'True':'False'),p>=+k?1:0,YB[i]]),{hi:(ri,ci,v,r)=>ci===2?(r[3]===r[4]?HI('gr'):HI('rd')):''})+`<div class="row" style="gap:12px;margin-top:12px">${card('VP · FN',tp+' · '+fn,'pk','malignos achados · perdidos')+card('FP',fp,'cy','alarmes falsos')+card('precision',br(P.toFixed(2)),'gr','dos previstos, quantos eram')+card('recall',br(R.toFixed(2)),'am','dos malignos, quantos achei')}</div>`},
  say:'A comparação gera True/False; <b>astype(int)</b> transforma em 1/0. Baixar o limiar aumenta o recall e derruba a precision.',tip:'Valores reais do desafio 5.1 (143 pacientes de teste, 53 malignos).'}]};

/* =====================================================================
   DESCRIÇÕES ESCRITAS DE CADA COMANDO
   f = o que faz · p = parâmetros [nome, explicação] · r = o que devolve
   «…» marca código. ferramentas/auditar_comandos.py confere que todo nome
   usado nos notebooks aparece como «código» dentro desta seção.
   ===================================================================== */
/*DOC:INICIO*/
const DOC={
lib00:{
 'numpy as np':{f:"«import numpy as np» carrega o NumPy e o apelida de «np». Daí em diante, tudo dele é acessado com «np.» na frente: «np.nan» (o valor vazio), «np.sqrt()» (raiz quadrada), «np.array()» (cria um array)."},
 'pandas as pd':{f:"«import pandas as pd» carrega o pandas como «pd». Ele traz o «DataFrame» (tabela com linhas e colunas nomeadas) e a «Series» (uma coluna). Quase toda a limpeza do Lab 00 usa métodos dele, como «df.head()» e «df.dropna()»."},
 'matplotlib.pyplot as plt':{f:"«import matplotlib.pyplot as plt» carrega a parte da Matplotlib com funções prontas de gráfico: «plt.scatter()», «plt.boxplot()», «plt.title()», «plt.xlabel()», «plt.ylabel()», «plt.tight_layout()» e «plt.show()», que exibe o gráfico embaixo da célula."},
 'sklearn.model_selection':{f:"«from sklearn.model_selection import train_test_split» traz do scikit-learn só a função que separa treino e teste. O formato «from módulo import Peça» permite escrever «train_test_split(…)» direto, sem prefixo."},
 'compose · pipeline':{f:"«ColumnTransformer» (do módulo «sklearn.compose») aplica um preparo diferente a cada grupo de colunas. «Pipeline» (de «sklearn.pipeline») encadeia etapas que rodam sempre na mesma ordem. Juntos, garantem que todo «fit» use só o treino."},
 'impute · preprocessing':{f:"«SimpleImputer» preenche valores faltantes; «StandardScaler» padroniza (média 0, desvio 1); «OneHotEncoder» cria uma coluna 0/1 por categoria. Os três seguem o mesmo par de métodos: «fit» (aprender) e «transform» (aplicar)."},
 'ajustes de exibição':{f:"«pd.set_option('display.max_columns', 20)» faz o pandas mostrar até 20 colunas sem esconder nenhuma com “…”. «plt.rcParams['figure.figsize'] = (8, 4)» define o tamanho padrão dos gráficos em polegadas (largura, altura). O «print» final só confirma que a célula rodou."}},
insp:{
 "pd.read_csv() · head()":{f:"«pd.read_csv()» lê um arquivo de texto com valores separados por vírgula e monta um «DataFrame». «df.head(n)» mostra só as n primeiras linhas, para espiar a tabela sem imprimir tudo.",p:[["'alunos.csv'","caminho do arquivo na sessão do Colab"],["n","quantas linhas; sem nada, 5"]],r:"um DataFrame."},
 'df.shape':{f:"Atributo que guarda o tamanho da tabela. Por ser um valor guardado e não uma ação, «shape» vem sem parênteses.",r:"uma tupla «(linhas, colunas)»; «df.shape[0]» é só o número de linhas."},
 'df.info()':{f:"«df.info()» imprime um resumo: quantas linhas há, o nome de cada coluna, quantos valores não nulos ela tem (Non-Null Count) e o tipo (Dtype): «float64» = número com casas decimais, «int64» = inteiro, «object» = texto.",r:"nada; só imprime. Se Non-Null for menor que o total de linhas, a coluna tem faltantes."},
 'df.describe()':{f:"«df.describe()» calcula estatísticas de cada coluna numérica: «count» (valores não nulos), «mean» (média), «std» (desvio-padrão), «min», os quartis «25%», «50%» (mediana) e «75%», e «max». É o jeito mais rápido de achar valores impossíveis.",r:"um DataFrame com uma linha por estatística."},
 'df.isna().sum()':{f:"«df.isna()» testa cada célula e marca «True» onde falta valor (NaN). Em seguida, «.sum()» soma cada coluna; como «True» vale 1 e «False» vale 0, o resultado é quantos valores faltam em cada coluna.",r:"«isna()»: uma tabela de True/False do mesmo tamanho; «.sum()»: uma Series com um número por coluna."},
 "df['turno'].value_counts()":{f:"«df['turno']» seleciona uma coluna, que é uma «Series». «value_counts()» conta quantas vezes cada valor aparece e ordena do mais frequente para o menos frequente.",p:[["normalize=True","mostra proporções (de 0 a 1) em vez de contagens"]],r:"uma Series: os valores no índice e as contagens nos dados."}},
limp:{
 'df.duplicated()':{f:"«df.duplicated()» compara cada linha com as anteriores e marca «True» quando ela repete, coluna por coluna, uma linha que já apareceu. A primeira ocorrência fica «False».",r:"uma Series de True/False; com «.sum()», o número de linhas duplicadas."},
 'df.drop_duplicates()':{f:"«df.drop_duplicates()» devolve a tabela sem as linhas repetidas, mantendo a primeira de cada. O índice original é preservado: os números das linhas removidas simplesmente somem.",r:"um novo DataFrame. O original não muda; por isso se escreve «df = df.drop_duplicates()»."},
 ".str.strip().str.lower()":{f:"«.str» dá acesso aos métodos de texto, aplicados a cada valor da coluna. «strip()» tira espaços do começo e do fim; «lower()» deixa tudo minúsculo. Depois, «replace({'manha': 'manhã'})» troca valores inteiros usando um dicionário {antigo: novo}.",r:"uma nova Series; para salvar, atribua de volta com «df['turno'] = …»."},
 'plt.boxplot()':{f:"«plt.boxplot()» desenha o diagrama de caixa: a caixa vai do 1º ao 3º quartil, a linha laranja é a mediana, as hastes vão até 1,5 × a altura da caixa e o que passa disso aparece como círculo. «.dropna()» tira os NaN antes, porque o boxplot não os aceita. «plt.title()» escreve o título e «plt.show()» exibe."},
 "df.loc[cond, col] = np.nan":{f:"«df.loc[linhas, coluna]» seleciona células pelo rótulo. A condição «df['horas_estudo'] > 24» gera True/False para cada linha e escolhe as linhas True; depois da vírgula vem a coluna. Com «= np.nan», essas células passam a valer vazio.",r:"nada: a mudança é feita no próprio df."},
 "df.dropna(subset=[…])":{f:"«df.dropna()» remove as linhas que têm pelo menos um valor faltando.",p:[["subset","lista de colunas que devem ser olhadas; um NaN em outra coluna não remove a linha"]],r:"um novo DataFrame (salve com «df = …»)."}},
expl:{
 'df.hist(bins=…)':{f:"«df.hist()» desenha um histograma para cada coluna numérica, em uma grade. «plt.tight_layout()» ajusta os espaços para os títulos não se sobreporem.",p:[["bins","em quantas faixas dividir os valores de cada coluna"],["figsize","tamanho da figura inteira, (largura, altura) em polegadas"]]},
 '.mean() × .median()':{f:"«df[col].mean()» calcula a média da coluna; «df[col].median()», a mediana (o valor do meio, com os dados ordenados). Ambos ignoram os NaN. O «for» repete para as duas colunas e o «print(f'…')» monta o texto: o que está entre chaves é calculado, e «:.1f» mostra 1 casa decimal.",r:"um número cada."},
 'plt.scatter(x, y, alpha=…)':{f:"«plt.scatter(x, y)» desenha um ponto por linha da tabela, x no eixo horizontal e y no vertical. «plt.xlabel()» e «plt.ylabel()» dão nome aos eixos; «plt.show()» exibe.",p:[["alpha","transparência dos pontos, de 0 (invisível) a 1 (opaco)"]]},
 'df.corr(numeric_only=True)':{f:"«df.corr()» calcula a correlação de Pearson entre cada par de colunas, de −1 a 1. Em seguida, «.round(2)» arredonda para 2 casas decimais.",p:[["numeric_only=True","usa só as colunas numéricas; texto daria erro"]],r:"um DataFrame quadrado e simétrico, com 1 na diagonal."},
 "groupby(…)['nota_final'].mean()":{f:"«df.groupby('turno')» separa as linhas em grupos, um para cada valor de turno. «['nota_final']» escolhe a coluna e «.mean()» calcula a média em cada grupo. Com uma lista, como «['turno', 'monitoria']», os grupos são as combinações.",r:"uma Series com os grupos no índice."},
 ".agg(['min', 'max'])":{f:"«.agg()» aplica várias funções de uma vez a cada grupo, produzindo uma coluna por função.",p:[["['min', 'max']","lista de funções pelo nome: «'mean'», «'median'», «'count'»…"]],r:"um DataFrame: grupos nas linhas, funções nas colunas."}},
prep:{
 'pd.get_dummies()':{f:"«pd.get_dummies()» cria uma coluna 0/1 para cada categoria (one-hot). A alternativa, «.map({…})», troca cada valor pelo número do dicionário (label encoding).",p:[["prefix","texto colocado antes do nome de cada coluna nova, como «turno_manhã»"],["dtype=int","mostra 0/1 em vez de True/False"]],r:"um DataFrame («get_dummies») ou uma Series («map»)."},
 "OneHotEncoder(handle_unknown=…)":{f:"A versão do scikit-learn do one-hot. O «fit» aprende as categorias do treino (ficam em «enc.categories_») e o «transform» cria as colunas. Como lembra as categorias, gera sempre as mesmas colunas no treino e no teste.",p:[["handle_unknown","o que fazer com uma categoria nunca vista: «'error'» (o padrão) para o código; «'ignore'» gera uma linha de zeros"]],r:"uma matriz esparsa; «.toarray()» a mostra como array comum."},
 "SimpleImputer(strategy=…)":{f:"No «fit», calcula um valor por coluna usando a estratégia escolhida e o guarda em «imp.statistics_». No «transform», coloca esse valor nos NaN. «fit_transform» faz os dois de uma vez.",p:[["strategy","«'mean'» (média), «'median'» (mediana) ou «'most_frequent'» (valor mais comum)"]],r:"um array 2D, já sem nomes de colunas."},
 'StandardScaler()':{f:"No «fit», aprende a média («mean_») e o desvio («scale_») de cada coluna. No «transform», aplica z = (x − média) / desvio. Depois disso, todas as colunas ficam com média 0 e desvio 1.",r:"um array 2D com os valores padronizados."},
 'pd.concat([…], axis=1)':{f:"«pd.concat([a, b, c], axis=1)» cola tabelas e colunas lado a lado; com «axis=0», empilharia uma embaixo da outra. «.rename('label')» dá um novo nome a uma Series, que vira o nome da coluna.",r:"um DataFrame."}},
pipe:{
 'df.drop(columns=[…])':{f:"«df.drop(columns=[…])» devolve a tabela sem as colunas listadas: aqui, sem o alvo e sem a coluna que vaza a resposta. «df[alvo]» pega só a coluna do alvo.",r:"X: um DataFrame com as features; y: uma Series com o alvo."},
 'train_test_split()':{f:"«train_test_split()» embaralha as linhas e separa uma fração para o teste. Recebe X e y juntos para que cada linha continue com o seu alvo.",p:[["test_size","fração (de 0 a 1) que vai para o teste"],["random_state","semente do sorteio: o mesmo número dá sempre a mesma divisão"],["stratify","(Lab 02) mantém a proporção das classes nos dois lados"]],r:"4 objetos, sempre nesta ordem: «X_tr, X_te, y_tr, y_te»."},
 'fit × transform':{f:"Todo preparo do scikit-learn tem três métodos. «fit» aprende com os dados (média, desvio, categorias…) e guarda o que aprendeu em atributos terminados em _. «transform» aplica o que foi aprendido. «fit_transform» faz os dois de uma vez, e só deve ser usado no treino."},
 'ColumnTransformer([…])':{f:"Recebe uma lista de tuplas (nome, transformador, colunas) e aplica cada transformador só às suas colunas, juntando os resultados lado a lado. «get_feature_names_out()» devolve os nomes das colunas de saída, com o prefixo do grupo («num__», «cat__»).",r:"um array 2D com todas as colunas transformadas."},
 'Pipeline([…])':{f:"Recebe uma lista de etapas (nome, objeto). «fit» chama «fit_transform» em cada etapa, em ordem, e «fit» na última. «predict» chama «transform» em cada etapa e «predict» na última. «named_steps['nome']» acessa uma etapa pelo nome.",r:"«fit» devolve o próprio Pipeline; «predict», um array de previsões."}},
conf:{
 'Z_tr[:, :4].mean(axis=0)':{f:"«Z_tr» é um array 2D. «[:, :4]» fatia: todas as linhas («:») e as colunas de 0 a 3 («:4»), que são as numéricas. «.mean(axis=0)» tira a média de cada coluna, percorrendo as linhas; «.std(axis=0)», o desvio. «pd.DataFrame({…}, index=num)» monta uma tabela a partir de um dicionário {nome da coluna: valores}, com os nomes das features no «index».",r:"um array com um valor por coluna."},
 "named_transformers_[…].mean_":{f:"Depois do fit, «preparo.named_transformers_['num']» acessa o transformador do grupo 'num', que é o Pipeline imputar → padronizar. «.named_steps['padronizar']» entra no StandardScaler e «.mean_» lê a média que ele aprendeu.",r:"um array com a média de cada coluna numérica, calculada só com o treino."},
 'fillna(X.median())':{f:"«X[num].fillna(X[num].median())» preenche os NaN de cada coluna com a mediana daquela coluna, calculada com o dataset inteiro. Aqui o erro é proposital: o scaler é ajustado com treino e teste juntos, para comparar as médias.",r:"um DataFrame sem NaN."},
 "df.to_csv(…, index=False)":{f:"«df.to_csv()» grava a tabela num arquivo CSV na pasta da sessão do Colab.",p:[["'alunos_limpo.csv'","o nome do arquivo"],["index=False","não grava o índice como uma coluna extra, sem nome"]],r:"nada; o arquivo aparece no painel de arquivos do Colab."},
 'iloc · np.sqrt · idxmin()':{f:"«A.iloc[0]» pega a primeira linha pela posição («iloc» = posição; «loc» = rótulo). «(outros - voce) ** 2» subtrai a pessoa de referência de todas as linhas e eleva ao quadrado; «.sum(axis=1)» soma ao longo das colunas, uma soma por linha; «np.sqrt()» tira a raiz: é a distância euclidiana. «.idxmin()» devolve o rótulo da menor distância e «.to_dict()» transforma a linha num dicionário {coluna: valor}. «A.mean()» e «A.std()» padronizam.",r:"um dicionário com os dados da pessoa mais parecida."}},
lib01:{
 'numpy · pandas · plt':{f:"As mesmas três importações do Lab 00. No Lab 01 entram «np.linspace()», «np.array()», «np.clip()», «plt.plot()», «plt.yscale()» e «plt.legend()»."},
 'model_selection':{f:"Importa duas funções do mesmo módulo, separadas por vírgula: «train_test_split» e «cross_val_score»."},
 'compose · pipeline · impute':{f:"O mesmo preparo do Lab 00 («ColumnTransformer», «Pipeline», «SimpleImputer»), usado na regressão múltipla."},
 'preprocessing':{f:"Além de «StandardScaler» e «OneHotEncoder», importa «PolynomialFeatures», que gera as potências das features."},
 'linear_model':{f:"Os dois modelos de regressão do lab: «LinearRegression» (mínimos quadrados) e «Ridge» (regressão linear com regularização L2)."},
 'metrics':{f:"As três funções de erro da regressão: «mean_absolute_error», «mean_squared_error» e «r2_score»."}},
np:{
 'w * x + b':{f:"Com arrays, as operações valem elemento a elemento: «w * x» multiplica cada x por w e «+ b» soma b a cada resultado. Isso se chama vetorização e dispensa o «for».",r:"um array do mesmo tamanho de x."},
 'erro = y - y_hat':{f:"Subtrai elemento a elemento: o 1º y menos o 1º ŷ, o 2º menos o 2º, e assim por diante.",r:"um array de resíduos: positivo onde o modelo previu baixo, negativo onde previu alto."},
 '(erro ** 2).mean()':{f:"«erro ** 2» eleva cada elemento ao quadrado e «.mean()» tira a média de todos. É a MSE em uma linha.",r:"um número."},
 'x.reshape(-1, 1)':{f:"«reshape» muda o formato do array sem mudar os valores. «(-1, 1)» pede 1 coluna e “quantas linhas forem necessárias” (o −1). O scikit-learn exige X em 2D: linhas = exemplos, colunas = features.",r:"um array de formato (10, 1)."},
 'for alpha in […]: plt.plot(…)':{f:"Na função, «for _ in range(epocas)» repete o passo «epocas» vezes e «historico.append(…)» guarda cada MSE. Aqui o «for» testa 4 taxas; «_, _, h =» guarda só o histórico. «np.clip(h, None, 1e3)» corta acima de 1000; «plt.plot()» desenha cada curva, «label» a nomeia em «plt.legend()» e «plt.yscale('log')» põe o eixo y em escala log."}},
skl:{
 'LinearRegression()':{f:"«LinearRegression()» cria um modelo de regressão linear ainda sem parâmetros. Todo modelo do scikit-learn é criado assim, com os hiperparâmetros entre parênteses.",r:"o modelo vazio."},
 'reg.fit(X, y)':{f:"«fit(X, y)» ajusta o modelo: encontra o w e o b que minimizam a MSE pela fórmula dos mínimos quadrados. X precisa ser 2D (por isso o «reshape»); y pode ser 1D.",r:"o próprio modelo, já treinado; por isso dá para encadear «.fit(…).predict(…)»."},
 'reg.coef_, reg.intercept_':{f:"«coef_» guarda os pesos aprendidos, um por feature, num array; «intercept_» guarda o intercepto b. O _ no fim indica um atributo que só existe depois do «fit»."},
 'reg.predict() · zip()':{f:"«np.array([2, 6, 10])» cria um array a partir de uma lista. «reg.predict(X)» aplica a reta a cada linha de X. «zip(a, b)» anda pelas duas sequências juntas, um par por vez: (2, 2.53), (6, 4.06)… No texto, «{h:>2}» alinha o número à direita em 2 espaços e «{nota:.2f}» mostra 2 casas.",r:"«predict»: um array com uma previsão por linha."},
 'mean_absolute_error(y, ŷ)':{f:"As funções de métrica comparam o real com o previsto. «mean_absolute_error»: média de |y − ŷ|. «mean_squared_error»: média de (y − ŷ)². «r2_score»: 1 − (erro do modelo ÷ erro de prever sempre a média).",p:[["y_te","os valores reais, sempre primeiro"],["pred","os valores previstos"]],r:"um número."}},
cv:{
 'cross_val_score(…, cv=5)':{f:"«cross_val_score()» divide os dados em «cv» partes, treina em cv − 1 delas e avalia na que sobrou, repetindo até cada parte ser validação uma vez. Com um Pipeline, o preparo é refeito em cada rodada, só com a parte de treino.",p:[["cv","número de folds (partes)"],["scoring","a métrica: «'accuracy'», «'neg_mean_absolute_error'»…; erros vêm negativos porque o scikit-learn sempre maximiza o score"]],r:"um array com uma nota por fold; «.mean()» e «.std()» resumem."},
 'PolynomialFeatures(degree=…)':{f:"«PolynomialFeatures» cria colunas novas com as potências de cada feature (x, x², x³… até o grau pedido), mais uma coluna de 1s.",p:[["degree","o maior expoente"]],r:"um array 2D; para uma feature, com degree + 1 colunas."},
 'Ridge(alpha=…)':{f:"«Ridge» é a regressão linear com a penalidade λ·Σw² somada à perda. A função «poli(lam)» monta um Pipeline: polinômio de grau 10 → padronizar → modelo. «passos.append(…)» acrescenta a última etapa à lista, e «A if condição else B» escolhe «LinearRegression()» quando λ = 0 e «Ridge» nos outros casos.",p:[["alpha","a força da penalidade, o λ do slide. Não é a taxa de aprendizado!"]]},
 'datasets':{f:"«load_iris» e «load_breast_cancer» carregam datasets que já vêm com o scikit-learn, sem download."},
 'model_selection · pipeline':{f:"As mesmas peças dos labs anteriores: «train_test_split», «cross_val_score», «Pipeline» e «StandardScaler»."},
 'neighbors':{f:"«KNeighborsClassifier»: o classificador KNN, que decide pela votação dos vizinhos mais próximos."},
 'tree':{f:"«DecisionTreeClassifier» (a árvore de decisão) e «plot_tree» (desenha a árvore treinada)."},
 'ensemble':{f:"«RandomForestClassifier»: muitas árvores treinadas com sorteios diferentes, votando juntas. “Ensemble” significa combinar vários modelos."},
 'metrics':{f:"«ConfusionMatrixDisplay» (desenha a matriz de confusão), «classification_report» (métricas por classe), «precision_score» e «recall_score». Os parênteses permitem quebrar um import longo em duas linhas."}},
iris:{
 'load_iris(as_frame=True)':{f:"«load_iris()» carrega o Iris. O resultado tem vários campos: «iris.data» (as 4 medidas), «iris.target» (a espécie de cada flor, como 0, 1 ou 2) e «iris.target_names» (os nomes das espécies).",p:[["as_frame=True","devolve data como DataFrame e target como Series, com nomes de colunas"]]},
 'X.head()':{f:"«X.head()» mostra as 5 primeiras flores. «X.columns» guarda os nomes das colunas, usados depois no «plot_tree».",r:"um DataFrame com 5 linhas."},
 'y.value_counts()':{f:"«y.value_counts()» conta quantas flores há de cada classe. Depois do split, «.to_dict()» transforma a contagem num dicionário {classe: contagem}, mais compacto de imprimir.",r:"uma Series: classes no índice, contagens nos dados."},
 "plt.scatter(…, c=y)":{f:"«plt.scatter()» desenha uma flor por ponto: comprimento × largura da pétala.",p:[["c=y","pinta cada ponto conforme a classe"],["cmap","a paleta de cores, como «'viridis'»"],["alpha","transparência dos pontos"]]},
 'train_test_split(…, stratify=y)':{f:"A mesma separação de sempre, agora com estratificação.",p:[["stratify=y","mantém no treino e no teste a mesma proporção de cada classe de y"],["test_size=0.25","25% para teste: 38 flores"]],r:"«X_tr, X_te, y_tr, y_te»."}},
clf:{
 'modelos = {…} · .items()':{f:"Um dicionário {nome: modelo} guarda os três modelos. «modelos.items()» devolve os pares (nome, modelo), e o «for» desempacota cada par em duas variáveis. «{nome:<14}» alinha o nome à esquerda em 14 espaços para formar colunas.",r:"três linhas impressas, uma por modelo."},
 'KNeighborsClassifier(n_neighbors=…)':{f:"«KNeighborsClassifier» classifica pelos K vizinhos mais próximos. Vai num Pipeline com «StandardScaler» porque depende de distâncias.",p:[["n_neighbors","o K: quantos vizinhos votam"],["metric","a distância: «'euclidean'» (o padrão, linha reta) ou «'manhattan'» (soma dos deslocamentos em cada eixo)"]]},
 'DecisionTreeClassifier(max_depth=…)':{f:"«DecisionTreeClassifier» faz perguntas do tipo “feature ≤ limite?” e escolhe, em cada nó, a que mais reduz o Gini.",p:[["max_depth","máximo de perguntas em sequência; «None» = sem limite"],["random_state","fixa os desempates entre perguntas igualmente boas"]]},
 'RandomForestClassifier(n_estimators=…)':{f:"«RandomForestClassifier» treina várias árvores, cada uma com uma amostra sorteada das linhas e das features, e decide pela votação.",p:[["n_estimators","quantas árvores votam"],["random_state","fixa os sorteios"]]}},
cmp:{
 '.fit(…).score(…)':{f:"«modelo.fit(X_tr, y_tr)» treina e devolve o próprio modelo, então dá para emendar «.score(X, y)», que prevê X e compara com y. A função devolve as duas acurácias: a do treino e a da validação cruzada.",r:"«score»: a acurácia, de 0 a 1."},
 'plt.subplots(1, 2)':{f:"«fig, ax = plt.subplots(1, 2, figsize=(12, 4))» cria uma figura com 1 linha e 2 gráficos; «ax[0]» e «ax[1]» são cada um deles. Cada gráfico tem seus métodos: «ax[0].plot()» desenha, «ax[0].set_xscale('log')» usa escala log no eixo x, «set_xlabel()» nomeia o eixo, «set_title()» dá o título e «legend()» mostra a legenda."},
 'plot_tree(arvore, …)':{f:"«plt.figure(figsize=(10, 5))» abre uma figura grande e «plot_tree» desenha nela a árvore treinada.",p:[["feature_names","nomes das colunas, para as perguntas ficarem legíveis («X.columns»)"],["class_names","nomes das classes nas folhas («nomes»)"],["filled=True","pinta cada caixa pela classe da maioria"]]},
 '.predict() · .predict_proba()':{f:"«modelos['Random Forest']» pega o modelo do dicionário pelo nome, e «.fit()» o treina no treino inteiro. «predict(X)» devolve a classe prevista de cada linha; «predict_proba(X)» devolve uma coluna de probabilidade por classe, somando 1 em cada linha.",r:"«predict»: um array de classes; «predict_proba»: um array 2D (linhas × classes)."}},
aval:{
 'ConfusionMatrixDisplay':{f:"«ConfusionMatrixDisplay.from_predictions(y_real, y_previsto)» conta os acertos e erros para cada par (classe real, classe prevista) e desenha a matriz.",p:[["display_labels","nomes das classes nos eixos"]]},
 'classification_report()':{f:"«classification_report()» calcula precision, recall, F1 e support de cada classe, além da acurácia e das médias.",p:[["target_names","nomes das classes nas linhas do relatório"]],r:"um texto; use «print()» para vê-lo alinhado."},
 'load_breast_cancer()':{f:"«load_breast_cancer()» carrega 569 exames com 30 medidas cada; «bc.data» são as medidas e «bc.target» o diagnóstico. No original, 0 = maligno: «bc.target == 0» gera True para os malignos e «.astype(int)» converte True/False em 1/0, para que maligno seja a classe positiva.",r:"«Xb» (569 × 30) e «yb» (569 valores 0/1)."},
 'predict_proba(X)[:, 1]':{f:"«predict_proba» devolve uma coluna de probabilidade por classe. «[:, 1]» seleciona todas as linhas («:») da coluna 1: a probabilidade de ser maligno.",r:"um array 1D com uma probabilidade por paciente."},
 '(proba >= limiar).astype(int)':{f:"«proba >= limiar» compara cada probabilidade com o limiar e gera True/False; «.astype(int)» converte em 1/0. «precision_score(real, previsto)» = VP ÷ (VP + FP); «recall_score(real, previsto)» = VP ÷ (VP + FN).",r:"«prev»: array de 0/1; as métricas: um número cada."}}
};
/*DOC:FIM*/

/* ---------------- motor dos slides de comando ---------------- */
const md=t=>esc(t).replace(/«([^»]*)»/g,'<code>$1</code>');
const docHTML=d=>`<div class="lbl">O que o comando faz</div><p>${md(d.f)}</p>${d.p?`<dl>${d.p.map(([n,t])=>`<dt><code>${esc(n)}</code></dt><dd>${md(t)}</dd>`).join('')}</dl>`:''}${d.r?`<p class="ret"><b>Devolve:</b> ${md(d.r)}</p>`:''}`;
function build(sec){const key=sec.dataset.cmd,C=CMD[key];if(!C){console.warn('comando sem conteúdo:',key);return}
 const id='cmd_'+key,S=Object.assign({},C.state||{}),idx=slides.indexOf(sec);sec.dataset.id=id;sec.classList.add('cmds');
 sec.insertAdjacentHTML('beforeend',`<div class="nbk">▸ ${C.lab}</div><div class="cmdw"><div class="cmdL"><div class="cmdLib">${C.libs.map(n=>`<span class="pill" style="color:var(--${LIBC[n]})">${n}</span>`).join('')}</div><div class="cmdList">${C.items.map((it,k)=>`<button class="cchip" data-k="${k}"><span class="k">${String(k+1).padStart(2,'0')}</span><span><code>${esc(it.chip)}</code><small>${it.lbl}</small></span></button>`).join('')}</div><div class="cdoc"></div></div>
  <div class="cmdR"><div class="nbcell${C.cell?' libcell':''}"><div class="in">[ ]:</div><pre class="code"></pre></div><div class="ctls"></div><div class="cout"><span class="ol">${C.outLbl||'SAÍDA'}</span><div class="ob"></div></div><div class="csay"></div></div></div>`);
 for(let k=1;k<C.items.length;k++)sec.insertAdjacentHTML('beforeend',`<i class="f" data-f="${k}"></i>`);
 let sel=-1;const v=(x,s)=>typeof x==='function'?x(s):x;
 const render=()=>{const it=C.items[sel];
  $('.code',sec).innerHTML=C.cell?C.cell.split('\n').map((ln,i)=>`<span class="ln${it.lines.includes(i)?' on':''}">${hlPy(ln)||' '}</span>`).join(''):hlPy(v(it.code,S));
  $('.ob',sec).innerHTML=it.out(S);
  const tip=v(it.tip,S);$('.csay',sec).innerHTML=`<div>${v(it.say,S)}${tip?`<div class="tip">${tip}</div>`:''}</div>`;
  const d=(DOC[key]||{})[it.chip],cd=$('.cdoc',sec);cd.hidden=!d;cd.innerHTML=d?docHTML(d):'';cd.scrollTop=0};
 C.items.forEach(it=>{if(!(DOC[key]||{})[it.chip])console.warn('comando sem descrição:',key,it.chip)});
 const ctls=()=>{const it=C.items[sel],L=it.ctl||[],bx=$('.ctls',sec);bx.style.display=L.length?'':'none';
  bx.innerHTML=L.map(c=>c.t==='range'?`<label class="ctl"><span class="mu mono">${c.l}</span><input type="range" data-c="${c.k}" min="${c.min}" max="${c.max}" step="${c.step}" value="${S[c.k]}"></label>`:`<div class="seg">${c.l?`<span class="mu mono">${c.l}</span>`:''}${c.o.map(([val,t])=>`<button class="b${String(S[c.k])===String(val)?' on':''}" data-c="${c.k}" data-v="${val}">${esc(t)}</button>`).join('')}</div>`).join('');
  $$('input',bx).forEach(inp=>inp.oninput=()=>{S[inp.dataset.c]=+inp.value;render()});
  $$('button',bx).forEach(b=>b.onclick=()=>{const c=L.find(x=>x.k===b.dataset.c);S[c.k]=c.num?+b.dataset.v:b.dataset.v;$$(`button[data-c="${c.k}"]`,bx).forEach(x=>x.classList.toggle('on',x===b));render()})};
 FX[id]={init(){$$('.cchip',sec).forEach(b=>b.onclick=()=>go(idx,+b.dataset.k))},
  step(k){if(k!==sel){sel=k;$$('.cchip',sec).forEach((b,j)=>{b.classList.toggle('on',j===k);b.classList.toggle('seen',j<k)});ctls();render()}}}}
$$('section[data-cmd]').forEach(build);

/* ---------------- descida do gradiente, linha por linha ---------------- */
if($('#gdcCode')){const SRC=['def descida_gradiente(x, y, alpha=⟨A⟩, epocas=3000):','    w, b = 0.0, 0.0','    historico = []','    for _ in range(epocas):','        y_hat = w * x + b','        erro = y - y_hat','        historico.append((erro ** 2).mean())','        dw = -2 * (x * erro).mean()','        db = -2 * erro.mean()','        w = w - alpha * dw','        b = b - alpha * db','    return w, b, historico'];
 const AL=[0.001,0.01,0.02,0.023,0.03];let a=0.02,pc,w,b,yh,er,dw,db,hist,ep,chg,timer=null,last;
 const V3=a=>a?`[${a.slice(0,4).map(v=>v.toFixed(2)).join(', ')}, …]`:'—',N=v=>v===null||v===undefined?'—':Math.abs(v)>1e5?v.toExponential(2):v.toFixed(4);
 function reset(){stop();pc=1;w=b=yh=er=dw=db=hist=null;ep=0;chg=[];last=-1;$('#gdcMsg').innerHTML='<span class="mu">Clique em “Próxima linha” para executar a função como o Python faz.</span>';draw()}
 function exec1(){last=pc;switch(pc){case 1:w=0;b=0;chg=['w','b'];pc=2;break;case 2:hist=[];chg=['historico'];pc=3;break;case 3:ep++;chg=['época'];pc=4;break;
  case 4:yh=X10.map(x=>w*x+b);chg=['y_hat'];pc=5;break;case 5:er=Y10.map((y,i)=>y-yh[i]);chg=['erro'];pc=6;break;case 6:hist.push(mean(er.map(e=>e*e)));chg=['historico'];pc=7;break;
  case 7:dw=-2*mean(X10.map((x,i)=>x*er[i]));chg=['dw'];pc=8;break;case 8:db=-2*mean(er);chg=['db'];pc=9;break;case 9:w=w-a*dw;chg=['w'];pc=10;break;case 10:b=b-a*db;chg=['b'];pc=3;break}}
 function epoch(){do exec1();while(pc!==3)}
 function draw(){$('#gdcCode').innerHTML=SRC.map((l,i)=>`<span class="ln${i===pc?' on':''}${i===last?' last':''}"><b>${i===pc?'▶':' '}</b>${hlPy(l.replace('A',a))||' '}</span>`).join('');
  const row=(n,val,k)=>`<div class="vr${chg.includes(k||n)?' chg':''}"><span class="mono">${n}</span><span class="mono">${val}</span></div>`;
  $('#gdcVars').innerHTML=`<div class="lbl mu" style="font-size:13px;margin-bottom:8px">Variáveis agora</div>`+row('época',ep||'—')+row('w',N(w))+row('b',N(b))+row('y_hat',V3(yh))+row('erro',V3(er))+row('MSE',hist&&hist.length?N(hist[hist.length-1]):'—','historico')+row('dw',N(dw))+row('db',N(db));
  const ok=w!==null&&isFinite(w)&&Math.abs(w)<50,m=mapper(30,8,290,170,0,10,0,7);let h=`<defs><clipPath id="gdcClip"><rect x="30" y="8" width="290" height="170"/></clipPath></defs>`+`<path d="M30 8 V178 H320" fill="none" stroke="${COL.dim}" stroke-width="1.5"/>`;
  if(ok&&er)X10.forEach((x,i)=>h+=`<line x1="${m.X(x)}" y1="${m.Y(Y10[i])}" x2="${m.X(x)}" y2="${m.Y(Y10[i]-er[i])}" stroke="${COL.am}" stroke-width="2" clip-path="url(#gdcClip)"/>`);
  if(ok)h+=`<line x1="${m.X(0)}" y1="${m.Y(b)}" x2="${m.X(10)}" y2="${m.Y(w*10+b)}" stroke="${COL.cy}" stroke-width="3" clip-path="url(#gdcClip)"/>`;X10.forEach((x,i)=>h+=`<circle cx="${m.X(x)}" cy="${m.Y(Y10[i])}" r="5" fill="${COL.tx}"/>`);
  $('#gdcPlot').innerHTML=h+tx(175,200,'a reta: w · x + b',`text-anchor="middle" font-size="14" fill="${COL.mu}"`);
  let g=`<path d="M40 8 V178 H320" fill="none" stroke="${COL.dim}" stroke-width="1.5"/>`;if(hist&&hist.length>1){const lg=hist.map(v=>Math.log10(Math.max(1e-3,Math.min(1e6,v)))),lo=Math.min(...lg,-.2),hi=Math.max(...lg)+.1,n=hist.length,mm=mapper(40,8,280,170,0,Math.max(10,n-1),lo,hi);g+=`<path d="${lg.map((v,i)=>(i?'L':'M')+mm.X(i).toFixed(1)+' '+mm.Y(v).toFixed(1)).join('')}" fill="none" stroke="${COL.am}" stroke-width="2.5"/>`}
  $('#gdcLoss').innerHTML=g+tx(180,200,"plt.plot(historico); plt.yscale('log')",`text-anchor="middle" font-size="13" font-family="JetBrains Mono,monospace" fill="${COL.mu}"`)}
 function check(){if(w!==null&&(!isFinite(w)||Math.abs(w)>1e4)){$('#gdcMsg').innerHTML=`<span class="rd" style="font-weight:700">Divergiu: com alpha = ${String(a).replace('.',',')}, cada passo piora o erro.</span>`;stop();return 1}
  if(ep>0&&pc===3){const E=hist[hist.length-1];$('#gdcMsg').innerHTML=a===0.023&&ep<60?'<span class="am">Oscila de um lado para o outro, mas ainda desce.</span>':a<=0.001?`<span class="mu">Época ${ep}: MSE ${E.toFixed(3)}. Alpha pequeno = lento.</span>`:`<span class="gr">Época ${ep}: MSE ${E.toFixed(3)}. O notebook roda 3000 épocas.</span>`}return 0}
 function stop(){clearInterval(timer);timer=null;$('#gdcRun').textContent='▶ 100 épocas'}
 $('#gdcA').innerHTML=AL.map(v=>`<button class="b${v===a?' on':''}" data-a="${v}">${v}</button>`).join('');
 FX.gdc={init(){$$('#gdcA button').forEach(x=>x.onclick=()=>{$$('#gdcA button').forEach(y=>y.classList.toggle('on',y===x));a=+x.dataset.a;reset()});
  $('#gdcLine').onclick=()=>{stop();exec1();draw();check()};$('#gdcEp').onclick=()=>{stop();epoch();draw();check()};$('#gdcRst').onclick=reset;
  $('#gdcRun').onclick=()=>{if(timer){stop();return}$('#gdcRun').textContent='❚❚ Pausar';let n=0;timer=setInterval(()=>{epoch();n++;draw();if(check()||n>=100)stop()},40)};reset()},leave:stop}}
});
