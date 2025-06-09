import { PreviewBoard } from "./preview-board.js";
import { Board } from "./board.js";

let tetrominoDropTime = 750;
let tetromino;
let gameRunning = false;
let board

// Allow tests or game logic to set the drop time
window.setTetrominoDropTime = function (ms) {
    tetrominoDropTime = ms;
};

document.getElementById("game-board").addEventListener("gameover", () => {
    const gameOverElement = document.createElement("div");
    gameOverElement.id = "game-over";
    gameOverElement.className = "game-over";
    document.getElementById("game-board").appendChild(gameOverElement);
});

document.getElementById("start-button").addEventListener("click", () => {
    if (gameRunning) {
        resetGame();
    } else {
        startGame();
    }
});

function startGame() {
    gameRunning = true;
    const previewBoard = new PreviewBoard(document.getElementById("next-board"));
    board = new Board(20, 11, document.getElementById("game-board"), previewBoard);
    document.getElementById("start-button").textContent = "Reset Game";
    spawnNewTetromino();
    document.onkeydown = function (e) {
        if (e.key === "ArrowLeft") {
            tetromino.move("left");
        }
        if (e.key === "ArrowRight") {
            tetromino.move("right");
        }
        if (e.key === "ArrowDown") {
            tetromino.drop();
        }
    };
}

function resetGame() {
    const gameOverElement = document.getElementById("game-over");
    if (gameOverElement) {
        gameOverElement.remove();
    }
    if (board) {
        board.reset();
    }
    document.getElementById("start-button").textContent = "Start Game";
    document.onkeydown = null;
    gameRunning = false;
    tetromino = null;
}

function spawnNewTetromino() {
    tetromino = board.spawnTetromino(document);
    tetromino.startFalling(tetrominoDropTime);
    tetromino.element.addEventListener("locked", () => {
        spawnNewTetromino();
    })
}
