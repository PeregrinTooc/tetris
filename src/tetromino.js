export class Tetromino {
    static nextId = 1;
    constructor(left, document, board) {
        this.board = board;
        this.left = left;
        this.top = 0;
        this.size = 24;
        this.element = this.createElement(document);
        this.board.addTetromino(this);
    }

    createElement(document) {
        const tetromino = document.createElement("div");
        tetromino.className = "tetromino";
        tetromino.style.width = this.size + "px";
        tetromino.style.height = this.size + "px";
        tetromino.style.position = "absolute";
        tetromino.style.left = this.left * this.size + "px";
        tetromino.style.top = this.top * this.size + "px";
        tetromino.setAttribute("data-tetromino-id", Tetromino.nextId++);
        return tetromino;
    }

    move(direction) {
        this.board.moveTetromino(this, direction);
    }

    drop() {
        while (this.board.moveTetromino(this, "down")) { }
        this.lock();
    }

    updatePosition() {
        this.element.style.top = this.top * this.size + "px";
        this.element.style.left = this.left * this.size + "px";
    }

    remove() {
        this.element.remove();
        this.board.tetrominos.delete(this);
    }

    blocksMovement(direction, movingTetromino) {
        if (this === movingTetromino) return false;
        if (direction === "left") {
            return this.top === movingTetromino.top && this.left === movingTetromino.left - 1
        }
        if (direction === "right") {
            return this.top === movingTetromino.top && this.left === movingTetromino.left + 1;
        }
        if (direction === "down") {
            return this.left === movingTetromino.left && this.top === movingTetromino.top + 1;
        }
    }

    lock() {
        if (this.locked) return;
        this.locked = true;
        this.move = function () { };
        this.drop = function () { };
        const event = new Event("locked");
        this.element.dispatchEvent(event);
    }

    startFalling(dropTime) {
        const moveDown = () => {
            const canContinue = this.board.moveTetromino(this, "down");
            if (canContinue) {
                setTimeout(() => this.startFalling(dropTime), dropTime);
            } else {
                this.lock();
            }
        };
        setTimeout(moveDown, dropTime);
    }
}