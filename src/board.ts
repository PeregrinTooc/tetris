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
		// Sort blocks by y position (bottom to top) to process them correctly
		const sortedBlocks = [...this.occupiedPositions].sort((a, b) => b.y - a.y);

		for (const block of sortedBlocks) {
			// Find the lowest position this block can fall to
			let targetY = this.height;

			// Check for collisions with other blocks below
			for (const otherBlock of this.occupiedPositions) {
				if (otherBlock !== block && otherBlock.x === block.x && otherBlock.y > block.y) {
					targetY = Math.min(targetY, otherBlock.y - 1);
				}
			}

			// Drop the block to the target position
			while (block.y < targetY) {
				block.drop();
			}
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
		this.tetrominos.clear();
		this.element.innerHTML = "";
	}

	public spawnTetromino(): Tetromino {
		this.waitUntilLocked();
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

	private waitUntilLocked() {
		if (this.activeTetromino)
			while (!this.activeTetromino.locked) {
				setTimeout(() => { }, 10);
			}
	}
}
