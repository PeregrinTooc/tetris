import { Tetromino, BlockPosition } from "./tetromino-base";
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
	height: number;
	width: number;
	element: HTMLElement;
	previewBoard: PreviewBoard | null;
	tetrominos: Set<any>;
	nextTetromino: Tetromino | null = null;
	tetrominoSeedQueue: TetrominoSeedQueue;
	// @ts-expect-error: Suppress possibly undefined warning for activeTetromino
	activeTetromino: Tetromino;
	occupiedPositions: BlockPosition[] = [];

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

	_canMove(direction: string): boolean {
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
		const movingBlocks = this.activeTetromino!.getBlockPositions()
			.map(({ x, y }) => ({ x: x + dx, y: y + dy }));

		return movingBlocks.some(({ x, y }) =>
			this.occupiedPositions.some(({ x: bx, y: by }) => bx === x && by === y)
		);
	}

	_raiseGameOverIfStackReachesTop(): void {
		if (this.activeTetromino.top === 0) {
			const gameOverEvent = new Event("gameover");
			this.element.dispatchEvent(gameOverEvent);
		}
	}

	addTetromino(tetromino: Tetromino): void {
		this.tetrominos.add(tetromino);
		this.element.appendChild(tetromino.element);
		this.activeTetromino = tetromino;
		tetromino.addEventListener("locked", (event: Event) => {
			const customEvent = event as CustomEvent;
			customEvent.detail.forEach((position: any) => { this.occupiedPositions.push(position) });
		})
	}

	moveTetromino(tetromino: Tetromino, direction: string): boolean {
		let dx = 0, dy = 0;
		if (direction === "left") dx = -1;
		if (direction === "right") dx = 1;
		if (direction === "down") dy = 1;
		const previewBlocks = tetromino
			.getBlockPositions()
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

	reset(): void {
		this.tetrominos.clear();
		this.element.innerHTML = "";
	}

	spawnTetromino(document: Document): any {
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
