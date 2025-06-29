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


}
