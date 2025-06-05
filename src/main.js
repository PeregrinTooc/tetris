

let tetrominoDropTime = 1000;

// Allow tests or game logic to set the drop time
window.setTetrominoDropTime = function (ms) {
    tetrominoDropTime = ms;
};

function createTetrominoElement(left, top, size) {
    const tetromino = document.createElement("div");
    tetromino.className = "tetromino";
    tetromino.style.width = size + "px";
    tetromino.style.height = size + "px";
    tetromino.style.position = "absolute";
    tetromino.style.left = left + "px";
    tetromino.style.top = top + "px";
    return tetromino;
}

function moveTetromino(tetromino, direction, step) {
    const currentLeft = parseInt(tetromino.style.left, 10);
    if (direction === "left") {
        tetromino.style.left = (currentLeft - step) + "px";
    }
    if (direction === "right") {
        tetromino.style.left = (currentLeft + step) + "px";
    }
}

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
    const tetromino = createTetrominoElement(96, 0, 24);
    document.getElementById("game-board").appendChild(tetromino);
    animateTetrominoFall(tetromino, 400, 24, tetrominoDropTime);

    document.onkeydown = function (e) {
        if (e.key === "ArrowLeft") {
            moveTetromino(tetromino, "left", 24);
        }
        if (e.key === "ArrowRight") {
            moveTetromino(tetromino, "right", 24);
        }
    };
});