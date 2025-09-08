import { Tetromino, Block } from "./tetromino-base";
import { TetrominoFactory } from "./tetrominoFactory";
import { HoldBoard } from "./hold-board";
import { AudioManager } from "./audio";
import { KeyBindingManager } from "./key-binding-manager";
import { TetrominoSeedQueue } from "./TetrominoSeedQueue";
import { PreviewBoard } from "./preview-board";

export class Board {
	private height: number;
	private width: number;
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

	constructor(
		height: number,
		width: number,
		element: HTMLElement,
		previewBoard: PreviewBoard | null,
		tetrominoSeedQueue: TetrominoSeedQueue,
		holdBoard: HoldBoard | null = null,
		keyBindingManager: KeyBindingManager | null = null,
		audioManager: AudioManager | null = null
	) {
		this.height = height;
		this.width = width;
		this.element = element;
		this.previewBoard = previewBoard;
		this.holdBoard = holdBoard;
		this.tetrominos = new Set();
		this.nextTetromino = null;
		this.tetrominoSeedQueue = tetrominoSeedQueue;
		this.keyBindingManager = keyBindingManager;
		this.audioManager = audioManager;
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
		if (this.previewBoard && this.previewBoard.previewContainer) {
			this.previewBoard.previewContainer.innerHTML = "";
		}
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

		// Handle coordinate rendering
		if (this.isCoordinateRenderingEnabled()) {
			tetromino.element.style.display = "none"; // Hide the container
			this.renderTetrominoCoordinates(tetromino);
		}
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
	public inBounds(previewBlocks: Block[]) {
		return previewBlocks.every(
			({ x, y }) => x >= 0 && x < this.width && y >= 0 && y <= this.height
		);
	}
	public collision(previewBlocks: Block[]): boolean {
		const collision =
			this.occupiedPositions.some((other) =>
				previewBlocks.some(
					(pos: Block) => other.x === pos.x && other.y === pos.y
				)
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
		return this.activeTetromino.collides(dx, dy, this.occupiedPositions)
	}

	private _raiseGameOverIfStackReachesTop(): void {
		if (this.activeTetromino.top === 0) {
			const gameOverEvent = new Event("gameover");
			this.element.dispatchEvent(gameOverEvent);
		}
	}



	private _handleTetrominoLocked(event: Event): void {
		const customEvent = event as CustomEvent;
		customEvent.detail.forEach((block: Block) => { this.occupiedPositions.push(block) });
		this.occupiedPositions.sort((a, b) => b.y - a.y);
		this._checkForCompletedLines();
		this.canHoldPiece = true;
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

	private _dropTetrominosInOptimalOrder(tetrominoDropInfo: { tetromino: Tetromino; blocks: Block[]; maxDrop: number; }[]) {
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
		let maxDrop = this.height;

		maxDrop = this._calculateBlockDropLimit(blocks, tetromino, maxDrop);

		return maxDrop;
	}

	private _calculateBlockDropLimit(blocks: Block[], tetromino: Tetromino, maxDrop: number) {
		for (const block of blocks) {
			let blockMaxDrop = this.height - block.y;
			blockMaxDrop = this._findDropDistance(tetromino, block, blockMaxDrop);
			maxDrop = Math.min(maxDrop, blockMaxDrop);
		}
		return maxDrop;
	}

	private _findDropDistance(tetromino: Tetromino, block: Block, blockMaxDrop: number) {
		for (const otherBlock of this.occupiedPositions) {
			// Exclude blocks from the same tetromino (including deleted blocks that may still be in occupiedPositions)
			if (otherBlock.parent !== tetromino &&
				otherBlock.x === block.x &&
				otherBlock.y > block.y) {
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




	private _reuseNextTetromino() {
		if (this.previewBoard &&
			this.previewBoard.previewContainer.contains(this.nextTetromino.element)) {
			this.previewBoard.previewContainer.removeChild(
				this.nextTetromino.element
			);
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
