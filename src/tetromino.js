export class Tetromino {
    static nextId = 1;
    constructor(left, document, boardWidth, boardHeight) {
        this.boardHeight = boardHeight;
        this.boardWidth = boardWidth;
        this.left = left;
        this.size = 24;
        this.element = this.createElement(document);

    }

    createElement(document) {
        const top = 0;
        const tetromino = document.createElement("div");
        tetromino.className = "tetromino";
        tetromino.style.width = this.size + "px";
        tetromino.style.height = this.size + "px";
        tetromino.style.position = "absolute";
        tetromino.style.left = this.left * this.size + "px";
        tetromino.style.top = top * this.size + "px";
        tetromino.setAttribute("data-tetromino-id", Tetromino.nextId++);
        return tetromino;
    }

    move(direction) {
        if (direction === "left") {
            this.left = Math.max(0, this.left - 1);
            this.element.style.left = (this.left * this.size) + "px";
        }
        if (direction === "right") {
            this.left = Math.min(this.boardWidth - 1, this.left + 1);
            this.element.style.left = (this.left * this.size) + "px";
        }
    }

    startFalling(dropTime) {
        let top = 0;
        const that = this;
        function moveDown() {
            top += that.size;
            that.element.style.top = top + "px";
            if (top + that.size <= that.boardHeight * that.size) {
                setTimeout(moveDown, dropTime);
            } else {
                that.move = function () { };
            }
        }
        setTimeout(moveDown, dropTime);
    }
}