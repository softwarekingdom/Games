
"use strict";

// ==========================================
// NEON BRICK BREAKER
// SOFTWAREKINGDOM ARCADE
// ==========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("bestScore");
const levelEl = document.getElementById("level");
const livesEl = document.getElementById("lives");
const statusEl = document.getElementById("gameStatus");

const overlay = document.getElementById("gameOverlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayMessage = document.getElementById("overlayMessage");
const overlayIcon = document.getElementById("overlayIcon");
const overlayStartBtn = document.getElementById("overlayStartBtn");

const W = canvas.width;
const H = canvas.height;

const COLORS = [
    "#00f5ff",
    "#a855f7",
    "#ff2bd6",
    "#ff9f1c",
    "#36ff85",
    "#4778ff"
];

let score = 0;
let bestScore = 0;
let level = 1;
let lives = 3;

let state = "ready";
let musicEnabled = false;

let bricks = [];
let balls = [];
let particles = [];
let powerups = [];

let paddle = {
    x: W / 2 - 65,
    y: 550,
    w: 130,
    h: 15,
    speed: 9
};

let keys = {
    left: false,
    right: false
};

let expandedUntil = 0;
let slowedUntil = 0;

let lastFrame = 0;
let animationId = null;
let audioContext = null;

try {
    bestScore = Number(localStorage.getItem("neonBrickBest")) || 0;
} catch (error) {
    bestScore = 0;
}

bestEl.textContent = bestScore;

// ==========================================
// AUDIO EFFECTS
// ==========================================

function playSound(frequency = 440, duration = 0.07, type = "sine") {
    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return;

        if (!audioContext) {
            audioContext = new AudioContextClass();
        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(
            frequency,
            audioContext.currentTime
        );

        gain.gain.setValueAtTime(0.12, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + duration
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);

    } catch (error) {
        // Audio is optional.
    }
}

function toggleMusic() {
    musicEnabled = !musicEnabled;

    const button = document.getElementById("musicBtn");

    if (musicEnabled) {
        if (typeof gameMusic !== "undefined") {
            gameMusic.start();
        }

        button.textContent = "♫ MUSIC ON";
    } else {
        if (typeof gameMusic !== "undefined") {
            gameMusic.stop();
        }

        button.textContent = "♫ MUSIC OFF";
    }
}

// ==========================================
// GAME INITIALIZATION
// ==========================================

function createBall() {
    const speed = 5.5 + Math.min(level * 0.35, 3);

    return {
        x: paddle.x + paddle.w / 2,
        y: paddle.y - 15,
        r: 9,
        vx: (Math.random() > 0.5 ? 1 : -1) * speed * 0.65,
        vy: -speed
    };
}

function createBricks() {
    bricks = [];

    const columns = 10;
    const rows = Math.min(5 + Math.floor((level - 1) / 2), 7);

    const brickW = 70;
    const brickH = 25;
    const gap = 10;

    const totalWidth = columns * brickW + (columns - 1) * gap;
    const startX = (W - totalWidth) / 2;
    const startY = 85;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {

            const hp = level >= 3 && row < 2 ? 2 : 1;

            bricks.push({
                x: startX + col * (brickW + gap),
                y: startY + row * (brickH + gap),
                w: brickW,
                h: brickH,
                color: COLORS[row % COLORS.length],
                hp: hp,
                alive: true
            });
        }
    }
}

function resetPaddle() {
    paddle.w = 130;
    paddle.x = W / 2 - paddle.w / 2;
    paddle.y = 550;
}

function resetGame() {
    score = 0;
    level = 1;
    lives = 3;

    particles = [];
    powerups = [];
    balls = [];

    expandedUntil = 0;
    slowedUntil = 0;

    resetPaddle();
    createBricks();

    balls.push(createBall());

    updateHUD();
}

function updateHUD() {
    scoreEl.textContent = score;
    bestEl.textContent = bestScore;
    levelEl.textContent = level;
    livesEl.textContent = lives;
}

// ==========================================
// OVERLAY
// ==========================================

function showOverlay(title, message, icon, buttonText) {
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    overlayIcon.textContent = icon;
    overlayStartBtn.textContent = buttonText;

    overlay.classList.remove("hidden");
}

function hideOverlay() {
    overlay.classList.add("hidden");
}

// ==========================================
// GAME CONTROLS
// ==========================================

function startGame() {
    if (state === "playing") return;

    if (state === "ready" || state === "over" || state === "won") {
        if (state === "over" || state === "won") {
            resetGame();
        }
    }

    state = "playing";

    hideOverlay();
    statusEl.textContent = "PLAYING";

    playSound(550, 0.1);
}

function pauseGame() {
    if (state === "playing") {
        state = "paused";

        showOverlay(
            "GAME PAUSED",
            "Take a break. Your progress is saved.",
            "Ⅱ",
            "RESUME GAME"
        );

        statusEl.textContent = "PAUSED";

    } else if (state === "paused") {
        startGame();
    }
}

function restartGame() {
    resetGame();

    state = "ready";

    showOverlay(
        "NEON BRICK BREAKER",
        "Break the bricks. Collect power-ups. Beat every level.",
        "◆",
        "START GAME"
    );

    statusEl.textContent = "READY";
}

// ==========================================
// DRAW BACKGROUND
// ==========================================

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);

    gradient.addColorStop(0, "#101b38");
    gradient.addColorStop(0.55, "#080e20");
    gradient.addColorStop(1, "#050916");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // Neon grid
    ctx.save();

    ctx.strokeStyle = "#1c4260";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.24;

    for (let x = 0; x <= W; x += 45) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
    }

    for (let y = 0; y <= H; y += 45) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
    }

    ctx.restore();

    // Arena border
    ctx.save();

    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00eaff";
    ctx.strokeStyle = "#00eaff66";
    ctx.lineWidth = 2;

    ctx.strokeRect(5, 5, W - 10, H - 10);

    ctx.restore();

    // Background lights
    const glow = ctx.createRadialGradient(
        W / 2, 220, 10,
        W / 2, 220, 420
    );

    glow.addColorStop(0, "#123d6330");
    glow.addColorStop(1, "#06102000");

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
}

// ==========================================
// DRAW BRICKS
// ==========================================

function drawBrick(brick) {
    if (!brick.alive) return;

    const { x, y, w, h, color, hp } = brick;

    ctx.save();

    ctx.shadowColor = color;
    ctx.shadowBlur = 16;

    // Main body
    const gradient = ctx.createLinearGradient(x, y, x, y + h);

    gradient.addColorStop(0, color);
    gradient.addColorStop(0.35, color);
    gradient.addColorStop(1, "#11182c");

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 5);
    ctx.fill();

    // Top highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff75";

    ctx.fillRect(x + 5, y + 3, w - 10, 2);

    // Bottom bevel
    ctx.fillStyle = "#00000066";
    ctx.fillRect(x + 4, y + h - 4, w - 8, 3);

    // Side bevel
    ctx.fillStyle = "#ffffff30";
    ctx.fillRect(x + 3, y + 4, 2, h - 8);

    if (hp > 1) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(hp, x + w / 2, y + h / 2 + 4);
    }

    ctx.restore();
}

function drawBricks() {
    bricks.forEach(drawBrick);
}

// ==========================================
// DRAW PADDLE
// ==========================================

function drawPaddle() {
    ctx.save();

    const gradient = ctx.createLinearGradient(
        paddle.x,
        paddle.y,
        paddle.x,
        paddle.y + paddle.h
    );

    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.25, "#00f5ff");
    gradient.addColorStop(1, "#0874d4");

    ctx.shadowColor = "#00eaff";
    ctx.shadowBlur = 25;

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.roundRect(
        paddle.x,
        paddle.y,
        paddle.w,
        paddle.h,
        8
    );
    ctx.fill();

    ctx.restore();
}

// ==========================================
// DRAW BALL
// ==========================================

function drawBall(ball) {
    ctx.save();

    const gradient = ctx.createRadialGradient(
        ball.x - 3,
        ball.y - 3,
        1,
        ball.x,
        ball.y,
        ball.r + 3
    );

    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.35, "#9fffff");
    gradient.addColorStop(1, "#00aaff");

    ctx.shadowColor = "#00f5ff";
    ctx.shadowBlur = 25;

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// ==========================================
// PARTICLE EFFECTS
// ==========================================

function createExplosion(x, y, color) {
    for (let i = 0; i < 13; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;

        particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 5 + 2,
            life: 1,
            color
        });
    }
}

function updateParticles() {
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.98;
        p.vy *= 0.98;

        p.life -= 0.025;
        p.size *= 0.97;
    });

    particles = particles.filter(p => p.life > 0);
}

function drawParticles() {
    particles.forEach(p => {
        ctx.save();

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });
}

// ==========================================
// POWER-UPS
// ==========================================

function createPowerup(x, y) {
    if (Math.random() > 0.22) return;

    const types = ["expand", "multiball", "slow"];
    const type = types[Math.floor(Math.random() * types.length)];

    powerups.push({
        x,
        y,
        type,
        speed: 2.5,
        size: 13
    });
}

function drawPowerups() {
    const symbols = {
        expand: "↔",
        multiball: "✦",
        slow: "◷"
    };

    const colors = {
        expand: "#00f5ff",
        multiball: "#ff2bd6",
        slow: "#a855f7"
    };

    powerups.forEach(p => {
        ctx.save();

        ctx.shadowColor = colors[p.type];
        ctx.shadowBlur = 20;

        ctx.fillStyle = "#101c36";
        ctx.strokeStyle = colors[p.type];
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(symbols[p.type], p.x, p.y);

        ctx.restore();
    });
}

function collectPowerup(powerup) {
    playSound(850, 0.18, "triangle");

    if (powerup.type === "expand") {
        paddle.w = 190;
        expandedUntil = Date.now() + 10000;

    } else if (powerup.type === "multiball") {
        const extra = [];

        balls.forEach(ball => {
            extra.push({
                ...ball,
                vx: -ball.vx,
                vy: ball.vy
            });
        });

        balls.push(...extra);

    } else if (powerup.type === "slow") {
        slowedUntil = Date.now() + 8000;
    }
}

// ==========================================
// COLLISION DETECTION
// ==========================================

function circleRectCollision(ball, rect) {
    const closestX = Math.max(
        rect.x,
        Math.min(ball.x, rect.x + rect.w)
    );

    const closestY = Math.max(
        rect.y,
        Math.min(ball.y, rect.y + rect.h)
    );

    const dx = ball.x - closestX;
    const dy = ball.y - closestY;

    return dx * dx + dy * dy < ball.r * ball.r;
}

function hitBrick(ball, brick) {
    const previousX = ball.x - ball.vx;
    const previousY = ball.y - ball.vy;

    if (
        previousY + ball.r <= brick.y ||
        previousY - ball.r >= brick.y + brick.h
    ) {
        ball.vy *= -1;
    } else if (
        previousX + ball.r <= brick.x ||
        previousX - ball.r >= brick.x + brick.w
    ) {
        ball.vx *= -1;
    } else {
        ball.vy *= -1;
    }

    brick.hp--;

    if (brick.hp <= 0) {
        brick.alive = false;

        score += 10 * level;

        createExplosion(
            brick.x + brick.w / 2,
            brick.y + brick.h / 2,
            brick.color
        );

        createPowerup(
            brick.x + brick.w / 2,
            brick.y + brick.h / 2
        );

        playSound(330 + Math.random() * 300, 0.07, "square");

    } else {
        playSound(250, 0.05);
    }

    updateBestScore();
    updateHUD();
}

// ==========================================
// SCORE & BEST SCORE
// ==========================================

function updateBestScore() {
    if (score > bestScore) {
        bestScore = score;

        try {
            localStorage.setItem("neonBrickBest", bestScore);
        } catch (error) {
            // Storage may be unavailable.
        }
    }
}

// ==========================================
// LEVEL SYSTEM
// ==========================================

function checkLevelComplete() {
    if (bricks.some(brick => brick.alive)) return;

    level++;

    updateHUD();

    if (level > 10) {
        state = "won";
        statusEl.textContent = "VICTORY";

        showOverlay(
            "YOU ARE THE CHAMPION!",
            "Incredible! You completed all 10 levels.",
            "🏆",
            "PLAY AGAIN"
        );

        playSound(900, 0.35, "triangle");
        return;
    }

    createBricks();

    balls = [createBall()];
    powerups = [];

    expandedUntil = 0;
    slowedUntil = 0;

    paddle.w = 130;

    playSound(700, 0.2, "triangle");
}

// ==========================================
// UPDATE BALLS
// ==========================================

function updateBalls() {
    const slowActive = Date.now() < slowedUntil;

    const slowFactor = slowActive ? 0.72 : 1;

    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];

        const vx = ball.vx * slowFactor;
        const vy = ball.vy * slowFactor;

        ball.x += vx;
        ball.y += vy;

        // Left and right walls
        if (ball.x - ball.r <= 8 || ball.x + ball.r >= W - 8) {
            ball.vx *= -1;
            ball.x = Math.max(
                ball.r + 8,
                Math.min(W - ball.r - 8, ball.x)
            );

            playSound(180, 0.04);
        }

        // Top wall
        if (ball.y - ball.r <= 8) {
            ball.vy = Math.abs(ball.vy);
            ball.y = ball.r + 8;

            playSound(220, 0.04);
        }

        // Paddle collision
        if (
            ball.vy > 0 &&
            circleRectCollision(ball, paddle)
        ) {
            const hitPosition =
                (ball.x - (paddle.x + paddle.w / 2)) /
                (paddle.w / 2);

            ball.vx = hitPosition * 6.5;
            ball.vy = -Math.max(4.5, Math.abs(ball.vy));

            ball.y = paddle.y - ball.r;

            playSound(480, 0.07, "triangle");
        }

        // Brick collision
        for (const brick of bricks) {
            if (!brick.alive) continue;

            if (circleRectCollision(ball, brick)) {
                hitBrick(ball, brick);
                break;
            }
        }

        // Lost ball
        if (ball.y - ball.r > H) {
            balls.splice(i, 1);
        }
    }

    if (balls.length === 0) {
        lives--;

        updateHUD();

        if (lives <= 0) {
            gameOver();
        } else {
            balls = [createBall()];
            playSound(150, 0.25, "sawtooth");
        }
    }
}

// ==========================================
// UPDATE PADDLE
// ==========================================

function updatePaddle() {
    if (keys.left) {
        paddle.x -= paddle.speed;
    }

    if (keys.right) {
        paddle.x += paddle.speed;
    }

    paddle.x = Math.max(
        8,
        Math.min(W - paddle.w - 8, paddle.x)
    );

    if (Date.now() > expandedUntil) {
        paddle.w = 130;
    }
}

// ==========================================
// UPDATE POWER-UPS
// ==========================================

function updatePowerups() {
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];

        p.y += p.speed;

        const caught =
            p.x + p.size > paddle.x &&
            p.x - p.size < paddle.x + paddle.w &&
            p.y + p.size > paddle.y &&
            p.y - p.size < paddle.y + paddle.h;

        if (caught) {
            collectPowerup(p);
            powerups.splice(i, 1);

        } else if (p.y > H + 30) {
            powerups.splice(i, 1);
        }
    }
}

// ==========================================
// GAME OVER
// ==========================================

function gameOver() {
    state = "over";

    statusEl.textContent = "GAME OVER";

    updateBestScore();

    showOverlay(
        "GAME OVER",
        "Final Score: " + score + " · Try again and beat your record!",
        "✕",
        "PLAY AGAIN"
    );

    playSound(120, 0.4, "sawtooth");
}

// ==========================================
// MAIN UPDATE
// ==========================================

function update() {
    if (state !== "playing") return;

    updatePaddle();
    updateBalls();
    updatePowerups();
    updateParticles();

    checkLevelComplete();
}

// ==========================================
// MAIN DRAW
// ==========================================

function draw() {
    drawBackground();
    drawBricks();
    drawPaddle();

    balls.forEach(drawBall);

    drawPowerups();
    drawParticles();
}

// ==========================================
// GAME LOOP
// ==========================================

function gameLoop(timestamp) {
    // Keep the game animation running at a stable pace.
    const delta = Math.min(timestamp - lastFrame || 16.67, 40);
    lastFrame = timestamp;

    if (state === "playing") {
        
        // Scale movement to approximately 60 FPS.
        const steps = Math.min(delta / 16.67, 2.4);

        for (let i = 0; i < steps; i++) {
            update();
            if (state !== "playing") break;
        }
    } else {
        updateParticles();
    }

    draw();

    animationId = requestAnimationFrame(gameLoop);
}

// ==========================================
// KEYBOARD CONTROLS
// ==========================================

document.addEventListener("keydown", event => {
    if (
        ["ArrowLeft", "ArrowRight", " "].includes(event.key)
    ) {
        event.preventDefault();
    }

    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        keys.left = true;
    }

    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        keys.right = true;
    }

    if (event.key === " " && !event.repeat) {
        if (state === "playing") {
            pauseGame();
        } else if (state === "ready" || state === "paused") {
            startGame();
        }
    }
});

document.addEventListener("keyup", event => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        keys.left = false;
    }

    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        keys.right = false;
    }
});

window.addEventListener("blur", () => {
    keys.left = false;
    keys.right = false;

    if (state === "playing") {
        pauseGame();
    }
});

// ==========================================
// MOBILE TOUCH / POINTER CONTROLS
// ==========================================

function movePaddleToPointer(event) {
    if (state !== "playing") return;

    const rect = canvas.getBoundingClientRect();

    const scaleX = W / rect.width;

    const pointerX = (event.clientX - rect.left) * scaleX;

    paddle.x = pointerX - paddle.w / 2;

    paddle.x = Math.max(
        8,
        Math.min(W - paddle.w - 8, paddle.x)
    );
}

canvas.addEventListener("pointerdown", event => {
    movePaddleToPointer(event);
});

canvas.addEventListener("pointermove", event => {
    if (event.buttons || event.pointerType === "touch") {
        movePaddleToPointer(event);
    }
});

// Mobile arrow buttons
function bindMobileButton(id, direction) {
    const button = document.getElementById(id);

    button.addEventListener("pointerdown", event => {
        event.preventDefault();
        keys[direction] = true;
    });

    button.addEventListener("pointerup", () => {
        keys[direction] = false;
    });

    button.addEventListener("pointerleave", () => {
        keys[direction] = false;
    });

    button.addEventListener("pointercancel", () => {
        keys[direction] = false;
    });
}

bindMobileButton("leftBtn", "left");
bindMobileButton("rightBtn", "right");

// ==========================================
// BUTTON EVENTS
// ==========================================

document.getElementById("startBtn").addEventListener("click", startGame);

document.getElementById("pauseBtn").addEventListener("click", pauseGame);

document.getElementById("restartBtn").addEventListener("click", restartGame);

document.getElementById("musicBtn").addEventListener("click", toggleMusic);

overlayStartBtn.addEventListener("click", startGame);

// ==========================================
// INITIALIZE
// ==========================================

resetGame();

showOverlay(
    "NEON BRICK BREAKER",
    "Break the bricks. Collect power-ups. Beat every level.",
    "◆",
    "START GAME"
);

statusEl.textContent = "READY";

if (!animationId) {
    animationId = requestAnimationFrame(gameLoop);
}
