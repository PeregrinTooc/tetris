import { Tetromino } from "./tetromino.js";

export class Board {
  constructor(height, width, element, previewBoard) {
    this.height = height;
    this.width = width;
    this.element = element;
    this.previewBoard = previewBoard;
    this.tetrominos = new Set();
    this.nextTetromino = null;
  }

  _canMove(tetromino, direction) {
    const hasCollision = Array.from(this.tetrominos).some((other) =>
      other.blocksMovement(direction, tetromino)
    );

    if (hasCollision) {
      if (direction === "down") {
        this._raiseGameOverIfStackReachesTop(tetromino);
      }
      return false;
    }

    return tetromino.isWithinBounds(direction, this.width, this.height);
  }
  _raiseGameOverIfStackReachesTop(tetromino) {
    if (tetromino.top === 0) {
      const gameOverEvent = new Event("gameover");
      this.element.dispatchEvent(gameOverEvent);
    }
  }

  addTetromino(tetromino) {
    this.tetrominos.add(tetromino);
    this.element.appendChild(tetromino.element);
  }

  moveTetromino(tetromino, direction) {
    if (!this._canMove(tetromino, direction)) {
      return false;
    }
    if (direction === "left") {
      tetromino.left--;
    }
    if (direction === "right") {
      tetromino.left++;
    }
    if (direction === "down") {
      tetromino.top++;
    }
    tetromino.updatePosition();
    return true;
  }

  reset() {
    this.tetrominos.clear();
    this.element.innerHTML = "";
  }

  spawnTetromino(document) {
    const tetromino =
      this.nextTetromino || Tetromino.createNew(5, document, this);
    tetromino.startFalling();
    //this.nextTetromino = Tetromino.createNew(5, document, this);
    //this.previewBoard.showNextTetromino(this.nextTetromino);
    return tetromino;
  }
}
