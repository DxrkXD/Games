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
  if (mode === 'agar' && !agarReady) resetAgar();
  if (mode === 'slither' && !slitherReady) resetSlither();
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
const snakeModeSelect = document.querySelector('#snakeModeSelect');
let snakeState = [];
let snakeFood = [];
let snakeDirection = { row: 0, column: 1 };
let snakeNextDirection = { row: 0, column: 1 };
let snakeTimer;
let snakeClock;
let snakeRunning = false;
let snakeMode = 'classic';
let snakeTicks = 0;
let snakeObstacles = [];
const snakeRows = 16;
const snakeColumns = 20;
const snakeModes = { classic: { label: 'classic walls', speed: 150, wrap: false }, wrap: { label: 'wraparound', speed: 150, wrap: true }, speed: { label: 'speed rush', speed: 82, wrap: false }, time: { label: 'time attack', speed: 120, wrap: false, time: 30 }, maze: { label: 'maze runner', speed: 145, wrap: false, maze: true }, portal: { label: 'portal gates', speed: 145, wrap: false, portal: true }, double: { label: 'double food', speed: 145, wrap: false, food: 2 }, tail: { label: 'tail chase', speed: 120, wrap: false, growth: 2 }, borderless: { label: 'borderless', speed: 130, wrap: true, noSelf: true }, zen: { label: 'zen endless', speed: 180, wrap: true, noSelf: true, noGrowth: true } };
function snakeRandomOpen() { const open = []; for (let index = 0; index < snakeRows * snakeColumns; index += 1) if (!snakeState.includes(index) && !snakeObstacles.includes(index) && !snakeFood.includes(index)) open.push(index); return open[Math.floor(Math.random() * open.length)] ?? 0; }
function resetSnake() { clearInterval(snakeTimer); clearInterval(snakeClock); snakeMode = snakeModeSelect.value; const config = snakeModes[snakeMode]; snakeState = [Math.floor(snakeRows / 2) * snakeColumns + 4, Math.floor(snakeRows / 2) * snakeColumns + 3, Math.floor(snakeRows / 2) * snakeColumns + 2]; snakeFood = []; snakeDirection = { row: 0, column: 1 }; snakeNextDirection = { row: 0, column: 1 }; snakeRunning = false; snakeTicks = 0; snakeObstacles = config.maze ? createSnakeMaze() : config.portal ? [0, 319] : []; for (let index = 0; index < (config.food || 1); index += 1) snakeFood.push(snakeRandomOpen()); snakeBoardElement.dataset.mode = snakeMode; snakeStatus.textContent = config.time ? `${config.label} / 30s` : config.label; snakeMessage.textContent = `Choose ${config.label}, then steer with arrow keys or WASD.`; document.querySelector('#snakeReset').textContent = 'start snake'; renderSnake(); }
function createSnakeMaze() { const blocks = []; for (let row = 2; row < snakeRows - 2; row += 3) for (let column = 2; column < snakeColumns - 2; column += 3) { if (Math.random() > .35) for (let width = 0; width < 3; width += 1) blocks.push(row * snakeColumns + column + width); } return blocks; }
function startSnake() { if (snakeRunning) { resetSnake(); return; } snakeRunning = true; const config = snakeModes[snakeMode]; snakeMessage.textContent = config.maze ? 'Follow the open lanes. The border is real.' : 'Eat the red dots and watch the border.'; document.querySelector('#snakeReset').textContent = 'restart snake'; snakeTimer = setInterval(stepSnake, config.speed); if (config.time) { let timeLeft = config.time; snakeClock = setInterval(() => { timeLeft -= 1; snakeStatus.textContent = `${config.label} / ${timeLeft}s`; if (timeLeft <= 0) endSnake('Time attack complete.'); }, 1000); } }
function endSnake(message) { snakeRunning = false; clearInterval(snakeTimer); clearInterval(snakeClock); snakeStatus.textContent = 'game over'; snakeMessage.textContent = message; document.querySelector('#snakeReset').textContent = 'try again'; }
function renderSnake() { snakeBoardElement.innerHTML = ''; for (let index = 0; index < snakeRows * snakeColumns; index += 1) { const cell = document.createElement('div'); cell.className = 'snake-cell'; if (snakeState.includes(index)) cell.classList.add('snake'); if (snakeState[0] === index) cell.classList.add('snake-head'); if (snakeFood.includes(index)) cell.classList.add('food'); if (snakeObstacles.includes(index) && snakeMode !== 'portal') cell.classList.add('obstacle'); if (snakeMode === 'portal' && snakeObstacles.includes(index)) cell.classList.add('portal'); snakeBoardElement.appendChild(cell); } }
function stepSnake() { if (!snakeRunning) return; const config = snakeModes[snakeMode]; snakeDirection = snakeNextDirection; const head = snakeState[0]; const row = Math.floor(head / snakeColumns); const column = head % snakeColumns; let nextRow = row + snakeDirection.row; let nextColumn = column + snakeDirection.column; if (config.wrap) { nextRow = (nextRow + snakeRows) % snakeRows; nextColumn = (nextColumn + snakeColumns) % snakeColumns; } const next = nextRow * snakeColumns + nextColumn; if (snakeMode === 'portal' && next === 0) { snakeState.unshift(319); } else if (snakeMode === 'portal' && next === 319) { snakeState.unshift(0); } else { const outside = nextRow < 0 || nextRow >= snakeRows || nextColumn < 0 || nextColumn >= snakeColumns; if (outside || snakeObstacles.includes(next) || (!config.noSelf && snakeState.includes(next))) { endSnake(config.wrap ? 'You hit an obstacle.' : 'The border got you. Try again.'); return; } snakeState.unshift(next); } const foodIndex = snakeFood.indexOf(snakeState[0]); if (foodIndex >= 0) { snakeFood.splice(foodIndex, 1); if (!config.noGrowth) for (let growth = 0; growth < (config.growth || 1); growth += 1) snakeState.push(snakeState[snakeState.length - 1]); snakeFood.push(snakeRandomOpen()); if (config.food === 2 && snakeFood.length < 2) snakeFood.push(snakeRandomOpen()); snakeMessage.textContent = `${config.label}: ${snakeState.length - 3} segments restored.`; } else if (!config.noGrowth || snakeState.length < 180) snakeState.pop(); snakeTicks += 1; if (snakeMode === 'speed' && snakeTicks % 25 === 0) { clearInterval(snakeTimer); snakeTimer = setInterval(stepSnake, Math.max(48, config.speed - snakeTicks)); } renderSnake(); }
snakeModeSelect.addEventListener('change', resetSnake);
document.addEventListener('keydown', event => { const directions = { ArrowUp: { row: -1, column: 0 }, w: { row: -1, column: 0 }, ArrowDown: { row: 1, column: 0 }, s: { row: 1, column: 0 }, ArrowLeft: { row: 0, column: -1 }, a: { row: 0, column: -1 }, ArrowRight: { row: 0, column: 1 }, d: { row: 0, column: 1 } }; const next = directions[event.key]; if (!next || !snakeRunning || !document.querySelector('[data-panel="snake"]').classList.contains('active')) return; if (next.row === -snakeDirection.row && next.column === -snakeDirection.column) return; snakeNextDirection = next; event.preventDefault(); });
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

function resetFlappy() { cancelAnimationFrame(flappyFrame); flappyReady = true; flappyRunning = false; flappyGame = { birdY: 220, velocity: 0, score: 0, pipes: [{ x: 700, gap: 210, passed: false }, { x: 1000, gap: 280, passed: false }] }; flappyStatus.textContent = 'score 0 / space to flap'; flappyMessage.textContent = 'Thread the gaps and beat your high score.'; document.querySelector('#flappyReset').textContent = 'start flappy'; drawFlappy(); }
function flap() { if (!flappyRunning) { flappyRunning = true; document.querySelector('#flappyReset').textContent = 'restart flappy'; flappyMessage.textContent = 'Keep flying.'; flappyFrame = requestAnimationFrame(stepFlappy); } flappyGame.velocity = -7; }
function drawFlappy() { const g = flappyGame; flappyContext.fillStyle = '#b6e6d2'; flappyContext.fillRect(0, 0, 720, 440); g.pipes.forEach(pipe => { flappyContext.fillStyle = '#f05d54'; flappyContext.fillRect(pipe.x, 0, 55, pipe.gap - 72); flappyContext.fillRect(pipe.x, pipe.gap + 72, 55, 440); }); flappyContext.fillStyle = '#2d6cff'; flappyContext.fillRect(120, g.birdY - 10, 24, 20); flappyContext.fillStyle = '#17212b'; flappyContext.font = '500 18px DM Mono'; flappyContext.fillText(`SCORE ${g.score}`, 18, 30); }
function stepFlappy() { if (!flappyRunning) return; const g = flappyGame; g.velocity += .38; g.birdY += g.velocity; g.pipes.forEach(pipe => { pipe.x -= 3; if (!pipe.passed && pipe.x + 55 < 120) { pipe.passed = true; g.score += 1; flappyStatus.textContent = `score ${g.score}`; flappyMessage.textContent = `Nice flight. Score ${g.score}.`; } }); if (g.pipes[0].x < -60) g.pipes.shift(); if (g.pipes.length < 3) g.pipes.push({ x: g.pipes[g.pipes.length - 1].x + 300, gap: 150 + Math.random() * 170, passed: false }); const hitPipe = g.pipes.some(pipe => 144 > pipe.x && 120 < pipe.x + 55 && (g.birdY - 10 < pipe.gap - 72 || g.birdY + 10 > pipe.gap + 72)); if (g.birdY < -10 || g.birdY > 450 || hitPipe) { flappyRunning = false; flappyStatus.textContent = `score ${g.score}`; flappyMessage.textContent = `Flight ended with score ${g.score}.`; document.querySelector('#flappyReset').textContent = 'new flight'; } drawFlappy(); flappyFrame = requestAnimationFrame(stepFlappy); }
document.addEventListener('keydown', event => { if (document.querySelector('[data-panel="flappy"]').classList.contains('active') && event.code === 'Space') { event.preventDefault(); flap(); } });
flappyCanvas.addEventListener('click', flap);
document.querySelector('#flappyReset').addEventListener('click', flap);

const connectBoardElement = document.querySelector('#connectBoard');
const connectMessage = document.querySelector('#connectMessage');
const connectStatus = document.querySelector('#connectStatus');
const connectResult = document.querySelector('#connectResult');
let connectState = [];
let connectOver = false;
function resetConnect() { connectState = Array(42).fill(''); connectOver = false; connectStatus.textContent = 'your move / blue'; connectMessage.textContent = 'Drop four blue discs in a row.'; connectResult.hidden = true; connectResult.className = 'connect-result'; connectResult.textContent = ''; renderConnect(); }
function renderConnect() { connectBoardElement.innerHTML = ''; for (let index = 0; index < 42; index += 1) { const cell = document.createElement('button'); cell.type = 'button'; cell.className = `connect-cell ${connectState[index]}`; cell.disabled = connectOver; cell.addEventListener('click', () => playConnect(Math.floor(index % 7))); connectBoardElement.appendChild(cell); } }
function dropConnect(column, color) { for (let row = 5; row >= 0; row -= 1) { const index = row * 7 + column; if (!connectState[index]) { connectState[index] = color; return index; } } return -1; }
function connectWinner(color) { for (let row = 0; row < 6; row += 1) for (let column = 0; column < 7; column += 1) { const index = row * 7 + column; if (connectState[index] !== color) continue; if (column < 4 && [1, 2, 3].every(offset => connectState[index + offset] === color)) return true; if (row < 3 && [1, 2, 3].every(offset => connectState[index + offset * 7] === color)) return true; if (row < 3 && column < 4 && [1, 2, 3].every(offset => connectState[index + offset * 8] === color)) return true; if (row > 2 && column < 4 && [1, 2, 3].every(offset => connectState[index - offset * 6] === color)) return true; } return false; }
function finishConnect(color) { if (connectWinner(color)) { connectOver = true; const playerWon = color === 'blue'; connectStatus.textContent = playerWon ? 'victory / blue' : 'game over / red'; connectMessage.textContent = playerWon ? 'Four connected. You beat the bot.' : 'The bot connected four first.'; connectResult.hidden = false; connectResult.className = `connect-result${playerWon ? '' : ' bot'}`; connectResult.textContent = playerWon ? 'YOU WIN' : 'BOT WINS'; return true; } if (connectState.every(Boolean)) { connectOver = true; connectStatus.textContent = 'draw / full board'; connectMessage.textContent = 'No spaces left. Start another match.'; connectResult.hidden = false; connectResult.className = 'connect-result draw'; connectResult.textContent = 'DRAW'; return true; } return false; }
function playConnect(column) { if (connectOver || dropConnect(column, 'blue') < 0) return; renderConnect(); if (finishConnect('blue')) { renderConnect(); return; } connectStatus.textContent = 'bot thinking / red'; setTimeout(() => { if (connectOver) return; const openColumns = [...Array(7).keys()].filter(item => connectState[item] === ''); const choice = botDifficulty === 'easy' ? openColumns[Math.floor(Math.random() * openColumns.length)] : openColumns.reduce((best, item) => connectState[5 * 7 + item] ? best : item, openColumns[0]); dropConnect(choice, 'red'); finishConnect('red'); if (!connectOver) { connectStatus.textContent = 'your move / blue'; connectMessage.textContent = 'Your turn. Build a line.'; } renderConnect(); }, 320); }
document.querySelector('#connectReset').addEventListener('click', resetConnect);

const agarCanvas = document.querySelector('#agarCanvas');
const agarContext = agarCanvas.getContext('2d');
const agarMessage = document.querySelector('#agarMessage');
const agarStatus = document.querySelector('#agarStatus');
let agarReady = false;
let agarRunning = false;
let agarFrame;
let agarPointer = { x: 360, y: 220 };
let agarGame;

function randomAgarColor() { return ['#f05d54', '#f8cc50', '#b6e6d2', '#ff9d71', '#b78cff'][Math.floor(Math.random() * 5)]; }
function resetAgar() {
  cancelAnimationFrame(agarFrame); agarReady = true; agarRunning = false;
  agarGame = { worldWidth: 2400, worldHeight: 1600, player: [{ x: 1200, y: 800, radius: 22, color: '#2d6cff' }], pellets: [], bots: [], score: 0, camera: { x: 1200, y: 800 } };
  for (let index = 0; index < 260; index += 1) agarGame.pellets.push({ x: 25 + Math.random() * 2350, y: 25 + Math.random() * 1550, radius: 3 + Math.random() * 3, color: randomAgarColor() });
  for (let index = 0; index < 20; index += 1) agarGame.bots.push(createAgarBot(agarGame, 16, index < 5 ? 92 : 58));
  agarPointer = { x: 360, y: 220 }; agarStatus.textContent = 'mouse / touch to move / space to split'; agarMessage.textContent = 'Explore the huge map, collect pellets, split, and absorb smaller cells.'; document.querySelector('#agarReset').textContent = 'start arena'; drawAgar();
}
function startAgar() { const button = document.querySelector('#agarReset'); if (agarRunning) { resetAgar(); return; } if (button.textContent.includes('new arena')) resetAgar(); agarRunning = true; button.textContent = 'restart arena'; agarMessage.textContent = 'Find smaller cells and keep moving.'; agarFrame = requestAnimationFrame(stepAgar); }
function setAgarPointer(event) { const rect = agarCanvas.getBoundingClientRect(); const point = event.touches ? event.touches[0] : event; agarPointer.x = (point.clientX - rect.left) * agarCanvas.width / rect.width; agarPointer.y = (point.clientY - rect.top) * agarCanvas.height / rect.height; if (!agarRunning) startAgar(); }
function agarDistance(first, second) { return Math.hypot(first.x - second.x, first.y - second.y); }
function drawAgar() { const g = agarGame; const focus = g.player[0]; g.camera.x += (focus.x - g.camera.x) * .08; g.camera.y += (focus.y - g.camera.y) * .08; const left = g.camera.x - 360; const top = g.camera.y - 220; agarContext.fillStyle = '#102f45'; agarContext.fillRect(0, 0, 720, 440); agarContext.strokeStyle = 'rgba(182,230,210,.1)'; for (let x = Math.floor(left / 80) * 80; x < left + 720; x += 80) { agarContext.beginPath(); agarContext.moveTo(x - left, 0); agarContext.lineTo(x - left, 440); agarContext.stroke(); } for (let y = Math.floor(top / 80) * 80; y < top + 440; y += 80) { agarContext.beginPath(); agarContext.moveTo(0, y - top); agarContext.lineTo(720, y - top); agarContext.stroke(); } g.pellets.forEach(pellet => { agarContext.fillStyle = pellet.color; agarContext.beginPath(); agarContext.arc(pellet.x - left, pellet.y - top, pellet.radius, 0, Math.PI * 2); agarContext.fill(); }); g.bots.forEach(bot => drawAgarCell(bot, left, top)); g.player.forEach(cell => drawAgarCell(cell, left, top)); agarContext.fillStyle = '#f4f0e7'; agarContext.font = '500 12px DM Mono'; agarContext.fillText(`MASS ${Math.round(g.player.reduce((total, cell) => total + cell.radius, 0))}   SCORE ${g.score}   MAP 2400×1600`, 16, 24); }
function drawAgarCell(cell, left = 0, top = 0) { agarContext.fillStyle = cell.color; agarContext.beginPath(); agarContext.arc(cell.x - left, cell.y - top, cell.radius, 0, Math.PI * 2); agarContext.fill(); agarContext.strokeStyle = 'rgba(244,240,231,.7)'; agarContext.lineWidth = 2; agarContext.stroke(); }
function endAgar(message) { agarRunning = false; cancelAnimationFrame(agarFrame); agarStatus.textContent = 'session ended'; agarMessage.textContent = message; document.querySelector('#agarReset').textContent = 'new arena'; }
function stepAgar() { if (!agarRunning) return; const g = agarGame; const targetX = g.camera.x - 360 + agarPointer.x; const targetY = g.camera.y - 220 + agarPointer.y; g.player.forEach(cell => { const dx = targetX - cell.x; const dy = targetY - cell.y; const distance = Math.hypot(dx, dy); const speed = Math.max(.65, 4.8 - cell.radius * .035); if (distance > 2) { cell.x += dx / distance * speed; cell.y += dy / distance * speed; } cell.x = Math.max(cell.radius, Math.min(g.worldWidth - cell.radius, cell.x)); cell.y = Math.max(cell.radius, Math.min(g.worldHeight - cell.radius, cell.y)); }); g.pellets = g.pellets.filter(pellet => { const eater = g.player.find(cell => agarDistance(cell, pellet) < cell.radius + pellet.radius); if (eater) { eater.radius += .32; g.score += 1; return false; } return true; }); while (g.pellets.length < 260) g.pellets.push({ x: 25 + Math.random() * 2350, y: 25 + Math.random() * 1550, radius: 3 + Math.random() * 3, color: randomAgarColor() }); g.bots.forEach(bot => { const allCells = [...g.player, ...g.bots.filter(other => other !== bot)]; const larger = allCells.filter(cell => cell.radius > bot.radius * 1.15).sort((a, b) => agarDistance(bot, a) - agarDistance(bot, b))[0]; const smaller = allCells.filter(cell => cell.radius < bot.radius * .82).sort((a, b) => agarDistance(bot, a) - agarDistance(bot, b))[0]; const target = larger || smaller; const direction = larger ? -1 : 1; if (target) { const angle = Math.atan2(target.y - bot.y, target.x - bot.x); bot.angle += Math.atan2(Math.sin(angle - bot.angle), Math.cos(angle - bot.angle)) * .05 * direction; } else bot.angle += (Math.random() - .5) * .08; bot.x += Math.cos(bot.angle) * bot.speed; bot.y += Math.sin(bot.angle) * bot.speed; if (bot.x < bot.radius || bot.x > g.worldWidth - bot.radius) bot.angle = Math.PI - bot.angle; if (bot.y < bot.radius || bot.y > g.worldHeight - bot.radius) bot.angle = -bot.angle; }); g.player = g.player.filter(cell => { const danger = g.bots.find(bot => agarDistance(cell, bot) < bot.radius * .72 && bot.radius > cell.radius * 1.12); if (danger) return false; const prey = g.bots.find(bot => agarDistance(cell, bot) < cell.radius * .72 && cell.radius > bot.radius * 1.12); if (prey) { cell.radius += prey.radius * .18; g.score += Math.round(prey.radius); g.bots.splice(g.bots.indexOf(prey), 1); g.bots.push({ x: 80 + Math.random() * 2240, y: 60 + Math.random() * 1480, radius: 16 + Math.random() * 32, color: randomAgarColor(), angle: Math.random() * Math.PI * 2, speed: .65 + Math.random() * .75, think: 0 }); } return true; }); if (!g.player.length) { endAgar('A larger cell absorbed you. Grow and try again.'); return; } g.bots.forEach(bot => { const prey = g.player.find(cell => agarDistance(cell, bot) < bot.radius * .72 && bot.radius > cell.radius * 1.12); if (prey) { g.player.splice(g.player.indexOf(prey), 1); bot.radius += prey.radius * .15; } }); agarStatus.textContent = `mass ${Math.round(g.player.reduce((total, cell) => total + cell.radius, 0))} / score ${g.score}`; drawAgar(); agarFrame = requestAnimationFrame(stepAgar); }
function createAgarBot(g, minRadius = 16, maxRadius = 62) { let x; let y; do { x = minRadius + Math.random() * (g.worldWidth - minRadius * 2); y = minRadius + Math.random() * (g.worldHeight - minRadius * 2); } while (g.player.some(cell => agarDistance(cell, { x, y }) < 260)); return { x, y, radius: minRadius + Math.random() * (maxRadius - minRadius), color: randomAgarColor(), angle: Math.random() * Math.PI * 2, speed: .65 + Math.random() * .75, think: 0 }; }
function stepAgar() { if (!agarRunning) return; const g = agarGame; const focus = g.player[0]; const targetX = g.camera.x - 360 + agarPointer.x; const targetY = g.camera.y - 220 + agarPointer.y; g.player.forEach(cell => { const distance = Math.hypot(targetX - cell.x, targetY - cell.y); if (distance > 2) { cell.x += (targetX - cell.x) / distance * Math.max(.65, 4.8 - cell.radius * .035); cell.y += (targetY - cell.y) / distance * Math.max(.65, 4.8 - cell.radius * .035); } cell.x = Math.max(cell.radius, Math.min(g.worldWidth - cell.radius, cell.x)); cell.y = Math.max(cell.radius, Math.min(g.worldHeight - cell.radius, cell.y)); }); g.bots.forEach(bot => { const larger = [...g.player, ...g.bots.filter(other => other !== bot)].filter(cell => cell.radius > bot.radius * 1.15).sort((a, b) => agarDistance(bot, a) - agarDistance(bot, b))[0]; const smaller = [...g.player, ...g.bots.filter(other => other !== bot)].filter(cell => cell.radius < bot.radius * .82).sort((a, b) => agarDistance(bot, a) - agarDistance(bot, b))[0]; const target = larger || smaller; if (target) { const targetAngle = Math.atan2(target.y - bot.y, target.x - bot.x); bot.angle += Math.atan2(Math.sin(targetAngle - bot.angle), Math.cos(targetAngle - bot.angle)) * .06 * (larger ? -1 : 1); } bot.x += Math.cos(bot.angle) * bot.speed; bot.y += Math.sin(bot.angle) * bot.speed; if (bot.x <= bot.radius || bot.x >= g.worldWidth - bot.radius) { bot.x = Math.max(bot.radius, Math.min(g.worldWidth - bot.radius, bot.x)); bot.angle = Math.PI - bot.angle; } if (bot.y <= bot.radius || bot.y >= g.worldHeight - bot.radius) { bot.y = Math.max(bot.radius, Math.min(g.worldHeight - bot.radius, bot.y)); bot.angle = -bot.angle; } }); g.pellets = g.pellets.filter(pellet => { const eater = g.player.find(cell => agarDistance(cell, pellet) < cell.radius + pellet.radius); if (eater) { eater.radius += .32; g.score += 1; return false; } return true; }); while (g.pellets.length < 260) g.pellets.push({ x: 25 + Math.random() * (g.worldWidth - 50), y: 25 + Math.random() * (g.worldHeight - 50), radius: 3 + Math.random() * 3, color: randomAgarColor() }); g.player = g.player.filter(cell => { const danger = g.bots.find(bot => agarDistance(cell, bot) < bot.radius * .75 && bot.radius > cell.radius * 1.12); const prey = g.bots.find(bot => agarDistance(cell, bot) < cell.radius * .75 && cell.radius > bot.radius * 1.12); if (danger) return false; if (prey) { cell.radius += prey.radius * .18; g.score += Math.round(prey.radius); g.bots.splice(g.bots.indexOf(prey), 1); g.bots.push(createAgarBot(g, 18, Math.max(70, cell.radius * .9))); } return true; }); if (!g.player.length) { endAgar('A larger cell absorbed you. Grow and try again.'); return; } g.bots.forEach(bot => { const prey = g.player.find(cell => agarDistance(cell, bot) < bot.radius * .72 && bot.radius > cell.radius * 1.12); if (prey) { g.player.splice(g.player.indexOf(prey), 1); bot.radius += prey.radius * .15; } }); agarStatus.textContent = `mass ${Math.round(g.player.reduce((total, cell) => total + cell.radius, 0))} / score ${g.score}`; drawAgar(); agarFrame = requestAnimationFrame(stepAgar); }
agarCanvas.addEventListener('mousemove', setAgarPointer); agarCanvas.addEventListener('touchmove', event => { event.preventDefault(); setAgarPointer(event); }, { passive: false });
document.addEventListener('keydown', event => { if (event.code === 'Space' && document.querySelector('[data-panel="agar"]').classList.contains('active')) { event.preventDefault(); if (!agarRunning) startAgar(); else { const g = agarGame; const largest = g.player.slice().sort((a, b) => b.radius - a.radius)[0]; if (largest && largest.radius > 12 && g.player.length < 12) { const angle = Math.atan2(agarPointer.y - 220, agarPointer.x - 360); largest.radius *= .78; g.player.push({ x: largest.x + Math.cos(angle) * largest.radius * 1.7, y: largest.y + Math.sin(angle) * largest.radius * 1.7, radius: largest.radius, color: '#2d6cff', launchX: Math.cos(angle) * 7, launchY: Math.sin(angle) * 7, launchFrames: 28 }); agarMessage.textContent = 'Split launched toward the cursor. Click absorb clone to merge.'; } } } });
document.querySelector('#agarReset').addEventListener('click', startAgar);
function absorbAgarClone() { if (!agarGame || agarGame.player.length < 2) { agarMessage.textContent = 'Split first to create a clone.'; return; } const ordered = agarGame.player.slice().sort((first, second) => second.radius - first.radius); const largest = ordered[0]; const clone = ordered[ordered.length - 1]; largest.radius = Math.sqrt((largest.radius * largest.radius) + (clone.radius * clone.radius)); agarGame.player.splice(agarGame.player.indexOf(clone), 1); agarMessage.textContent = 'Clone absorbed. Mass combined.'; drawAgar(); }
document.querySelector('#agarAbsorb').addEventListener('click', absorbAgarClone);

function runAgarBotEconomy() { if (!agarRunning || !agarGame) return; const g = agarGame; g.bots.forEach(bot => { const orbIndex = g.pellets.findIndex(pellet => agarDistance(bot, pellet) < bot.radius + pellet.radius); if (orbIndex >= 0) { g.pellets.splice(orbIndex, 1); bot.radius += .22; } }); g.bots = g.bots.filter((bot, index) => { const larger = g.bots.find((other, otherIndex) => otherIndex !== index && other.radius > bot.radius * 1.15 && agarDistance(other, bot) < other.radius * .72); if (larger) { larger.radius += bot.radius * .14; return false; } return true; }); while (g.bots.length < 20) g.bots.push(createAgarBot(g, 18, 92)); agarStatus.textContent = `mass ${Math.round(g.player.reduce((total, cell) => total + cell.radius, 0))} / score ${g.score} / bots ${g.bots.length}`; }
setInterval(runAgarBotEconomy, 120);

const slitherCanvas = document.querySelector('#slitherCanvas');
const slitherContext = slitherCanvas.getContext('2d');
const slitherMessage = document.querySelector('#slitherMessage');
const slitherStatus = document.querySelector('#slitherStatus');
let slitherReady = false;
let slitherRunning = false;
let slitherFrame;
let slitherPointer = { x: 360, y: 220 };
let slitherGame;

function resetSlither() {
  cancelAnimationFrame(slitherFrame); slitherReady = true; slitherRunning = false;
  slitherGame = { width: 1800, height: 1200, score: 0, player: [], pellets: [], bots: [], camera: { x: 900, y: 600 } };
  for (let index = 0; index < 180; index += 1) slitherGame.pellets.push({ x: 20 + Math.random() * 1760, y: 20 + Math.random() * 1160, color: randomAgarColor() });
  for (let botIndex = 0; botIndex < 5; botIndex += 1) { const body = []; let x = 150 + Math.random() * 1500; let y = 100 + Math.random() * 1000; while (Math.hypot(x - 900, y - 600) < 300) { x = 150 + Math.random() * 1500; y = 100 + Math.random() * 1000; } for (let part = 0; part < 18; part += 1) body.push({ x: x - part * 12, y }); slitherGame.bots.push({ body, angle: Math.random() * Math.PI * 2, color: ['#f05d54', '#f8cc50', '#b6e6d2', '#ff9d71'][botIndex % 4] }); }
  const playerX = 900; const playerY = 600; for (let part = 0; part < 18; part += 1) slitherGame.player.push({ x: playerX - part * 12, y: playerY }); slitherPointer = { x: 360, y: 220 }; slitherStatus.textContent = 'mouse / touch to steer'; slitherMessage.textContent = 'Collect pellets, grow your body, and circle the rival snakes.'; document.querySelector('#slitherReset').textContent = 'start slither'; drawSlither();
}
function startSlither() { const button = document.querySelector('#slitherReset'); if (slitherRunning) { resetSlither(); return; } if (button.textContent.includes('new run')) resetSlither(); slitherRunning = true; button.textContent = 'restart slither'; slitherMessage.textContent = 'Stay alert. Your head is vulnerable.'; slitherFrame = requestAnimationFrame(stepSlither); }
function setSlitherPointer(event) { const rect = slitherCanvas.getBoundingClientRect(); const point = event.touches ? event.touches[0] : event; slitherPointer.x = (point.clientX - rect.left) * slitherCanvas.width / rect.width; slitherPointer.y = (point.clientY - rect.top) * slitherCanvas.height / rect.height; if (!slitherRunning) startSlither(); }
function slitherDistance(first, second) { return Math.hypot(first.x - second.x, first.y - second.y); }
function drawSlither() { const g = slitherGame; const head = g.player[0]; g.camera.x += (head.x - g.camera.x) * .08; g.camera.y += (head.y - g.camera.y) * .08; const left = g.camera.x - 360; const top = g.camera.y - 220; slitherContext.fillStyle = '#102f45'; slitherContext.fillRect(0, 0, 720, 440); slitherContext.strokeStyle = 'rgba(182,230,210,.11)'; for (let x = Math.floor(left / 60) * 60; x < left + 720; x += 60) { slitherContext.beginPath(); slitherContext.moveTo(x - left, 0); slitherContext.lineTo(x - left, 440); slitherContext.stroke(); } for (let y = Math.floor(top / 60) * 60; y < top + 440; y += 60) { slitherContext.beginPath(); slitherContext.moveTo(0, y - top); slitherContext.lineTo(720, y - top); slitherContext.stroke(); } slitherContext.strokeStyle = '#f05d54'; slitherContext.lineWidth = 5; if (left <= 0) { slitherContext.beginPath(); slitherContext.moveTo(-left, 0); slitherContext.lineTo(-left, 440); slitherContext.stroke(); } if (left + 720 >= g.width) { slitherContext.beginPath(); slitherContext.moveTo(g.width - left, 0); slitherContext.lineTo(g.width - left, 440); slitherContext.stroke(); } if (top <= 0) { slitherContext.beginPath(); slitherContext.moveTo(0, -top); slitherContext.lineTo(720, -top); slitherContext.stroke(); } if (top + 440 >= g.height) { slitherContext.beginPath(); slitherContext.moveTo(0, g.height - top); slitherContext.lineTo(720, g.height - top); slitherContext.stroke(); } g.pellets.forEach(pellet => { slitherContext.fillStyle = pellet.color; slitherContext.beginPath(); slitherContext.arc(pellet.x - left, pellet.y - top, 4, 0, Math.PI * 2); slitherContext.fill(); }); g.bots.forEach(bot => drawSlitherBody(bot.body, bot.color, left, top)); drawSlitherBody(g.player, '#2d6cff', left, top); slitherContext.fillStyle = '#f4f0e7'; slitherContext.font = '500 12px DM Mono'; slitherContext.fillText(`LENGTH ${g.player.length}   SCORE ${g.score}   MAP 1800×1200`, 16, 24); }
function drawSlitherBody(body, color, left, top) { body.slice().reverse().forEach((part, index) => { slitherContext.fillStyle = color; slitherContext.beginPath(); slitherContext.arc(part.x - left, part.y - top, index === body.length - 1 ? 14 : 12, 0, Math.PI * 2); slitherContext.fill(); }); const head = body[0]; slitherContext.fillStyle = '#17212b'; slitherContext.beginPath(); slitherContext.arc(head.x - left - 4, head.y - top - 3, 2, 0, Math.PI * 2); slitherContext.arc(head.x - left + 4, head.y - top - 3, 2, 0, Math.PI * 2); slitherContext.fill(); }
function endSlither(message) { slitherRunning = false; cancelAnimationFrame(slitherFrame); slitherStatus.textContent = 'game over'; slitherMessage.textContent = message; document.querySelector('#slitherReset').textContent = 'new run'; }
function stepSlitherOld() { if (!slitherRunning) return; const g = slitherGame; const head = g.player[0]; const targetX = g.camera.x - 360 + slitherPointer.x; const targetY = g.camera.y - 220 + slitherPointer.y; const targetAngle = Math.atan2(targetY - head.y, targetX - head.x); const currentAngle = Math.atan2(head.y - g.player[1].y, head.x - g.player[1].x); let angleDelta = Math.atan2(Math.sin(targetAngle - currentAngle), Math.cos(targetAngle - currentAngle)); const angle = currentAngle + Math.max(-.13, Math.min(.13, angleDelta)); const nextHead = { x: head.x + Math.cos(angle) * 4, y: head.y + Math.sin(angle) * 4 }; if (nextHead.x < 14 || nextHead.x > g.width - 14 || nextHead.y < 14 || nextHead.y > g.height - 14) { endSlither('You hit the edge of the world.'); return; } g.player.unshift(nextHead); const pelletIndex = g.pellets.findIndex(pellet => slitherDistance(nextHead, pellet) < 17); if (pelletIndex >= 0) { g.pellets.splice(pelletIndex, 1); g.player.push({ ...g.player[g.player.length - 1] }); g.score += 1; } else g.player.pop(); while (g.pellets.length < 180) g.pellets.push({ x: 20 + Math.random() * 1760, y: 20 + Math.random() * 1160, color: randomAgarColor() }); g.bots.forEach(bot => { const botHead = bot.body[0]; const nearby = g.pellets.reduce((best, pellet) => slitherDistance(botHead, pellet) < slitherDistance(botHead, best) ? pellet : best, g.pellets[0]); const desired = Math.atan2(nearby.y - botHead.y, nearby.x - botHead.x); bot.angle += Math.max(-.08, Math.min(.08, Math.atan2(Math.sin(desired - bot.angle), Math.cos(desired - bot.angle)))); botHead.x += Math.cos(bot.angle) * 2.2; botHead.y += Math.sin(bot.angle) * 2.2; bot.body.unshift({ x: botHead.x, y: botHead.y }); bot.body.pop(); }); const hitBody = [...g.bots.flatMap(bot => bot.body), ...g.player.slice(12)].some(part => slitherDistance(nextHead, part) < 13); if (hitBody) { endSlither('Your head hit a body. Start a new run.'); return; } if (g.bots.some(bot => bot.body.some(part => slitherDistance(nextHead, part) < 13))) { endSlither('You outmaneuvered yourself into a rival.'); return; } slitherStatus.textContent = `length ${g.player.length} / score ${g.score}`; drawSlither(); slitherFrame = requestAnimationFrame(stepSlither); }
function slitherAngleToward(current, target, amount) { const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current)); return current + Math.max(-amount, Math.min(amount, delta)); }
function dropSlitherLoot(body) { for (let index = 0; index < Math.min(12, Math.floor(body.length / 3)); index += 1) { const part = body[index * 2]; slitherGame.pellets.push({ x: part.x, y: part.y, color: '#f8cc50' }); } }
function stepSlither() {
  if (!slitherRunning) return;
  const g = slitherGame; const head = g.player[0]; const targetX = g.camera.x - 360 + slitherPointer.x; const targetY = g.camera.y - 220 + slitherPointer.y;
  const currentAngle = Math.atan2(head.y - g.player[1].y, head.x - g.player[1].x); const wantedAngle = Math.atan2(targetY - head.y, targetX - head.x); const angle = slitherAngleToward(currentAngle, wantedAngle, .16); const nextHead = { x: head.x + Math.cos(angle) * 4, y: head.y + Math.sin(angle) * 4 };
  if (nextHead.x < 14 || nextHead.x > g.width - 14 || nextHead.y < 14 || nextHead.y > g.height - 14) { endSlither('You hit the edge of the world.'); return; }
  g.player.unshift(nextHead); const pelletIndex = g.pellets.findIndex(pellet => slitherDistance(nextHead, pellet) < 17); if (pelletIndex >= 0) { g.pellets.splice(pelletIndex, 1); g.player.push({ ...g.player[g.player.length - 1] }); g.score += 1; } else g.player.pop();
  g.bots.forEach(bot => { const botHead = bot.body[0]; const distanceToPlayer = slitherDistance(botHead, nextHead); const playerThreat = distanceToPlayer < 360 && g.player.length > bot.body.length * 1.12; const playerPrey = distanceToPlayer < 420 && bot.body.length > g.player.length * 1.18; const nearestPellet = g.pellets.reduce((best, pellet) => slitherDistance(botHead, pellet) < slitherDistance(botHead, best) ? pellet : best, g.pellets[0]); const target = playerThreat ? { x: botHead.x - (nextHead.x - botHead.x), y: botHead.y - (nextHead.y - botHead.y) } : playerPrey ? nextHead : nearestPellet; const desired = Math.atan2(target.y - botHead.y, target.x - botHead.x); bot.angle = slitherAngleToward(bot.angle, desired, playerThreat ? .12 : .08); const nextBotX = Math.max(14, Math.min(g.width - 14, botHead.x + Math.cos(bot.angle) * 2.6)); const nextBotY = Math.max(14, Math.min(g.height - 14, botHead.y + Math.sin(bot.angle) * 2.6)); if (nextBotX === 14 || nextBotX === g.width - 14) bot.angle = Math.PI - bot.angle; if (nextBotY === 14 || nextBotY === g.height - 14) bot.angle = -bot.angle; bot.body.unshift({ x: nextBotX, y: nextBotY }); bot.body.pop(); const botPellet = g.pellets.findIndex(pellet => slitherDistance(bot.body[0], pellet) < 17); if (botPellet >= 0) { g.pellets.splice(botPellet, 1); bot.body.push({ ...bot.body[bot.body.length - 1] }); } });
  if (g.player.slice(8).some(part => slitherDistance(nextHead, part) < 11)) { endSlither('You crossed your own body. Start a new run.'); return; }
  if (g.bots.some(bot => bot.body.slice(1).some(part => slitherDistance(nextHead, part) < 16))) { endSlither('Your head hit a rival body.'); return; }
  const defeated = []; g.bots.forEach((bot, index) => { const botHead = bot.body[0]; const hitsPlayerBody = g.player.slice(2).some(part => slitherDistance(botHead, part) < 16); const headOn = slitherDistance(botHead, nextHead) < 18; const botHitByRival = g.bots.some((rival, rivalIndex) => rivalIndex !== index && rival.body.slice(1).some(part => slitherDistance(botHead, part) < 16)); if (hitsPlayerBody || (headOn && g.player.length >= bot.body.length) || botHitByRival) defeated.push(index); });
  defeated.reverse().forEach(index => { const [bot] = g.bots.splice(index, 1); dropSlitherLoot(bot.body); g.score += bot.body.length; });
  while (g.bots.length < 5) { const body = []; let x = 150 + Math.random() * 1500; let y = 100 + Math.random() * 1000; while (Math.hypot(x - g.player[0].x, y - g.player[0].y) < 300) { x = 150 + Math.random() * 1500; y = 100 + Math.random() * 1000; } for (let part = 0; part < 18; part += 1) body.push({ x: x - part * 12, y }); g.bots.push({ body, angle: Math.random() * Math.PI * 2, color: ['#f05d54', '#f8cc50', '#b6e6d2', '#ff9d71'][Math.floor(Math.random() * 4)] }); } while (g.pellets.length < 180) g.pellets.push({ x: 20 + Math.random() * 1760, y: 20 + Math.random() * 1160, color: randomAgarColor() }); slitherStatus.textContent = `length ${g.player.length} / score ${g.score} / bots ${g.bots.length}`; drawSlither(); slitherFrame = requestAnimationFrame(stepSlither);
}
slitherCanvas.addEventListener('mousemove', setSlitherPointer); slitherCanvas.addEventListener('touchmove', event => { event.preventDefault(); setSlitherPointer(event); }, { passive: false });
document.querySelector('#slitherReset').addEventListener('click', startSlither);

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
resetAgar();
resetSlither();
