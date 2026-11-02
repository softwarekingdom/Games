
"use strict";

// =====================================
// SOFTWAREKINGDOM - CONNECT FOUR
// =====================================

// GAME SETTINGS

const ROWS = 6;
const COLS = 7;

const EMPTY = 0;
const PLAYER_ONE = 1;
const PLAYER_TWO = 2;

let board = [];
let currentPlayer = PLAYER_ONE;

let gameMode = "computer";
let gameActive = true;

let scoreOne = 0;
let scoreTwo = 0;
let drawScore = 0;

let firstPlayerChoice = null;

// =====================================
// HTML ELEMENTS
// =====================================

const gameBoard = document.getElementById("gameBoard");

const turnIndicator =
    document.getElementById("turnIndicator");

const gameMessage =
    document.getElementById("gameMessage");

const scoreOneElement =
    document.getElementById("scoreOne");

const scoreTwoElement =
    document.getElementById("scoreTwo");

const drawScoreElement =
    document.getElementById("drawScore");

const playerOneLabel =
    document.getElementById("playerOneLabel");

const playerTwoLabel =
    document.getElementById("playerTwoLabel");

const computerMode =
    document.getElementById("computerMode");

const twoPlayerMode =
    document.getElementById("twoPlayerMode");

const restartBtn =
    document.getElementById("restartBtn");

const resetScoreBtn =
    document.getElementById("resetScoreBtn");

const musicBtn =
    document.getElementById("musicBtn");

// =====================================
// INITIALIZE GAME
// =====================================

function initializeGame() {

    board = Array.from(
        { length: ROWS },
        () => Array(COLS).fill(EMPTY)
    );

    currentPlayer = PLAYER_ONE;

    gameActive = true;

    firstPlayerChoice = null;

    renderBoard();

    updateTurn();

    gameMessage.textContent =
        "Select a column to drop your disc!";

}

// =====================================
// RENDER BOARD
// =====================================

function renderBoard() {

    gameBoard.innerHTML = "";

    for (let row = 0; row < ROWS; row++) {

        for (let col = 0; col < COLS; col++) {

            const cell = document.createElement("button");

            cell.type = "button";

            cell.className = "cell";

            cell.dataset.row = row;
            cell.dataset.col = col;

            const disc = document.createElement("div");

            disc.className = "disc";

            if (board[row][col] === PLAYER_ONE) {
                cell.classList.add("red");
            }

            if (board[row][col] === PLAYER_TWO) {
                cell.classList.add("yellow");
            }

            cell.appendChild(disc);

            cell.addEventListener("click", () => {
                handleColumnClick(col);
            });

            gameBoard.appendChild(cell);

        }

    }

}

// =====================================
// DROP DISC
// =====================================

function dropDisc(col, player) {

    if (col < 0 || col >= COLS) {
        return -1;
    }

    for (let row = ROWS - 1; row >= 0; row--) {

        if (board[row][col] === EMPTY) {

            board[row][col] = player;

            return row;

        }

    }

    return -1;

}

// =====================================
// HANDLE PLAYER MOVE
// =====================================

function handleColumnClick(col) {

    if (!gameActive) return;

    if (
        gameMode === "computer" &&
        currentPlayer === PLAYER_TWO
    ) {
        return;
    }

    if (gameMode === "two" && firstPlayerChoice !== null) {

        if (firstPlayerChoice === col) {

            gameMessage.textContent =
                "Player 2 must choose a column!";

            return;

        }

        // Player 2's selection is handled below.
    }

    if (gameMode === "two") {

        if (firstPlayerChoice === null) {

            const row = dropDisc(col, PLAYER_ONE);

            if (row === -1) {
                gameMessage.textContent =
                    "This column is full!";
                return;
            }

            renderBoard();

            if (checkGameEnd(PLAYER_ONE)) return;

            firstPlayerChoice = col;

            currentPlayer = PLAYER_TWO;

            updateTurn();

            gameMessage.textContent =
                "Player 1 has played. Player 2, choose your column!";

            return;

        } else {

            const row = dropDisc(col, PLAYER_TWO);

            if (row === -1) {
                gameMessage.textContent =
                    "This column is full!";
                return;
            }

            renderBoard();

            if (checkGameEnd(PLAYER_TWO)) return;

            firstPlayerChoice = null;

            currentPlayer = PLAYER_ONE;

            updateTurn();

            gameMessage.textContent =
                "Player 1, your turn!";

            return;

        }

    }

    // PLAYER VS COMPUTER

    const row = dropDisc(col, PLAYER_ONE);

    if (row === -1) {

        gameMessage.textContent =
            "This column is full!";

        return;

    }

    renderBoard();

    if (checkGameEnd(PLAYER_ONE)) return;

    currentPlayer = PLAYER_TWO;

    updateTurn();

    gameMessage.textContent =
        "Computer is thinking...";

    setTimeout(() => {

        if (!gameActive) return;

        const computerColumn = getComputerMove();

        if (computerColumn !== -1) {

            dropDisc(computerColumn, PLAYER_TWO);

            renderBoard();

            if (checkGameEnd(PLAYER_TWO)) return;

            currentPlayer = PLAYER_ONE;

            updateTurn();

            gameMessage.textContent =
                "Your turn!";

        }

    }, 450);

}

// =====================================
// CHECK WINNER
// =====================================

function getWinningCells(player) {

    const directions = [

        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1]

    ];

    for (let row = 0; row < ROWS; row++) {

        for (let col = 0; col < COLS; col++) {

            if (board[row][col] !== player) continue;

            for (const [dr, dc] of directions) {

                const cells = [];

                for (let i = 0; i < 4; i++) {

                    const r = row + dr * i;
                    const c = col + dc * i;

                    if (
                        r < 0 ||
                        r >= ROWS ||
                        c < 0 ||
                        c >= COLS ||
                        board[r][c] !== player
                    ) {
                        break;
                    }

                    cells.push({ row: r, col: c });

                }

                if (cells.length === 4) {
                    return cells;
                }

            }

        }

    }

    return null;

}

// =====================================
// HIGHLIGHT WINNING CELLS
// =====================================

function highlightWinningCells(cells) {

    if (!cells) return;

    cells.forEach(({ row, col }) => {

        const cell = gameBoard.querySelector(
            `[data-row="${row}"][data-col="${col}"]`
        );

        if (cell) {
            cell.classList.add("winning");
        }

    });

}

// =====================================
// CHECK GAME END
// =====================================

function checkGameEnd(player) {

    const winningCells = getWinningCells(player);

    if (winningCells) {

        gameActive = false;

        highlightWinningCells(winningCells);

        if (player === PLAYER_ONE) {

            scoreOne++;

            gameMessage.textContent =
                gameMode === "computer"
                ? "🎉 You Win!"
                : "🎉 Player 1 Wins!";

        } else {

            scoreTwo++;

            gameMessage.textContent =
                gameMode === "computer"
                ? "🤖 Computer Wins!"
                : "🎉 Player 2 Wins!";

        }

        updateScores();

        turnIndicator.textContent = "GAME OVER";

        return true;

    }

    if (board.every(row => row.every(cell => cell !== EMPTY))) {

        gameActive = false;

        drawScore++;

        updateScores();

        gameMessage.textContent =
            "🤝 It's a Draw!";

        turnIndicator.textContent = "GAME OVER";

        return true;

    }

    return false;

}

// =====================================
// COMPUTER AI
// =====================================

function getValidColumns() {

    const valid = [];

    for (let col = 0; col < COLS; col++) {

        if (board[0][col] === EMPTY) {
            valid.push(col);
        }

    }

    return valid;

}

function simulateMove(col, player) {

    for (let row = ROWS - 1; row >= 0; row--) {

        if (board[row][col] === EMPTY) {

            board[row][col] = player;

            return row;

        }

    }

    return -1;

}

function undoMove(row, col) {

    if (row !== -1) {
        board[row][col] = EMPTY;
    }

}

function hasWinningMove(player) {

    const validColumns = getValidColumns();

    for (const col of validColumns) {

        const row = simulateMove(col, player);

        const wins = getWinningCells(player) !== null;

        undoMove(row, col);

        if (wins) {
            return col;
        }

    }

    return -1;

}

function getComputerMove() {

    const validColumns = getValidColumns();

    if (validColumns.length === 0) {
        return -1;
    }

    // 1. Win if possible.

    const winningMove = hasWinningMove(PLAYER_TWO);

    if (winningMove !== -1) {
        return winningMove;
    }

    // 2. Block Player 1's winning move.

    const blockingMove = hasWinningMove(PLAYER_ONE);

    if (blockingMove !== -1) {
        return blockingMove;
    }

    // 3. Prefer the center column.

    const preferredColumns = [3, 2, 4, 1, 5, 0, 6];

    for (const col of preferredColumns) {

        if (validColumns.includes(col)) {

            if (Math.random() < 0.75) {
                return col;
            }

        }

    }

    return validColumns[
        Math.floor(Math.random() * validColumns.length)
    ];

}

// =====================================
// UPDATE TURN
// =====================================

function updateTurn() {

    if (gameMode === "computer") {

        turnIndicator.textContent =
            currentPlayer === PLAYER_ONE
            ? "🔴 YOUR TURN"
            : "🟡 COMPUTER'S TURN";

    } else {

        turnIndicator.textContent =
            currentPlayer === PLAYER_ONE
            ? "🔴 PLAYER 1'S TURN"
            : "🟡 PLAYER 2'S TURN";

    }

}

// =====================================
// UPDATE SCOREBOARD
// =====================================

function updateScores() {

    scoreOneElement.textContent = scoreOne;

    scoreTwoElement.textContent = scoreTwo;

    drawScoreElement.textContent = drawScore;

}

// =====================================
// CHANGE GAME MODE
// =====================================

function setGameMode(mode) {

    gameMode = mode;

    computerMode.classList.toggle(
        "active",
        mode === "computer"
    );

    twoPlayerMode.classList.toggle(
        "active",
        mode === "two"
    );

    playerOneLabel.textContent =
        mode === "computer" ? "YOU" : "PLAYER 1";

    playerTwoLabel.textContent =
        mode === "computer" ? "COMPUTER" : "PLAYER 2";

    initializeGame();

}

// =====================================
// RESTART GAME
// =====================================

function restartGame() {

    initializeGame();

}

// =====================================
// RESET SCORES
// =====================================

function resetScores() {

    scoreOne = 0;

    scoreTwo = 0;

    drawScore = 0;

    updateScores();

    initializeGame();

}

// =====================================
// MUSIC CONTROL
// =====================================

if (typeof gameMusic !== "undefined" && musicBtn) {

    musicBtn.addEventListener("click", async () => {

        if (!gameMusic.isPlaying) {

            await gameMusic.start();

            if (gameMusic.isPlaying) {
                musicBtn.textContent = "🎵 Music ON";
            }

        } else {

            gameMusic.stop();

            musicBtn.textContent = "🎵 Music OFF";

        }

    });

}

// =====================================
// EVENT LISTENERS
// =====================================

computerMode.addEventListener("click", () => {

    setGameMode("computer");

});

twoPlayerMode.addEventListener("click", () => {

    setGameMode("two");

});

restartBtn.addEventListener("click", restartGame);

resetScoreBtn.addEventListener("click", resetScores);

// =====================================
// START GAME
// =====================================

initializeGame();

updateScores();
