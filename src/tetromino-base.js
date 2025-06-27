export class Tetromino {
  static nextId = 1;
  static createNew(left, document, board, seed) {
    throw new Error("Use the factory in tetromino.js");
  }

  constructor(left, document, board) {
    this.board = board;
    this.left = left;
    this.top = 0;
    this.size = 24;
    this.element = this.createElement(document);
    if (this.board) {
      this.board.addTetromino(this);
    }
  }

  createElement(document) {
    return this.createDiv(document, this.getClassName());
  }

  getClassName() {
    return "tetromino";
  }

  createDiv(
    document,
    className,
    left = this.left,
    top = this.top,
    size = this.size
  ) {
    const tetromino = document.createElement("div");
    tetromino.className = className;
    tetromino.style.width = size + "px";
    tetromino.style.height = size + "px";
    tetromino.style.position = "absolute";
    tetromino.style.left = left * size + "px";
    tetromino.style.top = top * size + "px";
    tetromino.setAttribute("data-tetromino-id", Tetromino.nextId++);
    return tetromino;
  }

  move(direction) {
    if (!this.board) return;
    this.board.moveTetromino(this, direction);
  }

  drop() {
    if (!this.board) return;
    while (this.canDrop()) {
      this.board.moveTetromino(this, "down");
    }
    this.lock();
  }

  canDrop() {
    if (!this.board) return false;
    const positions = this.getBlockPositions();
    return positions.every(
      ({ x, y }) =>
        y < this.board.height &&
        !Array.from(this.board.tetrominos).some(
          (other) =>
            other !== this &&
            other.getBlockPositions().some((p) => p.x === x && p.y === y + 1)
        )
    );
  }

  updatePosition() {
    this.element.style.top = this.top * this.size + "px";
    this.element.style.left = this.left * this.size + "px";
  }

  remove() {
    this.element.remove();
    this.board.tetrominos.delete(this);
  }

  blocksMovement(direction, movingTetromino) {
    if (this === movingTetromino) return false;
    const thisBlocks = this.getBlockPositions();
    const movingBlocks = movingTetromino.getBlockPositions();
    let dx = 0,
      dy = 0;
    if (direction === "left") dx = -1;
    if (direction === "right") dx = 1;
    if (direction === "down") dy = 1;
    return movingBlocks.some(({ x, y }) =>
      thisBlocks.some(({ x: bx, y: by }) => bx === x + dx && by === y + dy)
    );
  }

  lock() {
    if (this.locked) return;
    this.locked = true;
    this.move = function () {};
    this.drop = function () {};
    const event = new Event("locked");
    this.element.dispatchEvent(event);
  }

  startFalling() {
    if (!this.board) return;
    this.fallListener = () => {
      if (!this.locked && this.board) {
        const canContinue = this.board.moveTetromino(this, "down");
        if (!canContinue) {
          this.lock();
        }
      }
    };
    document.addEventListener("tick", this.fallListener);
  }

  isWithinBounds(direction, boardWidth, boardHeight) {
    switch (direction) {
      case "down":
        return this.top < boardHeight;
      case "left":
        return this.left > 0;
      case "right":
        return this.left < boardWidth - 1;
      default:
        return false;
    }
  }

  getBlockPositions() {
    return [{ x: this.left, y: this.top }];
  }
}
