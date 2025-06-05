export class Tetromino {
    constructor(left, top, size, document) {
        this.element = this.createElement(left, top, size, document);
    }

    createElement(left, top, size, document) {
        const tetromino = document.createElement("div");
        tetromino.className = "tetromino";
        tetromino.style.width = size + "px";
        tetromino.style.height = size + "px";
        tetromino.style.position = "absolute";
        tetromino.style.left = left + "px";
        tetromino.style.top = top + "px";
        return tetromino;
    }

    move(direction, step) {
        const currentLeft = parseInt(this.element.style.left, 10);
        if (direction === "left") {
            this.element.style.left = (currentLeft - step) + "px";
        }
        if (direction === "right") {
            this.element.style.left = (currentLeft + step) + "px";
        }
    }
}