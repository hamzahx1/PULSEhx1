let appRef, exitCallback, active = null, timer = null, ticker = null, runnerRAF = null;
let installed = false;

const games = [
  ['memory','🧠','تسلسل الذاكرة','احفظ التسلسل وكرره'],
  ['target','🎯','اصطياد الهدف','اجمع أكبر عدد خلال 30 ثانية'],
  ['snake','🐍','الثعبان','اجمع الطعام وتجنب الاصطدام'],
  ['shapes','🧩','لغز الأشكال','اختر الشكل الذي يكمل النمط'],
  ['colors','🌈','تحدي الألوان','اختر اللون المطلوب بسرعة'],
  ['numbers','🔢','تحدي الأرقام','حل العمليات الحسابية'],
  ['dodge','🚧','تفادي العقبات','تحرك بين المسارات وابقَ حيًا'],
  ['gems','💎','جمع الجواهر','اعثر على الجوهرة قبل انتهاء الوقت'],
  ['cards','🃏','مطابقة البطاقات','اكشف الأزواج المتطابقة'],
  ['minute','⏱️','تحدي الدقيقة','أسئلة سريعة لمدة دقيقة']
];

const colors = [
  {name:'أحمر',hex:'#ff476f'},
  {name:'أزرق',hex:'#438cff'},
  {name:'أخضر',hex:'#34dfa0'},
  {name:'أصفر',hex:'#ffd34e'}
];

const shapes = ['🔺','🔵','🟩','⭐','💠','🟣'];

function stopTimers(){
  if(runnerRAF!==null){cancelAnimationFrame(runnerRAF);runnerRAF=null;}
  if(timer) clearInterval(timer);
  if(ticker) clearInterval(ticker);
  timer = ticker = null;
}

function rand(n){ return Math.floor(Math.random()*n); }
function shuffle(a){ return [...a].sort(()=>Math.random()-.5); }

function shell(title, content){
  appRef.innerHTML = `
    <main class="app mini-app">
      <div class="gamehead">
        <button data-mini-action="catalog">↩ الألعاب</button>
        <b>${title}</b>
        <button data-mini-action="exit">⌂ الرئيسية</button>
      </div>
      ${content}
    </main>`;
}

function renderCatalog(){
  stopTimers();
  active = null;
  appRef.innerHTML = `
    <main class="app mini-app">
      <div class="top">
        <button data-mini-action="exit">↩ الرئيسية</button>
        <div class="pill">⚡ PULSE ARCADE</div>
      </div>
      <div class="brand">
        <div class="logo">🎮</div>
        <h1>MINI GAMES</h1>
        <p>عشر ألعاب صغيرة، تحديات كبيرة!</p>
      </div>
      <div class="mini-grid">
        ${games.map(g=>`
          <button class="mini-card" data-mini-action="start" data-id="${g[0]}">
            <span class="mini-icon">${g[1]}</span>
            <b>${g[2]}</b>
            <small>${g[3]}</small>
            <span class="mini-play">العب الآن ←</span>
          </button>`).join('')}
      </div>
    </main>`;
}

function start(id){
  stopTimers();
  const common = {id,score:0,time:id==='minute'?60:30,ended:false};
  active = common;

  if(id==='memory'){
    active.seq = [rand(4)];
    active.input = [];
    active.showing = true;
    active.flash = -1;
  } else if(id==='target'){
    active.target = rand(9);
  } else if(id==='snake'){
    active.snake = [ [4,4], [3,4], [2,4] ];
    active.dir = [1,0];
    active.nextDir = [1,0];
    active.food = [rand(9),rand(9)];
    active.time = 60;
  } else if(id==='shapes'){
    makeShapeQuestion();
  } else if(id==='colors'){
    makeColorQuestion();
  } else if(id==='numbers'||id==='minute'){
    makeNumberQuestion();
  } else if(id==='dodge'){
    active.time = 60;
    active.runner = {
      x: 125, y: 0, vy: 0, ground: 0, sliding: 0,
      obstacles: [], coins: [], distance: 0, speed: 300,
      spawn: 0, coinSpawn: 1.2, last: 0, alive: true
    };
  } else if(id==='gems'){
    active.gem = rand(9);
  } else if(id==='cards'){
    active.deck = shuffle(['🌙','🌙','⭐','⭐','💎','💎','🔥','🔥','🍀','🍀','⚡','⚡','🎯','🎯','👑','👑']);
    active.open = [];
    active.matched = [];
    active.moves = 0;
    active.lock = false;
  }
  renderGame();
  if(id==='memory') showSequence();
  if(id==='snake') startSnake();
  else {
    if(id==='dodge') startRunner();
    timer = setInterval(()=>{
      if(!active || active.ended) return;
      active.time--;
      if(active.time<=0) endGame();
      else if(active.id==='minute'){
        makeNumberQuestion();
        renderGame();
      } else updateTimer();
    },1000);
  }
}

function makeShapeQuestion(){
  const a=rand(shapes.length), b=rand(shapes.length);
  active.question = `${shapes[a]}　${shapes[b]}　${shapes[a]}　${shapes[b]}　؟`;
  active.answer = shapes[a];
  active.options = shuffle([active.answer,shapes[rand(6)],shapes[rand(6)],shapes[rand(6)]]);
  if(new Set(active.options).size<4) active.options=shuffle([active.answer,...shuffle(shapes.filter(x=>x!==active.answer)).slice(0,3)]);
}

function makeColorQuestion(){
  active.color = colors[rand(colors.length)];
  active.options = shuffle(colors);
}

function makeNumberQuestion(){
  const a=rand(20)+1, b=rand(12)+1;
  const op=rand(2)?'+':'−';
  active.answer=op==='+'?a+b:a-b;
  active.question=`${a} ${op} ${b} = ؟`;
  active.options=shuffle([...new Set([
    active.answer, active.answer+rand(5)+1,
    active.answer-rand(5)-1, active.answer+rand(10)+2
  ])]);
  while(active.options.length<4) active.options.push(active.answer+active.options.length+3);
}

function showSequence(){
  if(!active || active.id!=='memory' || active.ended) return;
  active.showing=true;
  active.input=[];
  active.flash=-1;
  renderGame();
  let i=0;
  const seq=[...active.seq];
  if(ticker) clearInterval(ticker);
  ticker=setInterval(()=>{
    if(!active || active.id!=='memory'){clearInterval(ticker);return;}
    active.flash=i<seq.length?seq[i]:-1;
    renderGame();
    i++;
    if(i>seq.length){
      clearInterval(ticker);ticker=null;
      active.showing=false;
      renderGame();
    }
  },650);
}

function startSnake(){
  ticker=setInterval(()=>{
    if(!active || active.id!=='snake' || active.ended)return;
    const g=active;
    g.dir=g.nextDir;
    const head=[g.snake[0][0]+g.dir[0],g.snake[0][1]+g.dir[1]];
    if(head[0]<0||head[0]>8||head[1]<0||head[1]>8||
      g.snake.some(p=>p[0]===head[0]&&p[1]===head[1])){
      endGame();return;
    }
    g.snake.unshift(head);
    if(head[0]===g.food[0]&&head[1]===g.food[1]){
      g.score+=10;g.food=[rand(9),rand(9)];
    } else g.snake.pop();
    renderGame();
  },220);
  timer=setInterval(()=>{
    if(!active||active.ended)return;
    active.time--;
    if(active.time<=0)endGame();
    else updateTimer();
  },1000);
}

function updateTimer(){
  const el=appRef.querySelector('[data-mini-time]');
  if(el)el.textContent=active?active.time:'0';
  const score=appRef.querySelector('[data-mini-score]');
  if(score&&active)score.textContent=active.score;
}

function panelStats(){
  return `<div class="mini-stats">
    <span>النقاط <b data-mini-score>${active.score}</b></span>
    <span>الوقت <b data-mini-time>${active.time}</b> ث</span>
  </div>`;
}

function renderGame(){
  if(!active)return;
  const g=active;
  let body='';

  if(g.id==='memory'){
    body=`<div class="mini-box"><h3>${g.showing?'احفظ التسلسل 👀':'كرر التسلسل بالترتيب'}</h3>
      <div class="mini-sequence">${g.seq.map((_,i)=>`<span>${g.showing&&i===g.flash?['🔴','🔵','🟢','🟡'][g.seq[i]]:g.showing?'●':'?'}</span>`).join('')}</div>
      <div class="mini-grid four">${['🔴','🔵','🟢','🟡'].map((c,i)=>`<button class="mini-choice" data-mini-action="memory-pick" data-v="${i}" ${g.showing?'disabled':''}>${c}</button>`).join('')}</div>
      <p>المستوى: ${g.seq.length}</p></div>`;
  } else if(g.id==='target'){
    body=`<div class="mini-box"><h3>اضغط على الهدف بأسرع ما يمكن!</h3><div class="target-grid">${Array.from({length:9},(_,i)=>`<button class="target-cell ${i===g.target?'is-target':''}" data-mini-action="target-pick" data-v="${i}">${i===g.target?'🎯':'·'}</button>`).join('')}</div></div>`;
  } else if(g.id==='snake'){
    body=`<div class="mini-box"><h3>اجمع الطعام 🟢</h3><div class="snake-grid">${Array.from({length:81},(_,i)=>{
      const x=i%9,y=Math.floor(i/9);
      const head=g.snake[0][0]===x&&g.snake[0][1]===y;
      const body=g.snake.some(p=>p[0]===x&&p[1]===y);
      const food=g.food[0]===x&&g.food[1]===y;
      return `<span class="snake-cell ${head?'snake-head':body?'snake-body':food?'snake-food':''}">${head?'🟢':food?'🍎':''}</span>`;
    }).join('')}</div><div class="snake-controls">
      <button data-mini-action="dir" data-v="0,-1">⬆️</button>
      <button data-mini-action="dir" data-v="-1,0">⬅️</button>
      <button data-mini-action="dir" data-v="0,1">⬇️</button>
      <button data-mini-action="dir" data-v="1,0">➡️</button></div></div>`;
  } else if(g.id==='shapes'){
    body=`<div class="mini-box"><h3>ما الشكل الذي يكمل النمط؟</h3><div class="shape-question">${g.question}</div><div class="mini-grid four">${g.options.map(x=>`<button class="mini-choice" data-mini-action="shape-pick" data-v="${x}">${x}</button>`).join('')}</div></div>`;
  } else if(g.id==='colors'){
    body=`<div class="mini-box"><h3>اضغط اللون: <b style="color:${g.color.hex}">${g.color.name}</b></h3><div class="mini-grid four">${g.options.map(c=>`<button class="mini-choice color-choice" style="background:${c.hex}" data-mini-action="color-pick" data-v="${c.name}">${c.name}</button>`).join('')}</div></div>`;
  } else if(g.id==='numbers'||g.id==='minute'){
    body=`<div class="mini-box"><h3>${g.id==='minute'?'تحدي الدقيقة!':'حل العملية الحسابية'}</h3><div class="shape-question">${g.question}</div><div class="mini-grid four">${g.options.map(x=>`<button class="mini-choice" data-mini-action="number-pick" data-v="${x}">${x}</button>`).join('')}</div></div>`;
  } else if(g.id==='dodge'){
    body=`<div class="mini-box runner-box">
      <h3>اركض، اقفز، واجمع العملات!</h3>
      <canvas class="runner-canvas" id="runnerCanvas" width="800" height="320" aria-label="ملعب الركض"></canvas>
      <div class="runner-controls">
        <button class="primary runner-button" data-mini-action="jump">⬆ قفز</button>
        <button class="tap runner-button" data-mini-action="slide">⬇ انزلاق</button>
      </div>
      <p class="runner-help">تجنّب الحواجز واجمع العملات الذهبية. يمكنك أيضًا استخدام المسافة للقفز.</p>
    </div>`;
  } else if(g.id==='gems'){
    body=`<div class="mini-box"><h3>اضغط الماسة 💎</h3><div class="target-grid">${Array.from({length:9},(_,i)=>`<button class="target-cell ${i===g.gem?'is-target':''}" data-mini-action="gem-pick" data-v="${i}">${i===g.gem?'💎':'·'}</button>`).join('')}</div></div>`;
  } else if(g.id==='cards'){
    body=`<div class="mini-box"><h3>اعثر على كل الأزواج</h3><p>المحاولات: ${g.moves}</p><div class="mini-grid cards-grid">${g.deck.map((c,i)=>`<button class="mini-choice card-choice" data-mini-action="card-pick" data-v="${i}" ${g.matched.includes(i)||g.open.includes(i)?'disabled':''}>${g.matched.includes(i)||g.open.includes(i)?c:'❔'}</button>`).join('')}</div></div>`;
  }

  shell(games.find(x=>x[0]===g.id)?.[2]||'لعبة',`
    ${panelStats()}${body}
    <div class="mini-actions">
      <button class="primary" data-mini-action="restart">🔄 إعادة اللعب</button>
      <button class="tap" data-mini-action="catalog">قائمة الألعاب</button>
    </div>`);
}


function startRunner(){
  if(!active || active.id!=='dodge' || !active.runner) return;
  const canvas=document.getElementById('runnerCanvas');
  if(!canvas) return;
  const ctx=canvas.getContext('2d');
  if(!ctx) return;

  const r=active.runner, W=canvas.width, H=canvas.height;
  r.ground=H-48;
  r.y=r.ground-48;
  r.last=0;

  const rounded=(x,y,w,h,rad,color)=>{
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.roundRect(x,y,w,h,rad);
    ctx.fill();
  };

  function frame(now){
    if(!active || active.id!=='dodge' || active.ended || !r.alive) {
      runnerRAF=null;
      return;
    }
    const dt=Math.min((now-(r.last||now))/1000,0.035);
    r.last=now;
    r.distance+=r.speed*dt;
    r.speed=Math.min(570,300+r.distance*0.018);
    r.spawn-=dt;
    r.coinSpawn-=dt;

    if(r.spawn<=0){
      const h=30+Math.random()*25, w=24+Math.random()*16;
      r.obstacles.push({x:W+20,y:r.ground-h,w,h});
      r.spawn=Math.max(0.72,1.35-r.speed/1000)+Math.random()*0.45;
    }
    if(r.coinSpawn<=0){
      r.coins.push({x:W+20,y:r.ground-75-Math.random()*95,r:10,taken:false});
      r.coinSpawn=1.1+Math.random()*1.1;
    }

    r.y+=r.vy*dt;
    r.vy+=1450*dt;
    if(r.y>=r.ground-48){r.y=r.ground-48;r.vy=0;}

    if(r.sliding>0) r.sliding-=dt;
    const playerH=r.sliding>0?25:48;
    const playerY=r.ground-playerH;

    for(const o of r.obstacles) o.x-=r.speed*dt;
    for(const c of r.coins) c.x-=r.speed*dt;
    r.obstacles=r.obstacles.filter(o=>o.x+o.w>-5);
    r.coins=r.coins.filter(c=>c.x+c.r>-5&&!c.taken);

    // خلفية متحركة
    const bg=ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#101a32');
    bg.addColorStop(1,'#263b58');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(95,150,220,.12)';
    for(let i=0;i<8;i++){
      const x=((i*137-r.distance*0.18)%(W+100)+W+100)%(W+100);
      ctx.fillRect(x,45+(i%3)*28,3,100);
    }
    ctx.fillStyle='#71849b';ctx.fillRect(0,r.ground,W,H-r.ground);
    ctx.fillStyle='#c4d2e1';
    for(let i=0;i<15;i++){
      const x=((i*75-r.distance)%(W+75)+W+75)%(W+75);
      ctx.fillRect(x,r.ground+19,34,4);
    }

    // العملات
    for(const c of r.coins){
      ctx.beginPath();ctx.arc(c.x,c.y,c.r,0,Math.PI*2);
      ctx.fillStyle='#ffd34e';ctx.fill();
      ctx.strokeStyle='#fff0a1';ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle='#805500';ctx.font='bold 13px sans-serif';
      ctx.textAlign='center';ctx.fillText('$',c.x,c.y+5);
      if(!c.taken && Math.abs(c.x-(r.x+18))<23 &&
         Math.abs(c.y-(playerY+playerH/2))<34){
        c.taken=true;active.score+=5;
      }
    }

    // الحواجز
    for(const o of r.obstacles){
      rounded(o.x,o.y,o.w,o.h,6,'#fa526d');
      rounded(o.x+4,o.y+5,Math.max(3,o.w-8),5,2,'#ffb0bb');
      ctx.fillStyle='#7e2039';
      ctx.fillRect(o.x+5,o.y+o.h-7,Math.max(2,o.w-10),5);
      const px=r.x+7, py=playerY+5, pw=28, ph=playerH-8;
      if(px<o.x+o.w-3 && px+pw>o.x+3 &&
         py<o.y+o.h-3 && py+ph>o.y+3){
        r.alive=false;
        endGame();
        return;
      }
    }

    // شخصية مرسومة داخل اللعبة
    const px=r.x, py=playerY;
    const bob=r.sliding>0?0:Math.sin(now/75)*3;
    // الظل
    ctx.beginPath();ctx.ellipse(px+20,r.ground+1,25,5,0,0,Math.PI*2);
    ctx.fillStyle='rgba(0,0,0,.25)';ctx.fill();
    if(r.sliding>0){
      rounded(px,py+5,43,20,9,'#55d9b4');
      ctx.beginPath();ctx.arc(px+39,py+9,8,0,Math.PI*2);
      ctx.fillStyle='#b7ffe9';ctx.fill();
    }else{
      // الساقان
      rounded(px+8,py+31+bob,10,17,4,'#5c91ff');
      rounded(px+25,py+31-bob,10,17,4,'#5c91ff');
      // الجسم والرأس
      rounded(px+5,py+12+bob,31,25,9,'#55d9b4');
      ctx.beginPath();ctx.arc(px+24,py+7+bob,12,0,Math.PI*2);
      ctx.fillStyle='#b7ffe9';ctx.fill();
      ctx.beginPath();ctx.arc(px+28,py+6+bob,2,0,Math.PI*2);
      ctx.fillStyle='#14233c';ctx.fill();
    }

    // تحديث النقاط دون إعادة رسم الصفحة
    const scoreEl=appRef?.querySelector('.mini-stats');
    if(scoreEl) scoreEl.innerHTML=`<span>⭐ النقاط: ${active.score}</span><span>⏱️ الوقت: ${active.time}ث</span>`;
    runnerRAF=requestAnimationFrame(frame);
  }
  runnerRAF=requestAnimationFrame(frame);
}

function runnerJump(){
  if(!active || active.id!=='dodge' || active.ended) return;
  const r=active.runner;
  if(r && r.y>=r.ground-48 && r.sliding<=0) r.vy=-590;
}
function runnerSlide(){
  if(!active || active.id!=='dodge' || active.ended) return;
  const r=active.runner;
  if(r && r.y>=r.ground-48) r.sliding=0.62;
}

function endGame(){
  if(!active||active.ended)return;
  active.ended=true;
  stopTimers();
  const g=active;
  shell('🏆 انتهت اللعبة',`
    <div class="mini-box center">
      <div class="result">${g.score}</div>
      <h3>${g.id==='cards'&&g.matched.length===16?'ممتاز! طابقت كل البطاقات 🎉':'أحسنت! انتهى التحدي'}</h3>
      <p>نتيجتك: ${g.score} نقطة</p>
      <button class="primary" data-mini-action="restart">🔄 العب مجددًا</button>
      <button class="tap" data-mini-action="catalog">🎮 ألعاب أخرى</button>
    </div>`);
}

function answer(ok){
  if(!active||active.ended)return;
  if(ok)active.score+=10;
  else active.score=Math.max(0,active.score-2);
}

function clickHandler(e){
  const b=e.target.closest('[data-mini-action]');
  if(!b||!appRef||!appRef.contains(b))return;
  const a=b.dataset.miniAction,v=b.dataset.v;
  if(a==='exit'){stopTimers();active=null;exitCallback?.();return;}
  if(a==='catalog'){renderCatalog();return;}
  if(a==='start'){start(b.dataset.id);return;}
  if(a==='restart'){if(active)start(active.id);return;}
  if(!active||active.ended)return;
  const g=active;

  if(a==='memory-pick'&&g.id==='memory'&&!g.showing){
    const n=Number(v);
    if(n!==g.seq[g.input.length]){
      g.score=Math.max(0,g.score-2);g.seq=[rand(4)];g.input=[];showSequence();return;
    }
    g.input.push(n);g.score+=5;
    if(g.input.length===g.seq.length){g.seq.push(rand(4));showSequence();return;}
    renderGame();return;
  }
  if(a==='target-pick'&&g.id==='target'){
    if(Number(v)===g.target){g.score+=10;g.target=rand(9);renderGame();}return;
  }
  if(a==='dir'&&g.id==='snake'){
    const d=v.split(',').map(Number);
    if(!(d[0]===-g.dir[0]&&d[1]===-g.dir[1]))g.nextDir=d;
    return;
  }
  if(a==='shape-pick'&&g.id==='shapes'){
    answer(v===g.answer);makeShapeQuestion();renderGame();return;
  }
  if(a==='color-pick'&&g.id==='colors'){
    answer(v===g.color.name);makeColorQuestion();renderGame();return;
  }
  if(a==='number-pick'&&(g.id==='numbers'||g.id==='minute')){
    answer(Number(v)===g.answer);makeNumberQuestion();renderGame();return;
  }
  if(a==='jump'&&g.id==='dodge'){runnerJump();return;}
  if(a==='slide'&&g.id==='dodge'){runnerSlide();return;}
  if(a==='gem-pick'&&g.id==='gems'){
    if(Number(v)===g.gem){g.score+=10;g.gem=rand(9);renderGame();}return;
  }
  if(a==='card-pick'&&g.id==='cards'&&!g.lock){
    const i=Number(v);
    if(g.open.includes(i)||g.matched.includes(i))return;
    g.open.push(i);
    if(g.open.length===2){
      g.moves++;
      if(g.deck[g.open[0]]===g.deck[g.open[1]]){
        g.matched.push(...g.open);g.score+=20;g.open=[];
        if(g.matched.length===16){endGame();return;}
      }else{
        g.lock=true;renderGame();
        setTimeout(()=>{if(active===g&&!g.ended){g.open=[];g.lock=false;renderGame();}},700);
        return;
      }
    }
    renderGame();return;
  }
}


function runnerKeyHandler(e){
  if(!active || active.id!=='dodge' || active.ended) return;
  if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if(e.code==='Space'||e.code==='ArrowUp'){
    e.preventDefault();runnerJump();
  }else if(e.code==='ArrowDown'){
    e.preventDefault();runnerSlide();
  }
}

export function renderMiniGames(app,onExit){
  appRef=app;exitCallback=onExit;
  if(!installed){
    document.addEventListener('click',clickHandler);
    document.addEventListener('keydown',runnerKeyHandler);
    installed=true;
  }
  renderCatalog();
}
