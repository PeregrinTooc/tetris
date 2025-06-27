import { Tetromino } from "./tetromino-base.js";

export class TetrominoT extends Tetromino {
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
    return "tetromino tetromino-t";
  }

  getBlockPositions() {
    if (this.rotation % 4 === 0) {
      return [
        { x: this.left, y: this.top },
        { x: this.left - 1, y: this.top },
        { x: this.left + 1, y: this.top },
        { x: this.left, y: this.top + 1 },
      ];
    }
    if (this.rotation % 4 === 3) {
      return [
        { x: this.left, y: this.top },
        { x: this.left + 1, y: this.top },
        { x: this.left, y: this.top - 1 },
        { x: this.left, y: this.top + 1 },
      ];
    }
    if (this.rotation % 4 === 2) {
      return [
        { x: this.left, y: this.top },
        { x: this.left + 1, y: this.top },
        { x: this.left - 1, y: this.top },
        { x: this.left, y: this.top - 1 },
      ];
    }
    if (this.rotation % 4 === 1) {
      return [
        { x: this.left, y: this.top },
        { x: this.left - 1, y: this.top },
        { x: this.left, y: this.top - 1 },
        { x: this.left, y: this.top + 1 },
      ];
    }
    return [];
  }

  rotate() {
    this.rotation++;
    this.updateBlocks();
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
