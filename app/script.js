// 遊戲狀態
let board = ['', '', '', '', '', '', '', '', '']; // 改回 9 格
let currentPlayer = 'X';
let gameActive = true;
let playerScore = 0;
let computerScore = 0;
let drawScore = 0;
let difficulty = 'medium';

// 獲勝組合 (3x3)
const winningConditions = [
    // 橫行
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // 直行
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // 對角線
    [0, 4, 8],
    [2, 4, 6]
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
    
    if (board[cellIndex] !== '' || !gameActive || currentPlayer !== 'X') {
        return;
    }
    
    playerMove(cellIndex);
}

// 新增玩家移動函數
function playerMove(index) {
    board[index] = 'X';
    updateCell(index, 'X');
    
    if (checkWin()) {
        endGame('X');
        return;
    }
    
    if (!hasWinningPossibility()) {
        endGame('draw');
        return;
    }
    
    currentPlayer = 'O';
    setTimeout(computerMove, 100);
}

// 簡化電腦移動
function computerMove() {
    if (!gameActive) return;
    
    const move = getRandomMove();
    if (move === -1) return;
    
    board[move] = 'O';
    updateCell(move, 'O');
    
    if (checkWin()) {
        endGame('O');
        return;
    }
    
    if (!hasWinningPossibility()) {
        endGame('draw');
        return;
    }
    
    currentPlayer = 'X';
    startTimer();
}

// 更新格子顯示
function updateCell(index, player) {
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add('taken', player.toLowerCase());
}

// 檢查勝利
function checkWin() {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] && 
            board[a] === board[b] && 
            board[a] === board[c]) {
            condition.forEach(i => {
                document.querySelector(`[data-index="${i}"]`).classList.add('winning');
            });
            return true;
        }
    }
    return false;
}

// 結束遊戲
function endGame(result) {
    gameActive = false;
    clearInterval(timer);
    
    if (result === 'X') {
        playerScore++;
        statusDisplay.textContent = '🎉 恭喜您獲勝！';
    } else if (result === 'O') {
        computerScore++;
        statusDisplay.textContent = '😢 電腦獲勝！';
    } else {
        drawScore++;
        statusDisplay.textContent = '平手！無法形成連線';
    }
    
    updateScoreDisplay();
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

// 修改檢查結果邏輯
function checkResult() {
    let roundWon = false;
    let winningCombination = null;
    
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && 
            board[a] === board[b] && 
            board[a] === board[c]) {
            roundWon = true;
            winningCombination = [a, b, c];
            break;
        }
    }
    
    if (roundWon) {
        const winner = currentPlayer;
        gameActive = false;
        
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
    }
    
    // 只檢查是否全部格子已填滿
    if (!board.includes('')) {
        gameActive = false;
        drawScore++;
        statusDisplay.textContent = '平手！';
        statusDisplay.classList.add('draw');
        updateScoreDisplay();
    }
}

// 檢查是否還有獲勝可能
function hasWinningPossibility() {
    // 檢查每個獲勝組合
    for (let condition of winningConditions) {
        let [a, b, c] = condition;
        let cells = [board[a], board[b], board[c]];
        
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

// 移除或註解掉 minimax 相關函數
// function getBestMove() { ... }
// function minimax() { ... }

// 重置遊戲
function resetGame() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    gameActive = true;
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'x', 'o', 'winning');
    });
    
    statusDisplay.textContent = '您是 X，輪到您下棋';
    statusDisplay.classList.remove('winner', 'draw');
    startTimer();
}

// 開始遊戲
init();