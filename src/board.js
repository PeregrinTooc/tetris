import { Tetromino } from "./tetromino.js";

export class Board {
    constructor(height, width, element, previewBoard) {
        this.height = height;
        this.width = width;
        this.element = element;
        this.previewBoard = previewBoard;
        this.tetrominos = new Set();
        this.nextTetromino = null;
    }

    _canMove(tetromino, direction) {
        if (direction === "down") {
            if (tetromino.top >= this.height) {
                return false;
            }
            for (let other of this.tetrominos) {
                if (other !== tetromino && other.left === tetromino.left && other.top === tetromino.top + 1) {
                    this._raiseGameOverIfStackReachesTop(tetromino);
                    return false;
                }
            }
            return true;
        }
        if (direction === "left") {
            for (let other of this.tetrominos) {
                if (other !== tetromino && other.top === tetromino.top && other.left === tetromino.left - 1) {
                    return false;
                }
            }
            return tetromino.left > 0;
        }
        if (direction === "right") {
            for (let other of this.tetrominos) {
                if (other !== tetromino && other.top === tetromino.top && other.left === tetromino.left + 1) {
                    return false;
                }
            }
            return tetromino.left < this.width - 1;
        }
        return false;
    }
    _raiseGameOverIfStackReachesTop(tetromino) {
        if (tetromino.top === 0) {
            const gameOverEvent = new Event("gameover");
            this.element.dispatchEvent(gameOverEvent);
        }
    }


    addTetromino(tetromino) {
        this.tetrominos.add(tetromino);
        this.element.appendChild(tetromino.element);

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

    reset() {
        this.tetrominos.clear();
        this.element.innerHTML = "";
    }

    spawnTetromino(document) {
        const tetromino = this.nextTetromino || new Tetromino(5, document, this);
        //this.nextTetromino = new Tetromino(5, document, this);
        //this.previewBoard.showNextTetromino(this.nextTetromino);
        return tetromino;
    }
}