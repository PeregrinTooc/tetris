import { any } from "cypress/types/bluebird";
import { Board } from "./board";

export class Block {
	x: number;
	y: number;
	parent: Tetromino;

	constructor({ x, y, parent }: { x: number; y: number; parent: Tetromino }) {
		this.x = x;
		this.y = y;
		this.parent = parent;
	}

	drop(): void {
		this.y++;
	}

	delete(): void {
		this.parent.removeBlock(this);
	}

}

export abstract class Tetromino {
	collapseBlocks() {
		for (const block of this.blocks) {
			let blocksBelow = this.blocks.filter(b => b.x === block.x && b.y > block.y)
			let highestBelowBlockY = Math.min(...blocksBelow.map(b => b.y))
			if (blocksBelow.length > 0 && highestBelowBlockY - 1 > block.y) {
				block.drop();
				this.collapseBlocks(); // Recursively collapse until no more blocks can drop			
			}
		}
	}
	dropByOne() {
		this.blocks.forEach((block) => block.drop());
	}

	blocks: Block[] = [];

	static nextId = 1;
	public readonly id: string;

	public get left(): number {
		return this.pivot.x;
	}
	public set left(value: number) {
		this.pivot.x = value;
	}
	public get top(): number {
		return this.pivot.y;
	}
	public set top(value: number) {
		this.pivot.y = value;
	}
	size: number;
	board: any;
	locked: boolean;
	rotation: number;
	element: HTMLElement;
	fallListener?: () => void;
	keyboardListener?: (event: KeyboardEvent) => void;
	protected pivot: Block;

	constructor(left: number, board: Board | null) {
		this.id = (Tetromino.nextId++).toString();
		this.pivot = new Block({ x: left, y: 0, parent: this });
		this.size = 24;
		this.board = board;
		this.locked = false;
		this.rotation = 0;
		this.element = this._createElement();
		this.blocks = this.getBlocks();
		this._renderBlocks();
		if (this.board) this.board.addTetromino(this);
	}
	protected createBlocks(): void {
		this.blocks = this.getBlocks();
	}

	public removeBlock(block: Block): void {
		this.blocks = this.blocks.filter((b) => b !== block);
		this.updateBlocks();
	}
	private _createElement(): HTMLElement {
		return this._createDiv(this.getClassName());
	}
	public collides(dx: number, dy: number, occupiedPositions: Block[]): boolean {
		const movingBlocks = this.getBlocks()
			.map(({ x, y }) => ({ x: x + dx, y: y + dy }));
		return movingBlocks.some(({ x, y }) =>
			occupiedPositions.some(({ x: bx, y: by }) => bx === x && by === y)
		);
	}
	public abstract getClassName(): string;

	private _createDiv(
		className: string,
		left: number = 0,
		top: number = 0,
		size: number = this.size
	): HTMLElement {
		const div = document.createElement("div");
		div.className = className;
		div.style.width = size + "px";
		div.style.height = size + "px";
		div.style.position = "absolute";
		div.style.left = left * size + "px";
		div.style.top = top * size + "px";

		// Add tetromino ID to both containers and blocks
		div.setAttribute("data-tetromino-id", this.id);

		return div;
	}

	public abstract getBlocks(): Block[];

	public move(direction: string): void {
		const board = this.board as Board;
		if (!board || this.locked) return;
		const moved = board.moveTetromino(this, direction);
		// Award 10 points for soft drop if tetromino actually moved down
		if (moved && direction === "down") {
			this._dispatchScoreEvent(10);
		}
	}

	public drop(): void {
		if (!this.board || this.locked) return;
		let dropDistance = 0;
		while (this.board.moveTetromino(this, "down")) {
			dropDistance++;
		}

		// Award 15 points per line for hard drop
		if (dropDistance > 0) {
			this._dispatchScoreEvent(dropDistance * 15);
			// Dispatch hard drop event
			const hardDropEvent = new Event("hardDrop");
			this.element.dispatchEvent(hardDropEvent);
		}

		this.lock();
	}

	private _dispatchScoreEvent(points: number): void {
		const event = new CustomEvent("scoreEvent", {
			detail: { points },
			bubbles: true
		});
		this.element.dispatchEvent(event);
	}

	public addEventListener(event: string, listener: EventListener): void {
		this.element.addEventListener(event, listener);
	}

	public updatePosition(): void {
		this.element.style.top = this.top * this.size + "px";
		this.element.style.left = this.left * this.size + "px";

		// Update coordinate rendering if enabled
		if (this.board && (window as any).USE_COORDINATE_RENDERING === true) {
			(this.board as any).renderTetrominoCoordinates(this);
		}
	}

	public lock(): void {
		if (this.locked) return;
		this.blocks = this.getBlocks(); //make sure the blocks are up to date: from now on, their position will not be calculated again.
		this.locked = true;
		this._removeKeyboardListener();

		// Award 5 points for locking a tetromino
		this._dispatchScoreEvent(5);

		const event = new CustomEvent("locked", { detail: this.getBlocks() });
		this.element.dispatchEvent(event);
	}

	private _setupKeyboardListener(): void {
		this.keyboardListener = (event: KeyboardEvent) => {
			if (this.locked || !this.board || window.isPaused) return;

			if (event.key === "ArrowLeft") {
				this.move("left");
			} else if (event.key === "ArrowRight") {
				this.move("right");
			} else if (event.key === "ArrowDown") {
				this.move("down");
			} else if (event.key === " " || event.key === "Space" || event.key === "Spacebar") {
				if (event.preventDefault) event.preventDefault();
				this.drop();
			} else if (event.key === "ArrowUp") {
				this.rotate();
			}
		};
		document.addEventListener("keydown", this.keyboardListener);
	}

	private _removeKeyboardListener(): void {
		if (this.keyboardListener) {
			document.removeEventListener("keydown", this.keyboardListener);
			this.keyboardListener = undefined;
		}
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

	public activateKeyboardControl(): void {
		this._removeKeyboardListener(); // Remove any existing listener first
		this._setupKeyboardListener();
	}

	public deactivateKeyboardControl(): void {
		this._removeKeyboardListener();
	}

	public rotate(): void {
		const board = this.board as Board;
		const prevRotation = this.rotation;
		this.rotation++;
		const previewBlocks = this.getBlocks();

		if (!board.inBounds(previewBlocks) || board.collision(previewBlocks)) {
			this.rotation = prevRotation;
			return;
		}
		this.blocks = previewBlocks;
		this.updateBlocks();
	}

	public updateBlocks(): void {
		this.blocks = this.getBlocks();
		while (this.element.firstChild)
			this.element.removeChild(this.element.firstChild);
		this._renderBlocks();

		// Update coordinate rendering if enabled
		if (this.board && (window as any).USE_COORDINATE_RENDERING === true) {
			(this.board as any).renderTetrominoCoordinates(this);
		}
	}

	private _renderBlocks(): void {
		this.blocks.forEach(({ x, y }) => {
			const block = this._createDiv("block", x - this.left, y - this.top);
			this.element.appendChild(block);
		});
	}
}
