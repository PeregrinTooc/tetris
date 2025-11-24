import { Board } from "./board";
import { KeyBindingManager } from "./key-binding-manager";
import { SizingConfig } from "./sizing-config";

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
		const board = this.parent?.board;
		if (board && typeof (board as any).getHeight === "function") {
			const maxY = (board as any).getHeight() - 1;
			if (this.y >= maxY) {
				console.warn(`Block cannot drop: already at maximum y (${this.y} >= ${maxY})`);
				return;
			}
		}
		this.y++;
	}

	delete(): void {
		this.parent.removeBlock(this);
	}

	public log(): void {
		console.log("  Block ->", { x: this.x, y: this.y, tetrominoId: this.parent?.id });
	}
}

export abstract class Tetromino {
	size: number;
	board: any;
	locked: boolean;
	rotation: number;
	element: HTMLElement;
	fallListener?: () => void;
	keyboardListener?: (event: KeyboardEvent) => void;
	protected pivot: Block;
	paused: boolean = false;
	blocks: Block[] = [];

	private static nextId = 1;
	public readonly id: string;

	constructor(left: number, board: Board | null) {
		this.id = (Tetromino.nextId++).toString();
		this.pivot = new Block({ x: left, y: 0, parent: this });
		this.size =
			board && typeof (board as any).getBlockSize === "function"
				? (board as any).getBlockSize()
				: SizingConfig.BLOCK_SIZE;
		this.board = board;
		this.locked = false;
		this.rotation = 0;
		this.element = this._createElement();
		this.blocks = this.getBlocks();
		if (this.board) {
			this.board.addTetromino(this);
		}
	}

	public pause() {
		this.paused = !this.paused;
	}

	public collapseBlocks() {
		const MAX_ITERATIONS = 100;
		let iterations = 0;
		let collapsed = true;

		while (collapsed && iterations < MAX_ITERATIONS) {
			collapsed = false;
			iterations++;

			for (const block of this.blocks) {
				const blocksBelow = this.blocks.filter((b) => b.x === block.x && b.y > block.y);
				if (blocksBelow.length > 0) {
					const highestBelowBlockY = Math.min(...blocksBelow.map((b) => b.y));
					if (highestBelowBlockY - 1 > block.y) {
						block.drop();
						collapsed = true;
					}
				}
			}
		}

		if (iterations >= MAX_ITERATIONS) {
			console.warn(
				"Block collapse exceeded maximum iterations. Possible infinite loop prevented."
			);
		}
	}

	public dropByOne() {
		this.blocks.forEach((block) => block.drop());
	}

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

	public reset(): void {
		this.left = Math.floor((this.board?.width || 10) / 2);
		this.top = 0;
		this.rotation = 0;
		this.locked = false;
		this.paused = false;
		this.updatePosition();
		this.updateBlocks();
	}

	protected createBlocks(): void {
		this.blocks = this.getBlocks();
	}

	public removeBlock(block: Block): void {
		this.blocks = this.blocks.filter((b) => b !== block);
		this.updateBlocks();
		if (this.blocks.length === 0 && this.board) {
			this.board.removeTetromino(this);
		}
	}

	private _createElement(): HTMLElement {
		return this._createDiv(this.getClassName());
	}

	public collides(dx: number, dy: number, occupiedPositions: Block[]): boolean {
		const movingBlocks = this.getBlocks().map(({ x, y }) => ({ x: x + dx, y: y + dy }));
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
		div.setAttribute("data-tetromino-id", this.id);
		return div;
	}

	public abstract getBlocks(): Block[];

	public move(direction: string): void {
		const board = this.board as Board;
		if (!board || this.locked) return;
		const moved = board.moveTetromino(this, direction);
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

		if (dropDistance > 0) {
			this._dispatchScoreEvent(dropDistance * 15);
			const hardDropEvent = new Event("hardDrop");
			this.element.dispatchEvent(hardDropEvent);
		}

		this.lock();
	}

	private _dispatchScoreEvent(points: number): void {
		const event = new CustomEvent("scoreEvent", {
			detail: { points },
			bubbles: true,
		});
		this.element.dispatchEvent(event);
	}

	public addEventListener(event: string, listener: EventListener): void {
		this.element.addEventListener(event, listener);
	}

	public updatePosition(): void {
		this.element.style.top = this.top * this.size + "px";
		this.element.style.left = this.left * this.size + "px";

		if (this.board && typeof (this.board as any).getBlockRenderer === "function") {
			(this.board as any).getBlockRenderer().updateTetromino(this);
		}
	}

	public lock(): void {
		if (this.locked) return;
		this.stopListening();
		this.blocks = this.getBlocks();
		this.locked = true;

		// Clear shadows before dispatching locked event (before new piece spawns)
		if (this.board && typeof (this.board as any).getBlockRenderer === "function") {
			(this.board as any).getBlockRenderer().clearShadowBlocks(this);
		}

		this._dispatchScoreEvent(5);

		const event = new CustomEvent("locked", { detail: this.getBlocks() });
		this.element.dispatchEvent(event);
	}

	private _setupKeyboardListener(keyBindingManager: KeyBindingManager): void {
		this.keyboardListener = (event: KeyboardEvent) => {
			if (this.locked || !this.board || this.paused) return;

			const action = keyBindingManager.getActionForKey(event.key);
			if (!action) return;

			switch (action) {
				case "moveLeft":
					this.move("left");
					break;
				case "moveRight":
					this.move("right");
					break;
				case "softDrop":
					this.move("down");
					break;
				case "hardDrop":
					if (event.preventDefault) event.preventDefault();
					this.drop();
					break;
				case "rotateClockwise":
					this.rotate();
					break;
				case "rotateCounterClockwise":
					this.rotate(-1);
					break;
				case "hold":
					if (this.board) {
						this.board.hold();
					}
					break;
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
		document.addEventListener("tick", this.fallListener as EventListener);
	}

	stopListening() {
		document.removeEventListener("tick", this.fallListener as EventListener);
		this.deactivateKeyboardControl();
	}

	public activateKeyboardControl(keyBindingManager: KeyBindingManager): void {
		this._removeKeyboardListener();
		this._setupKeyboardListener(keyBindingManager);
	}

	public deactivateKeyboardControl(): void {
		this._removeKeyboardListener();
	}

	public rotate(direction: 1 | -1 = 1): void {
		const board = this.board as Board;
		const prevRotation = this.rotation;
		this.rotation += direction;
		const previewBlocks = this.getBlocks();

		if (!board.inBounds(previewBlocks) || board.collision(previewBlocks)) {
			this.rotation = prevRotation;
			return;
		}
		this.blocks = previewBlocks;
		this.updateBlocks();

		if (board && typeof (board as any).calculateDropDistance === "function") {
			const blockRenderer = (board as any).getBlockRenderer();
			blockRenderer.clearShadowBlocks(this);
			const dropDistance = (board as any).calculateDropDistance(this);
			blockRenderer.renderShadowBlocks(this, dropDistance);
		}
	}

	public updateBlocks(): void {
		this.blocks = this.getBlocks();

		if (this.board && typeof (this.board as any).getBlockRenderer === "function") {
			(this.board as any).getBlockRenderer().updateTetromino(this);
		}
	}

	public log(): void {
		console.log(" Tetromino ->", {
			id: this.id,
			left: this.left,
			top: this.top,
			locked: this.locked,
		});
		if (this.blocks && this.blocks.length > 0) {
			console.log("  Blocks:");
			this.blocks.forEach((b) => {
				if ((b as any).log) (b as any).log();
				else console.log("    ", { x: b.x, y: b.y });
			});
		}
	}
}
