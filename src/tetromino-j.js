import { Tetromino } from "./tetromino-base.js";

export class TetrominoJ extends Tetromino {
  constructor(left, document, board) {
    super(left, document, null);
    this.type = "J";
    this.rotation = 0;
    this.element = this.createElement(document);
    if (board) {
      this.board = board;
      board.addTetromino(this);
    }
  }

  getClassName() {
    return "tetromino tetromino-j";
  }

  getBlockPositions() {
    if (this.rotation % 4 === 0) {
      return [
        { x: this.left, y: this.top },
        { x: this.left - 1, y: this.top },
        { x: this.left + 1, y: this.top },
        { x: this.left + 1, y: this.top + 1 },
      ];
    }
    if (this.rotation % 4 === 1) {
      return [
        { x: this.left, y: this.top },
        { x: this.left, y: this.top - 1 },
        { x: this.left, y: this.top + 1 },
        { x: this.left + 1, y: this.top - 1 },
      ];
    }
    if (this.rotation % 4 === 2) {
      return [
        { x: this.left, y: this.top },
        { x: this.left - 1, y: this.top },
        { x: this.left + 1, y: this.top },
        { x: this.left - 1, y: this.top - 1 },
      ];
    }
    if (this.rotation % 4 === 3) {
      return [
        { x: this.left, y: this.top },
        { x: this.left, y: this.top - 1 },
        { x: this.left, y: this.top + 1 },
        { x: this.left - 1, y: this.top + 1 },
      ];
    }
    return [];
  }
}
