export class Tetromino {
  static nextId = 1;

  constructor(left, document, board) {
    this.left = left;
    this.top = 0;
    this.size = 24;
    this.board = board;
    this.locked = false;
    this.rotation = 0;
    this.element = this._createElement(document);
    if (this.board) this.board.addTetromino(this);
  }

  _createElement(document) {
    const el = this._createDiv(document, this.getClassName());
    this._renderBlocks(el, document);
    return el;
  }

  getClassName() {
    return "tetromino";
  }

  _createDiv(document, className, left = 0, top = 0, size = this.size) {
    const div = document.createElement("div");
    div.className = className;
    div.style.width = size + "px";
    div.style.height = size + "px";
    div.style.position = "absolute";
    div.style.left = left * size + "px";
    div.style.top = top * size + "px";
    div.setAttribute("data-tetromino-id", Tetromino.nextId++);
    return div;
  }

  getBlockPositions() {
    // Override in subclasses for real shapes
    return [{ x: this.left, y: this.top }];
  }

  move(direction) {
    if (!this.board || this.locked) return;
    this.board.moveTetromino(this, direction);
  }

  drop() {
    if (!this.board || this.locked) return;
    while (this.canDrop()) {
      this.board.moveTetromino(this, "down");
    }
    this.lock();
  }

  canDrop() {
    if (!this.board || this.locked) return false;
    const nextBlocks = this.getBlockPositions().map(({ x, y }) => ({
      x,
      y: y + 1,
    }));
    return this._inBounds(nextBlocks) && !this._collides(nextBlocks);
  }

  _inBounds(blocks) {
    const width = this.board ? this.board.width : 10;
    const height = this.board ? this.board.height : 20;
    return blocks.every(
      ({ x, y }) => x >= 0 && x < width && y >= 0 && y <= height
    );
  }

  _collides(blocks) {
    if (!this.board) return false;
    for (const other of this.board.tetrominos) {
      if (other === this) continue;
      const otherBlocks = other.getBlockPositions();
      if (
        blocks.some((pos) =>
          otherBlocks.some((b) => b.x === pos.x && b.y === pos.y)
        )
      ) {
        return true;
      }
    }
    return false;
  }

  updatePosition() {
    this.element.style.top = this.top * this.size + "px";
    this.element.style.left = this.left * this.size + "px";
  }

  remove() {
    this.element.remove();
    if (this.board) this.board.tetrominos.delete(this);
  }

  blocksMovement(direction, movingTetromino) {
    if (this === movingTetromino) return false;
    const dx = direction === "left" ? -1 : direction === "right" ? 1 : 0;
    const dy = direction === "down" ? 1 : 0;
    const movingBlocks = movingTetromino
      .getBlockPositions()
      .map(({ x, y }) => ({ x: x + dx, y: y + dy }));
    const thisBlocks = this.getBlockPositions();
    return movingBlocks.some(({ x, y }) =>
      thisBlocks.some(({ x: bx, y: by }) => bx === x && by === y)
    );
  }

  lock() {
    if (this.locked) return;
    this.locked = true;
    const event = new Event("locked");
    this.element.dispatchEvent(event);
  }

  startFalling() {
    if (!this.board || this.locked) return;
    this.fallListener = () => {
      if (!this.locked && this.board) {
        const canContinue = this.board.moveTetromino(this, "down");
        if (!canContinue) this.lock();
      }
    };
    document.addEventListener("tick", this.fallListener);
  }

  isWithinBounds(direction, boardWidth, boardHeight) {
    const dx = direction === "left" ? -1 : direction === "right" ? 1 : 0;
    const dy = direction === "down" ? 1 : 0;
    const nextBlocks = this.getBlockPositions().map(({ x, y }) => ({
      x: x + dx,
      y: y + dy,
    }));
    return nextBlocks.every(
      ({ x, y }) => x >= 0 && x < boardWidth && y >= 0 && y <= boardHeight
    );
  }

  rotate(board) {
    const prevRotation = this.rotation;
    this.rotation++;
    const previewBlocks = this.getBlockPositions();
    const width = board ? board.width : this.board ? this.board.width : 10;
    const height = board ? board.height : this.board ? this.board.height : 20;
    const inBounds = previewBlocks.every(
      ({ x, y }) => x >= 0 && x < width && y >= 0 && y <= height
    );
    const collision =
      board &&
      board.tetrominos &&
      Array.from(board.tetrominos).some(
        (other) =>
          other !== this &&
          previewBlocks.some((pos) =>
            other
              .getBlockPositions()
              .some((b) => b.x === pos.x && b.y === pos.y)
          )
      );
    if (!inBounds || collision) {
      this.rotation = prevRotation;
      return;
    }
    this.updateBlocks();
  }

  updateBlocks() {
    while (this.element.firstChild)
      this.element.removeChild(this.element.firstChild);
    this._renderBlocks(this.element, document);
  }

  _renderBlocks(element, document) {
    const blocks = this.getBlockPositions();
    blocks.forEach(({ x, y }) => {
      const block = this._createDiv(
        document,
        "block",
        x - this.left,
        y - this.top
      );
      element.appendChild(block);
    });
  }
}
