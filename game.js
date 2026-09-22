const board = document.querySelector('#gameBoard');
const startButton = document.querySelector('#startButton');
const scoreElement = document.querySelector('#score');
const bestScoreElement = document.querySelector('#bestScore');
const timeElement = document.querySelector('#time');
const livesElement = document.querySelector('#lives');
const savedElement = document.querySelector('#saved');
const messageElement = document.querySelector('#message');
const roundLabel = document.querySelector('#roundLabel');
const difficultySelect = document.querySelector('#difficultySelect');
let botDifficulty = difficultySelect.value;
difficultySelect.addEventListener('change', () => { botDifficulty = difficultySelect.value; });

const games = [
  ['SNAKE', '↝', '2004'], ['PAC-MAP', '●', '2010'], ['PONY', '♞', '2014'], ['SPACE', '✦', '2012'],
  ['MINE', '◆', '2015'], ['BASKET', '◒', '2012'], ['GARDEN', '✿', '2011'], ['CUBE', '▦', '2018'],
  ['MUSIC', '♫', '2019'], ['JUMP', '↟', '2013'], ['BLOB', '●', '2016'], ['BIRD', '⌁', '2020']
];
let timerId;
let decayId;
let running = false;
let score = 0;
let saved = 0;
let lives = 3;
let timeLeft = 45;
let bestScore = Number(localStorage.getItem('expiredGamesBest') || 0);

bestScoreElement.textContent = String(bestScore).padStart(6, '0');

function makeTile(game, index) {
  const tile = document.createElement('button');
  const isCorrupt = Math.random() < 0.18;
  tile.type = 'button';
  tile.className = `game-tile${isCorrupt ? ' corrupt' : ''}`;
  tile.dataset.corrupt = String(isCorrupt);
  tile.style.animationDelay = `${index * 35}ms`;
  tile.innerHTML = `<span class="tile-code">${isCorrupt ? 'ERR_404' : `DGL_${game[2]}`}</span><span class="tile-icon" aria-hidden="true">${isCorrupt ? '×' : game[1]}</span><span class="tile-title">${isCorrupt ? 'LINK LOST' : game[0]}</span><span class="tile-year">${isCorrupt ? 'ARCHIVE ERROR' : `DOODLE / ${game[2]}`}</span>`;
  tile.addEventListener('click', () => handleTile(tile));
  return tile;
}

function fillBoard() {
  board.innerHTML = '';
  const shuffled = [...games].sort(() => Math.random() - .5);
  shuffled.forEach((game, index) => board.appendChild(makeTile(game, index)));
}

function handleTile(tile) {
  if (!running || tile.classList.contains('saved') || tile.classList.contains('missed')) return;
  if (tile.dataset.corrupt === 'true') {
    loseLife(tile);
    return;
  }
  const bonus = tile.classList.contains('fading') ? 25 : 10;
  score += bonus;
  saved += 1;
  scoreElement.textContent = String(score).padStart(6, '0');
  savedElement.textContent = String(saved).padStart(2, '0');
  tile.classList.add('saved');
  messageElement.textContent = `+${bonus} archive points. Keep going.`;
  if (saved % 4 === 0) messageElement.textContent = 'Nice recovery. The archive remembers.';
}

function loseLife(tile) {
  lives -= 1;
  tile.classList.add('missed');
  livesElement.textContent = `${'● '.repeat(lives)}${'○ '.repeat(3 - lives)}`.trim();
  messageElement.textContent = 'That link was corrupted. Watch the red tiles.';
  if (lives <= 0) endGame('Archive corrupted.');
}

function decayRandomTile() {
  if (!running) return;
  const available = [...board.querySelectorAll('.game-tile:not(.saved):not(.missed)')];
  if (!available.length) return;
  const tile = available[Math.floor(Math.random() * available.length)];
  tile.classList.add('fading');
  setTimeout(() => {
    if (running && !tile.classList.contains('saved') && !tile.classList.contains('missed')) {
      tile.classList.add('missed');
      loseLife(tile);
    }
  }, 3300);
}

function startGame() {
  clearInterval(timerId);
  clearInterval(decayId);
  score = 0; saved = 0; lives = 3; timeLeft = 45; running = true;
  scoreElement.textContent = '000000';
  savedElement.textContent = '00';
  livesElement.textContent = '● ● ●';
  timeElement.textContent = '45.0';
  roundLabel.textContent = 'RESTORE IN PROGRESS';
  startButton.innerHTML = '<span>↻</span> restart archive';
  messageElement.textContent = 'Find the recoverable tiles.';
  fillBoard();
  timerId = setInterval(() => {
    timeLeft -= 0.1;
    timeElement.textContent = Math.max(0, timeLeft).toFixed(1);
    if (timeLeft <= 0) endGame('Time expired.');
  }, 100);
  decayId = setInterval(decayRandomTile, 2100);
}

function endGame(reason) {
  if (!running) return;
  running = false;
  clearInterval(timerId);
  clearInterval(decayId);
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('expiredGamesBest', String(bestScore));
    bestScoreElement.textContent = String(bestScore).padStart(6, '0');
  }
  roundLabel.textContent = 'SESSION ENDED';
  messageElement.textContent = `${reason} You saved ${saved} game${saved === 1 ? '' : 's'}.`;
  startButton.innerHTML = '<span>▶</span> try again';
}

startButton.addEventListener('click', startGame);
fillBoard();

const modeButtons = document.querySelectorAll('.mode-button');
const modePanels = document.querySelectorAll('.mode-panel');
modeButtons.forEach(button => button.addEventListener('click', () => {
  const mode = button.dataset.mode;
  modeButtons.forEach(item => item.classList.toggle('active', item === button));
  modePanels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === mode));
  if (mode === 'tictactoe' && !tttBoardState.length) resetTicTacToe();
  if (mode === 'mines' && !mineState.length) resetMines();
  if (mode === 'chess' && !chessState.length) resetChess();
  if (mode === 'snake' && !snakeState.length) resetSnake();
  if (mode === 'memory' && !memoryState.length) resetMemory();
  if (mode === 'pong' && !pongReady) resetPong();
  if (mode === '2048' && !twentyState.length) resetTwenty();
  if (mode === 'breakout' && !breakoutReady) resetBreakout();
  if (mode === 'flappy' && !flappyReady) resetFlappy();
  if (mode === 'connect' && !connectState.length) resetConnect();
}));

const tttBoardElement = document.querySelector('#tttBoard');
const tttMessage = document.querySelector('#tttMessage');
const tttStatus = document.querySelector('#tttStatus');
let tttBoardState = [];
let tttOver = false;
let tttThinking = false;
let tttBotTimer;

function tttWinner(cells) {
  const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  return lines.find(([a, b, c]) => cells[a] && cells[a] === cells[b] && cells[a] === cells[c]);
}

function resetTicTacToe() {
  clearTimeout(tttBotTimer);
  tttBoardState = Array(9).fill('');
  tttOver = false; tttThinking = false;
  tttMessage.textContent = 'Place an X. The bot is watching.';
  tttStatus.textContent = 'your move / X';
  renderTicTacToe();
}

function renderTicTacToe() {
  tttBoardElement.innerHTML = '';
  tttBoardState.forEach((value, index) => {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = `ttt-cell ${value.toLowerCase()}`;
    cell.textContent = value;
    cell.disabled = Boolean(value) || tttOver;
    cell.addEventListener('click', () => playTicTacToe(index));
    tttBoardElement.appendChild(cell);
  });
}

function playTicTacToe(index) {
  if (tttOver || tttThinking || tttBoardState[index]) return;
  tttBoardState[index] = 'X';
  if (finishTicTacToe()) return;
  tttThinking = true; tttStatus.textContent = 'bot thinking / O';
  tttMessage.textContent = 'The bot is calculating a reply.';
  renderTicTacToe();
  tttBotTimer = setTimeout(() => {
    if (tttOver) return;
    const move = bestTicTacToeMove();
    tttBoardState[move] = 'O';
    tttThinking = false;
    finishTicTacToe();
    if (!tttOver) { tttStatus.textContent = 'your move / X'; tttMessage.textContent = 'Your turn. Find the line.'; }
    renderTicTacToe();
  }, 350);
}

function finishTicTacToe() {
  const winner = tttWinner(tttBoardState);
  if (winner || !tttBoardState.includes('')) {
    tttOver = true;
    tttStatus.textContent = winner ? `${winner} wins` : 'draw / archive stable';
    tttMessage.textContent = winner === 'X' ? 'You beat the bot. The archive applauds.' : winner === 'O' ? 'The bot got three in a row.' : 'No winner this round.';
    return true;
  }
  return false;
}

function bestTicTacToeMove() {
  const open = tttBoardState.map((value, index) => value ? -1 : index).filter(index => index >= 0);
  if (botDifficulty === 'easy') return open[Math.floor(Math.random() * open.length)];
  if (botDifficulty === 'medium') {
    for (const mark of ['O', 'X']) for (const index of open) { tttBoardState[index] = mark; const wins = tttWinner(tttBoardState); tttBoardState[index] = ''; if (wins) return index; }
    if (!tttBoardState[4]) return 4;
    const corners = [0, 2, 6, 8].filter(index => !tttBoardState[index]); if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
    return open[Math.floor(Math.random() * open.length)];
  }
  let best = -Infinity;
  let move = open[0];
  open.forEach(index => {
    tttBoardState[index] = 'O';
    const value = tttMinimax(false);
    tttBoardState[index] = '';
    if (value > best) { best = value; move = index; }
  });
  return move;
}

function tttMinimax(botTurn) {
  const winner = tttWinner(tttBoardState);
  if (winner === 'O') return 10;
  if (winner === 'X') return -10;
  if (!tttBoardState.includes('')) return 0;
  const open = tttBoardState.map((value, index) => value ? -1 : index).filter(index => index >= 0);
  const values = open.map(index => { tttBoardState[index] = botTurn ? 'O' : 'X'; const result = tttMinimax(!botTurn); tttBoardState[index] = ''; return result; });
  return botTurn ? Math.max(...values) : Math.min(...values);
}

document.querySelector('#tttReset').addEventListener('click', resetTicTacToe);

const minesBoardElement = document.querySelector('#minesBoard');
const mineCountElement = document.querySelector('#mineCount');
const minesMessage = document.querySelector('#minesMessage');
let mineState = [];
let mineOver = false;
const mineSize = 8;
const mineTotal = 10;

function resetMines() {
  const cells = Array.from({ length: mineSize * mineSize }, (_, index) => ({ index, mine: false, revealed: false, flagged: false, adjacent: 0 }));
  const mineIndexes = [...cells.keys()].sort(() => Math.random() - .5).slice(0, mineTotal);
  mineIndexes.forEach(index => { cells[index].mine = true; });
  cells.forEach(cell => { cell.adjacent = neighbors(cell.index).filter(index => cells[index].mine).length; });
  mineState = cells; mineOver = false; mineCountElement.textContent = mineTotal; minesMessage.textContent = 'Clear the field without waking the archive.'; renderMines();
}

function neighbors(index) {
  const row = Math.floor(index / mineSize); const column = index % mineSize; const result = [];
  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
    if (!rowOffset && !columnOffset) continue;
    const nextRow = row + rowOffset; const nextColumn = column + columnOffset;
    if (nextRow >= 0 && nextRow < mineSize && nextColumn >= 0 && nextColumn < mineSize) result.push(nextRow * mineSize + nextColumn);
  }
  return result;
}

function renderMines() {
  minesBoardElement.innerHTML = '';
  mineState.forEach((cell) => {
    const element = document.createElement('button'); element.type = 'button'; element.className = 'mine-cell';
    if (cell.revealed) { element.classList.add('revealed'); element.textContent = cell.mine ? '×' : (cell.adjacent || ''); }
    if (cell.flagged && !cell.revealed) { element.classList.add('flagged'); element.textContent = '⚑'; }
    element.addEventListener('click', () => revealMine(cell.index)); element.addEventListener('contextmenu', event => { event.preventDefault(); flagMine(cell.index); });
    minesBoardElement.appendChild(element);
  });
}

function revealMine(index) {
  const cell = mineState[index]; if (mineOver || cell.revealed || cell.flagged) return;
  if (cell.mine) { mineOver = true; mineState.forEach(item => { if (item.mine) item.revealed = true; }); minesMessage.textContent = 'Boom. The archive caught you.'; renderMines(); return; }
  cell.revealed = true;
  if (!cell.adjacent) neighbors(index).forEach(neighbor => revealMine(neighbor));
  if (mineState.filter(item => !item.mine && item.revealed).length === mineSize * mineSize - mineTotal) { mineOver = true; minesMessage.textContent = 'Field clear. You outsmarted the archive.'; }
  renderMines();
}

function flagMine(index) {
  const cell = mineState[index]; if (mineOver || cell.revealed) return; cell.flagged = !cell.flagged; mineCountElement.textContent = mineTotal - mineState.filter(item => item.flagged).length; renderMines();
}

document.querySelector('#minesReset').addEventListener('click', resetMines);

const chessBoardElement = document.querySelector('#chessBoard');
const chessMessage = document.querySelector('#chessMessage');
const chessStatus = document.querySelector('#chessStatus');
let chessState = [];
let chessSelected = -1;
let chessOver = false;
const chessSymbols = { wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙', bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟' };

function resetChess() {
  chessState = Array(64).fill(null); chessSelected = -1; chessOver = false;
  const backRank = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  backRank.forEach((piece, index) => { chessState[index] = `b${piece}`; chessState[index + 8] = 'bP'; chessState[index + 48] = 'wP'; chessState[index + 56] = `w${piece}`; });
  chessStatus.textContent = 'your move / white'; chessMessage.textContent = 'Select a white piece, then a highlighted square.'; renderChess();
}

function renderChess() {
  chessBoardElement.innerHTML = '';
  chessState.forEach((piece, index) => { const cell = document.createElement('button'); const row = Math.floor(index / 8); const column = index % 8; cell.type = 'button'; cell.className = `chess-cell ${(row + column) % 2 ? 'dark' : 'light'}`; if (piece) { cell.textContent = chessSymbols[piece]; cell.classList.add(piece[0] === 'w' ? 'white-piece' : 'black-piece'); } if (index === chessSelected) cell.classList.add('selected'); if (chessSelected >= 0 && chessLegalMoves(chessSelected).includes(index)) cell.classList.add('legal'); cell.addEventListener('click', () => clickChess(index)); chessBoardElement.appendChild(cell); });
}

function clickChess(index) {
  if (chessOver) return;
  if (chessSelected >= 0 && chessLegalMoves(chessSelected).includes(index)) { moveChess(chessSelected, index, true); chessSelected = -1; renderChess(); if (!chessOver) setTimeout(botChessMove, 400); return; }
  if (chessState[index]?.[0] === 'w') { chessSelected = index; chessMessage.textContent = 'Choose a highlighted square.'; renderChess(); }
}

function moveChess(from, to, userMove) { const captured = chessState[to]; chessState[to] = chessState[from]; chessState[from] = null; const promoted = chessState[to]; if (promoted?.[1] === 'P' && Math.floor(to / 8) === (promoted[0] === 'w' ? 0 : 7)) chessState[to] = `${promoted[0]}Q`; if (captured?.[1] === 'K') { chessOver = true; chessMessage.textContent = userMove ? 'King captured. You beat the bot.' : 'Your king was captured. Try again.'; chessStatus.textContent = userMove ? 'victory / white' : 'game over / black'; } }

function chessLegalMoves(index) {
  const piece = chessState[index]; if (!piece) return []; const color = piece[0]; const type = piece[1]; const row = Math.floor(index / 8); const column = index % 8; const moves = [];
  const add = (nextRow, nextColumn) => { if (nextRow < 0 || nextRow > 7 || nextColumn < 0 || nextColumn > 7) return false; const next = nextRow * 8 + nextColumn; if (!chessState[next]) { moves.push(next); return true; } if (chessState[next][0] !== color) moves.push(next); return false; };
  if (type === 'P') { const direction = color === 'w' ? -1 : 1; const startRow = color === 'w' ? 6 : 1; if (row + direction >= 0 && row + direction <= 7 && !chessState[(row + direction) * 8 + column]) { moves.push((row + direction) * 8 + column); if (row === startRow && !chessState[(row + direction * 2) * 8 + column]) moves.push((row + direction * 2) * 8 + column); } [-1, 1].forEach(offset => { const target = (row + direction) * 8 + column + offset; if (column + offset >= 0 && column + offset < 8 && chessState[target]?.[0] && chessState[target][0] !== color) moves.push(target); }); }
  if (type === 'N') [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([r, c]) => add(row + r, column + c));
  if (type === 'K') for (let r = -1; r <= 1; r += 1) for (let c = -1; c <= 1; c += 1) if (r || c) add(row + r, column + c);
  const directions = type === 'B' ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : type === 'R' ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : type === 'Q' ? [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]] : [];
  directions.forEach(([r, c]) => { let nextRow = row + r; let nextColumn = column + c; while (add(nextRow, nextColumn)) { nextRow += r; nextColumn += c; } });
  return moves;
}

function botChessMove() { if (chessOver) return; const moves = []; chessState.forEach((piece, index) => { if (piece?.[0] === 'b') chessLegalMoves(index).forEach(to => moves.push([index, to])); }); if (!moves.length) return; const captures = moves.filter(([, to]) => chessState[to]); let choices = moves; if (botDifficulty !== 'easy' && captures.length) choices = captures; if (botDifficulty === 'hard' && captures.length) { const values = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 99 }; const bestValue = Math.max(...captures.map(([, to]) => values[chessState[to][1]])); choices = captures.filter(([, to]) => values[chessState[to][1]] === bestValue); } const [from, to] = choices[Math.floor(Math.random() * choices.length)]; moveChess(from, to, false); chessStatus.textContent = chessOver ? 'game over / black' : 'your move / white'; chessMessage.textContent = chessOver ? 'The bot found your king.' : 'The bot moved. Your turn.'; renderChess(); }

document.querySelector('#chessReset').addEventListener('click', resetChess);

const snakeBoardElement = document.querySelector('#snakeBoard');
const snakeMessage = document.querySelector('#snakeMessage');
const snakeStatus = document.querySelector('#snakeStatus');
let snakeState = [];
let snakeFood = 0;
let snakeDirection = { row: 0, column: 1 };
let snakeNextDirection = { row: 0, column: 1 };
let snakeTimer;
let snakeRunning = false;

function resetSnake() {
  clearInterval(snakeTimer);
  snakeState = [135, 134, 133]; snakeFood = 170; snakeDirection = { row: 0, column: 1 }; snakeNextDirection = { row: 0, column: 1 }; snakeRunning = false;
  snakeStatus.textContent = 'arrow keys / WASD'; snakeMessage.textContent = 'Press start, then steer with arrow keys or WASD.'; document.querySelector('#snakeReset').textContent = 'start snake'; renderSnake();
}

function startSnake() {
  if (snakeRunning) { resetSnake(); return; }
  snakeRunning = true; snakeMessage.textContent = 'Eat the red dots. Do not hit yourself.'; document.querySelector('#snakeReset').textContent = 'restart snake'; snakeTimer = setInterval(stepSnake, 170);
}

function renderSnake() {
  snakeBoardElement.innerHTML = '';
  for (let index = 0; index < 256; index += 1) { const cell = document.createElement('div'); cell.className = 'snake-cell'; if (snakeState.includes(index)) cell.classList.add('snake'); if (snakeState[0] === index) cell.classList.add('snake-head'); if (snakeFood === index) cell.classList.add('food'); snakeBoardElement.appendChild(cell); }
}

function stepSnake() {
  snakeDirection = snakeNextDirection; const head = snakeState[0]; const row = Math.floor(head / 16); const column = head % 16; const nextRow = (row + snakeDirection.row + 16) % 16; const nextColumn = (column + snakeDirection.column + 16) % 16; const next = nextRow * 16 + nextColumn;
  if (snakeState.includes(next)) { snakeRunning = false; clearInterval(snakeTimer); snakeMessage.textContent = 'Crash. The archive wins this round.'; snakeStatus.textContent = 'game over'; return; }
  snakeState.unshift(next); if (next === snakeFood) { do snakeFood = Math.floor(Math.random() * 256); while (snakeState.includes(snakeFood)); snakeMessage.textContent = `Infinite run: ${snakeState.length - 3} dots restored.`; } else snakeState.pop(); renderSnake();
}

document.addEventListener('keydown', event => {
  const directions = { ArrowUp: { row: -1, column: 0 }, w: { row: -1, column: 0 }, ArrowDown: { row: 1, column: 0 }, s: { row: 1, column: 0 }, ArrowLeft: { row: 0, column: -1 }, a: { row: 0, column: -1 }, ArrowRight: { row: 0, column: 1 }, d: { row: 0, column: 1 } };
  const next = directions[event.key]; if (!next || !snakeRunning || !document.querySelector('[data-panel="snake"]').classList.contains('active')) return; if (next.row === -snakeDirection.row && next.column === -snakeDirection.column) return; snakeNextDirection = next; event.preventDefault();
});

document.querySelector('#snakeReset').addEventListener('click', startSnake);

const memoryBoardElement = document.querySelector('#memoryBoard');
const memoryMessage = document.querySelector('#memoryMessage');
const memoryStatus = document.querySelector('#memoryStatus');
const memorySymbols = ['✦', '●', '◆', '✿', '♫', '⌁'];
let memoryState = [];
let memoryOpen = [];
let memoryLocked = false;

function resetMemory() {
  memoryState = [...memorySymbols, ...memorySymbols].sort(() => Math.random() - .5).map((symbol, index) => ({ symbol, index, flipped: false, matched: false })); memoryOpen = []; memoryLocked = false; memoryMessage.textContent = 'Flip two cards and restore the pairs.'; memoryStatus.textContent = 'find the matching pairs'; renderMemory();
}

function renderMemory() {
  memoryBoardElement.innerHTML = '';
  memoryState.forEach(card => { const element = document.createElement('button'); element.type = 'button'; element.className = `memory-card${card.flipped ? ' flipped' : ''}${card.matched ? ' matched' : ''}`; element.textContent = card.symbol; element.addEventListener('click', () => flipMemory(card.index)); memoryBoardElement.appendChild(element); });
}

function flipMemory(index) {
  const card = memoryState[index]; if (memoryLocked || card.flipped || card.matched) return; card.flipped = true; memoryOpen.push(index); renderMemory(); if (memoryOpen.length < 2) return; memoryLocked = true; const [first, second] = memoryOpen; if (memoryState[first].symbol === memoryState[second].symbol) { memoryState[first].matched = true; memoryState[second].matched = true; memoryOpen = []; memoryLocked = false; memoryMessage.textContent = 'Pair restored. Keep searching.'; memoryStatus.textContent = `${memoryState.filter(item => item.matched).length / 2} / 6 pairs restored`; renderMemory(); if (memoryState.every(item => item.matched)) memoryMessage.textContent = 'All pairs restored. The vault is complete.'; } else { setTimeout(() => { memoryState[first].flipped = false; memoryState[second].flipped = false; memoryOpen = []; memoryLocked = false; memoryMessage.textContent = 'No match. Try to remember the symbols.'; renderMemory(); }, 650); } }

document.querySelector('#memoryReset').addEventListener('click', resetMemory);

const pongCanvas = document.querySelector('#pongCanvas');
const pongContext = pongCanvas.getContext('2d');
const pongMessage = document.querySelector('#pongMessage');
const pongStatus = document.querySelector('#pongStatus');
let pongFrame;
let pongRunning = false;
let pongReady = false;
let pongKeys = {};
let pongGame = {};

function resetPong() {
  cancelAnimationFrame(pongFrame); pongRunning = false; pongReady = true; pongGame = { playerY: 175, botY: 175, ballX: 360, ballY: 210, velocityX: 4, velocityY: 2, playerScore: 0, botScore: 0 }; pongStatus.textContent = 'first to 5'; pongMessage.textContent = 'Move with W/S or the arrow keys.'; document.querySelector('#pongReset').textContent = 'start pong'; drawPong();
}

function startPong() { if (pongRunning) { resetPong(); return; } pongRunning = true; document.querySelector('#pongReset').textContent = 'restart pong'; pongMessage.textContent = 'Return the ball. The bot is tracking.'; pongFrame = requestAnimationFrame(stepPong); }
function drawPong() { const width = pongCanvas.width; const height = pongCanvas.height; pongContext.fillStyle = '#17212b'; pongContext.fillRect(0, 0, width, height); pongContext.strokeStyle = 'rgba(244,240,231,.25)'; pongContext.setLineDash([8, 12]); pongContext.beginPath(); pongContext.moveTo(width / 2, 0); pongContext.lineTo(width / 2, height); pongContext.stroke(); pongContext.setLineDash([]); pongContext.fillStyle = '#b6e6d2'; pongContext.fillRect(20, pongGame.playerY, 12, 70); pongContext.fillStyle = '#f05d54'; pongContext.fillRect(width - 32, pongGame.botY, 12, 70); pongContext.fillStyle = '#f8cc50'; pongContext.fillRect(pongGame.ballX - 7, pongGame.ballY - 7, 14, 14); pongContext.fillStyle = '#f4f0e7'; pongContext.font = '500 42px DM Mono'; pongContext.textAlign = 'center'; pongContext.fillText(pongGame.playerScore, width / 2 - 45, 55); pongContext.fillText(pongGame.botScore, width / 2 + 45, 55); }
function resetPongBall(direction) { pongGame.ballX = 360; pongGame.ballY = 210; pongGame.velocityX = direction * 4; pongGame.velocityY = (Math.random() - .5) * 5; }
function stepPong() { if (!pongRunning) return; if (pongKeys.ArrowUp || pongKeys.w) pongGame.playerY -= 7; if (pongKeys.ArrowDown || pongKeys.s) pongGame.playerY += 7; pongGame.playerY = Math.max(0, Math.min(350, pongGame.playerY)); pongGame.botY += (pongGame.ballY - (pongGame.botY + 35)) * (botDifficulty === 'hard' ? .14 : botDifficulty === 'medium' ? .1 : .06); pongGame.ballX += pongGame.velocityX; pongGame.ballY += pongGame.velocityY; if (pongGame.ballY < 7 || pongGame.ballY > 413) pongGame.velocityY *= -1; if (pongGame.ballX < 32 && pongGame.ballY > pongGame.playerY - 8 && pongGame.ballY < pongGame.playerY + 78) { pongGame.velocityX = Math.abs(pongGame.velocityX) + .15; pongGame.velocityY += (pongGame.ballY - pongGame.playerY - 35) * .06; } if (pongGame.ballX > 688 && pongGame.ballY > pongGame.botY - 8 && pongGame.ballY < pongGame.botY + 78) { pongGame.velocityX = -Math.abs(pongGame.velocityX) - .15; pongGame.velocityY += (pongGame.ballY - pongGame.botY - 35) * .06; } if (pongGame.ballX < -15) { pongGame.botScore += 1; resetPongBall(1); } if (pongGame.ballX > 735) { pongGame.playerScore += 1; resetPongBall(-1); } if (pongGame.playerScore >= 5 || pongGame.botScore >= 5) { pongRunning = false; pongStatus.textContent = pongGame.playerScore >= 5 ? 'you win' : 'bot wins'; pongMessage.textContent = pongGame.playerScore >= 5 ? 'Great rally. The bot is archived.' : 'The bot took the match. Try a lower difficulty.'; document.querySelector('#pongReset').textContent = 'new match'; } drawPong(); pongFrame = requestAnimationFrame(stepPong); }
document.addEventListener('keydown', event => { if (document.querySelector('[data-panel="pong"]').classList.contains('active')) pongKeys[event.key] = true; });
document.addEventListener('keyup', event => { pongKeys[event.key] = false; });
document.querySelector('#pongReset').addEventListener('click', startPong);

const twentyBoardElement = document.querySelector('#twentyBoard');
const twentyMessage = document.querySelector('#twentyMessage');
const twentyStatus = document.querySelector('#twentyStatus');
const twentyScoreElement = document.querySelector('#twentyScore');
let twentyState = [];
let twentyScore = 0;
let twentyOver = false;

function addTwentyTile() { const open = twentyState.map((value, index) => value ? -1 : index).filter(index => index >= 0); if (open.length) twentyState[open[Math.floor(Math.random() * open.length)]] = Math.random() < .9 ? 2 : 4; }
function resetTwenty() { twentyState = Array(16).fill(0); twentyScore = 0; twentyOver = false; addTwentyTile(); addTwentyTile(); twentyScoreElement.textContent = '000000'; twentyStatus.textContent = 'arrow keys / WASD'; twentyMessage.textContent = 'Combine matching numbers to reach 2048.'; renderTwenty(); }
function renderTwenty() { twentyBoardElement.innerHTML = ''; twentyState.forEach(value => { const cell = document.createElement('div'); cell.className = `twenty-cell${value ? ` v${value}` : ''}`; cell.textContent = value || ''; twentyBoardElement.appendChild(cell); }); }
function moveTwenty(direction) { if (twentyOver) return; const before = twentyState.join(','); for (let line = 0; line < 4; line += 1) { const indexes = direction === 'left' || direction === 'right' ? [0, 1, 2, 3].map(column => line * 4 + column) : [0, 1, 2, 3].map(row => row * 4 + line); if (direction === 'right' || direction === 'down') indexes.reverse(); const values = indexes.map(index => twentyState[index]).filter(Boolean); for (let index = 0; index < values.length - 1; index += 1) if (values[index] === values[index + 1]) { values[index] *= 2; twentyScore += values[index]; values.splice(index + 1, 1); } values.push(...Array(4 - values.length).fill(0)); indexes.forEach((index, position) => { twentyState[index] = values[position]; }); } if (before === twentyState.join(',')) return; addTwentyTile(); twentyScoreElement.textContent = String(twentyScore).padStart(6, '0'); renderTwenty(); if (twentyState.includes(2048)) twentyMessage.textContent = '2048 restored. You cracked the number vault.'; if (!twentyState.includes(0) && !canMoveTwenty()) { twentyOver = true; twentyStatus.textContent = 'grid locked'; twentyMessage.textContent = 'No moves left. Start a new grid.'; } }
function canMoveTwenty() { return twentyState.some((value, index) => neighborsTwenty(index).some(neighbor => twentyState[neighbor] === value)); }
function neighborsTwenty(index) { const row = Math.floor(index / 4); const column = index % 4; return [row > 0 ? index - 4 : -1, row < 3 ? index + 4 : -1, column > 0 ? index - 1 : -1, column < 3 ? index + 1 : -1].filter(neighbor => neighbor >= 0); }
document.addEventListener('keydown', event => { if (!document.querySelector('[data-panel="2048"]').classList.contains('active')) return; const directions = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' }; if (directions[event.key]) { event.preventDefault(); moveTwenty(directions[event.key]); } });
document.querySelector('#twentyReset').addEventListener('click', resetTwenty);

const breakoutCanvas = document.querySelector('#breakoutCanvas');
const breakoutContext = breakoutCanvas.getContext('2d');
const breakoutMessage = document.querySelector('#breakoutMessage');
const breakoutStatus = document.querySelector('#breakoutStatus');
let breakoutReady = false;
let breakoutRunning = false;
let breakoutFrame;
let breakoutKeys = {};
let breakoutGame;

function resetBreakout() { cancelAnimationFrame(breakoutFrame); breakoutReady = true; breakoutRunning = false; breakoutGame = { paddle: 310, ballX: 360, ballY: 390, velocityX: 3, velocityY: -4, lives: 3, bricks: Array.from({ length: 32 }, (_, index) => ({ x: 72 + (index % 8) * 72, y: 55 + Math.floor(index / 8) * 27, alive: true })) }; breakoutStatus.textContent = 'move with arrows / A D'; breakoutMessage.textContent = 'Break every brick. The archive has three lives.'; document.querySelector('#breakoutReset').textContent = 'start breakout'; drawBreakout(); }
function startBreakout() { if (breakoutRunning) { resetBreakout(); return; } breakoutRunning = true; document.querySelector('#breakoutReset').textContent = 'restart breakout'; breakoutMessage.textContent = 'Keep the ball in play.'; breakoutFrame = requestAnimationFrame(stepBreakout); }
function drawBreakout() { const g = breakoutGame; breakoutContext.fillStyle = '#17212b'; breakoutContext.fillRect(0, 0, 720, 440); g.bricks.forEach((brick, index) => { if (!brick.alive) return; breakoutContext.fillStyle = index % 2 ? '#f05d54' : '#f8cc50'; breakoutContext.fillRect(brick.x, brick.y, 62, 18); }); breakoutContext.fillStyle = '#b6e6d2'; breakoutContext.fillRect(g.paddle, 414, 100, 10); breakoutContext.fillStyle = '#f4f0e7'; breakoutContext.fillRect(g.ballX - 6, g.ballY - 6, 12, 12); breakoutContext.fillStyle = '#f4f0e7'; breakoutContext.font = '11px DM Mono'; breakoutContext.fillText(`LIVES ${g.lives}   BRICKS ${g.bricks.filter(brick => brick.alive).length}`, 16, 25); }
function stepBreakout() { if (!breakoutRunning) return; const g = breakoutGame; if (breakoutKeys.ArrowLeft || breakoutKeys.a) g.paddle -= 7; if (breakoutKeys.ArrowRight || breakoutKeys.d) g.paddle += 7; g.paddle = Math.max(0, Math.min(620, g.paddle)); g.ballX += g.velocityX; g.ballY += g.velocityY; if (g.ballX < 6 || g.ballX > 714) g.velocityX *= -1; if (g.ballY < 6) g.velocityY *= -1; if (g.ballY > 404 && g.ballX > g.paddle - 6 && g.ballX < g.paddle + 106) { g.velocityY = -Math.abs(g.velocityY); g.velocityX += (g.ballX - g.paddle - 50) * .03; } const brick = g.bricks.find(item => item.alive && g.ballX > item.x && g.ballX < item.x + 62 && g.ballY > item.y && g.ballY < item.y + 18); if (brick) { brick.alive = false; g.velocityY *= -1; } if (g.ballY > 450) { g.lives -= 1; g.ballX = 360; g.ballY = 390; g.velocityX = 3; g.velocityY = -4; } if (!g.lives || !g.bricks.some(item => item.alive)) { breakoutRunning = false; breakoutStatus.textContent = g.lives ? 'wall cleared' : 'game over'; breakoutMessage.textContent = g.lives ? 'Perfect clear. The archive is empty.' : 'Three strikes. Start a new run.'; document.querySelector('#breakoutReset').textContent = 'new run'; } drawBreakout(); breakoutFrame = requestAnimationFrame(stepBreakout); }
document.addEventListener('keydown', event => { breakoutKeys[event.key] = true; });
document.addEventListener('keyup', event => { breakoutKeys[event.key] = false; });
document.querySelector('#breakoutReset').addEventListener('click', startBreakout);

const flappyCanvas = document.querySelector('#flappyCanvas');
const flappyContext = flappyCanvas.getContext('2d');
const flappyMessage = document.querySelector('#flappyMessage');
const flappyStatus = document.querySelector('#flappyStatus');
let flappyReady = false;
let flappyRunning = false;
let flappyFrame;
let flappyGame;

function resetFlappy() { cancelAnimationFrame(flappyFrame); flappyReady = true; flappyRunning = false; flappyGame = { birdY: 220, velocity: 0, score: 0, pipes: [{ x: 700, gap: 210 }, { x: 1000, gap: 280 }] }; flappyStatus.textContent = 'space / click to flap'; flappyMessage.textContent = 'Thread the gaps and beat your high score.'; document.querySelector('#flappyReset').textContent = 'start flappy'; drawFlappy(); }
function flap() { if (!flappyRunning) { flappyRunning = true; document.querySelector('#flappyReset').textContent = 'restart flappy'; flappyMessage.textContent = 'Keep flying.'; flappyFrame = requestAnimationFrame(stepFlappy); } flappyGame.velocity = -7; }
function drawFlappy() { const g = flappyGame; flappyContext.fillStyle = '#b6e6d2'; flappyContext.fillRect(0, 0, 720, 440); g.pipes.forEach(pipe => { flappyContext.fillStyle = '#f05d54'; flappyContext.fillRect(pipe.x, 0, 55, pipe.gap - 72); flappyContext.fillRect(pipe.x, pipe.gap + 72, 55, 440); }); flappyContext.fillStyle = '#2d6cff'; flappyContext.fillRect(120, g.birdY - 10, 24, 20); flappyContext.fillStyle = '#17212b'; flappyContext.font = '500 18px DM Mono'; flappyContext.fillText(`SCORE ${g.score}`, 18, 30); }
function stepFlappy() { if (!flappyRunning) return; const g = flappyGame; g.velocity += .38; g.birdY += g.velocity; g.pipes.forEach(pipe => { pipe.x -= 3; if (pipe.x === 120) { g.score += 1; flappyStatus.textContent = `score ${g.score}`; } }); if (g.pipes[0].x < -60) g.pipes.shift(); if (g.pipes.length < 3) g.pipes.push({ x: g.pipes[g.pipes.length - 1].x + 300, gap: 150 + Math.random() * 170 }); const hitPipe = g.pipes.some(pipe => 144 > pipe.x && 120 < pipe.x + 55 && (g.birdY - 10 < pipe.gap - 72 || g.birdY + 10 > pipe.gap + 72)); if (g.birdY < -10 || g.birdY > 450 || hitPipe) { flappyRunning = false; flappyStatus.textContent = `score ${g.score}`; flappyMessage.textContent = 'Flight ended. Tap start to try again.'; document.querySelector('#flappyReset').textContent = 'new flight'; } drawFlappy(); flappyFrame = requestAnimationFrame(stepFlappy); }
document.addEventListener('keydown', event => { if (document.querySelector('[data-panel="flappy"]').classList.contains('active') && event.code === 'Space') { event.preventDefault(); flap(); } });
flappyCanvas.addEventListener('click', flap);
document.querySelector('#flappyReset').addEventListener('click', flap);

const connectBoardElement = document.querySelector('#connectBoard');
const connectMessage = document.querySelector('#connectMessage');
const connectStatus = document.querySelector('#connectStatus');
let connectState = [];
let connectOver = false;
function resetConnect() { connectState = Array(42).fill(''); connectOver = false; connectStatus.textContent = 'your move / blue'; connectMessage.textContent = 'Drop four blue discs in a row.'; renderConnect(); }
function renderConnect() { connectBoardElement.innerHTML = ''; for (let index = 0; index < 42; index += 1) { const cell = document.createElement('button'); cell.type = 'button'; cell.className = `connect-cell ${connectState[index]}`; cell.disabled = connectOver; cell.addEventListener('click', () => playConnect(Math.floor(index % 7))); connectBoardElement.appendChild(cell); } }
function dropConnect(column, color) { for (let row = 5; row >= 0; row -= 1) { const index = row * 7 + column; if (!connectState[index]) { connectState[index] = color; return index; } } return -1; }
function connectWinner(color) { for (let row = 0; row < 6; row += 1) for (let column = 0; column < 7; column += 1) { const index = row * 7 + column; if (connectState[index] !== color) continue; if (column < 4 && [1, 2, 3].every(offset => connectState[index + offset] === color)) return true; if (row < 3 && [1, 2, 3].every(offset => connectState[index + offset * 7] === color)) return true; if (row < 3 && column < 4 && [1, 2, 3].every(offset => connectState[index + offset * 8] === color)) return true; if (row > 2 && column < 4 && [1, 2, 3].every(offset => connectState[index - offset * 6] === color)) return true; } return false; }
function finishConnect(color) { if (connectWinner(color)) { connectOver = true; connectStatus.textContent = color === 'blue' ? 'victory / blue' : 'game over / red'; connectMessage.textContent = color === 'blue' ? 'Four connected. You beat the bot.' : 'The bot connected four first.'; return true; } if (connectState.every(Boolean)) { connectOver = true; connectStatus.textContent = 'draw / full board'; connectMessage.textContent = 'No spaces left. Start another match.'; return true; } return false; }
function playConnect(column) { if (connectOver || dropConnect(column, 'blue') < 0) return; renderConnect(); if (finishConnect('blue')) { renderConnect(); return; } connectStatus.textContent = 'bot thinking / red'; setTimeout(() => { if (connectOver) return; const openColumns = [...Array(7).keys()].filter(item => connectState[item] === ''); const choice = botDifficulty === 'easy' ? openColumns[Math.floor(Math.random() * openColumns.length)] : openColumns.reduce((best, item) => connectState[5 * 7 + item] ? best : item, openColumns[0]); dropConnect(choice, 'red'); finishConnect('red'); if (!connectOver) { connectStatus.textContent = 'your move / blue'; connectMessage.textContent = 'Your turn. Build a line.'; } renderConnect(); }, 320); }
document.querySelector('#connectReset').addEventListener('click', resetConnect);

resetTicTacToe();
resetMines();
resetChess();
resetSnake();
resetMemory();
resetPong();
resetTwenty();
resetBreakout();
resetFlappy();
resetConnect();
