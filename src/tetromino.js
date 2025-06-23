export class Tetromino {
  static nextId = 1;
  static createNew(left, document, board, seed) {
    if (seed === 0) {
      return new TetrominoT(left, document, board);
    }
    return new Tetromino(left, document, board, seed);
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
    const tetromino = document.createElement("div");
    tetromino.className = "tetromino";
    tetromino.style.width = this.size + "px";
    tetromino.style.height = this.size + "px";
    tetromino.style.position = "absolute";
    tetromino.style.left = this.left * this.size + "px";
    tetromino.style.top = this.top * this.size + "px";
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

export class TetrominoT extends Tetromino {
  constructor(left, document, board) {
    super(left, document, null, 0); // don't add to board in super
    this.type = "T";
    this.element = this.createElement(document);
    if (board) {
      this.board = board;
      board.addTetromino(this);
    }
  }

  createElement(document) {
    const tetromino = document.createElement("div");
    tetromino.className = "tetromino tetromino-t";
    tetromino.style.position = "absolute";
    tetromino.style.left = this.left * this.size + "px";
    tetromino.style.top = this.top * this.size + "px";
    tetromino.setAttribute("data-tetromino-id", Tetromino.nextId++);
    const blocks = [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];
    blocks.forEach(({ x, y }) => {
      const block = document.createElement("div");
      block.className = "block";
      block.style.width = this.size + "px";
      block.style.height = this.size + "px";
      block.style.position = "absolute";
      block.style.left = x * this.size + "px";
      block.style.top = y * this.size + "px";
      tetromino.appendChild(block);
    });
    return tetromino;
  }
}
