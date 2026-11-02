
"use strict";

// =====================================
// SOFTWAREKINGDOM - 2048 GAME ENGINE
// =====================================

const SIZE = 4;
const TARGET = 2048;

let board = [];
let score = 0;
let bestScore = 0;

let gameActive = true;
let won = false;
let keepPlaying = false;

let previousState = null;
let newTileIndex = -1;

// =====================================
// HTML ELEMENTS
// =====================================

const gameBoard = document.getElementById("gameBoard");

const scoreElement = document.getElementById("score");

const bestScoreElement =
    document.getElementById("bestScore");

const gameMessage =
    document.getElementById("gameMessage");

const newGameBtn =
    document.getElementById("newGameBtn");

const undoBtn =
    document.getElementById("undoBtn");

const musicBtn =
    document.getElementById("musicBtn");

// =====================================
// LOAD BEST SCORE
// =====================================

try {

    bestScore = Number(
        localStorage.getItem("sk2048BestScore")
    ) || 0;

} catch (error) {

    bestScore = 0;

}

// =====================================
// SAVE BEST SCORE
// =====================================

function saveBestScore() {

    if (score > bestScore) {

        bestScore = score;

        try {

            localStorage.setItem(
                "sk2048BestScore",
                String(bestScore)
            );

        } catch (error) {

            console.warn("Best score could not be saved.");

        }

    }

    updateScore();

}

// =====================================
// UPDATE SCORE
// =====================================

function updateScore() {

    scoreElement.textContent = score;

    bestScoreElement.textContent = bestScore;

}

// =====================================
// CREATE EMPTY BOARD
// =====================================

function createEmptyBoard() {

    return Array.from(
        { length: SIZE },
        () => Array(SIZE).fill(0)
    );

}

// =====================================
// ADD RANDOM TILE
// =====================================

function addRandomTile() {

    const emptyCells = [];

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            if (board[row][col] === 0) {

                emptyCells.push({ row, col });

            }

        }

    }

    if (emptyCells.length === 0) return;

    const randomCell =
        emptyCells[
            Math.floor(Math.random() * emptyCells.length)
        ];

    const value = Math.random() < 0.9 ? 2 : 4;

    board[randomCell.row][randomCell.col] = value;

    newTileIndex =
        randomCell.row * SIZE + randomCell.col;

}

// =====================================
// RENDER BOARD
// =====================================

function renderBoard() {

    gameBoard.innerHTML = "";

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            const value = board[row][col];

            const tile = document.createElement("div");

            tile.className = "tile";

            if (value !== 0) {

                tile.textContent = value;

                tile.dataset.value = value;

            }

            const index = row * SIZE + col;

            if (index === newTileIndex && value !== 0) {

                tile.classList.add("new-tile");

            }

            gameBoard.appendChild(tile);

        }

    }

    newTileIndex = -1;

    updateScore();

}

// =====================================
// SAVE PREVIOUS STATE
// =====================================

function savePreviousState() {

    previousState = {

        board: board.map(row => [...row]),

        score: score,

        won: won,

        keepPlaying: keepPlaying,

        gameActive: gameActive

    };

    undoBtn.disabled = false;

}

// =====================================
// RESTORE PREVIOUS STATE
// =====================================

function undoMove() {

    if (!previousState) {

        gameMessage.textContent =
            "No previous move available!";

        return;

    }

    board = previousState.board.map(
        row => [...row]
    );

    score = previousState.score;

    won = previousState.won;

    keepPlaying = previousState.keepPlaying;

    gameActive = previousState.gameActive;

    previousState = null;

    undoBtn.disabled = true;

    gameMessage.textContent =
        "Previous move restored!";

    renderBoard();

    if (!gameActive) {

        gameMessage.textContent =
            "Game Over! Press New Game to play again.";

    } else if (won && !keepPlaying) {

        gameMessage.textContent =
            "🎉 You reached 2048!";

    }

}

// =====================================
// MERGE ROW
// =====================================

function mergeRow(row) {

    const filtered = row.filter(value => value !== 0);

    const merged = [];

    let gainedScore = 0;

    for (let i = 0; i < filtered.length; i++) {

        if (filtered[i] === filtered[i + 1]) {

            const newValue = filtered[i] * 2;

            merged.push(newValue);

            gainedScore += newValue;

            i++;

        } else {

            merged.push(filtered[i]);

        }

    }

    while (merged.length < SIZE) {

        merged.push(0);

    }

    return {

        row: merged,

        gainedScore: gainedScore

    };

}

// =====================================
// ROTATE BOARD
// =====================================

function rotateBoard(times = 1) {

    for (let t = 0; t < times; t++) {

        const rotated = createEmptyBoard();

        for (let row = 0; row < SIZE; row++) {

            for (let col = 0; col < SIZE; col++) {

                rotated[col][SIZE - 1 - row] =
                    board[row][col];

            }

        }

        board = rotated;

    }

}

// =====================================
// MOVE LEFT
// =====================================

function moveLeft() {

    let gainedScore = 0;

    const newBoard = [];

    for (let row = 0; row < SIZE; row++) {

        const result = mergeRow(board[row]);

        newBoard.push(result.row);

        gainedScore += result.gainedScore;

    }

    board = newBoard;

    score += gainedScore;

}

// =====================================
// MOVE RIGHT
// =====================================

function moveRight() {

    rotateBoard(2);

    moveLeft();

    rotateBoard(2);

}

// =====================================
// MOVE UP
// =====================================

function moveUp() {

    rotateBoard(3);

    moveLeft();

    rotateBoard(1);

}

// =====================================
// MOVE DOWN
// =====================================

function moveDown() {

    rotateBoard(1);

    moveLeft();

    rotateBoard(3);

}

// =====================================
// CHECK BOARD CHANGED
// =====================================

function boardsAreEqual(oldBoard, newBoard) {

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            if (
                oldBoard[row][col] !==
                newBoard[row][col]
            ) {

                return false;

            }

        }

    }

    return true;

}

// =====================================
// CHECK WIN
// =====================================

function checkWin() {

    if (won) return;

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            if (board[row][col] === TARGET) {

                won = true;

                gameMessage.textContent =
                    "🎉 Amazing! You reached 2048!";

                return;

            }

        }

    }

}

// =====================================
// CHECK GAME OVER
// =====================================

function checkGameOver() {

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            if (board[row][col] === 0) {

                return false;

            }

            if (
                col < SIZE - 1 &&
                board[row][col] === board[row][col + 1]
            ) {

                return false;

            }

            if (
                row < SIZE - 1 &&
                board[row][col] === board[row + 1][col]
            ) {

                return false;

            }

        }

    }

    return true;

}

// =====================================
// HANDLE MOVE
// =====================================

function handleMove(direction) {

    if (!gameActive) return;

    const oldBoard = board.map(row => [...row]);

    const oldScore = score;

    switch (direction) {

        case "left":
            moveLeft();
            break;

        case "right":
            moveRight();
            break;

        case "up":
            moveUp();
            break;

        case "down":
            moveDown();
            break;

        default:
            return;

    }

    if (boardsAreEqual(oldBoard, board)) {

        score = oldScore;

        return;

    }

    // Save state before adding a new tile.

    previousState = {

        board: oldBoard,

        score: oldScore,

        won: won,

        keepPlaying: keepPlaying,

        gameActive: gameActive

    };

    undoBtn.disabled = false;

    addRandomTile();

    saveBestScore();

    checkWin();

    if (won && !keepPlaying) {

        gameActive = false;

        renderBoard();

        return;

    }

    if (checkGameOver()) {

        gameActive = false;

        gameMessage.textContent =
            "😢 Game Over! Press New Game.";

    } else if (!won) {

        gameMessage.textContent =
            "Keep going! Reach 2048!";

    }

    renderBoard();

}

// =====================================
// START NEW GAME
// =====================================

function newGame() {

    board = createEmptyBoard();

    score = 0;

    gameActive = true;

    won = false;

    keepPlaying = false;

    previousState = null;

    newTileIndex = -1;

    undoBtn.disabled = true;

    addRandomTile();

    addRandomTile();

    gameMessage.textContent =
        "Good Luck! Reach 2048!";

    renderBoard();

}

// =====================================
// CONTINUE AFTER WIN
// =====================================

function continuePlaying() {

    if (!won || gameActive) return;

    keepPlaying = true;

    gameActive = true;

    gameMessage.textContent =
        "Keep playing! Try for a higher score.";

    renderBoard();

}

// =====================================
// KEYBOARD CONTROLS
// =====================================

document.addEventListener("keydown", event => {

    const keyMap = {

        ArrowLeft: "left",

        ArrowRight: "right",

        ArrowUp: "up",

        ArrowDown: "down"

    };

    const direction = keyMap[event.key];

    if (direction) {

        event.preventDefault();

        handleMove(direction);

    }

});

// =====================================
// MOBILE BUTTON CONTROLS
// =====================================

document.querySelectorAll(".move-btn").forEach(button => {

    button.addEventListener("click", () => {

        handleMove(button.dataset.direction);

    });

});

// =====================================
// SWIPE CONTROLS
// =====================================

let touchStartX = 0;
let touchStartY = 0;

gameBoard.addEventListener("touchstart", event => {

    const touch = event.changedTouches[0];

    touchStartX = touch.clientX;

    touchStartY = touch.clientY;

}, { passive: true });

gameBoard.addEventListener("touchend", event => {

    const touch = event.changedTouches[0];

    const deltaX = touch.clientX - touchStartX;

    const deltaY = touch.clientY - touchStartY;

    const minDistance = 30;

    if (
        Math.max(
            Math.abs(deltaX),
            Math.abs(deltaY)
        ) < minDistance
    ) {

        return;

    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {

        handleMove(
            deltaX > 0 ? "right" : "left"
        );

    } else {

        handleMove(
            deltaY > 0 ? "down" : "up"
        );

    }

}, { passive: true });

// =====================================
// NEW GAME BUTTON
// =====================================

newGameBtn.addEventListener("click", newGame);

// =====================================
// UNDO BUTTON
// =====================================

undoBtn.addEventListener("click", undoMove);

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
// START GAME
// =====================================

newGame();

updateScore();

