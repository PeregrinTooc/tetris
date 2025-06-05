import { Tetromino } from "./tetromino.js";

let tetrominoDropTime = 1000;

// Allow tests or game logic to set the drop time
window.setTetrominoDropTime = function (ms) {
    tetrominoDropTime = ms;
};

function animateTetrominoFall(tetromino, boardHeight, step, dropTime) {
    let top = 0;
    function moveDown() {
        top += step;
        tetromino.style.top = top + "px";
        if (top + step < boardHeight) {
            setTimeout(moveDown, dropTime);
        }
    }
    setTimeout(moveDown, dropTime);
}

document.getElementById("start-button").addEventListener("click", () => {
    const tetromino = new Tetromino(96, 0, 24, document);
    document.getElementById("game-board").appendChild(tetromino.element);
    animateTetrominoFall(tetromino.element, 400, 24, tetrominoDropTime);

    document.onkeydown = function (e) {
        if (e.key === "ArrowLeft") {
            tetromino.move("left", 24);
        }
        if (e.key === "ArrowRight") {
            tetromino.move("right", 24);
        }
    };
});