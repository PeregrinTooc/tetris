export class Tetromino {
    constructor(left, top, size) {
        this.element = this.createElement(left, top, size);
    }

    createElement(left, top, size) {
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