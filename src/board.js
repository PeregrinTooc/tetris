import { TetrominoFactory } from "./tetromino.js";

export class Board {
  constructor(height, width, element, previewBoard, tetrominoSeedQueue) {
    this.height = height;
    this.width = width;
    this.element = element;
    this.previewBoard = previewBoard;
    this.tetrominos = new Set();
    this.nextTetromino = null;
    this.tetrominoSeedQueue = tetrominoSeedQueue;
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
    let tetromino;
    const center = Math.floor(this.width / 2);
    if (this.nextTetromino) {
      if (
        this.previewBoard &&
        this.previewBoard.previewContainer.contains(this.nextTetromino.element)
      ) {
        this.previewBoard.previewContainer.removeChild(
          this.nextTetromino.element
        );
      }
      tetromino = this.nextTetromino;
      tetromino.board = this;
      this.tetrominos.add(tetromino);
      this.element.appendChild(tetromino.element);
      tetromino.updatePosition();
    } else {
      tetromino = TetrominoFactory.createNew(
        center,
        document,
        this,
        this.tetrominoSeedQueue.dequeue()
      );
      this.tetrominos.add(tetromino);
      this.element.appendChild(tetromino.element);
      tetromino.updatePosition();
    }
    tetromino.startFalling();
    // Show next tetromino in preview
    this.nextTetromino = TetrominoFactory.createNew(
      center,
      document,
      null,
      this.tetrominoSeedQueue.dequeue()
    );
    this.nextTetromino.updatePosition();
    if (this.previewBoard && this.previewBoard.showNextTetromino) {
      this.previewBoard.showNextTetromino(this.nextTetromino);
    }
    return tetromino;
  }
}
