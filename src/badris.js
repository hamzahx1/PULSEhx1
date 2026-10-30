import './style.css';

const POS = [
  [0,0],[3,0],[6,0],[1,1],[3,1],[5,1],
  [2,2],[3,2],[4,2],[0,3],[1,3],[2,3],
  [4,3],[5,3],[6,3],[2,4],[3,4],[4,4],
  [1,5],[3,5],[5,5],[0,6],[3,6],[6,6],
  [3,3]
];

const ADJ = [
  [1,9],[0,2,4],[1,14],[4,10],[1,3,5,7],[4,13],
  [7,11],[4,6,8,24],[7,12],[0,10,21],[3,9,11,18],
  [6,10,15,24],[8,13,17,24],[5,12,14,20],[2,13,23],
  [11,16],[15,17,19,24],[12,16],[10,19],[16,18,20,22],
  [13,19],[9,22],[19,21,23],[14,22],
  [7,11,12,16]
];

const MILLS = [
  [0,1,2],[3,4,5],[6,7,8],[9,10,11],
  [12,13,14],[15,16,17],[18,19,20],[21,22,23],
  [0,9,21],[3,10,18],[6,11,15],[1,4,7],
  [16,19,22],[8,12,17],[5,13,20],[2,14,23],
  [7,24,16],[11,24,12]
];

let root, cleanup;
let board, turn, phase, placed, selected, removing;
let mode='ai', difficulty='medium', over=false, message='';
let aiBusy=false;
let stats={};

function freshGame(){
  board=Array(25).fill('');
  turn='w';
  phase='place';
  placed={w:0,b:0};
  selected=null;
  removing=false;
  over=false;
  aiBusy=false;
  message='دور الأبيض: ضع قطعة على نقطة فارغة';
  draw();
}

function other(c){return c==='w'?'b':'w';}
function count(c){return board.filter(x=>x===c).length;}
function millsAt(i,c,b=board){
  return MILLS.some(line=>line.includes(i)&&line.every(n=>b[n]===c));
}
function inMill(i,c){
  return millsAt(i,c);
}
function allMoves(c,b=board,phaseNow=phase){
  const pieces=b.map((v,i)=>v===c?i:-1).filter(i=>i>=0);
  const empty=b.map((v,i)=>v===''?i:-1).filter(i=>i>=0);
  if(phaseNow==='place') return empty.map(to=>({from:-1,to}));
  const moves=[];
  for(const from of pieces){
    const targets=countOnBoard(c,b)===3?empty:ADJ[from].filter(to=>b[to]==='');
    for(const to of targets)moves.push({from,to});
  }
  return moves;
}
function countOnBoard(c,b){return b.filter(x=>x===c).length;}
function protectedPiece(i,c,b=board){
  return millsAt(i,c,b);
}
function removable(c,b=board){
  const enemies=b.map((v,i)=>v===c?i:-1).filter(i=>i>=0);
  const outside=enemies.filter(i=>!protectedPiece(i,c,b));
  return outside.length?outside:enemies;
}
function createsMill(to,c,b=board){
  return MILLS.some(line=>line.includes(to)&&line.every(i=>b[i]===c));
}
function finishTurn(){
  if(placed.w===9&&placed.b===9)phase='move';
  const n=count(other(turn));
  if(n<3&&phase!=='place'){
    over=true;message=`🏆 فاز ${turn==='w'?'الأبيض':'الأسود'}!`;
    draw();return;
  }
  if(phase!=='place'&&allMoves(other(turn)).length===0){
    over=true;message=`🏆 فاز ${turn==='w'?'الأبيض':'الأسود'}: لا توجد حركات قانونية`;
    draw();return;
  }
  turn=other(turn);
  selected=null;
  message=`دور ${turn==='w'?'الأبيض':'الأسود'}`;
  draw();
  maybeAI();
}
function performMove(from,to){
  if(over||aiBusy)return;
  if(phase==='place'){
    if(board[to]!=='')return;
    board[to]=turn;
    placed[turn]++;
  }else{
    if(from<0||board[from]!==turn||board[to]!=='')return;
    if(count(turn)!==3&&!ADJ[from].includes(to))return;
    board[from]='';
    board[to]=turn;
  }
  selected=null;
  if(createsMill(to,turn)){
    removing=true;
    if(mode==='ai' && turn==='b'){
      const opts=removable('w');
      if(opts.length) board[opts[0]]='';
      removing=false;
      if(placed.w===9&&placed.b===9) phase='move';
      finishTurn();
      return;
    }
    message=`طاحونة! اختر قطعة من ${other(turn)==='w'?'الأبيض':'الأسود'} لإزالتها`;
    draw();return;
  }
  finishTurn();
}
function removePiece(i){
  if(!removing||board[i]!==other(turn))return;
  const options=removable(other(turn));
  if(!options.includes(i))return;
  board[i]='';
  removing=false;
  if(phase==='place'&&placed.w===9&&placed.b===9)phase='move';
  finishTurn();
}
function handlePoint(i){
  if(over||aiBusy||(mode==='ai'&&turn==='b'))return;
  if(removing){removePiece(i);return;}
  if(phase==='place'){
    if(board[i]==='')performMove(-1,i);
    return;
  }
  if(selected===null){
    if(board[i]===turn){selected=i;draw();}
    return;
  }
  if(i===selected){selected=null;draw();return;}
  if(board[i]===turn){selected=i;draw();return;}
  if(board[i]===''){
    if(count(turn)===3||ADJ[selected].includes(i))performMove(selected,i);
  }
}
function evaluate(b,c){
  const enemy=other(c);
  let score=0;
  for(const line of MILLS){
    const mine=line.filter(i=>b[i]===c).length;
    const theirs=line.filter(i=>b[i]===enemy).length;
    if(mine===3)score+=80;
    else if(mine===2&&theirs===0)score+=12;
    if(theirs===2&&mine===0)score-=17;
  }
  score+=(countOnBoard(c,b)-countOnBoard(enemy,b))*8;
  return score;
}
function aiChoose(){
  const moves=allMoves('b');
  if(!moves.length)return null;
  const scored=moves.map(m=>{
    const b=board.slice();
    if(m.from>=0)b[m.from]='';
    b[m.to]='b';
    let score=evaluate(b,'b')+Math.random()*4;
    if(createsMill(m.to,'b',b))score+=30;
    if(m.from>=0&&createsMill(m.from,'b',board))score-=2;
    if(difficulty==='easy')score=Math.random()*100;
    if(difficulty==='medium')score+=Math.random()*15;
    if(difficulty==='hard'){
      const replies=allMoves('w',b,phase).map(r=>{
        const next=b.slice();
        if(r.from>=0)next[r.from]='';
        next[r.to]='w';
        return evaluate(next,'b');
      });
      if(replies.length)score-=Math.max(...replies)*0.35;
    }
    return {m,score};
  }).sort((a,b)=>b.score-a.score);
  return scored[0].m;
}
function maybeAI(){
  if(mode!=='ai'||turn!=='b'||over)return;
  aiBusy=true;
  draw();
  setTimeout(()=>{
    if(!root||over||mode!=='ai'||turn!=='b')return;
    if(removing){
      const opts=removable('w');
      if(opts.length)board[opts[0]]='';
      removing=false;
      aiBusy=false;
      finishTurn();
      return;
    }
    const m=aiChoose();
    aiBusy=false;
    if(!m){over=true;message='🏆 فاز الأبيض!';draw();return;}
    performMove(m.from,m.to);
  },350);
}
function boardHTML(){
  return POS.map(([x,y],i)=>{
    const chosen=selected===i?' selected':'';
    const piece=board[i]==='w'?'⚪':board[i]==='b'?'⚫':'';
    const left=5+x*15,top=5+y*15;
    return `<button class="bd-point${chosen}" data-bdpoint="${i}"
      style="left:${left}%;top:${top}%">${piece}</button>`;
  }).join('');
}
function draw(){
  if(!root)return;
  const placedText=`الأبيض ${placed.w}/9 · الأسود ${placed.b}/9`;
  root.innerHTML=`
  <section dir="rtl" style="max-width:600px;margin:auto;padding:16px;color:#fff">
    <header style="display:flex;justify-content:space-between;align-items:center;gap:8px">
      <button class="tg-back" data-bd="exit">رجوع</button>
      <h2>⚪ البدريس</h2>
      <button class="tg-back" data-bd="new">جديدة</button>
    </header>
    ${gameMenu? '' : ''}
    <div style="display:flex;gap:8px;margin:12px 0">
      <button class="tg-back" data-bdmode="ai">🤖 ضد الكمبيوتر</button>
      <button class="tg-back" data-bdmode="local">👥 لاعبان</button>
    </div>
    ${mode==='ai'?`<div style="display:flex;gap:6px;margin:10px 0">
      <button class="tg-back ${difficulty==='easy'?'bd-diff-active':''}" data-bddiff="easy">🟢 سهل</button>
      <button class="tg-back ${difficulty==='medium'?'bd-diff-active':''}" data-bddiff="medium">🟡 متوسط</button>
      <button class="tg-back ${difficulty==='hard'?'bd-diff-active':''}" data-bddiff="hard">🔴 صعب</button>
    </div>`:''}
    <p class="tg-status">${message}</p>
    <p style="text-align:center">${phase==='place'?'مرحلة تنزيل القطع':count(turn)===3?'مرحلة التحليق':'مرحلة التحريك'} · ${placedText}</p>
    <div class="bd-board">
      <div class="bd-square outer"></div><div class="bd-square middle"></div><div class="bd-square inner"></div>
      <svg class="bd-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1="50" y1="5" x2="50" y2="20"/>
        <line x1="50" y1="20" x2="50" y2="35"/>
        <line x1="50" y1="35" x2="50" y2="50"/>
        <line x1="50" y1="50" x2="50" y2="65"/>
        <line x1="50" y1="65" x2="50" y2="80"/>
        <line x1="50" y1="80" x2="50" y2="95"/>

        <line x1="5" y1="50" x2="20" y2="50"/>
        <line x1="20" y1="50" x2="35" y2="50"/>
        <line x1="35" y1="50" x2="50" y2="50"/>
        <line x1="50" y1="50" x2="65" y2="50"/>
        <line x1="65" y1="50" x2="80" y2="50"/>
        <line x1="80" y1="50" x2="95" y2="50"/>
      </svg>${boardHTML()}
    </div>
    <p class="tg-hint">كوّن خطًا من ثلاث قطع لإزالة قطعة من الخصم. القطع داخل الطاحونة محمية إلا إذا كانت جميع قطع الخصم ضمن طواحين.</p>
    <button class="tg-primary" data-bd="new">↻ مباراة جديدة</button>
  </section>
  <style>
  .bd-board{position:relative;width:min(88vw,470px);aspect-ratio:1;margin:18px auto;background:#e2c397;border-radius:8px;overflow:hidden}
  .bd-square{position:absolute;border:3px solid #75543a;box-sizing:border-box;pointer-events:none}
  .bd-square.outer{inset:5%}
  .bd-square.middle{inset:20%}
  .bd-square.inner{inset:35%}
  .bd-lines{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1}.bd-lines line{stroke:#75543a;stroke-width:.8}
  .bd-point{position:absolute;transform:translate(-50%,-50%);width:10%;height:10%;max-width:44px;max-height:44px;min-width:28px;min-height:28px;border-radius:50%;border:2px solid #866344;background:#f8e5c8;font-size:clamp(16px,5vw,30px);display:flex;align-items:center;justify-content:center;padding:0;z-index:2;box-sizing:border-box}
  .bd-diff-active{background:#174c78!important;border:2px solid #60a5fa!important;color:#fff!important;box-shadow:0 0 0 2px #60a5fa55,0 0 14px #3b82f680;font-weight:800}
.bd-point.selected{outline:4px solid #2563eb}
  </style>`;
}
let gameMenu=false;
export function renderBadris(app,onExit){
  root=app;
  mode='ai';
  cleanup=null;
  freshGame();
  const click=e=>{
    const b=e.target.closest('button');
    if(!b)return;
    if(b.dataset.bd==='exit'){root.removeEventListener('click',click);root=null;onExit();return;}
    if(b.dataset.bd==='new'){freshGame();return;}
    if(b.dataset.bdmode){
      mode=b.dataset.bdmode;freshGame();return;
    }
    if(b.dataset.bddiff){difficulty=b.dataset.bddiff;draw();return;}
    if(b.dataset.bdpoint!==undefined){handlePoint(Number(b.dataset.bdpoint));return;}
  };
  root.addEventListener('click',click);
  cleanup=()=>root?.removeEventListener('click',click);
  return cleanup;
}
