import { Tetromino } from "./tetromino-base.js";

export class TetrominoT extends Tetromino {
  constructor(left, document, board) {
    super(left, document, null);
    this.type = "T";
    this.rotation = 0;
    this.element = this._createElement(document);
    if (board) {
      this.board = board;
      board.addTetromino(this);
    }
  }

  getClassName() {
    return "tetromino tetromino-t";
  }

  getBlockPositions() {
    // Block order and pivot match test expectations
    switch (this.rotation % 4) {
      case 0:
        // Up
        return [
          { x: this.left, y: this.top },
          { x: this.left - 1, y: this.top },
          { x: this.left + 1, y: this.top },
          { x: this.left, y: this.top + 1 },
        ];
      case 1:
        // Right
        return [
          { x: this.left, y: this.top },
          { x: this.left, y: this.top - 1 },
          { x: this.left, y: this.top + 1 },
          { x: this.left + 1, y: this.top },
        ];
      case 2:
        // Down
        return [
          { x: this.left, y: this.top },
          { x: this.left - 1, y: this.top },
          { x: this.left + 1, y: this.top },
          { x: this.left, y: this.top - 1 },
        ];
      case 3:
        // Left
        return [
          { x: this.left, y: this.top },
          { x: this.left, y: this.top - 1 },
          { x: this.left, y: this.top + 1 },
          { x: this.left - 1, y: this.top },
        ];
      default:
        return [
          { x: this.left, y: this.top },
          { x: this.left, y: this.top },
          { x: this.left, y: this.top },
          { x: this.left, y: this.top },
        ];
    }
  }
}
