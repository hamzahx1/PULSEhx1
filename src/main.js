import './style.css';
import { renderTraditionalGames } from './traditional-games.js';
import { renderMiniGames } from './minigames.js';
const app=document.querySelector('#app');
/* PULSE_SHOP_V1 */
const KEY='pulse-local-v1';const defaults={coins:0,best:{classic:0,endless:0,time:0,precision:0},games:0,hits:0,misses:0,perfect:0,maxCombo:0,earned:0,claimed:[],owned:['blue'],skin:'blue',inventory:{heart:0,shield:0,wide:0},upgrades:{goldHeart:false,collector:false},settings:{sound:true,vibrate:true,low:false,music:false}};
let data;try{data={...structuredClone(defaults),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{data=structuredClone(defaults)};data.best={...defaults.best,...data.best};data.settings={...defaults.settings,...data.settings};if(!Array.isArray(data.claimed))data.claimed=[];if(!Array.isArray(data.owned))data.owned=['blue'];data.inventory={heart:0,shield:0,wide:0,...(data.inventory||{})};data.upgrades={goldHeart:false,collector:false,...(data.upgrades||{})};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}};
const modes={classic:['🎯','كلاسيكي','3 محاولات • زيادة متدرجة'],endless:['♾️','لا نهائي','محاولة واحدة • بقاء للأفضل'],time:['⏱️','سباق الزمن','60 ثانية • أقصى عدد نقاط'],precision:['⚡','الدقة المطلقة','منطقة هدف أضيق • مكافآت مضاعفة']};const skins=[['blue','النبضة الزرقاء','#23b9f6',0],['purple','الشفق البنفسجي','#ae45ef',80],['green','الزمرد الأخضر','#26d49e',150],['orange','اللهب الشمسي','#ff9c19',250],['red','البرق القرمزي','#ff4c79',400]];
let traditionalGame='chess',xoReturnScreen='home';let mode='classic',screen='home',game=null,raf=0,previous=0,audio=null;const fmt=n=>Math.floor(n).toLocaleString('en-US');const color=()=>skins.find(s=>s[0]===data.skin)?.[2]||'#23b9f6';function stop(){cancelAnimationFrame(raf);raf=0;game=null}function beep(freq=500){if(!data.settings.sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=freq;o.type='sine';g.gain.setValueAtTime(.12,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.13);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.14)}catch{}}function vibrate(){if(data.settings.vibrate)navigator.vibrate?.(20)}function header(title){return `<div class="panel"><h2>${title}<button class="close" data-action="home">×</button></h2>`}function render(){screen==='home'?home():screen==='bag'?bag():screen==='settings'?settings():screen==='stats'?stats():screen==='missions'?missions():screen==='shop'?shop():screen==='result'?result():screen==='xo'?xoHome():screen==='xo-game'?xoGameScreen():screen==='minigames'?renderMiniGames(app,()=>{screen='home';render()}):screen==='traditional-games'?renderTraditionalGames(app,()=>{screen='home';render()},traditionalGame,()=>{xoReturnScreen='traditional-games';screen='xo';render()}):null;bind()}
function home(){app.innerHTML=`<main class="app"><div class="top"><div><button data-action="settings">⚙️</button> <button data-action="settings">🔊</button></div><div class="pill">✧ ${fmt(data.coins)} نبضة</div></div><div class="brand"><div class="logo">ϟ</div><h1>PULSE</h1><p>نَبْضَة • أركيد التوقيت والسرعة</p><div class="best">🏅 أعلى نتيجة: ${fmt(data.best[mode])}</div></div><div class="sectiontitle">اختر وضع اللعب:</div><div class="modes">${Object.entries(modes).map(([id,m])=>`<button class="mode ${mode===id?'active':''}" data-mode="${id}"><span class="ico">${m[0]}</span><b>${m[1]}</b><small>${m[2]}</small></button>`).join('')}</div><button class="primary" data-action="start">▶ ابدأ اللعب</button><div class="nav"><button data-action="missions"><span>🏅</span>المهمات</button><button data-action="shop"><span>✧</span>الأشكال</button><button data-action="stats"><span>📊</span>الإحصائيات</button></div><section class="pulse-game-section">
<h2>🎮 تحديات الألعاب</h2>
<p>اختر لعبتك وابدأ مباشرة</p>
<div class="pulse-game-grid">
<button class="pulse-game-card" data-action="open-chess">
<span class="pulse-game-icon">♟️</span>
<strong>الشطرنج</strong>
<small>🤖 تحدَّ الكمبيوتر أو صديقك</small>
</button>
<button class="pulse-game-card" data-action="open-checkers">
<span class="pulse-game-icon">🔴</span>
<strong>الضامّة</strong>
<small>🤖 مستويات متعددة وتحديات ذكية</small>
</button>
<button class="pulse-game-card" data-action="open-badris">
<span class="pulse-game-icon">🎯</span>
<strong>البادريس</strong>
<small>🎮 ابدأ اللعب مباشرة</small>
</button>
<button class="pulse-game-card" data-action="open-xo">
<span class="pulse-game-icon">❌⭕</span>
<strong>إكس أو (XO)</strong>
<small>🤖 تحدَّ الذكاء الاصطناعي أو العب مع صديق</small>
</button>
</div>
</section><p class="notice">تطوير حمزة عامر هاشم</p></main>`}

function bag(){const items=[['heart','❤️','قلب إضافي'],['shield','🛡️','درع الحماية'],['wide','🎯','توسيع الهدف']];app.innerHTML=`<main class="app">${header('🎒 حقيبة المساعدات')}<div class="row">رصيدك <strong>✧ ${fmt(data.coins)}</strong></div><p class="muted">فعّل المساعدات قبل بدء الجولة. تُستهلك عند بدء جولة مناسبة.</p>${items.map(([id,icon,name])=>`<div class="shopitem"><div style="font-size:30px">${icon}</div><div class="info"><b>${name}</b><br><small>المتوفر: ${data.inventory[id]||0}</small></div></div>`).join('')}<div class="row">💎 القلب الذهبي <strong>${data.upgrades.goldHeart?'مفعّل':'غير مملوك'}</strong></div><div class="row">💰 جامع النبضات <strong>${data.upgrades.collector?'مفعّل':'غير مملوك'}</strong></div><button class="primary" data-action="home">العودة للرئيسية</button><button class="tap" data-action="shop">العودة للمتجر</button></main>`;}

function settings(){app.innerHTML=`<main class="app">${header('⚙️ إعدادات اللعبة')}${[['sound','🔊 المؤثرات الصوتية'],['music','🎵 الموسيقى الخلفية (قريباً)'],['vibrate','📱 الاهتزاز اللمسي'],['low','✨ وضع الأداء الخفيف']].map(([k,label])=>`<label class="row"><strong>${label}</strong><input class="switch" type="checkbox" data-setting="${k}" ${data.settings[k]?'checked':''} ${k==='music'?'disabled':''}></label>`).join('')}<div class="row">🌐 اللغة <strong>العربية</strong></div></div></main>`}
function stats(){const total=data.hits+data.misses;app.innerHTML=`<main class="app">${header('🏆 سجل الإحصائيات')}<div class="row" style="display:block"><b style="color:#22d0a6">الأرقام القياسية حسب الوضع</b>${Object.entries(modes).map(([id,m])=>`<div class="row">${m[1]} <strong>${fmt(data.best[id])}</strong></div>`).join('')}</div><div class="tilegrid">${[['إجمالي الجولات',data.games],['أعلى كومبو',data.maxCombo+'x'],['ضربات PERFECT',data.perfect],['معدل الدقة',total?Math.round(data.hits/total*100)+'%':'0%']].map(([a,b])=>`<div class="tile">${a}<strong>${b}</strong></div>`).join('')}</div><div class="row">الضربات الناجحة / الإخفاقات <b>${data.hits} / ${data.misses}</b></div><button class="row" style="width:100%;justify-content:center;color:#ff6680" data-action="reset">🗑 مسح بيانات التقدم</button></div></main>`}
// Missions have unlimited tiers: after claiming a tier, the next tier is generated.
const definitions=[['الخطوات الأولى','حقق ضربات ناجحة', 'hits',10,30],['سيد التوقيت','سجل ضربات PERFECT','perfect',5,50],['ملك السلاسل','حقق أعلى كومبو','maxCombo',5,80],['صياد النقاط','اجمع نبضات من اللعب','earned',100,100],['اللاعب المثابر','العب جولات','games',5,60]];
function missions(){app.innerHTML=`<main class="app">${header('🏅 المهمات والإنجازات')}<div class="row">رصيدك الحالي <strong>${fmt(data.coins)} نبضة</strong></div><div style="max-height:70dvh;overflow:auto">${definitions.map(([title,desc,key,base,reward],i)=>{let tier=1;while(data.claimed.includes(`${i}-${tier}`))tier++;const target=base*tier;const val=Number(data[key])||0;const done=val>=target;return `<div class="mission"><b>${title} • المستوى ${tier}</b><p>${desc} ${target} مرة / نقطة</p><small>🎁 +${reward*tier} نبضة</small><div class="bar"><i style="width:${Math.min(100,val/target*100)}%"></i></div><div class="row" style="padding:8px;background:transparent;border:0"><small>${fmt(val)} / ${fmt(target)}</small><button class="smallbtn" data-claim="${i}-${tier}" ${done?'':'disabled'}>${done?'استلم المكافأة':'قيد الإنجاز'}</button></div></div>`}).join('')}</div></div></main>`}
function shop(){const products=[['heart','❤️','قلب إضافي','قلب إضافي لجولة واحدة',150],['shield','🛡️','درع الحماية','يحمي من أول خطأ في الجولة',200],['wide','🎯','توسيع الهدف','يزيد مساحة الإصابة في جولة واحدة',180],['goldHeart','💎','القلب الذهبي','قلب إضافي دائم في الأوضاع المناسبة',900],['collector','💰','جامع النبضات','زيادة مكافآت الجولات 10% دائمًا',2000]];app.innerHTML=`<main class="app">${header('🛒 متجر PULSE')}<div class="row">رصيدك <strong>✧ ${fmt(data.coins)} نبضة</strong></div><button class="row" style="width:100%;justify-content:center" data-action="bag">🎒 حقيبة المساعدات</button><h3>⚡ المساعدات والتطويرات</h3>${products.map(([id,icon,name,desc,price])=>{const permanent=id==='goldHeart'||id==='collector';const owned=permanent?!!data.upgrades[id]:false;const count=permanent?0:Number(data.inventory[id]||0);return `<div class="shopitem"><div style="font-size:32px">${icon}</div><div class="info"><b>${name}</b><br><small>${desc}</small><br><small>${permanent?(owned?'✓ تم الشراء':'دائم'):('في الحقيبة: '+count)}</small><br><strong>${fmt(price)} نبضة</strong></div><button data-buy="${id}" ${owned?'disabled':''}>${owned?'مملوك':'شراء'}</button></div>`}).join('')}<hr><h3>🎨 الأشكال والنيون</h3><div style="max-height:55dvh;overflow:auto">${skins.map(([id,name,costColor,price])=>{const owned=data.owned.includes(id);return `<div class="shopitem"><div class="orb" style="--orb:${costColor}"></div><div class="info"><b>${name}</b><br><small>${owned?'مفتوح':price+' نبضة'}</small></div><button data-skin="${id}" ${data.skin===id?'disabled':''}>${data.skin===id?'✓ مفعل':owned?'تفعيل':'فتح'}</button></div>`}).join('')}</div></main>`}

const XO_KEY='pulse-xo-v1';
let xoMode='ai',xoDifficulty='medium',xoBoard=Array(9).fill(''),xoTurn='X',xoOver=false,xoBusy=false;
let xoStats={x:0,o:0,draw:0};
try{xoStats={...xoStats,...JSON.parse(localStorage.getItem(XO_KEY)||'{}')}}catch{}
function saveXO(){try{localStorage.setItem(XO_KEY,JSON.stringify(xoStats))}catch{}}
function xoHome(){
 app.innerHTML=`<main class="app"><div class="panel xo-panel"><h2>❌⭕ ساحة XO <button class="close" data-action="home">×</button></h2><p class="muted">اختر طريقة اللعب وابدأ التحدي!</p>
 <div class="xo-choice"><button data-xomode="ai" class="${xoMode==='ai'?'selected':''}">🤖 ضد الذكاء الاصطناعي</button><button data-xomode="local" class="${xoMode==='local'?'selected':''}">👥 لاعبان على الهاتف</button></div>
  ${xoMode==='ai'?`<label class="xo-label">مستوى الذكاء الاصطناعي</label><div class="xo-choice"><button data-xodiff="easy" class="${xoDifficulty==='easy'?'selected':''}">🟢 سهل</button><button data-xodiff="medium" class="${xoDifficulty==='medium'?'selected':''}">🟡 متوسط</button><button data-xodiff="hard" class="${xoDifficulty==='hard'?'selected':''}">🔴 صعب</button></div>`:''}
 <div class="xo-stats"><div>انتصارات X<strong>${xoStats.x}</strong></div><div>انتصارات O<strong>${xoStats.o}</strong></div><div>تعادلات<strong>${xoStats.draw}</strong></div></div>
 <button class="primary" data-action="xo-new">▶ ابدأ مباراة</button><button class="tap" data-action="home">العودة إلى PULSE</button></div></main>`;
}
function xoGameScreen(){
 app.innerHTML=`<main class="app"><div class="panel xo-panel"><h2>❌⭕ XO <button class="close" data-action="xo">×</button></h2><p class="xo-status">${xoOver?xoWinnerText():'الدور على '+xoTurn}</p><div class="xo-board">${xoBoard.map((v,i)=>`<button class="xo-cell ${v==='X'?'xmark':v==='O'?'omark':''}" data-xocell="${i}" ${v||xoOver||xoBusy?'disabled':''}>${v||''}</button>`).join('')}</div>
 <p class="muted center">${xoMode==='ai'?'تلعب X ضد الذكاء الاصطناعي O':'اللاعبان يتناوبان على نفس الهاتف'}</p>
 <button class="primary" data-action="xo-restart">↻ مباراة جديدة</button><button class="tap" data-action="xo">قائمة طور XO</button></div></main>`;
}
function xoWinnerText(){const w=xoGetWinner(xoBoard);return w==='draw'?'🤝 تعادل!':w==='X'?'🎉 فاز اللاعب X!':(xoMode==='ai'?'🏆 فاز الذكاء الاصطناعي O!':'🏆 فاز اللاعب O!')}
function xoGetWinner(b){
 const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
 for(const [a,c,d] of lines)if(b[a]&&b[a]===b[c]&&b[a]===b[d])return b[a];
 return b.every(Boolean)?'draw':null;
}
function xoBegin(){xoBoard=Array(9).fill('');xoTurn='X';xoOver=false;xoBusy=false;screen='xo-game';render()}
function xoPlay(i){
 if(screen!=='xo-game'||xoOver||xoBusy||xoBoard[i])return;
 xoBoard[i]=xoTurn;
 let w=xoGetWinner(xoBoard);
 if(w){xoEnd(w);return}
 xoTurn=xoTurn==='X'?'O':'X';render();
 if(xoMode==='ai'&&xoTurn==='O'){
  xoBusy=true;render();
  setTimeout(()=>{if(screen!=='xo-game'||xoOver)return;const move=xoAiMove();if(move>=0)xoBoard[move]='O';w=xoGetWinner(xoBoard);if(w)xoEnd(w);else{xoTurn='X';xoBusy=false;render()}},350);
 }
}
function xoAiMove(){
 const empty=xoBoard.map((v,i)=>v?-1:i).filter(i=>i>=0);
 if(!empty.length)return -1;

 const findMove=(mark)=>{
  for(const i of empty){
   xoBoard[i]=mark;
   const w=xoGetWinner(xoBoard);
   xoBoard[i]='';
   if(w===mark)return i;
  }
  return -1;
 };

 if(xoDifficulty==='easy'){
  if(Math.random()<0.35){
   const win=findMove('O');
   if(win>=0)return win;
  }
  return empty[Math.floor(Math.random()*empty.length)];
 }

 if(xoDifficulty==='medium' && Math.random()<0.25){
  return empty[Math.floor(Math.random()*empty.length)];
 }

 const win=findMove('O');
 if(win>=0)return win;

 const block=findMove('X');
 if(block>=0)return block;

 if(xoDifficulty==='medium'){
  if(!xoBoard[4])return 4;
  const corners=[0,2,6,8].filter(i=>!xoBoard[i]);
  if(corners.length)return corners[Math.floor(Math.random()*corners.length)];
  return empty[Math.floor(Math.random()*empty.length)];
 }

 function minimax(board, isMax, depth){
  const result=xoGetWinner(board);
  if(result==='O')return 10-depth;
  if(result==='X')return depth-10;
  if(result==='draw')return 0;

  if(isMax){
   let best=-Infinity;
   for(let i=0;i<9;i++){
    if(board[i])continue;
    board[i]='O';
    best=Math.max(best,minimax(board,false,depth+1));
    board[i]='';
   }
   return best;
  }

  let best=Infinity;
  for(let i=0;i<9;i++){
   if(board[i])continue;
   board[i]='X';
   best=Math.min(best,minimax(board,true,depth+1));
   board[i]='';
  }
  return best;
 }

 let bestScore=-Infinity, bestMoves=[];
 for(const i of empty){
  xoBoard[i]='O';
  const score=minimax(xoBoard,false,0);
  xoBoard[i]='';
  if(score>bestScore){
   bestScore=score;
   bestMoves=[i];
  }else if(score===bestScore){
   bestMoves.push(i);
  }
 }
 return bestMoves[Math.floor(Math.random()*bestMoves.length)];
}
function xoEnd(w){
 xoOver=true;xoBusy=false;
 if(w==='draw')xoStats.draw++;else if(w==='X')xoStats.x++;else xoStats.o++;
 saveXO();render();
}

function bind(){




document.querySelectorAll('[data-buy]').forEach(el=>el.addEventListener('click',()=>{const id=el.dataset.buy;const prices={heart:150,shield:200,wide:180,goldHeart:900,collector:2000};if(!(id in prices))return;if((id==='goldHeart'||id==='collector')&&data.upgrades[id])return;if(data.coins<prices[id]){alert('رصيدك غير كافٍ!');return}data.coins-=prices[id];if(id==='goldHeart'||id==='collector')data.upgrades[id]=true;else data.inventory[id]=(Number(data.inventory[id])||0)+1;save();shop()}));document.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>{if(el.dataset.action==='bag'){screen='bag';render();return}if(el.dataset.action==='shop'&&screen==='bag'){screen='shop';render();return}action(el.dataset.action)}));(el=>el.addEventListener('click',()=>action(el.dataset.action)));document.querySelectorAll('[data-mode]').forEach(el=>el.addEventListener('click',()=>{mode=el.dataset.mode;render()}));document.querySelectorAll('[data-setting]').forEach(el=>el.addEventListener('change',()=>{data.settings[el.dataset.setting]=el.checked;save()}));document.querySelectorAll('[data-claim]').forEach(el=>el.addEventListener('click',()=>{const [i,t]=el.dataset.claim.split('-').map(Number);const def=definitions[i];if(data.claimed.includes(el.dataset.claim)||(Number(data[def[2]])||0)<def[3]*t)return;data.claimed.push(el.dataset.claim);data.coins+=def[4]*t;save();render()}));document.querySelectorAll('[data-skin]').forEach(el=>el.addEventListener('click',()=>{const id=el.dataset.skin,s=skins.find(s=>s[0]===id);if(!s)return;if(!data.owned.includes(id)){if(data.coins<s[3])return alert('رصيدك غير كافٍ');data.coins-=s[3];data.owned.push(id)}data.skin=id;save();render()}))}
function action(a){if(a==='reset'){if(confirm('هل تريد حذف كل التقدم؟')){data=structuredClone(defaults);save();render()}return}if(a==='start'){start();return}if(a==='home'){stop();screen=(screen==='xo'||screen==='xo-game')?xoReturnScreen:'home';render();return}if(a==='xo'){stop();screen='xo';render();return}if(a==='open-xo'){stop();xoReturnScreen='home';screen='xo';render();return}if(['open-chess','open-checkers','open-badris'].includes(a)){
traditionalGame=a.replace('open-','');
stop();screen='traditional-games';render();return;
}if(a==='traditional-games'){stop();screen='traditional-games';render();return}screen=a;render()}
function start(){stop();const usable=mode==='time'?[]:['heart','shield','wide'];const active=usable.filter(id=>(Number(data.inventory[id])||0)>0);active.forEach(id=>data.inventory[id]--);const extraHeart=mode!=='endless'&&data.upgrades.goldHeart?1:0;screen='game';game={score:0,combo:0,hits:0,misses:0,perfect:0,lives:(mode==='endless'?1:3)+extraHeart+(active.includes('heart')?1:0),shields:active.includes('shield')?1:0,wide:active.includes('wide'),angle:0,target:Math.random()*Math.PI*2,speed:2.5,elapsed:0,feedback:'',paused:false,mode,ended:false};save();app.innerHTML=`<main class="app"><div class="gamehead"><button id="exit">✕ خروج</button><b>${modes[mode][1]}</b><button id="pause">⏸ إيقاف</button></div><div class="scoreline"><div>النقاط <b id="score">0</b></div><div id="life">❤️ 3</div></div><div class="center muted" id="combo">COMBO 0</div><canvas class="arena" id="arena" width="640" height="640" aria-label="حلقة التوقيت"></canvas><div class="feedback" id="feedback"></div><p class="hint">اضغط عندما تصل النقطة المضيئة إلى منطقة الهدف</p><button class="tap" id="tap">⚡ اضغط الآن</button></main>`;document.querySelector('#tap').addEventListener('pointerdown',e=>{e.preventDefault();hit()});document.querySelector('#arena').addEventListener('pointerdown',e=>{e.preventDefault();hit()});document.querySelector('#pause').onclick=()=>{game.paused=!game.paused;document.querySelector('#pause').textContent=game.paused?'▶ متابعة':'⏸ إيقاف'};document.querySelector('#exit').onclick=()=>{if(confirm('إنهاء الجولة والعودة؟')){stop();screen='home';render()}};previous=performance.now();raf=requestAnimationFrame(frame)}
const diff=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
function hit(){if(!game||game.paused||game.ended)return;const g=game;const d=diff(g.angle,g.target),limit=(g.mode==='precision'?.17:.28)*(g.wide?1.35:1);let result='';if(d<=limit){const points=d<limit*.3?30:d<limit*.65?20:10;g.hits++;g.combo++;if(points===30){g.perfect++;result='PERFECT!'}else result=points===20?'GREAT!':'GOOD!';const add=points*Math.min(5,1+Math.floor(g.combo/5))*(g.mode==='precision'?2:1);g.score+=add;g.speed=Math.min(16,2.5+g.hits*.22);g.target=Math.random()*Math.PI*2;beep(points===30?850:630);vibrate()}else{g.misses++;g.combo=0;result='MISS!';beep(190);vibrate();if(g.mode!=='time'){if(g.shields>0)g.shields--;else g.lives--;}if(g.lives<=0){finish();return}}g.feedback=result;document.querySelector('#feedback').textContent=result;document.querySelector('#feedback').style.color=result==='MISS!'?'#ff4c79':'#38e4b4';updateHud()}
function updateHud(){if(!game)return;document.querySelector('#score').textContent=fmt(game.score);document.querySelector('#combo').textContent=`COMBO ${game.combo}`;document.querySelector('#life').textContent=game.mode==='time'?`⏱ ${Math.max(0,60-Math.floor(game.elapsed))} ث`: `❤️ ${game.lives}`}
function frame(t){if(!game)return;let dt=Math.min(.05,(t-previous)/1000);previous=t;if(!game.paused){game.elapsed+=dt;game.angle=(game.angle+game.speed*dt)%(Math.PI*2);if(game.mode==='time'&&game.elapsed>=60){finish();return}draw();updateHud()}raf=requestAnimationFrame(frame)}
function draw(){const canvas=document.querySelector('#arena');if(!canvas||!game)return;const c=canvas.getContext('2d'),g=game;const center=320,r=218;c.clearRect(0,0,640,640);c.lineWidth=10;c.strokeStyle='#123e52';c.shadowColor=color();c.shadowBlur=data.settings.low?0:18;c.beginPath();c.arc(center,center,r,0,Math.PI*2);c.stroke();const lim=g.mode==='precision'?.17:.28;c.lineWidth=18;c.strokeStyle='#a74cf5';c.beginPath();c.arc(center,center,r,g.target-lim,g.target+lim);c.stroke();c.shadowBlur=data.settings.low?0:28;c.fillStyle=color();c.beginPath();c.arc(center+Math.cos(g.angle)*r,center+Math.sin(g.angle)*r,16,0,Math.PI*2);c.fill();c.shadowBlur=0;c.fillStyle='#0ec5e3';c.font='bold 105px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('ϟ',320,320)}
function finish(){if(!game||game.ended)return;game.ended=true;const g=game;data.games++;data.hits+=g.hits;data.misses+=g.misses;data.perfect+=g.perfect;data.maxCombo=Math.max(data.maxCombo,g.combo);data.best[g.mode]=Math.max(data.best[g.mode],g.score);const earned=Math.floor(g.score/10*(data.upgrades.collector?1.1:1));data.coins+=earned;data.earned+=earned;save();const summary={...g,earned};stop();game=summary;screen='result';render()}
function result(){const g=game;app.innerHTML=`<main class="app"><div class="panel center"><h2 style="justify-content:center">🏆 انتهت الجولة</h2><div class="muted">${modes[g.mode][1]}</div><div class="result">${fmt(g.score)}</div><p>أفضل نتيجة: ${fmt(data.best[g.mode])}</p><div class="tilegrid"><div class="tile">الضربات الناجحة<strong>${g.hits}</strong></div><div class="tile">الإخفاقات<strong>${g.misses}</strong></div><div class="tile">PERFECT<strong>${g.perfect}</strong></div><div class="tile">المكافأة<strong>+${g.earned} ✧</strong></div></div><button class="primary" data-action="start">↻ العب مجدداً</button><button class="tap" data-action="home">الصفحة الرئيسية</button></div></main>`}
render();


document.addEventListener('click', function(e){
 const el=e.target.closest('button');
 if(!el)return;

 if(el.dataset.xomode){
  xoMode=el.dataset.xomode;
  render();
  return;
 }

 if(el.dataset.xodiff){
  xoDifficulty=el.dataset.xodiff;
  render();
  return;
 }

 if(el.dataset.xocell!==undefined){
  xoPlay(Number(el.dataset.xocell));
  return;
 }

 if(el.dataset.action==='xo-new'||el.dataset.action==='xo-restart'){
  xoBegin();
 }
});
