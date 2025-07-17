import { Tetromino } from "./tetromino-base.js";

export class TetrominoI extends Tetromino {
  constructor(left, document, board) {
    super(left, document, null);
    this.type = "I";
    this.rotation = 0;
    this.element = this._createElement(document);
    if (board) {
      this.board = board;
      board.addTetromino(this);
    }
  }

  getClassName() {
    return "tetromino tetromino-i";
  }

  getBlockPositions() {
    // Tetris SRS: pivot is the second block from the left (horizontal) or from the top (vertical)
    if (this.rotation % 2 === 0) {
      // Horizontal: [left-1, left, left+1, left+2] at y=top
      return [
        { x: this.left - 1, y: this.top },
        { x: this.left, y: this.top },
        { x: this.left + 1, y: this.top },
        { x: this.left + 2, y: this.top },
      ];
    } else {
      // Vertical: [left, top-1], [left, top], [left, top+1], [left, top+2]
      return [
        { x: this.left, y: this.top - 1 },
        { x: this.left, y: this.top },
        { x: this.left, y: this.top + 1 },
        { x: this.left, y: this.top + 2 },
      ];
    }
  }
}
