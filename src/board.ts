import { Tetromino, Block } from "./tetromino-base";
import { TetrominoFactory } from "./tetrominoFactory";
import { HoldBoard } from "./hold-board";
import { AudioManager } from "./audio";
import { KeyBindingManager } from "./key-binding-manager";
import { TetrominoSeedQueue } from "./TetrominoSeedQueue";
import { PreviewBoard } from "./preview-board";
import { BlockRenderer } from "./block-renderer";
import { SizingConfig } from "./sizing-config";

export class Board {
	// Height & bounds semantics:
	// The board uses EXCLUSIVE upper bounds for rows. Valid y coordinates are 0..height-1.
	// No block (active, locked, during drop calculations or rendering) may reach y === height.
	// All boundary / drop / line-clear logic must therefore use (y < height) rather than (y <= height)
	// and the maximum vertical drop distance for a block at y is (height - 1) - y.
	private height: number;
	private width: number;
	private blockSize: number;
	private element: HTMLElement;
	private previewBoard: PreviewBoard | null;
	private holdBoard: HoldBoard | null;
	private tetrominos: Set<Tetromino>;
	private nextTetromino: Tetromino | null = null;
	private tetrominoSeedQueue: TetrominoSeedQueue;
	private activeTetromino: Tetromino;
	private occupiedPositions: Block[] = [];
	private coordinateBlocks: Map<string, HTMLElement> = new Map();
	public canHoldPiece: boolean = true;
	private keyBindingManager: KeyBindingManager | null = null;
	private audioManager: AudioManager | null = null;
	private blockRenderer: BlockRenderer;

	constructor(
		height: number,
		width: number,
		element: HTMLElement,
		previewBoard: PreviewBoard | null,
		tetrominoSeedQueue: TetrominoSeedQueue,
		holdBoard: HoldBoard | null = null,
		keyBindingManager: KeyBindingManager | null = null,
		audioManager: AudioManager | null = null,
		blockSize: number = SizingConfig.BLOCK_SIZE
	) {
		this.height = height;
		this.width = width;
		this.blockSize = blockSize;
		this.element = element;
		this.previewBoard = previewBoard;
		this.holdBoard = holdBoard;
		this.tetrominos = new Set();
		this.nextTetromino = null;
		this.tetrominoSeedQueue = tetrominoSeedQueue;
		this.keyBindingManager = keyBindingManager;
		this.audioManager = audioManager;
		this.blockRenderer = new BlockRenderer(element);

		this._applyDimensions();
	}

	private _applyDimensions(): void {
		const widthPx = this.blockSize * this.width;
		const heightPx = this.blockSize * this.height;
		this.element.style.width = widthPx + "px";
		this.element.style.height = heightPx + "px";
	}

	public reset(): void {
		// Clear all game state
		this.tetrominos.clear();
		this.occupiedPositions = [];
		this.coordinateBlocks.clear();
		this.nextTetromino = null;
		if (this.activeTetromino) {
			this.activeTetromino.stopListening();
		}
		this.activeTetromino = null as any;

		// Clear the DOM
		this.element.innerHTML = "";
	}

	public registerEventListener(eventName: string, callback: (event: Event) => void) {
		this.element.addEventListener(eventName, callback);
	}
	public pauseGame() {
		this.activeTetromino.pause();
	}

	public hold(): void {
		if (!this.holdBoard || !this.canHoldPiece || this.activeTetromino.locked) {
			return;
		}

		// Deactivate current piece's controls
		const { storedTetromino, currentTetromino } = this._resetActiveTetromino();

		if (storedTetromino) {
			// Swap pieces
			this._swap(currentTetromino, storedTetromino);
		} else {
			this._moveToHoldBoard(currentTetromino);
		}
	}

	private _moveToHoldBoard(currentPiece: Tetromino) {
		this.holdBoard.showHeldTetromino(currentPiece);
		currentPiece.board = null;
		this.spawnTetromino();
	}

	private _swap(currentPiece: Tetromino, heldPiece: Tetromino) {
		this.holdBoard.showHeldTetromino(currentPiece);
		currentPiece.board = null;
		this.addTetromino(heldPiece);
		heldPiece.reset();
		heldPiece.startFalling();
		if (this.keyBindingManager) {
			this.activeTetromino.activateKeyboardControl(this.keyBindingManager);
		}
	}

	private _resetActiveTetromino() {
		this.activeTetromino.stopListening();
		const currentTetromino = this.activeTetromino;
		const storedTetromino = this.holdBoard.getHeldTetromino();

		// Remove current piece from board
		this.tetrominos.delete(currentTetromino);
		// Note: element will be moved by showHeldTetromino, not removed here
		this.canHoldPiece = false;
		return { storedTetromino, currentTetromino };
	}

	public addTetromino(tetromino: Tetromino): void {
		this.tetrominos.add(tetromino);
		this.element.appendChild(tetromino.element);
		this.activeTetromino = tetromino;
		tetromino.board = this;
		tetromino.addEventListener("locked", this._handleTetrominoLocked.bind(this));

		// Use BlockRenderer for all rendering
		this.blockRenderer.renderTetromino(tetromino);
	}

	public removeTetromino(tetromino: Tetromino): void {
		if (this.tetrominos.has(tetromino)) {
			if (this.occupiedPositions.some((b) => b.parent.id === tetromino.id)) {
				console.error(
					"Removing tetromino with id " +
						tetromino.id +
						" with blocks still in occupiedPositions:"
				);
				tetromino.log();
				this.log();
				this.occupiedPositions = this.occupiedPositions.filter(
					(b) => b.parent.id !== tetromino.id
				);
			}
			this.tetrominos.delete(tetromino);
		}
	}

	public moveTetromino(tetromino: Tetromino, direction: string): boolean {
		let dx = 0,
			dy = 0;
		if (direction === "left") dx = -1;
		if (direction === "right") dx = 1;
		if (direction === "down") dy = 1;
		const previewBlocks = tetromino
			.getBlocks()
			.map(({ x, y }: { x: number; y: number }) => ({ x: x + dx, y: y + dy }));
		const inBounds = previewBlocks.every(
			({ x, y }: { x: number; y: number }) =>
				x >= 0 && x < this.width && y >= 0 && y < this.height
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

	public spawnTetromino(): Tetromino {
		let tetromino: Tetromino;
		const center = Math.floor(this.width / 2);
		if (this.nextTetromino) {
			tetromino = this._reuseNextTetromino();
		} else {
			tetromino = this._createNewTetromino(center);
		}
		this._configureTetrominoListeners(tetromino);
		tetromino.startFalling();
		this._prepareNextTetromino(center);
		return tetromino;
	}

	private _prepareNextTetromino(center: number) {
		this.nextTetromino = TetrominoFactory.createNew(
			center,
			null,
			this.tetrominoSeedQueue.dequeue()
		);
		this.nextTetromino.updatePosition();
		if (this.previewBoard && this.previewBoard.showNextTetromino) {
			this.previewBoard.showNextTetromino(this.nextTetromino);
		}
	}

	private _configureTetrominoListeners(tetromino: Tetromino) {
		tetromino.addEventListener("locked", () => {
			this.spawnTetromino();
			if (this.audioManager) {
				this.audioManager.playSoundEffect("locked");
			}
		});

		tetromino.addEventListener("hardDrop", () => {
			if (this.audioManager) {
				this.audioManager.playSoundEffect("hardDrop");
			}
		});

		if (this.keyBindingManager) {
			tetromino.activateKeyboardControl(this.keyBindingManager);
		}
	}

	private _createNewTetromino(center: number) {
		const tetromino = TetrominoFactory.createNew(
			center,
			this,
			this.tetrominoSeedQueue.dequeue()
		);
		tetromino.updatePosition();
		return tetromino;
	}

	public getActiveTetromino(): Tetromino {
		return this.activeTetromino;
	}

	public getBlockRenderer(): BlockRenderer {
		return this.blockRenderer;
	}

	public getHeight(): number {
		return this.height;
	}

	public getBlockSize(): number {
		return this.blockSize;
	}

	// Dev/testing helper: returns true if any occupied block has invalid y
	public hasOutOfBoundsLockedBlock(): boolean {
		return this.occupiedPositions.some((b) => b.y < 0 || b.y >= this.height);
	}
	public log(): void {
		console.group("Board");
		console.log("meta", {
			height: this.height,
			width: this.width,
			canHoldPiece: this.canHoldPiece,
		});

		console.group("Tetrominos");
		for (const t of this.tetrominos) {
			const tid = (t as any).id || "unknown";
			if (typeof (t as any).log === "function") {
				console.groupCollapsed(`Tetromino ${tid}`);
				(t as any).log();
				console.groupEnd();
			} else {
				console.log("  Tetromino (no log):", tid);
			}
		}
		console.groupEnd(); // Tetrominos

		if (this.nextTetromino) {
			console.group("Next Tetromino");
			(this.nextTetromino as any).log?.();
			console.groupEnd();
		}
		if (this.activeTetromino) {
			console.group("Active Tetromino");
			(this.activeTetromino as any).log?.();
			console.groupEnd();
		}

		// Group occupied positions by their y (row) and sort each row by x ascending
		console.group("Occupied Positions by row (y)");
		const rows = new Map<number, Block[]>();
		for (const b of this.occupiedPositions) {
			const arr = rows.get(b.y) || [];
			arr.push(b);
			rows.set(b.y, arr);
		}
		const sortedYs = Array.from(rows.keys()).sort((a, b) => a - b);
		for (const y of sortedYs) {
			const rowBlocks = rows.get(y)!;
			rowBlocks.sort((a, b) => a.x - b.x);
			console.group(`y=${y}`);
			rowBlocks.forEach((b) => {
				if (typeof (b as any).log === "function") (b as any).log();
				else console.log("  Block:", { x: b.x, y: b.y });
			});
			console.groupEnd();
		}
		console.groupEnd(); // Occupied Positions

		console.groupEnd(); // Board
	}
	public inBounds(previewBlocks: Block[]) {
		return previewBlocks.every(
			({ x, y }) => x >= 0 && x < this.width && y >= 0 && y < this.height
		);
	}
	public collision(previewBlocks: Block[]): boolean {
		const collision = this.occupiedPositions.some((other) =>
			previewBlocks.some((pos: Block) => other.x === pos.x && other.y === pos.y)
		);
		return collision;
	}

	private _canMove(direction: string): boolean {
		if (this._hasCollision(direction)) {
			if (direction === "down") {
				this._raiseGameOverIfStackReachesTop();
			}
			return false;
		}
		return true;
	}

	private _hasCollision(direction: string): boolean {
		const dx = direction === "left" ? -1 : direction === "right" ? 1 : 0;
		const dy = direction === "down" ? 1 : 0;
		return this.activeTetromino.collides(dx, dy, this.occupiedPositions);
	}

	private _raiseGameOverIfStackReachesTop(): void {
		if (this.activeTetromino.top === 0) {
			const gameOverEvent = new Event("gameover");
			this.element.dispatchEvent(gameOverEvent);
		}
	}

	private _handleTetrominoLocked(event: Event): void {
		const customEvent = event as CustomEvent;
		customEvent.detail.forEach((block: Block) => {
			this.occupiedPositions.push(block);
		});
		this.occupiedPositions.sort((a, b) => b.y - a.y);
		this._checkForCompletedLines();
		this.canHoldPiece = true;
	}
	private _checkForCompletedLines() {
		const MAX_ITERATIONS = 100;
		let iterations = 0;

		while (iterations < MAX_ITERATIONS) {
			const completedLines = this._findCompletedLines();
			if (completedLines.length === 0) {
				break;
			}

			this._removeCompletedLines(completedLines);
			this._dropAllBlocks();
			iterations++;
		}

		if (iterations >= MAX_ITERATIONS) {
			console.warn(
				"Line clearing exceeded maximum iterations. Possible infinite loop prevented."
			);
		}
	}

	private _removeCompletedLines(completedLines: number[]) {
		completedLines.forEach((line) => {
			const blocksToRemove = this.occupiedPositions.filter((block) => block.y === line);
			this.occupiedPositions = this.occupiedPositions.filter((block) => block.y !== line);
			blocksToRemove.forEach((block) => {
				block.parent.blocks = block.parent.blocks.filter((b) => b !== block);
				if (block.parent.blocks.length === 0 && this.tetrominos.has(block.parent)) {
					this.tetrominos.delete(block.parent);
				}
			});
		});
		const numberOfCompletedLines = completedLines.length;
		const scoreEvent = new CustomEvent("linesCompleted", {
			detail: { linesCompleted: numberOfCompletedLines },
		});
		this.element.dispatchEvent(scoreEvent);
	}
	private _findCompletedLines(): number[] {
		const completedLines: number[] = [];
		for (let y = 0; y < this.height; y++) {
			const isComplete =
				this.occupiedPositions.filter((pos) => pos.y === y).length === this.width;
			if (isComplete) completedLines.push(y);
		}
		return completedLines.sort();
	}

	private _dropAllBlocks() {
		const tetrominoGroups = this._groupBlocksByParent();
		const tetrominoDropInfo = this._calculateTetrominoDropInfo(tetrominoGroups);
		this._dropTetrominosInOptimalOrder(tetrominoDropInfo);
		this._renderAffectedTetrominoes();
	}

	private _renderAffectedTetrominoes() {
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

	private _dropTetrominosInOptimalOrder(
		tetrominoDropInfo: { tetromino: Tetromino; blocks: Block[]; maxDrop: number }[]
	) {
		for (const { tetromino, blocks } of tetrominoDropInfo) {
			this._dropTetrominoAsUnit(tetromino, blocks);
			tetromino.collapseBlocks();
		}
	}

	private _calculateTetrominoDropInfo(tetrominoGroups: Map<Tetromino, Block[]>) {
		const tetrominoDropInfo = [];
		for (const [tetromino, blocks] of tetrominoGroups) {
			const maxDrop = this._calculateMaxDrop(tetromino, blocks);
			tetrominoDropInfo.push({ tetromino, blocks, maxDrop });
		}
		tetrominoDropInfo.sort((a, b) => b.maxDrop - a.maxDrop);
		return tetrominoDropInfo;
	}

	private _groupBlocksByParent() {
		const tetrominoGroups = new Map<Tetromino, Block[]>();
		for (const block of this.occupiedPositions) {
			if (!tetrominoGroups.has(block.parent)) {
				tetrominoGroups.set(block.parent, []);
			}
			tetrominoGroups.get(block.parent)!.push(block);
		}
		return tetrominoGroups;
	}

	private _calculateMaxDrop(tetromino: Tetromino, blocks: Block[]): number {
		// Calculate how far the tetromino can drop without actually dropping it
		let maxDrop = this.height; // will be reduced below; represents number of single-step drops

		maxDrop = this._calculateBlockDropLimit(blocks, tetromino, maxDrop);

		return maxDrop;
	}

	private _calculateBlockDropLimit(blocks: Block[], tetromino: Tetromino, maxDrop: number) {
		for (const block of blocks) {
			// Maximum permissible drop steps for this block until it would reach bottom (exclusive bound)
			let blockMaxDrop = this.height - 1 - block.y;
			blockMaxDrop = this._findDropDistance(tetromino, block, blockMaxDrop);
			maxDrop = Math.min(maxDrop, blockMaxDrop);
		}
		return maxDrop;
	}

	private _findDropDistance(tetromino: Tetromino, block: Block, blockMaxDrop: number) {
		for (const otherBlock of this.occupiedPositions) {
			// Exclude blocks from the same tetromino (including deleted blocks that may still be in occupiedPositions)
			if (
				otherBlock.parent !== tetromino &&
				otherBlock.x === block.x &&
				otherBlock.y > block.y
			) {
				blockMaxDrop = Math.min(blockMaxDrop, otherBlock.y - block.y - 1);
			}
		}
		return blockMaxDrop;
	}

	private _dropTetrominoAsUnit(tetromino: Tetromino, blocks: Block[]) {
		// Recalculate drop distance in case other tetrominoes have moved
		const maxDrop = this._calculateMaxDrop(tetromino, blocks);

		// Drop all blocks of this tetromino by the same amount
		for (const block of blocks) {
			for (let i = 0; i < maxDrop; i++) {
				block.drop();
			}
		}
	}

	private _updateLockedTetrominoVisuals(tetromino: any): void {
		// For locked tetrominoes, update visual representation to match current block positions
		// The BlockRenderer will handle the positioning logic
		this.blockRenderer.updateTetromino(tetromino);
	}

	private _reuseNextTetromino() {
		if (
			this.previewBoard &&
			this.previewBoard.previewContainer.contains(this.nextTetromino.element)
		) {
			this.previewBoard.previewContainer.removeChild(this.nextTetromino.element);
		}
		const tetromino = this.nextTetromino as Tetromino;
		tetromino.board = this;
		this.addTetromino(tetromino);
		tetromino.updatePosition();
		return tetromino;
	}

	private isCoordinateRenderingEnabled(): boolean {
		return (window as any).USE_COORDINATE_RENDERING === true;
	}

	/**
	 * @deprecated Use BlockRenderer instead. Kept for backward compatibility.
	 */
	public renderTetrominoCoordinates(tetromino: Tetromino): void {
		this.blockRenderer.updateTetromino(tetromino);
	}

	/**
	 * @deprecated Use BlockRenderer instead. Kept for backward compatibility.
	 */
	public clearTetrominoCoordinates(tetromino: Tetromino): void {
		this.blockRenderer.clearTetromino(tetromino);
	}
}
