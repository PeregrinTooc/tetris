import { Block, Tetromino } from "./tetromino-base";

/**
 * Block rendering system using coordinate-based positioning.
 * Blocks are rendered directly on the board with absolute positioning.
 */
export class BlockRenderer {
	private board: HTMLElement;
	private coordinateBlocks: Map<string, HTMLElement> = new Map();
	private shadowBlocks: Map<string, HTMLElement> = new Map();

	constructor(board: HTMLElement) {
		this.board = board;
	}

	/**
	 * Render blocks for a tetromino using coordinate-based positioning
	 */
	public renderTetromino(tetromino: Tetromino): void {
		this.renderCoordinateBlocks(tetromino);
	}

	/**
	 * Clear blocks for a tetromino from the rendering system
	 */
	public clearTetromino(tetromino: Tetromino): void {
		this.clearCoordinateBlocks(tetromino);
	}

	/**
	 * Render blocks using coordinate-based positioning (direct children of board)
	 */
	private renderCoordinateBlocks(tetromino: Tetromino): void {
		// Clear existing coordinate blocks first
		this.clearCoordinateBlocks(tetromino);

		// Hide the tetromino container in coordinate mode
		tetromino.element.style.display = "none";

		// Create coordinate blocks
		tetromino.getBlocks().forEach((block) => {
			const blockElement = this.createCoordinateBlock(block, tetromino);
			const key = `${tetromino.id}-${block.x}-${block.y}`;
			this.coordinateBlocks.set(key, blockElement);
			this.board.appendChild(blockElement);
		});
	}

	/**
	 * Clear coordinate blocks for a specific tetromino
	 */
	private clearCoordinateBlocks(tetromino: Tetromino): void {
		const tetrominoId = tetromino.id;
		const keysToRemove: string[] = [];

		this.coordinateBlocks.forEach((element, key) => {
			if (key.startsWith(`${tetrominoId}-`)) {
				element.remove();
				keysToRemove.push(key);
			}
		});

		keysToRemove.forEach((key) => this.coordinateBlocks.delete(key));
	}

	/**
	 * Create a coordinate block element positioned absolutely on the board
	 */
	private createCoordinateBlock(block: Block, tetromino: Tetromino): HTMLElement {
		const blockElement = document.createElement("div");
		blockElement.className = `coordinate-block ${tetromino.getClassName()}-coordinate-block`;
		blockElement.style.position = "absolute";
		blockElement.style.width = tetromino.size + "px";
		blockElement.style.height = tetromino.size + "px";
		blockElement.style.left = `${block.x * tetromino.size}px`;
		blockElement.style.top = `${block.y * tetromino.size}px`;
		blockElement.setAttribute("data-tetromino-id", tetromino.id);
		return blockElement;
	}

	/**
	 * Update rendering for a tetromino (used when position or blocks change)
	 */
	public updateTetromino(tetromino: Tetromino): void {
		this.renderTetromino(tetromino);
	}

	/**
	 * Render shadow blocks showing where the tetromino will land
	 */
	public renderShadowBlocks(tetromino: Tetromino, dropDistance: number): void {
		this.clearShadowBlocks(tetromino);

		const blocks = tetromino.getBlocks();
		blocks.forEach((block, index) => {
			const shadowBlock = this.createShadowBlock(block, tetromino, dropDistance);
			const key = `${tetromino.id}-shadow-${index}`;
			this.shadowBlocks.set(key, shadowBlock);
			this.board.appendChild(shadowBlock);
		});
	}

	/**
	 * Clear shadow blocks for a specific tetromino
	 */
	public clearShadowBlocks(tetromino: Tetromino): void {
		if (!tetromino) return;

		const tetrominoId = tetromino.id;
		const keysToRemove: string[] = [];

		this.shadowBlocks.forEach((element, key) => {
			if (key.startsWith(`${tetrominoId}-shadow-`)) {
				element.remove();
				keysToRemove.push(key);
			}
		});

		keysToRemove.forEach((key) => this.shadowBlocks.delete(key));
	}

	/**
	 * Create a shadow block element positioned at the landing location
	 */
	private createShadowBlock(
		block: Block,
		tetromino: Tetromino,
		dropDistance: number
	): HTMLElement {
		const shadowElement = document.createElement("div");
		shadowElement.className = `shadow-block ${tetromino.getClassName()}-shadow-block`;
		shadowElement.style.position = "absolute";
		shadowElement.style.width = tetromino.size + "px";
		shadowElement.style.height = tetromino.size + "px";
		shadowElement.style.left = `${block.x * tetromino.size}px`;
		shadowElement.style.top = `${(block.y + dropDistance) * tetromino.size}px`;
		shadowElement.setAttribute("data-tetromino-id", tetromino.id);
		return shadowElement;
	}
}
