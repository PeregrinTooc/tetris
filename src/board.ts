import { Tetromino, Block } from "./tetromino-base";
import { TetrominoFactory } from "./tetrominoFactory";


interface PreviewBoard {
	element: HTMLElement;
	previewContainer: HTMLElement;
	showNextTetromino?: (tetromino: Tetromino) => void;
}

interface TetrominoSeedQueue {
	dequeue: () => number;
}

export class Board {
	registerEventListener(eventName: string, callback: (event: Event) => void) {
		this.element.addEventListener(eventName, callback);
	}
	pauseGame() {
		this.activeTetromino.pause();
	}
	private height: number;
	private width: number;
	private element: HTMLElement;
	private previewBoard: PreviewBoard | null;
	private tetrominos: Set<Tetromino>;
	private nextTetromino: Tetromino | null = null;
	private tetrominoSeedQueue: TetrominoSeedQueue;
	// @ts-expect-error: Suppress possibly undefined warning for activeTetromino
	private activeTetromino: Tetromino;
	private occupiedPositions: Block[] = [];
	private coordinateBlocks: Map<string, HTMLElement> = new Map();

	constructor(
		height: number,
		width: number,
		element: HTMLElement,
		previewBoard: PreviewBoard | null,
		tetrominoSeedQueue: TetrominoSeedQueue
	) {
		this.height = height;
		this.width = width;
		this.element = element;
		this.previewBoard = previewBoard;
		this.tetrominos = new Set();
		this.nextTetromino = null;
		this.tetrominoSeedQueue = tetrominoSeedQueue;
	}

	collision(previewBlocks: Block[]): boolean {
		const collision =
			this.occupiedPositions.some((other) =>
				previewBlocks.some(
					(pos: Block) => other.x === pos.x && other.y === pos.y
				)
			);
		return collision;
	}
	inBounds(previewBlocks: Block[]) {
		return previewBlocks.every(
			({ x, y }) => x >= 0 && x < this.width && y >= 0 && y <= this.height
		);
	}
	private _canMove(direction: string): boolean {
		if (this.hasCollision(direction)) {
			if (direction === "down") {
				this._raiseGameOverIfStackReachesTop();
			}
			return false;
		}
		return true;
	}

	private hasCollision(direction: string): boolean {
		const dx = direction === "left" ? -1 : direction === "right" ? 1 : 0;
		const dy = direction === "down" ? 1 : 0;
		return this.activeTetromino.collides(dx, dy, this.occupiedPositions)
	}

	private _raiseGameOverIfStackReachesTop(): void {
		if (this.activeTetromino.top === 0) {
			const gameOverEvent = new Event("gameover");
			this.element.dispatchEvent(gameOverEvent);
		}
	}

	public addTetromino(tetromino: Tetromino): void {
		this.tetrominos.add(tetromino);
		this.element.appendChild(tetromino.element);
		this.activeTetromino = tetromino;
		tetromino.addEventListener("locked", this._handleTetrominoLocked.bind(this));

		// Handle coordinate rendering
		if (this.isCoordinateRenderingEnabled()) {
			tetromino.element.style.display = "none"; // Hide the container
			this.renderTetrominoCoordinates(tetromino);
		}
	}

	private _handleTetrominoLocked(event: Event): void {
		const customEvent = event as CustomEvent;
		customEvent.detail.forEach((block: Block) => { this.occupiedPositions.push(block) });
		this.occupiedPositions.sort((a, b) => b.y - a.y);
		this._checkForCompletedLines();
	}
	private _checkForCompletedLines() {
		const completedLines = this._findCompletedLines();
		if (completedLines.length > 0) {
			this._removeCompletedLines(completedLines);
			// Drop all remaining blocks to their lowest possible positions
			this._dropAllBlocks();
			// Recursively check for new completed lines
			this._checkForCompletedLines();
		}
	}

	private _dropAllBlocks() {
		// Group blocks by their parent tetromino
		const tetrominoGroups = new Map<Tetromino, Block[]>();

		for (const block of this.occupiedPositions) {
			if (!tetrominoGroups.has(block.parent)) {
				tetrominoGroups.set(block.parent, []);
			}
			tetrominoGroups.get(block.parent)!.push(block);
		}


		// Drop locked tetrominoes as complete units
		for (const [tetromino, blocks] of tetrominoGroups) {
			this._dropTetrominoAsUnit(tetromino, blocks);
			tetromino.collapseBlocks();
		}



		// Update visual representation for all affected tetrominoes
		const affectedTetrominoes = new Set();
		for (const block of this.occupiedPositions) {
			if (block.parent && block.parent.locked) {
				affectedTetrominoes.add(block.parent);
			}
		}

		for (const tetromino of affectedTetrominoes) {
			this._updateLockedTetrominoVisuals(tetromino as any);
		}
	}

	private _dropTetrominoAsUnit(tetromino: Tetromino, blocks: Block[]) {
		// Find how far the entire tetromino can drop as a unit
		let maxDrop = this.height;

		for (const block of blocks) {
			let blockMaxDrop = this.height - block.y;

			// Check for collisions with other blocks below this block
			for (const otherBlock of this.occupiedPositions) {
				// Exclude blocks from the same tetromino (including deleted blocks that may still be in occupiedPositions)
				if (otherBlock.parent !== tetromino &&
					otherBlock.x === block.x &&
					otherBlock.y > block.y) {
					blockMaxDrop = Math.min(blockMaxDrop, otherBlock.y - block.y - 1);
				}
			}

			maxDrop = Math.min(maxDrop, blockMaxDrop);
		}

		// Drop all blocks of this tetromino by the same amount
		for (const block of blocks) {
			for (let i = 0; i < maxDrop; i++) {
				block.drop();
			}
		}
	}


	private _updateLockedTetrominoVisuals(tetromino: any): void {
		// For locked tetrominoes, update visual representation to match current block positions
		// Find the top-left-most block position for container positioning
		const minX = Math.min(...tetromino.blocks.map((block: any) => block.x));
		const minY = Math.min(...tetromino.blocks.map((block: any) => block.y));

		// Update the container position to match the new block layout
		tetromino.element.style.left = minX * tetromino.size + "px";
		tetromino.element.style.top = minY * tetromino.size + "px";

		// Clear and re-render blocks with positions relative to container
		while (tetromino.element.firstChild) {
			tetromino.element.removeChild(tetromino.element.firstChild);
		}

		tetromino.blocks.forEach((block: any) => {
			const blockElement = document.createElement("div");
			blockElement.className = "block";
			blockElement.style.width = tetromino.size + "px";
			blockElement.style.height = tetromino.size + "px";
			blockElement.style.position = "absolute";
			blockElement.style.left = (block.x - minX) * tetromino.size + "px";
			blockElement.style.top = (block.y - minY) * tetromino.size + "px";
			blockElement.setAttribute("data-tetromino-id", tetromino.id);
			tetromino.element.appendChild(blockElement);
		});

		// Update coordinate rendering if enabled
		if (this.isCoordinateRenderingEnabled()) {
			this.renderTetrominoCoordinates(tetromino);
		}
	}
	private _removeCompletedLines(completedLines: number[]) {
		completedLines.forEach(line => {
			this.occupiedPositions.filter(block => block.y === line).forEach(block => block.delete());
			this.occupiedPositions = this.occupiedPositions.filter(block => block.y !== line);
		});
		let numberOfCompletedLines = completedLines.length;
		// Dispatch event with line completion data for scoring
		const scoreEvent = new CustomEvent("linesCompleted", {
			detail: { linesCompleted: numberOfCompletedLines }
		});
		this.element.dispatchEvent(scoreEvent);
	}
	private _findCompletedLines(): number[] {
		const completedLines: number[] = [];
		for (let y = 0; y < this.height + 1; y++) {
			const isComplete = this.occupiedPositions.filter(pos => pos.y === y).length === this.width;
			if (isComplete) completedLines.push(y);
		}
		return completedLines.sort();
	}

	public moveTetromino(tetromino: Tetromino, direction: string): boolean {
		let dx = 0, dy = 0;
		if (direction === "left") dx = -1;
		if (direction === "right") dx = 1;
		if (direction === "down") dy = 1;
		const previewBlocks = tetromino
			.getBlocks()
			.map(({ x, y }: { x: number; y: number }) => ({ x: x + dx, y: y + dy }));
		const inBounds = previewBlocks.every(
			({ x, y }: { x: number; y: number }) => x >= 0 && x < this.width && y >= 0 && y <= this.height
		);
		if (!inBounds) return false;
		if (!this._canMove(direction)) {
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

	public reset(): void {
		// Clear all game state
		this.tetrominos.clear();
		this.occupiedPositions = [];
		this.coordinateBlocks.clear();
		this.nextTetromino = null;
		this.activeTetromino = null as any;

		// Clear the DOM
		this.element.innerHTML = "";
		if (this.previewBoard && this.previewBoard.previewContainer) {
			this.previewBoard.previewContainer.innerHTML = "";
		}
	}

	public spawnTetromino(): Tetromino {
		let tetromino: Tetromino;
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
			this.addTetromino(tetromino);
			tetromino.updatePosition();
		} else {
			tetromino = TetrominoFactory.createNew(
				center,
				this,
				this.tetrominoSeedQueue.dequeue()
			);
			tetromino.updatePosition();
		}
		tetromino.startFalling();
		this.nextTetromino = TetrominoFactory.createNew(
			center,
			null,
			this.tetrominoSeedQueue.dequeue()
		);
		this.nextTetromino.updatePosition();
		if (this.previewBoard && this.previewBoard.showNextTetromino) {
			this.previewBoard.showNextTetromino(this.nextTetromino);
		}
		return tetromino;
	}

	private isCoordinateRenderingEnabled(): boolean {
		return (window as any).USE_COORDINATE_RENDERING === true;
	}

	public renderTetrominoCoordinates(tetromino: Tetromino): void {
		if (!this.isCoordinateRenderingEnabled()) return;

		this.clearTetrominoCoordinates(tetromino);

		tetromino.getBlocks().forEach(block => {
			const blockElement = this.createCoordinateBlock(block, tetromino);
			const key = `${tetromino.id}-${block.x}-${block.y}`;
			this.coordinateBlocks.set(key, blockElement);
			this.element.appendChild(blockElement);
		});
	}

	public clearTetrominoCoordinates(tetromino: Tetromino): void {
		if (!this.isCoordinateRenderingEnabled()) return;

		const tetrominoId = tetromino.id;
		const keysToRemove: string[] = [];

		this.coordinateBlocks.forEach((element, key) => {
			if (key.startsWith(`${tetrominoId}-`)) {
				element.remove();
				keysToRemove.push(key);
			}
		});

		keysToRemove.forEach(key => this.coordinateBlocks.delete(key));
	}

	private createCoordinateBlock(block: Block, tetromino: Tetromino): HTMLElement {
		const blockElement = document.createElement("div");
		blockElement.className = `coordinate-block ${tetromino.getClassName()}-coordinate-block`;
		blockElement.style.position = "absolute";
		blockElement.style.width = "24px";
		blockElement.style.height = "24px";
		blockElement.style.left = `${block.x * 24}px`;
		blockElement.style.top = `${block.y * 24}px`;
		blockElement.setAttribute("data-tetromino-id", tetromino.id);
		return blockElement;
	}
}
