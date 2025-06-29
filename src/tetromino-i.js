import { Tetromino } from "./tetromino-base.js";

export class TetrominoI extends Tetromino {
  constructor(left, document, board) {
    super(left, document, null);
    this.type = "I";
    this.rotation = 0;
    this.element = this.createElement(document);
    if (board) {
      this.board = board;
      board.addTetromino(this);
    }
  }

  getClassName() {
    return "tetromino tetromino-i";
  }

  getBlockPositions() {
    if (this.rotation % 2 === 0) {
      return [
        { x: this.left, y: this.top },
        { x: this.left - 1, y: this.top },
        { x: this.left + 1, y: this.top },
        { x: this.left + 2, y: this.top },
      ];
    }
    return [
      { x: this.left, y: this.top },
      { x: this.left, y: this.top - 1 },
      { x: this.left, y: this.top + 1 },
      { x: this.left, y: this.top + 2 },
    ];
  }

}
