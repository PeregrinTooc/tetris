import { Tetromino } from "./tetromino-base.js";

export class TetrominoL extends Tetromino {
  constructor(left, document, board) {
    super(left, document, null);
    this.type = "L";
    this.rotation = 0;
    this.element = this._createElement(document);
    if (board) {
      this.board = board;
      board.addTetromino(this);
    }
  }

  getClassName() {
    return "tetromino tetromino-l";
  }

  getBlockPositions() {
    switch (this.rotation % 4) {
      case 0:
        return [
          { x: this.left, y: this.top },
          { x: this.left - 1, y: this.top },
          { x: this.left + 1, y: this.top },
          { x: this.left - 1, y: this.top + 1 },
        ];
      case 1:
        return [
          { x: this.left, y: this.top },
          { x: this.left, y: this.top + 1 },
          { x: this.left, y: this.top - 1 },
          { x: this.left + 1, y: this.top + 1 },
        ];
      case 2:
        return [
          { x: this.left, y: this.top },
          { x: this.left + 1, y: this.top },
          { x: this.left - 1, y: this.top },
          { x: this.left + 1, y: this.top - 1 },
        ];
      case 3:
        return [
          { x: this.left, y: this.top },
          { x: this.left, y: this.top - 1 },
          { x: this.left, y: this.top + 1 },
          { x: this.left - 1, y: this.top - 1 },
        ];
      default:
        return [];
    }
  }
}
