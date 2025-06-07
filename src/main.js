import { Tetromino } from "./tetromino.js";
import { Board } from "./board.js";

let tetrominoDropTime = 750;
let tetromino;
let gameRunning = false;
let board

// Allow tests or game logic to set the drop time
window.setTetrominoDropTime = function (ms) {
    tetrominoDropTime = ms;
};



document.getElementById("start-button").addEventListener("click", () => {
    if (gameRunning) {
        resetGame();
    } else {
        startGame();
    }
});

function startGame() {
    gameRunning = true;
    board = new Board(20, 11, document);
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
    document.getElementById("game-board").innerHTML = "";
    document.getElementById("start-button").textContent = "Start Game";
    document.onkeydown = null; // Remove event listeners
    gameRunning = false;
    tetromino = null;
}

function spawnNewTetromino() {
    tetromino = new Tetromino(5, document, board);
    document.getElementById("game-board").appendChild(tetromino.element);
    tetromino.startFalling(tetrominoDropTime);
    tetromino.element.addEventListener("locked", () => {
        spawnNewTetromino();
    })
}
