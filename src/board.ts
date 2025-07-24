import { TetrominoFactory } from "./tetromino";

interface PreviewBoard {
	element: HTMLElement;
	previewContainer: HTMLElement;
	showNextTetromino?: (tetromino: any) => void;
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
	nextTetromino: any;
	tetrominoSeedQueue: TetrominoSeedQueue;

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

	_canMove(tetromino: any, direction: string): boolean {
		const hasCollision = Array.from(this.tetrominos).some((other: any) =>
			other.blocksMovement(direction, tetromino)
		);
		if (hasCollision) {
			if (direction === "down") {
				this._raiseGameOverIfStackReachesTop(tetromino);
			}
			return false;
		}
		return true;
	}

	_raiseGameOverIfStackReachesTop(tetromino: any): void {
		if (tetromino.top === 0) {
			const gameOverEvent = new Event("gameover");
			this.element.dispatchEvent(gameOverEvent);
		}
	}

	addTetromino(tetromino: any): void {
		this.tetrominos.add(tetromino);
		this.element.appendChild(tetromino.element);
	}

	moveTetromino(tetromino: any, direction: string): boolean {
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
		if (!this._canMove(tetromino, direction)) {
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
		let tetromino: any;
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
			this.tetrominos.add(tetromino);
			this.element.appendChild(tetromino.element);
			tetromino.updatePosition();
		} else {
			tetromino = TetrominoFactory.createNew(
				center,
				document,
				this,
				this.tetrominoSeedQueue.dequeue()
			);
			this.tetrominos.add(tetromino);
			this.element.appendChild(tetromino.element);
			tetromino.updatePosition();
		}
		tetromino.startFalling();
		this.nextTetromino = TetrominoFactory.createNew(
			center,
			document,
			null,
			this.tetrominoSeedQueue.dequeue()
		);
		this.nextTetromino.updatePosition();
		if (this.previewBoard && this.previewBoard.showNextTetromino) {
			this.previewBoard.showNextTetromino(this.nextTetromino);
		}
		return tetromino;
	}
}
