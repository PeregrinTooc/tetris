export class Board {
    constructor(height, width, document) {
        this.height = height;
        this.width = width;
        this.element = document.getElementById("game-board");
        this.tetrominos = new Set();
    }

    _canMove(tetromino, direction) {
        if (direction === "down") {
            return tetromino.top < this.height;
        }
        if (direction === "left") {
            return tetromino.left > 0;
        }
        if (direction === "right") {
            return tetromino.left < this.width - 1;
        }
        return false;
    }

    addTetromino(tetromino) {
        this.tetrominos.add(tetromino);
    }

    moveTetromino(tetromino, direction) {
        if (!this._canMove(tetromino, direction)) {
            return false;
        }
        if (direction === "left") {
            tetromino.left--;
        }
        if (direction === "right") {
            tetromino.left++;
        }
        if (direction === "down") {
            tetromino.top++;
        }
        tetromino.updatePosition();
        return true;
    }
}