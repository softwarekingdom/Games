
/* =====================================
   SOFTWAREKINGDOM
   ROCK PAPER SCISSORS GAME
===================================== */

const choices = document.querySelectorAll(".choice-btn");

const computerMode = document.getElementById("computerMode");
const twoPlayerMode = document.getElementById("twoPlayerMode");

const playerScore = document.getElementById("playerScore");
const computerScore = document.getElementById("computerScore");
const drawScore = document.getElementById("drawScore");

const playerChoiceDisplay = document.getElementById("playerChoice");
const computerChoiceDisplay = document.getElementById("computerChoice");

const result = document.getElementById("result");

const opponentLabel = document.getElementById("opponentLabel");
const opponentName = document.getElementById("opponentName");

const restartBtn = document.getElementById("restartBtn");
const musicBtn = document.getElementById("musicBtn");

const playerLabel = document.getElementById("playerLabel");

let gameMode = "computer";

let scores = {
    player: 0,
    opponent: 0,
    draw: 0
};

let playerOneChoice = null;
let roundActive = true;

const gameChoices = {
    rock: "✊",
    paper: "✋",
    scissors: "✌️"
};

// =====================================
// UPDATE SCORE
// =====================================

function updateScore() {

    playerScore.textContent = scores.player;

    computerScore.textContent = scores.opponent;

    drawScore.textContent = scores.draw;
}

// =====================================
// CHANGE GAME MODE
// =====================================

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

    opponentLabel.textContent =
        mode === "computer" ? "COMPUTER" : "PLAYER 2";

    opponentName.textContent =
        mode === "computer" ? "COMPUTER" : "PLAYER 2";

    if (playerLabel) {
        playerLabel.textContent =
            mode === "computer" ? "YOU" : "PLAYER 1";
    }

    resetRound();

}

// =====================================
// RESET ROUND
// =====================================

function resetRound() {

    playerOneChoice = null;

    roundActive = true;

    playerChoiceDisplay.textContent = "❔";

    computerChoiceDisplay.textContent = "❔";

    result.textContent = "Select your move to start!";

}

// =====================================
// GET COMPUTER CHOICE
// =====================================

function getComputerChoice() {

    const options = [
        "rock",
        "paper",
        "scissors"
    ];

    const randomIndex = Math.floor(
        Math.random() * options.length
    );

    return options[randomIndex];
}

// =====================================
// DETERMINE WINNER
// =====================================

function determineWinner(player, opponent) {

    if (player === opponent) {
        return "draw";
    }

    if (
        (player === "rock" && opponent === "scissors") ||
        (player === "paper" && opponent === "rock") ||
        (player === "scissors" && opponent === "paper")
    ) {
        return "player";
    }

    return "opponent";
}

// =====================================
// SHOW RESULT
// =====================================

function showResult(player, opponent) {

    playerChoiceDisplay.textContent =
        gameChoices[player];

    computerChoiceDisplay.textContent =
        gameChoices[opponent];

    const winner = determineWinner(player, opponent);

    if (winner === "draw") {

        scores.draw++;

        result.textContent = "IT'S A DRAW! 🤝";

    } else if (winner === "player") {

        scores.player++;

        result.textContent =
            gameMode === "computer"
            ? "YOU WIN! 🎉"
            : "PLAYER 1 WINS! 🎉";

    } else {

        scores.opponent++;

        result.textContent =
            gameMode === "computer"
            ? "COMPUTER WINS! 🤖"
            : "PLAYER 2 WINS! 🎉";

    }

    updateScore();

    roundActive = false;
}

// =====================================
// COMPUTER MODE
// =====================================

function playComputer(player) {

    const computer = getComputerChoice();

    showResult(player, computer);

}

// =====================================
// TWO PLAYER MODE
// =====================================

function playTwoPlayers(choice) {

    // Player 1 selects
    if (playerOneChoice === null) {

        playerOneChoice = choice;

        // Hide Player 1's selection
        playerChoiceDisplay.textContent = "🔒";

        computerChoiceDisplay.textContent = "❔";

        result.textContent =
            "Player 1 selected! Pass the device to Player 2.";

        return;
    }

    // Player 2 selects
    const playerTwoChoice = choice;

    showResult(
        playerOneChoice,
        playerTwoChoice
    );

    playerOneChoice = null;
}

// =====================================
// HANDLE PLAYER SELECTION
// =====================================

function handleChoice(event) {

    if (!roundActive) return;

    const selectedChoice =
        event.currentTarget.dataset.choice;

    if (gameMode === "computer") {

        playComputer(selectedChoice);

    } else {

        playTwoPlayers(selectedChoice);

    }

}

// =====================================
// RESTART GAME
// =====================================

function restartGame() {

    scores = {
        player: 0,
        opponent: 0,
        draw: 0
    };

    updateScore();

    resetRound();

}

// =====================================
// MUSIC CONTROL
// =====================================

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

// =====================================
// EVENT LISTENERS
// =====================================

choices.forEach(button => {

    button.addEventListener(
        "click",
        handleChoice
    );

});

computerMode.addEventListener("click", () => {

    changeMode("computer");

});

twoPlayerMode.addEventListener("click", () => {

    changeMode("two");

});

restartBtn.addEventListener(
    "click",
    restartGame
);

// =====================================
// INITIALIZE GAME
// =====================================

updateScore();

resetRound();
