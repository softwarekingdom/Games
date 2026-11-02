
const cells = document.querySelectorAll(".cell");

const computerMode = document.getElementById("computerMode");
const twoPlayerMode = document.getElementById("twoPlayerMode");

const turnIndicator = document.getElementById("turnIndicator");
const gameMessage = document.getElementById("gameMessage");

const restartBtn = document.getElementById("restartBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");

const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreDraw = document.getElementById("scoreDraw");

const playerTwoLabel = document.getElementById("playerTwoLabel");

let board = Array(9).fill("");

let currentPlayer = "X";
let gameActive = true;
let gameMode = "computer";

let scores = {
    X: 0,
    O: 0,
    draw: 0
};

const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function checkWinner(state) {

    for (const pattern of winPatterns) {

        const [a, b, c] = pattern;

        if (
            state[a] &&
            state[a] === state[b] &&
            state[b] === state[c]
        ) {
            return {
                winner: state[a],
                pattern
            };
        }
    }

    if (!state.includes("")) {
        return { winner: "draw" };
    }

    return null;
}

function updateBoard() {

    cells.forEach((cell, index) => {

        cell.textContent = board[index];

        cell.classList.remove("x", "o", "winner");

        if (board[index] === "X") {
            cell.classList.add("x");
        }

        if (board[index] === "O") {
            cell.classList.add("o");
        }
    });
}

function updateScore() {

    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
    scoreDraw.textContent = scores.draw;
}

function updateTurn() {

    if (!gameActive) return;

    if (gameMode === "computer" && currentPlayer === "O") {
        turnIndicator.textContent = "COMPUTER THINKING...";
        return;
    }

    turnIndicator.textContent =
        gameMode === "computer"
        ? "YOUR TURN — X"
        : `PLAYER ${currentPlayer}'S TURN`;
}

function finishGame(result) {

    gameActive = false;

    if (result.winner === "draw") {

        scores.draw++;

        gameMessage.textContent = "It's a Draw! 🤝😂😎 Try again nanba ";

        turnIndicator.textContent = "GAME DRAW";

    } else {

        scores[result.winner]++;

        gameMessage.textContent =
            `${result.winner} WINS! 🎉`;

        turnIndicator.textContent = "GAME OVER";

        result.pattern.forEach(index => {
            cells[index].classList.add("winner");
        });
    }

    updateScore();
}

function makeMove(index) {

    if (!gameActive || board[index] !== "") return;

    board[index] = currentPlayer;

    updateBoard();

    const result = checkWinner(board);

    if (result) {
        finishGame(result);
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";

    updateTurn();
}

function minimax(state, isMaximizing) {

    const result = checkWinner(state);

    if (result) {

        if (result.winner === "O") return 10;
        if (result.winner === "X") return -10;

        return 0;
    }

    if (isMaximizing) {

        let bestScore = -Infinity;

        for (let i = 0; i < 9; i++) {

            if (state[i] === "") {

                state[i] = "O";

                const score = minimax(state, false);

                state[i] = "";

                bestScore = Math.max(bestScore, score);
            }
        }

        return bestScore;

    } else {

        let bestScore = Infinity;

        for (let i = 0; i < 9; i++) {

            if (state[i] === "") {

                state[i] = "X";

                const score = minimax(state, true);

                state[i] = "";

                bestScore = Math.min(bestScore, score);
            }
        }

        return bestScore;
    }
}

function getBestMove() {

    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {

        if (board[i] === "") {

            board[i] = "O";

            const score = minimax(board, false);

            board[i] = "";

            if (score > bestScore) {

                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

function computerMove() {

    if (!gameActive || gameMode !== "computer") return;

    const move = getBestMove();

    if (move !== -1) {
        makeMove(move);
    }
}

function handleCellClick(event) {

    const index = Number(event.currentTarget.dataset.index);

    if (!gameActive) return;

    if (gameMode === "computer" && currentPlayer !== "X") {
        return;
    }

    if (board[index] !== "") return;

    makeMove(index);

    if (
        gameActive &&
        gameMode === "computer" &&
        currentPlayer === "O"
    ) {
        updateTurn();

        setTimeout(computerMove, 350);
    }
}

function restartGame() {

    board = Array(9).fill("");

    currentPlayer = "X";
    gameActive = true;

    updateBoard();

    turnIndicator.textContent = "PLAYER X'S TURN";
    gameMessage.textContent = "Make your first move!";
}

function changeMode(mode) {

    gameMode = mode;

    computerMode.classList.toggle(
        "active",
        mode === "computer"
    );

    twoPlayerMode.classList.toggle(
        "active",
        mode === "two"
    );

    playerTwoLabel.textContent =
        mode === "computer" ? "COMPUTER O" : "PLAYER O";

    restartGame();
}

cells.forEach(cell => {
    cell.addEventListener("click", handleCellClick);
});

computerMode.addEventListener("click", () => {
    changeMode("computer");
});

twoPlayerMode.addEventListener("click", () => {
    changeMode("two");
});

restartBtn.addEventListener("click", restartGame);

resetScoreBtn.addEventListener("click", () => {

    scores = {
        X: 0,
        O: 0,
        draw: 0
    };

    updateScore();
    restartGame();
});

updateBoard();
updateScore();
updateTurn();
updateBoard();
updateScore();
updateTurn();

// =============================
// BACKGROUND MUSIC CONTROL
// =============================

const musicBtn = document.getElementById("musicBtn");

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