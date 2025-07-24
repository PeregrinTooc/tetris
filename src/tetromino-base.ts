export interface BlockPosition {
	x: number;
	y: number;
}

export class Tetromino {
	static nextId = 1;
	left: number;
	top: number;
	size: number;
	board: any;
	locked: boolean;
	rotation: number;
	element: HTMLElement;
	fallListener?: () => void;

	constructor(left: number, document: Document, board: any) {
		this.left = left;
		this.top = 0;
		this.size = 24;
		this.board = board;
		this.locked = false;
		this.rotation = 0;
		this.element = this._createElement(document);
		if (this.board) this.board.addTetromino(this);
	}

	_createElement(document: Document): HTMLElement {
		const el = this._createDiv(document, this.getClassName());
		this._renderBlocks(el, document);
		return el;
	}

	getClassName(): string {
		return "tetromino";
	}

	_createDiv(document: Document, className: string, left: number = 0, top: number = 0, size: number = this.size): HTMLElement {
		const div = document.createElement("div");
		div.className = className;
		div.style.width = size + "px";
		div.style.height = size + "px";
		div.style.position = "absolute";
		div.style.left = left * size + "px";
		div.style.top = top * size + "px";
		div.setAttribute("data-tetromino-id", (Tetromino.nextId++).toString());
		return div;
	}

	getBlockPositions(): BlockPosition[] {
		return [{ x: this.left, y: this.top }];
	}

	move(direction: string): void {
		if (!this.board || this.locked) return;
		this.board.moveTetromino(this, direction);
	}

	drop(): void {
		if (!this.board || this.locked) return;
		while (this.canDrop()) {
			this.board.moveTetromino(this, "down");
		}
		this.lock();
	}

	canDrop(): boolean {
		if (!this.board || this.locked) return false;
		const nextBlocks = this.getBlockPositions().map(({ x, y }) => ({
			x,
			y: y + 1,
		}));
		return this._inBounds(nextBlocks) && !this._collides(nextBlocks);
	}

	_inBounds(blocks: BlockPosition[]): boolean {
		const width = this.board ? this.board.width : 10;
		const height = this.board ? this.board.height : 20;
		return blocks.every(
			({ x, y }) => x >= 0 && x < width && y >= 0 && y <= height
		);
	}

	_collides(blocks: BlockPosition[]): boolean {
		if (!this.board) return false;
		for (const other of this.board.tetrominos) {
			if (other === this) continue;
			const otherBlocks = other.getBlockPositions();
			if (
				blocks.some((pos) =>
					otherBlocks.some((b: BlockPosition) => b.x === pos.x && b.y === pos.y)
				)
			) {
				return true;
			}
		}
		return false;
	}

	updatePosition(): void {
		this.element.style.top = this.top * this.size + "px";
		this.element.style.left = this.left * this.size + "px";
	}

	remove(): void {
		this.element.remove();
		if (this.board) this.board.tetrominos.delete(this);
	}

	blocksMovement(direction: string, movingTetromino: Tetromino): boolean {
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

	lock(): void {
		if (this.locked) return;
		this.locked = true;
		const event = new Event("locked");
		this.element.dispatchEvent(event);
	}

	startFalling(): void {
		if (!this.board || this.locked) return;
		this.fallListener = () => {
			if (!this.locked && this.board) {
				const canContinue = this.board.moveTetromino(this, "down");
				if (!canContinue) this.lock();
			}
		};
		document.addEventListener("tick", this.fallListener);
	}

	isWithinBounds(direction: string, boardWidth: number, boardHeight: number): boolean {
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

	rotate(board: any): void {
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
				(other: any) =>
					other !== this &&
					previewBlocks.some((pos: BlockPosition) =>
						other
							.getBlockPositions()
							.some((b: BlockPosition) => b.x === pos.x && b.y === pos.y)
					)
			);
		if (!inBounds || collision) {
			this.rotation = prevRotation;
			return;
		}
		this.updateBlocks();
	}

	updateBlocks(): void {
		while (this.element.firstChild)
			this.element.removeChild(this.element.firstChild);
		this._renderBlocks(this.element, document);
	}

	_renderBlocks(element: HTMLElement, document: Document): void {
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
