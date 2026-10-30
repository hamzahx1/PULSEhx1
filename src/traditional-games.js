import './style.css';
import { renderBadris } from './badris.js';
import { Chess } from 'chess.js';

const PIECES = {
  w: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
  b: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' }
};

const INITIAL_CHESS = [
  ['bR','bN','bB','bQ','bK','bB','bN','bR'],
  ['bP','bP','bP','bP','bP','bP','bP','bP'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['wP','wP','wP','wP','wP','wP','wP','wP'],
  ['wR','wN','wB','wQ','wK','wB','wN','wR']
];

let root, game = 'menu', selected = null, message = '';
let chessBoard, chessTurn, chessHistory, chessOver;
let chessEngine = null;
let chessMode = 'medium';
let chessThinking = false;
let chessFlipped = false;
let checkBoard, checkTurn, checkSelected, checkForced, checkOver;
let checkMode = 'medium';
let checkThinking = false;
let checkHistory = [];
let checkLast = null;
let checkTicket = 0;


const clone = x => JSON.parse(JSON.stringify(x));
const inside = (r,c) => r>=0 && r<8 && c>=0 && c<8;
const colorOf = p => p ? p[0] : null;
const opposite = c => c === 'w' ? 'b' : 'w';
const square = (r,c) => `${String.fromCharCode(97+c)}${8-r}`;

function chessStart() {
  chessEngine = new Chess();
  chessHistory = [];
  chessThinking = false;
  chessFlipped = false;
  selected = null;
  syncChessBoard();
  message = 'ابدأ اللعب بالأبيض';
  game = 'chess';
  draw();
}

function checkStart() {
  checkTicket++;
  checkBoard = Array.from({length:8}, (_,r) =>
    Array.from({length:8}, (_,c) =>
      (r+c)%2===1 && r<3 ? 'b' :
      (r+c)%2===1 && r>4 ? 'w' : null
    )
  );
  checkTurn = 'w';
  checkSelected = null;
  checkForced = null;
  checkOver = false;
  checkThinking = false;
  checkHistory = [];
  checkLast = null;
  message = 'دور الأحمر';
  game = 'checkers';
  draw();
}

function back() {
  game = 'menu';
  selected = null;
  draw();
}

function draw() {
  if (!root) return;
  if (game === 'menu') return menu();
  if (game === 'chess') return chessScreen();
  if (game === 'checkers') return checkScreen();

}

function menu() {
  root.innerHTML = `
    <section class="tg-wrap" dir="rtl">
      <header class="tg-header">
        <button class="tg-back" data-tg="exit">رجوع للرئيسية</button>
        <div class="tg-mark">PULSE <span>• ألعاب التراث</span></div>
        <h1>مجلس الألعاب ♟️</h1>
        <p>تحدَّ أصدقاءك على نفس الهاتف</p>
      </header>
      <div class="tg-cards">
          <button class="tg-card" data-tg="badris">
            <span class="tg-icon">⚪</span><strong>البدريس</strong>
            <small>الطواحين والتخطيط · 9 قطع لكل لاعب</small><b>ابدأ اللعب ←</b>
          </button>
        <button class="tg-card" data-tg="chess">
          <span class="tg-icon">♟️</span><strong>الشطرنج</strong>
          <small>تخطيط وتكتيك · لاعبان</small><b>ابدأ اللعب ←</b>
        </button>
        <button class="tg-card" data-tg="checkers">
          <span class="tg-icon">🔴</span><strong>الضامة</strong>
          <small>أكل القطع والترقية · لاعبان</small><b>ابدأ اللعب ←</b>
        </button>
        <button class="tg-card" data-tg="xo">
          <span class="tg-icon">❌⭕</span><strong>إكس أو (XO)</strong>
          <small>ضد الذكاء الاصطناعي أو لاعب آخر</small><b>ابدأ اللعب ←</b>
        </button>
        
      </div>
      <div class="tg-note">
        <span>✦</span>
        <div><strong>اللعب محلي</strong><p>لا تحتاج إلى حساب أو إنترنت للعب على الهاتف نفسه.</p></div>
      </div>
    </section>`;
}

function syncChessBoard() {
  if (!chessEngine) return;
  chessBoard = chessEngine.board().map(row =>
    row.map(p => p ? p.color + p.type.toUpperCase() : null)
  );
  chessTurn = chessEngine.turn();
  chessOver = chessEngine.isGameOver();
  chessHistory = chessEngine.history();
}

function chessScreen() {
  if (!chessEngine) chessEngine = new Chess();
  syncChessBoard();

  const legalMoves = selected
    ? chessEngine.moves({
        square: square(selected.r, selected.c),
        verbose: true
      })
    : [];

  const legalSquares = new Set(legalMoves.map(m => m.to));
  const history = chessEngine.history({ verbose: true });
  const last = history.length ? history[history.length - 1] : null;

  const rows = Array.from({length: 8}, (_, i) => i);
  const cols = Array.from({length: 8}, (_, i) => i);
  if (chessFlipped) {
    rows.reverse();
    cols.reverse();
  }

  const boardHTML = rows.map(r =>
    cols.map(c => {
      const p = chessBoard[r][c];
      const light = (r + c) % 2 === 0;
      const isSelected = selected && selected.r === r && selected.c === c;
      const sq = square(r, c);
      const legal = legalSquares.has(sq);
      const isLast = last && (last.from === sq || last.to === sq);
      const piece = p ? PIECES[p[0]][p[1]] : '';

      return `<button class="tg-square ${light ? 'light' : 'dark'} ${isSelected ? 'picked' : ''} ${legal ? 'legal' : ''} ${isLast ? 'chess-last' : ''}"
        data-chess="${r},${c}" aria-label="${sq}" ${chessThinking || chessOver ? 'disabled' : ''}>
        <span class="tg-piece ${p && p[0] === 'w' ? 'white-piece' : 'black-piece'}">${piece}</span>
        ${legal && p ? '<i class="chess-capture-ring"></i>' : ''}
        ${c === (chessFlipped ? 7 : 0) ? `<small class="chess-rank">${8-r}</small>` : ''}
        ${r === (chessFlipped ? 0 : 7) ? `<small class="chess-file">${String.fromCharCode(97+c)}</small>` : ''}
      </button>`;
    }).join('')
  ).join('');

  let status;
  if (chessThinking) {
    status = 'الكمبيوتر يفكر… 🤖';
  } else if (chessEngine.isCheckmate()) {
    status = `كش مات! فاز ${chessTurn === 'w' ? 'الأسود' : 'الأبيض'} 🏆`;
  } else if (chessEngine.isDraw()) {
    status = 'تعادل — انتهت المباراة';
  } else {
    status = `${chessMode === 'local' ? (chessTurn === 'w' ? 'دور الأبيض' : 'دور الأسود') :
      (chessTurn === 'w' ? 'دورك — الأبيض' : 'دور الكمبيوتر — الأسود')}`;
    if (chessEngine.isCheck()) status += ' · كش!';
  }

  root.innerHTML = `
    <section class="tg-wrap chess-premium" dir="rtl">
      <header class="tg-gamehead">
        <button class="tg-back" data-tg="menu">← الرئيسية</button>
        <div><span class="tg-eyebrow">PULSE · CHESS</span><h2>♟️ الشطرنج</h2></div>
        <button class="tg-back" data-tg="new-chess">لعبة جديدة</button>
      </header>

      <div class="chess-controls">
        <label for="chess-mode">طريقة اللعب</label>
        <select id="chess-mode" data-chess-mode ${chessThinking ? 'disabled' : ''}>
          <option value="easy" ${chessMode === 'easy' ? 'selected' : ''}>🟢 كمبيوتر سهل</option>
          <option value="medium" ${chessMode === 'medium' ? 'selected' : ''}>🟡 كمبيوتر متوسط</option>
          <option value="hard" ${chessMode === 'hard' ? 'selected' : ''}>🔴 كمبيوتر صعب</option>
          <option value="local" ${chessMode === 'local' ? 'selected' : ''}>👥 لاعبان على الهاتف</option>
        </select>
      </div>

      <div class="tg-status ${chessEngine.isCheck() && !chessOver ? 'chess-check' : ''}">${status}</div>
      <div class="tg-board chess-board" dir="ltr">${boardHTML}</div>
      <p class="tg-hint">${chessMode === 'local'
        ? 'اختر قطعة من لون الدور، ثم اضغط مربع الوصول.'
        : 'أنت الأبيض والكمبيوتر الأسود. اضغط قطعة ثم اختر إحدى الحركات المضيئة.'}</p>
      <div class="tg-legend"><span>♔ الأبيض</span><span>♚ الأسود</span></div>
      <div class="chess-actions">
        <button class="tg-back" data-tg="chess-undo" ${chessThinking || !history.length ? 'disabled' : ''}>↶ تراجع</button>
        <button class="tg-back" data-tg="chess-flip">⟳ تدوير الرقعة</button>
      </div>
    </section>`;
}

function chessEvaluate() {
  const values = {p:100, n:320, b:335, r:500, q:900, k:20000};
  let score = 0;
  const board = chessEngine.board();

  for (let r=0; r<8; r++) {
    for (let c=0; c<8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const sign = p.color === 'b' ? 1 : -1;
      let positional = 0;

      if (p.type === 'p') positional = (p.color === 'b' ? r : 7-r) * 7;
      if (['n','b'].includes(p.type)) {
        positional = (3.5 - Math.abs(3.5-c)) * 4 +
                     (3.5 - Math.abs(3.5-r)) * 4;
      }

      score += sign * (values[p.type] + positional);
    }
  }

  if (chessEngine.isCheckmate()) {
    return chessEngine.turn() === 'b' ? -100000 : 100000;
  }
  return score;
}

function chessSearch(depth, alpha, beta, maximizing) {
  if (depth === 0 || chessEngine.isGameOver()) return chessEvaluate();

  const moves = chessEngine.moves({verbose: true});
  moves.sort((a,b) =>
    ((b.captured ? 1 : 0) - (a.captured ? 1 : 0)) * 100 +
    ((b.promotion ? 1 : 0) - (a.promotion ? 1 : 0)) * 500
  );

  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      chessEngine.move({from:m.from, to:m.to, promotion:m.promotion || 'q'});
      best = Math.max(best, chessSearch(depth-1, alpha, beta, false));
      chessEngine.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const m of moves) {
    chessEngine.move({from:m.from, to:m.to, promotion:m.promotion || 'q'});
    best = Math.min(best, chessSearch(depth-1, alpha, beta, true));
    chessEngine.undo();
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function chessComputerMove() {
  if (!chessEngine || chessEngine.isGameOver() ||
      chessMode === 'local' || chessEngine.turn() !== 'b') return;

  chessThinking = true;
  selected = null;
  draw();

  const mode = chessMode;
  setTimeout(() => {
    if (!root || game !== 'chess' || !chessEngine ||
        chessEngine.isGameOver() || chessEngine.turn() !== 'b') {
      chessThinking = false;
      return;
    }

    const moves = chessEngine.moves({verbose: true});
    if (!moves.length) {
      chessThinking = false;
      draw();
      return;
    }

    let chosen;
    if (mode === 'easy') {
      chosen = moves[Math.floor(Math.random() * moves.length)];
    } else {
      const depth = mode === 'hard' ? 3 : 2;
      let best = -Infinity;
      const candidates = [];

      for (const m of moves) {
        chessEngine.move({from:m.from, to:m.to, promotion:m.promotion || 'q'});
        const score = chessSearch(depth-1, -Infinity, Infinity, false);
        chessEngine.undo();

        if (score > best) {
          best = score;
          candidates.length = 0;
          candidates.push(m);
        } else if (score === best) {
          candidates.push(m);
        }
      }

      chosen = candidates[Math.floor(Math.random() * candidates.length)];
    }

    if (chosen) {
      chessEngine.move({
        from: chosen.from,
        to: chosen.to,
        promotion: chosen.promotion || 'q'
      });
    }

    chessThinking = false;
    selected = null;
    syncChessBoard();
    draw();
  }, 60);
}

function chessClick(r, c) {
  if (!chessEngine || chessThinking || chessEngine.isGameOver()) return;
  if (chessMode !== 'local' && chessEngine.turn() === 'b') return;

  const p = chessBoard[r][c];
  const target = square(r,c);

  if (selected) {
    const from = square(selected.r, selected.c);
    const moves = chessEngine.moves({square:from, verbose:true});
    const move = moves.find(m => m.to === target);

    if (move) {
      chessEngine.move({from, to:target, promotion:'q'});
      selected = null;
      syncChessBoard();
      draw();

      if (chessMode !== 'local' && !chessEngine.isGameOver()) {
        chessComputerMove();
      }
      return;
    }
  }

  if (p && p[0] === chessEngine.turn()) selected = {r,c};
  else selected = null;

  draw();
}

// PULSE Checkers engine: mandatory captures and multi-jumps.
function checkPieceMoves(board,r,c,capturesOnly=false) {
  const p=board[r]?.[c];
  if(!p)return [];
  const color=p.toLowerCase();
  const king=p!==color;
  const dirs=king
    ? [[-1,-1],[-1,1],[1,-1],[1,1]]
    : color==='w' ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]];
  const moves=[],captures=[];
  for(const [dr,dc] of dirs) {
    const nr=r+dr,nc=c+dc;
    if(!inside(nr,nc))continue;
    const target=board[nr][nc];
    if(!target) {
      if(!capturesOnly)moves.push({r:nr,c:nc});
    } else if(target.toLowerCase()!==color &&
      inside(nr+dr,nc+dc) && !board[nr+dr][nc+dc]) {
      captures.push({r:nr+dr,c:nc+dc,cap:{r:nr,c:nc}});
    }
  }
  return captures.length ? captures : capturesOnly ? [] : moves;
}

function checkAllMoves(board,color,forced=null) {
  if(forced) {
    return checkPieceMoves(board,forced.r,forced.c,true)
      .map(m=>({...m,from:{...forced}}));
  }
  const captures=[],ordinary=[];
  for(let r=0;r<8;r++)for(let c=0;c<8;c++) {
    const p=board[r][c];
    if(!p||p.toLowerCase()!==color)continue;
    for(const m of checkPieceMoves(board,r,c)) {
      const move={...m,from:{r,c}};
      (m.cap?captures:ordinary).push(move);
    }
  }
  return captures.length ? captures : ordinary;
}

function checkMoves(r,c) {
  if(checkOver)return [];
  return checkAllMoves(checkBoard,checkTurn,checkForced)
    .filter(m=>m.from.r===r&&m.from.c===c);
}

function checkApply(board,move) {
  const next=board.map(row=>row.slice());
  const p=next[move.from.r][move.from.c];
  next[move.from.r][move.from.c]=null;
  next[move.r][move.c]=p;
  if(move.cap)next[move.cap.r][move.cap.c]=null;
  let promoted=false;
  if(p==='w'&&move.r===0 || p==='b'&&move.r===7) {
    next[move.r][move.c]=p.toUpperCase();
    promoted=true;
  }
  return {board:next,promoted};
}

function checkSave() {
  checkHistory.push({
    board:checkBoard.map(row=>row.slice()),
    turn:checkTurn,
    forced:checkForced?{...checkForced}:null,
    last:checkLast?{...checkLast}:null,
    message,
    over:checkOver
  });
}

function checkFinishTurn() {
  checkTurn=opposite(checkTurn);
  checkSelected=null;
  checkForced=null;
  const legal=checkAllMoves(checkBoard,checkTurn);
  if(!legal.length) {
    checkOver=true;
    message=`فاز ${checkTurn==='w'?'الأزرق':'الأحمر'} 🏆`;
  } else {
    message=`دور ${checkTurn==='w'?'الأحمر':'الأزرق'}`;
  }
}

function checkClick(r,c) {
  if(checkOver||checkThinking||
    (checkMode!=='local'&&checkTurn==='b'))return;
  const p=checkBoard[r][c];
  if(checkSelected) {
    const move=checkMoves(checkSelected.r,checkSelected.c)
      .find(m=>m.r===r&&m.c===c);
    if(move) {
      checkSave();
      const result=checkApply(checkBoard,move);
      checkBoard=result.board;
      checkLast={from:move.from,to:{r,c}};
      if(move.cap&&!result.promoted) {
        const more=checkPieceMoves(checkBoard,r,c,true);
        if(more.length) {
          checkSelected={r,c};
          checkForced={r,c};
          message='تابع الأكل بنفس القطعة';
          draw();
          return;
        }
      }
      checkFinishTurn();
      draw();
      if(!checkOver&&checkMode!=='local')checkComputerMove();
      return;
    }
  }
  if(p&&p.toLowerCase()===checkTurn&&
    (!checkForced||(checkForced.r===r&&checkForced.c===c))) {
    checkSelected={r,c};
    message=checkMoves(r,c).length
      ? 'اختر المربع المضيء'
      : 'الأكل إجباري: اختر قطعة تستطيع الأكل';
  } else if(!checkForced)checkSelected=null;
  draw();
}

function checkScore(board) {
  let score=0;
  for(let r=0;r<8;r++)for(let c=0;c<8;c++) {
    const p=board[r][c];
    if(!p)continue;
    const king=p!==p.toLowerCase();
    const value=(king?175:100)+(king?0:
      p.toLowerCase()==='b'?r*3:(7-r)*3);
    score+=(p.toLowerCase()==='b'?value:-value);
  }
  return score;
}

function checkSearch(board,color,depth,alpha,beta,forced=null) {
  const moves=checkAllMoves(board,color,forced);
  if(!moves.length)return color==='b'?-100000-depth:100000+depth;
  if(depth<=0&&!forced)return checkScore(board);
  const maximizing=color==='b';
  let best=maximizing?-Infinity:Infinity;
  for(const move of moves) {
    const result=checkApply(board,move);
    const nextForced=move.cap&&!result.promoted&&
      checkPieceMoves(result.board,move.r,move.c,true).length
      ? {r:move.r,c:move.c}:null;
    const value=checkSearch(
      result.board,nextForced?color:opposite(color),
      nextForced?depth:depth-1,alpha,beta,nextForced
    );
    best=maximizing?Math.max(best,value):Math.min(best,value);
    if(maximizing)alpha=Math.max(alpha,best);
    else beta=Math.min(beta,best);
    if(beta<=alpha)break;
  }
  return best;
}

function checkComputerMove() {
  if(checkOver||checkMode==='local'||checkTurn!=='b')return;
  const ticket=++checkTicket;
  checkThinking=true;
  message='🤖 الكمبيوتر يفكر...';
  draw();
  setTimeout(()=>{
    if(ticket!==checkTicket||game!=='checkers'||checkTurn!=='b')return;
    checkThinking=false;
    const moves=checkAllMoves(checkBoard,'b',checkForced);
    if(!moves.length) {
      checkOver=true;message='فاز الأحمر 🏆';draw();return;
    }
    let chosen;
    if(checkMode==='easy') {
      chosen=moves[Math.floor(Math.random()*moves.length)];
    } else {
      const depth=checkMode==='hard'?4:2;
      let best=-Infinity;
      for(const move of moves) {
        const result=checkApply(checkBoard,move);
        const forced=move.cap&&!result.promoted&&
          checkPieceMoves(result.board,move.r,move.c,true).length
          ? {r:move.r,c:move.c}:null;
        const value=checkSearch(
          result.board,forced?'b':'w',
          forced?depth:depth-1,-Infinity,Infinity,forced
        )+Math.random()*0.01;
        if(value>best){best=value;chosen=move;}
      }
    }
    checkSave();
    const result=checkApply(checkBoard,chosen);
    checkBoard=result.board;
    checkLast={from:chosen.from,to:{r:chosen.r,c:chosen.c}};
    if(chosen.cap&&!result.promoted&&
      checkPieceMoves(checkBoard,chosen.r,chosen.c,true).length) {
      checkForced={r:chosen.r,c:chosen.c};
      draw();
      checkComputerMove();
      return;
    }
    checkFinishTurn();
    draw();
  },90);
}

function checkScreen() {
  const legal=checkSelected
    ? checkMoves(checkSelected.r,checkSelected.c):[];
  const html=checkBoard.map((row,r)=>row.map((p,c)=>{
    const dark=(r+c)%2===1;
    const picked=checkSelected&&checkSelected.r===r&&checkSelected.c===c;
    const destination=legal.find(m=>m.r===r&&m.c===c);
    const last=checkLast&&(
      checkLast.from.r===r&&checkLast.from.c===c||
      checkLast.to.r===r&&checkLast.to.c===c
    );
    const king=p&&p!==p.toLowerCase();
    const color=p?.toLowerCase();
    return `<button class="tg-square ${dark?'dark':'light'}
      ${picked?'picked':''} ${destination?'legal':''}
      ${last?'check-last':''}" data-check="${r},${c}"
      ${checkOver||checkThinking?'disabled':''}>
      ${p?`<span class="check-disc ${color==='w'?'check-red':'check-blue'}
      ${king?'check-king':''}">${king?'♛':''}</span>`:''}
      ${destination?.cap?'<span class="check-capture-ring"></span>':''}
      </button>`;
  }).join('')).join('');
  root.innerHTML=`<section class="tg-wrap check-premium" dir="rtl">
    <header class="tg-gamehead">
      <button class="tg-back" data-tg="menu">← الرئيسية</button>
      <div><span class="tg-eyebrow">PULSE · PREMIUM</span>
      <h2>🔴 الضامّة</h2></div>
      <button class="tg-back" data-tg="new-check">لعبة جديدة</button>
    </header>
    <div class="check-controls">
      <label for="check-mode">🎮 نمط اللعب</label>
      <select id="check-mode" data-check-mode>
        <option value="easy" ${checkMode==='easy'?'selected':''}>🤖 سهل</option>
        <option value="medium" ${checkMode==='medium'?'selected':''}>🤖 متوسط</option>
        <option value="hard" ${checkMode==='hard'?'selected':''}>🤖 صعب</option>
        <option value="local" ${checkMode==='local'?'selected':''}>👥 لاعبان</option>
      </select>
    </div>
    <div class="tg-status">${message}</div>
    <div class="tg-board check-board" dir="ltr">${html}</div>
    <div class="check-actions">
      <button class="tg-back" data-tg="check-undo"
      ${!checkHistory.length||checkThinking?'disabled':''}>↶ تراجع</button>
      <button class="tg-back" data-tg="new-check">🔄 إعادة اللعب</button>
    </div>
    <p class="tg-hint">الأكل إجباري، ويمكن متابعة الأكل.
    الأحمر يبدأ أولاً 🔴</p>
    <div class="tg-legend"><span>🔴 أنت</span><span>🔵 ${checkMode==='local'?'اللاعب الثاني':'الكمبيوتر'}</span></div>
  </section>`;
}

export function renderTraditionalGames(app, onExit, initialGame='chess', onXO=()=>{}) {
  root=app;
  if(initialGame==='chess')chessStart();
  else if(initialGame==='checkers')checkStart();
  else if(initialGame==='badris'){
    game='badris';
    renderBadris(root,onExit);
  }
  else chessStart();
  const click = e => {
    const b=e.target.closest('button');
    if(!b)return;
    if(b.dataset.tg) {
      const a=b.dataset.tg;
      if(a==='chess-undo') {
        if(chessEngine && !chessThinking && chessEngine.history().length) {
          chessEngine.undo();
          if(chessMode !== 'local' && chessEngine.turn() === 'b' && chessEngine.history().length) {
            chessEngine.undo();
          }
          selected = null;
          syncChessBoard();
          draw();
        }
        return;
      }
      if(a==='chess-flip') {
        chessFlipped = !chessFlipped;
        draw();
        return;
      }
      if(a==='exit'){onExit();return;}
      if(a==='xo'){onXO();return;}
      if(a==='menu'){onExit();return;}
      if(a==='badris'){renderBadris(root,()=>draw());return;}
      if(a==='chess'){chessStart();return;}
      if(a==='checkers'){checkStart();return;}

      if(a==='new-chess'){chessStart();return;}
      if(a==='new-check'){checkStart();return;}
      if(a==='check-undo') {
        if(checkHistory.length&&!checkThinking) {
          checkTicket++;
          let state=checkHistory.pop();
          if(checkMode!=='local'&&state.turn==='b'&&checkHistory.length)
            state=checkHistory.pop();
          checkBoard=state.board;
          checkTurn=state.turn;
          checkForced=state.forced;
          checkLast=state.last;
          checkOver=state.over;
          message=state.message;
          checkSelected=null;
          checkThinking=false;
          draw();
        }
        return;
      }


    }
    if(b.dataset.chess) {
      const [r,c]=b.dataset.chess.split(',').map(Number);
      chessClick(r,c);return;
    }
    if(b.dataset.check) {
      const [r,c]=b.dataset.check.split(',').map(Number);
      checkClick(r,c);return;
    }
  };
  root.addEventListener('click',click);
  const change = e => {
    if (e.target && e.target.matches('[data-check-mode]')) {
      checkMode=e.target.value;
      checkStart();
      return;
    }
    if (e.target && e.target.matches('[data-chess-mode]')) {
      chessMode = e.target.value;
      chessStart();
    }
  };
  root.addEventListener('change',change);
  draw();
  return () => {
    root.removeEventListener('click',click);
    root.removeEventListener('change',change);
    root=null;
  };
}
