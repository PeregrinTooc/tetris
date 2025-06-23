export class Tetromino {
  static nextId = 1;
  static createNew(left, document, board, seed) {
    if (seed === 0) {
      return new TetrominoT(left, document, board);
    }
    if (seed === 1337) {
      return new Tetromino(left, document, board, seed);
    }
    throw new Error("Unsupported tetromino seed: " + seed);
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
    while (this.board.moveTetromino(this, "down")) {}
    this.lock();
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
    if (direction === "left") {
      return (
        this.top === movingTetromino.top &&
        this.left === movingTetromino.left - 1
      );
    }
    if (direction === "right") {
      return (
        this.top === movingTetromino.top &&
        this.left === movingTetromino.left + 1
      );
    }
    if (direction === "down") {
      return (
        this.left === movingTetromino.left &&
        this.top === movingTetromino.top + 1
      );
    }
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
}

class TetrominoT extends Tetromino {
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
    const positions = [
      { x: this.left, y: this.top },
      { x: this.left - 1, y: this.top },
      { x: this.left + 1, y: this.top },
      { x: this.left, y: this.top + 1 },
    ];
    if (this.rotation % 4 === 1) {
      return [
        { x: this.left, y: this.top },
        { x: this.left, y: this.top - 1 },
        { x: this.left, y: this.top + 1 },
        { x: this.left - 1, y: this.top },
      ];
    }
    if (this.rotation % 4 === 2) {
      return [
        { x: this.left, y: this.top },
        { x: this.left - 1, y: this.top },
        { x: this.left + 1, y: this.top },
        { x: this.left, y: this.top - 1 },
      ];
    }
    if (this.rotation % 4 === 3) {
      return [
        { x: this.left, y: this.top },
        { x: this.left, y: this.top - 1 },
        { x: this.left, y: this.top + 1 },
        { x: this.left + 1, y: this.top },
      ];
    }
    return positions;
  }

  rotate() {
    this.rotation = (this.rotation + 1) % 4;
    this.updateBlocks();
  }

  updateBlocks() {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
    const blocks = this.getBlockPositions();
    blocks.forEach(({ x, y }) => {
      const block = this.createDiv(
        document,
        "block",
        x - this.left,
        y - this.top
      );
      this.element.appendChild(block);
    });
  }

  createElement(document) {
    const tetromino = this.createDiv(document, this.getClassName());
    const blocks = this.getBlockPositions();
    blocks.forEach(({ x, y }) => {
      const block = this.createDiv(
        document,
        "block",
        x - this.left,
        y - this.top
      );
      tetromino.appendChild(block);
    });
    return tetromino;
  }
}
