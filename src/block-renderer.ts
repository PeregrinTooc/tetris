import { Block, Tetromino } from "./tetromino-base";

/**
 * Unified block rendering system that supports both container-based and coordinate-based rendering.
 * This class abstracts the rendering strategy and provides a consistent interface for block management.
 */
export class BlockRenderer {
	private board: HTMLElement;
	private coordinateBlocks: Map<string, HTMLElement> = new Map();
	private renderingMode: "container" | "coordinate" = "container";

	constructor(board: HTMLElement) {
		this.board = board;
	}

	/**
	 * Set the rendering mode. In coordinate mode, blocks are rendered directly on the board.
	 * In container mode, blocks are rendered within tetromino containers.
	 */
	public setRenderingMode(mode: "container" | "coordinate"): void {
		this.renderingMode = mode;
	}

	/**
	 * Get current rendering mode based on global flag or explicit setting
	 */
	public getCurrentRenderingMode(): "container" | "coordinate" {
		// Check global coordinate rendering flag for backward compatibility
		if ((window as any).USE_COORDINATE_RENDERING === true) {
			return "coordinate";
		}
		return this.renderingMode;
	}

	/**
	 * Render blocks for a tetromino using the current rendering strategy
	 */
	public renderTetromino(tetromino: Tetromino): void {
		const mode = this.getCurrentRenderingMode();

		if (mode === "coordinate") {
			this.renderCoordinateBlocks(tetromino);
		} else {
			this.renderContainerBlocks(tetromino);
		}
	}

	/**
	 * Clear blocks for a tetromino from the rendering system
	 */
	public clearTetromino(tetromino: Tetromino): void {
		const mode = this.getCurrentRenderingMode();

		if (mode === "coordinate") {
			this.clearCoordinateBlocks(tetromino);
		}
		// Container blocks are cleared by the tetromino itself in container mode
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
	 * Render blocks using container-based positioning (children of tetromino container)
	 */
	private renderContainerBlocks(tetromino: Tetromino): void {
		// Ensure tetromino container is visible
		tetromino.element.style.display = "";

		// Clear existing blocks in container
		while (tetromino.element.firstChild) {
			tetromino.element.removeChild(tetromino.element.firstChild);
		}

		// Get blocks and handle locked vs active tetrominoes differently
		const blocks = tetromino.getBlocks();

		if (tetromino.locked) {
			// For locked tetrominoes, blocks have absolute positions
			// Find the minimum x,y to position the container correctly
			const minX = Math.min(...blocks.map((b) => b.x));
			const minY = Math.min(...blocks.map((b) => b.y));

			// Update container position to match the block layout
			tetromino.element.style.left = minX * tetromino.size + "px";
			tetromino.element.style.top = minY * tetromino.size + "px";

			// Create blocks relative to the new container position
			blocks.forEach(({ x, y }) => {
				const block = this.createContainerBlock(x - minX, y - minY, tetromino);
				tetromino.element.appendChild(block);
			});
		} else {
			// For active tetrominoes, use relative positioning as before
			blocks.forEach(({ x, y }) => {
				const block = this.createContainerBlock(
					x - tetromino.left,
					y - tetromino.top,
					tetromino
				);
				tetromino.element.appendChild(block);
			});
		}
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
	 * Create a container block element positioned relative to tetromino container
	 */
	private createContainerBlock(
		relativeX: number,
		relativeY: number,
		tetromino: Tetromino
	): HTMLElement {
		const blockElement = document.createElement("div");
		blockElement.className = "block";
		blockElement.style.width = tetromino.size + "px";
		blockElement.style.height = tetromino.size + "px";
		blockElement.style.position = "absolute";
		blockElement.style.left = relativeX * tetromino.size + "px";
		blockElement.style.top = relativeY * tetromino.size + "px";
		blockElement.setAttribute("data-tetromino-id", tetromino.id);
		return blockElement;
	}

	/**
	 * Update rendering for a tetromino (used when position or blocks change)
	 */
	public updateTetromino(tetromino: Tetromino): void {
		this.renderTetromino(tetromino);
	}
}
