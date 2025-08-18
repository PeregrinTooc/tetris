import { Board } from "./board";

export interface BlockPosition {
	x: number;
	y: number;
}

export abstract class Tetromino {
	static nextId = 1;
	left: number;
	top: number;
	size: number;
	board: any;
	locked: boolean;
	rotation: number;
	element: HTMLElement;
	fallListener?: () => void;

	constructor(left: number, document: Document, board: Board | null) {
		this.left = left;
		this.top = 0;
		this.size = 24;
		this.board = board;
		this.locked = false;
		this.rotation = 0;
		this.element = this._createElement(document);
		if (this.board) this.board.addTetromino(this);
	}

	private _createElement(document: Document): HTMLElement {
		const el = this._createDiv(document, this.getClassName());
		this._renderBlocks(el, document);
		return el;
	}

	public abstract getClassName(): string;

	private _createDiv(document: Document, className: string, left: number = 0, top: number = 0, size: number = this.size): HTMLElement {
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

	public abstract getBlockPositions(): BlockPosition[];

	public move(direction: string): void {
		if (!this.board || this.locked) return;
		this.board.moveTetromino(this, direction);
	}

	public drop(): void {
		if (!this.board || this.locked) return;
		while (this.board.moveTetromino(this, "down")) {
			// Keep moving down until we can't anymore
		}
		this.lock();
	}

	public addEventListener(event: string, listener: EventListener): void {
		this.element.addEventListener(event, listener);
	}

	public updatePosition(): void {
		this.element.style.top = this.top * this.size + "px";
		this.element.style.left = this.left * this.size + "px";
	}



	public lock(): void {
		if (this.locked) return;
		this.locked = true;
		const event = new CustomEvent("locked", { detail: this.getBlockPositions() });
		this.element.dispatchEvent(event);
	}

	public startFalling(): void {
		if (!this.board || this.locked) return;
		this.fallListener = () => {
			if (!this.locked && this.board) {
				const canContinue = this.board.moveTetromino(this, "down");
				if (!canContinue) this.lock();
			}
		};
		document.addEventListener("tick", this.fallListener);
	}

	public rotate(): void {
		const board = this.board as Board;
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
		this._updateBlocks();
	}

	private _updateBlocks(): void {
		while (this.element.firstChild)
			this.element.removeChild(this.element.firstChild);
		this._renderBlocks(this.element, document);
	}

	private _renderBlocks(element: HTMLElement, document: Document): void {
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
