import { Tetromino } from "./tetromino.js";
import { Board } from "./board.js";

let tetrominoDropTime = 1000;

const board = new Board(20, 11, document);

// Allow tests or game logic to set the drop time
window.setTetrominoDropTime = function (ms) {
    tetrominoDropTime = ms;
};



document.getElementById("start-button").addEventListener("click", () => {
    const tetromino = new Tetromino(5, document, board);
    document.getElementById("game-board").appendChild(tetromino.element);
    tetromino.startFalling(tetrominoDropTime);

    document.onkeydown = function (e) {
        if (e.key === "ArrowLeft") {
            tetromino.move("left");
        }
        if (e.key === "ArrowRight") {
            tetromino.move("right");
        }
    };
});