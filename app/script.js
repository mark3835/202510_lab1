// 遊戲狀態
let board = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']; // 改為 16 格
let currentPlayer = 'X';
let gameActive = true;
let playerScore = 0;
let computerScore = 0;
let drawScore = 0;
let difficulty = 'medium';

// 新增計時器相關變數
let timer;
let timeLeft = 10;
const TIME_LIMIT = 10;

// 獲勝組合 (4x4)
const winningConditions = [
    // 橫行
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15],
    // 直行
    [0, 4, 8, 12],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
    // 對角線
    [0, 5, 10, 15],
    [3, 6, 9, 12]
];

// DOM 元素
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const difficultySelect = document.getElementById('difficultySelect');
const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');
const drawScoreDisplay = document.getElementById('drawScore');
const timerDisplay = document.getElementById('timer'); // 新增計時器顯示

// 初始化遊戲
function init() {
    // 從 Cookie 讀取分數
    loadScoresFromCookies();
    
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    resetBtn.addEventListener('click', resetGame);
    resetScoreBtn.addEventListener('click', resetScore);
    difficultySelect.addEventListener('change', handleDifficultyChange);
    updateScoreDisplay();
    startTimer();
}

// 處理格子點擊
function handleCellClick(e) {
    const cellIndex = parseInt(e.target.getAttribute('data-index'));
    
    if (board[cellIndex] !== '' || !gameActive || currentPlayer === 'O') {
        return;
    }
    
    makeMove(cellIndex, 'X');
    
    if (gameActive && currentPlayer === 'O') {
        // 電腦立即移動，不需等待
        computerMove();
    }
}

// 執行移動
function makeMove(index, player) {
    board[index] = player;
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add('taken');
    cell.classList.add(player.toLowerCase());
    
    checkResult();
    
    if (gameActive) {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();
    }
}

// 計時器功能
function startTimer() {
    timeLeft = TIME_LIMIT;
    updateTimerDisplay();
    clearInterval(timer);
    
    timer = setInterval(() => {
        if (currentPlayer === 'X' && gameActive) {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                // 時間到，自動隨機選擇
                const randomIndex = getRandomMove();
                if (randomIndex !== -1) {
                    makeMove(randomIndex, 'X');
                }
            }
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timer);
    startTimer();
}

function updateTimerDisplay() {
    timerDisplay.textContent = `剩餘時間: ${timeLeft} 秒`;
}

// 檢查遊戲結果
function checkResult() {
    let roundWon = false;
    let winningCombination = null;
    
    // 檢查獲勝
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c, d] = winningConditions[i];
        if (board[a] && 
            board[a] === board[b] && 
            board[a] === board[c] &&
            board[a] === board[d]) {
            roundWon = true;
            winningCombination = [a, b, c, d];
            break;
        }
    }
    
    if (roundWon) {
        const winner = currentPlayer;
        gameActive = false;
        
        // 高亮獲勝格子
        winningCombination.forEach(index => {
            document.querySelector(`[data-index="${index}"]`).classList.add('winning');
        });
        
        if (winner === 'X') {
            playerScore++;
            statusDisplay.textContent = '🎉 恭喜您獲勝！';
        } else {
            computerScore++;
            statusDisplay.textContent = '😢 電腦獲勝！';
        }
        statusDisplay.classList.add('winner');
        updateScoreDisplay();
        return;
    } else if (!hasWinningPossibility()) {
        // 如果沒有獲勝可能，直接結束為平手
        gameActive = false;
        drawScore++;
        statusDisplay.textContent = '平手！無法形成連線';
        statusDisplay.classList.add('draw');
        updateScoreDisplay();
    }
}

// 檢查是否還有獲勝可能
function hasWinningPossibility() {
    // 檢查每個獲勝組合
    for (let condition of winningConditions) {
        let [a, b, c, d] = condition;
        let cells = [board[a], board[b], board[c], board[d]];
        
        // 如果這個組合中沒有對方的棋子，表示還有獲勝可能
        if (!cells.includes('X') || !cells.includes('O')) {
            return true;
        }
    }
    return false;
}

// 更新狀態顯示
function updateStatus() {
    if (gameActive && currentPlayer === 'X') {
        statusDisplay.textContent = '您是 X，輪到您下棋';
    }
}

// 電腦移動
function computerMove() {
    if (!gameActive) return;
    
    let move;
    switch(difficulty) {
        case 'hard':
            move = getBestMove();
            break;
        case 'medium':
            move = getMediumMove();
            break;
        default:
            move = getRandomMove();
    }
    
    if (move !== -1) {
        makeMove(move, 'O');
        startTimer(); // 重新開始計時給玩家
    }
}

// 簡單難度：隨機移動
function getRandomMove() {
    const availableMoves = [];
    board.forEach((cell, index) => {
        if (cell === '') {
            availableMoves.push(index);
        }
    });
    
    if (availableMoves.length === 0) return -1;
    
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// 中等難度：混合策略
function getMediumMove() {
    // 50% 機會使用最佳策略，50% 機會隨機
    if (Math.random() < 0.5) {
        return getBestMove();
    } else {
        return getRandomMove();
    }
}

// 困難難度：Minimax 演算法
function getBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;
    
    for (let i = 0; i < 16; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

// Minimax 演算法實現
function minimax(board, depth, isMaximizing) {
    // 增加深度限制，避免過度遞迴
    if (depth > 3) {
        return 0;
    }

    const result = checkWinner();
    if (result !== null) {
        if