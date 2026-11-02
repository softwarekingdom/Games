
"use strict";

// =====================================
// SOFTWAREKINGDOM - SNAKE GAME
// =====================================

// GAME SETTINGS

const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext("2d");

const GRID_SIZE = 20;

const TILE_SIZE = canvas.width / GRID_SIZE;

const INITIAL_SPEED = 150;

const MIN_SPEED = 65;

const SPEED_REDUCTION = 7;

// =====================================
// HTML ELEMENTS
// =====================================

const scoreElement = document.getElementById("score");

const bestScoreElement =
    document.getElementById("bestScore");

const levelElement = document.getElementById("level");

const gameStatus =
    document.getElementById("gameStatus");

const gameOverlay =
    document.getElementById("gameOverlay");

const overlayTitle =
    document.getElementById("overlayTitle");

const overlayMessage =
    document.getElementById("overlayMessage");

const overlayStartBtn =
    document.getElementById("overlayStartBtn");

const startBtn =
    document.getElementById("startBtn");

const pauseBtn =
    document.getElementById("pauseBtn");

const restartBtn =
    document.getElementById("restartBtn");

const musicBtn =
    document.getElementById("musicBtn");

// =====================================
// GAME VARIABLES
// =====================================

let snake = [];

let food = {};

let direction = "right";

let nextDirection = "right";

let score = 0;

let bestScore = 0;

let level = 1;

let speed = INITIAL_SPEED;

let gameState = "ready";

let gameTimer = null;

// =====================================
// LOAD BEST SCORE
// =====================================

try {

    bestScore = Number(
        localStorage.getItem("skSnakeBest")
    ) || 0;

} catch (error) {

    bestScore = 0;

}

// =====================================
// UPDATE SCOREBOARD
// =====================================

function updateScoreboard() {

    scoreElement.textContent = score;

    bestScoreElement.textContent = bestScore;

    levelElement.textContent = level;

}

// =====================================
// SAVE BEST SCORE
// =====================================

function saveBestScore() {

    if (score > bestScore) {

        bestScore = score;

        try {

            localStorage.setItem(
                "skSnakeBest",
                String(bestScore)
            );

        } catch (error) {

            console.warn("Could not save best score.");

        }

    }

    updateScoreboard();

}

// =====================================
// CREATE SNAKE
// =====================================

function createSnake() {

    snake = [

        { x: 10, y: 10 },

        { x: 9, y: 10 },

        { x: 8, y: 10 }

    ];

    direction = "right";

    nextDirection = "right";

}

// =====================================
// CREATE FOOD
// =====================================

function createFood() {

    let newFood;

    do {

        newFood = {

            x: Math.floor(Math.random() * GRID_SIZE),

            y: Math.floor(Math.random() * GRID_SIZE)

        };

    } while (

        snake.some(
            segment =>
                segment.x === newFood.x &&
                segment.y === newFood.y
        )

    );

    food = newFood;

}

// =====================================
// DRAW GAME BOARD
// =====================================

function drawBoard() {

    ctx.fillStyle = "#071c12";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // GRID LINES

    ctx.strokeStyle = "#102e1d";

    ctx.lineWidth = 0.6;

    for (let i = 0; i <= GRID_SIZE; i++) {

        const position = i * TILE_SIZE;

        ctx.beginPath();

        ctx.moveTo(position, 0);

        ctx.lineTo(position, canvas.height);

        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(0, position);

        ctx.lineTo(canvas.width, position);

        ctx.stroke();

    }

}

// =====================================
// DRAW SNAKE
// =====================================

function drawSnake() {

    snake.forEach((segment, index) => {

        const padding = 1.5;

        const x = segment.x * TILE_SIZE;

        const y = segment.y * TILE_SIZE;

        ctx.fillStyle =
            index === 0 ? "#a0ffbd" : "#39ff88";

        ctx.shadowColor = "#39ff88";

        ctx.shadowBlur = index === 0 ? 12 : 5;

        ctx.beginPath();

        ctx.roundRect(
            x + padding,
            y + padding,
            TILE_SIZE - padding * 2,
            TILE_SIZE - padding * 2,
            5
        );

        ctx.fill();

        // SNAKE EYES

        if (index === 0) {

            ctx.shadowBlur = 0;

            ctx.fillStyle = "#071510";

            let eye1;
            let eye2;

            if (direction === "right") {

                eye1 = [x + 14, y + 6];
                eye2 = [x + 14, y + 14];

            } else if (direction === "left") {

                eye1 = [x + 6, y + 6];
                eye2 = [x + 6, y + 14];

            } else if (direction === "up") {

                eye1 = [x + 6, y + 6];
                eye2 = [x + 14, y + 6];

            } else {

                eye1 = [x + 6, y + 14];
                eye2 = [x + 14, y + 14];

            }

            ctx.beginPath();

            ctx.arc(
                eye1[0],
                eye1[1],
                1.5,
                0,
                Math.PI * 2
            );

            ctx.arc(
                eye2[0],
                eye2[1],
                1.5,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

    });

    ctx.shadowBlur = 0;

}

// =====================================
// DRAW FOOD
// =====================================

function drawFood() {

    const centerX =
        food.x * TILE_SIZE + TILE_SIZE / 2;

    const centerY =
        food.y * TILE_SIZE + TILE_SIZE / 2;

    ctx.shadowColor = "#ff4567";

    ctx.shadowBlur = 15;

    ctx.fillStyle = "#ff4567";

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        TILE_SIZE * 0.36,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // FOOD HIGHLIGHT

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ffb0bd";

    ctx.beginPath();

    ctx.arc(
        centerX - 3,
        centerY - 3,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();

}

// =====================================
// RENDER GAME
// =====================================

function renderGame() {

    drawBoard();

    drawFood();

    drawSnake();

}

// =====================================
// CHANGE DIRECTION
// =====================================

function changeDirection(newDirection) {

    if (gameState !== "playing") return;

    const opposite = {

        up: "down",

        down: "up",

        left: "right",

        right: "left"

    };

    if (newDirection === opposite[direction]) {
        return;
    }

    nextDirection = newDirection;

}

// =====================================
// MOVE SNAKE
// =====================================

function moveSnake() {

    direction = nextDirection;

    const head = { ...snake[0] };

    if (direction === "right") head.x++;

    if (direction === "left") head.x--;

    if (direction === "up") head.y--;

    if (direction === "down") head.y++;

    // WALL COLLISION

    if (

        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE

    ) {

        gameOver();

        return;

    }

    // FOOD CHECK

    const ateFood =

        head.x === food.x &&
        head.y === food.y;

    // SELF COLLISION
    // Allow movement into the old tail position
    // when the snake is not growing.

    const collisionBody = ateFood
        ? snake
        : snake.slice(0, -1);

    const hitSnake = collisionBody.some(
        segment =>
            segment.x === head.x &&
            segment.y === head.y
    );

    if (hitSnake) {

        gameOver();

        return;

    }

    snake.unshift(head);

    if (ateFood) {

        collectFood();

    } else {

        snake.pop();

    }

    renderGame();

}

// =====================================
// COLLECT FOOD
// =====================================

function collectFood() {

    score += 10;

    level = Math.floor(score / 50) + 1;

    speed = Math.max(
        MIN_SPEED,
        INITIAL_SPEED - (level - 1) * SPEED_REDUCTION
    );

    saveBestScore();

    createFood();

    gameStatus.textContent =
        "🍎 FOOD COLLECTED! LEVEL " + level;

    updateGameSpeed();

}

// =====================================
// GAME SPEED
// =====================================

function updateGameSpeed() {

    if (gameState !== "playing") return;

    clearInterval(gameTimer);

    gameTimer = setInterval(
        gameLoop,
        speed
    );

}

// =====================================
// GAME LOOP
// =====================================

function gameLoop() {

    if (gameState !== "playing") return;

    moveSnake();

}

// =====================================
// START GAME
// =====================================

function startGame() {

    if (gameState === "playing") return;

    if (gameState === "ready" || gameState === "over") {

        resetGameData();

    }

    gameState = "playing";

    gameOverlay.classList.add("hidden");

    gameStatus.textContent = "GAME RUNNING";

    startBtn.disabled = true;

    pauseBtn.disabled = false;

    pauseBtn.textContent = "⏸ Pause";

    updateGameSpeed();

    renderGame();

}

// =====================================
// PAUSE GAME
// =====================================

function pauseGame() {

    if (gameState !== "playing") return;

    gameState = "paused";

    clearInterval(gameTimer);

    gameOverlay.classList.remove("hidden");

    overlayTitle.textContent = "GAME PAUSED";

    overlayMessage.textContent =
        "Take a break and continue when ready!";

    overlayStartBtn.textContent = "RESUME GAME";

    gameStatus.textContent = "GAME PAUSED";

    startBtn.disabled = false;

    pauseBtn.disabled = true;

}

// =====================================
// GAME OVER
// =====================================

function gameOver() {

    gameState = "over";

    clearInterval(gameTimer);

    saveBestScore();

    gameOverlay.classList.remove("hidden");

    overlayTitle.textContent = "GAME OVER";

    overlayMessage.textContent =
        "Your Score: " + score +
        " | Best: " + bestScore;

    overlayStartBtn.textContent = "PLAY AGAIN";

    gameStatus.textContent = "GAME OVER";

    startBtn.disabled = false;

    pauseBtn.disabled = true;

    renderGame();

}

// =====================================
// RESET GAME DATA
// =====================================

function resetGameData() {

    clearInterval(gameTimer);

    score = 0;

    level = 1;

    speed = INITIAL_SPEED;

    createSnake();

    createFood();

    updateScoreboard();

    renderGame();

}

// =====================================
// RESTART GAME
// =====================================

function restartGame() {

    resetGameData();

    gameState = "ready";

    gameOverlay.classList.remove("hidden");

    overlayTitle.textContent = "SNAKE GAME";

    overlayMessage.textContent =
        "Collect food and grow your snake!";

    overlayStartBtn.textContent = "START GAME";

    gameStatus.textContent = "READY TO PLAY";

    startBtn.disabled = false;

    pauseBtn.disabled = true;

}

// =====================================
// KEYBOARD CONTROLS
// =====================================

document.addEventListener("keydown", event => {

    const keys = {

        ArrowUp: "up",

        ArrowDown: "down",

        ArrowLeft: "left",

        ArrowRight: "right",

        w: "up",

        s: "down",

        a: "left",

        d: "right"

    };

    if (keys[event.key]) {

        event.preventDefault();

        changeDirection(keys[event.key]);

    }

    if (event.key === " " && gameState === "playing") {

        event.preventDefault();

        pauseGame();

    }

});

// =====================================
// MOBILE BUTTON CONTROLS
// =====================================

document.querySelectorAll(".direction-btn").forEach(button => {

    button.addEventListener("click", () => {

        changeDirection(button.dataset.direction);

    });

});

// =====================================
// SWIPE CONTROLS
// =====================================

let touchStartX = 0;

let touchStartY = 0;

canvas.addEventListener("touchstart", event => {

    const touch = event.changedTouches[0];

    touchStartX = touch.clientX;

    touchStartY = touch.clientY;

}, { passive: true });

canvas.addEventListener("touchend", event => {

    const touch = event.changedTouches[0];

    const deltaX = touch.clientX - touchStartX;

    const deltaY = touch.clientY - touchStartY;

    if (
        Math.max(
            Math.abs(deltaX),
            Math.abs(deltaY)
        ) < 20
    ) {

        return;

    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {

        changeDirection(
            deltaX > 0 ? "right" : "left"
        );

    } else {

        changeDirection(
            deltaY > 0 ? "down" : "up"
        );

    }

}, { passive: true });

// =====================================
// BUTTON EVENTS
// =====================================

startBtn.addEventListener("click", startGame);

overlayStartBtn.addEventListener("click", startGame);

pauseBtn.addEventListener("click", pauseGame);

restartBtn.addEventListener("click", restartGame);

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
// INITIALIZE GAME
// =====================================

resetGameData();

gameState = "ready";

gameOverlay.classList.remove("hidden");

overlayTitle.textContent = "SNAKE GAME";

overlayMessage.textContent =
    "Collect food and grow your snake!";

overlayStartBtn.textContent = "START GAME";

gameStatus.textContent = "PRESS START TO PLAY";

startBtn.disabled = false;

pauseBtn.disabled = true;

