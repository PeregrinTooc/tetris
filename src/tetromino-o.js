import { Tetromino } from "./tetromino-base.js";

export class TetrominoO extends Tetromino {
    constructor(left, document, board) {
        super(left, document, null);
        this.type = "T";
        this.rotation = 0;
        this.element = this.createElement(document);
        if (board) {
            this.board = board;
            board.addTetromino(this);
        }
    }

    getClassName() {
        return "tetromino tetromino-o";
    }

    getBlockPositions() {
        return [
            { x: this.left, y: this.top + 1 },
            { x: this.left + 1, y: this.top + 1 },
            { x: this.left + 1, y: this.top },
            { x: this.left, y: this.top },
        ];
    }

    rotate() {
        // O tetromino does not rotate, so no action needed    
    }

    updateBlocks() {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
        this._renderBlocks(this.element);
    }

    _renderBlocks(element) {
        const blocks = this.getBlockPositions();
        blocks.forEach(({ x, y }) => {
            const block = this.createDiv(
                document,
                "block",
                x - this.left,
                y - this.top
            );
            element.appendChild(block);
        });
    }

    createElement(document) {
        const tetromino = this.createDiv(document, this.getClassName());
        this._renderBlocks(tetromino);
        return tetromino;
    }
}
