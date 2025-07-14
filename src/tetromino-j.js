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
    // SRS: pivot is always (left, top)
    switch (this.rotation % 4) {
      case 0: // spawn (horizontal)
        return [
          { x: this.left, y: this.top }, // pivot
          { x: this.left - 1, y: this.top }, // left
          { x: this.left + 1, y: this.top }, // right
          { x: this.left + 1, y: this.top + 1 }, // bottom right
        ];
      case 1: // right (vertical)
        return [
          { x: this.left, y: this.top }, // pivot
          { x: this.left, y: this.top + 1 }, // down
          { x: this.left, y: this.top - 1 }, // up
          { x: this.left + 1, y: this.top - 1 }, // up right
        ];
      case 2: // reverse (horizontal, upside down)
        return [
          { x: this.left, y: this.top }, // pivot
          { x: this.left + 1, y: this.top }, // right
          { x: this.left - 1, y: this.top }, // left
          { x: this.left - 1, y: this.top - 1 }, // top left
        ];
      case 3: // left (vertical, upside down)
        return [
          { x: this.left, y: this.top }, // pivot
          { x: this.left, y: this.top - 1 }, // up
          { x: this.left, y: this.top + 1 }, // down
          { x: this.left - 1, y: this.top + 1 }, // down left
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
