import { Tetromino } from "./tetromino-base";
import { SizingConfig } from "./sizing-config";
import { BlockRenderer } from "./block-renderer";

export class HoldBoard {
	private element: HTMLElement;
	private currentTetromino: Tetromino | null = null;
	private holdContainer: HTMLElement;
	private blockRenderer: BlockRenderer;

	constructor(element: HTMLElement) {
		this.element = element;
		this.holdContainer = element.querySelector(".hold-container") as HTMLElement;
		if (this.holdContainer) {
			this.blockRenderer = new BlockRenderer(this.holdContainer);
		} else {
			this.blockRenderer = new BlockRenderer(element);
		}
		this._applyDimensions();
	}

	private _applyDimensions(): void {
		this.element.style.width = SizingConfig.HOLD_BOARD_WIDTH + "px";
		if (this.holdContainer) {
			this.holdContainer.style.width = SizingConfig.HOLD_CONTAINER_SIZE + "px";
			this.holdContainer.style.height = SizingConfig.HOLD_CONTAINER_SIZE + "px";
		}
	}

	showHeldTetromino(tetromino: Tetromino) {
		if (this.currentTetromino) {
			this.blockRenderer.clearTetromino(this.currentTetromino);
		}
		this.clearBoard();

		this.currentTetromino = tetromino;

		if (tetromino.element.parentNode) {
			tetromino.element.parentNode.removeChild(tetromino.element);
		}

		const centerOffset = (this.element.clientWidth - tetromino.size * 2) / 2;

		const tempBoard = tetromino.board;
		tetromino.board = {
			getBlockRenderer: () => this.blockRenderer,
			getBlockSize: () => tetromino.size,
		};

		const tempLeft = tetromino.left;
		const tempTop = tetromino.top;
		tetromino.left = Math.floor(centerOffset / tetromino.size);
		tetromino.top = Math.floor(centerOffset / tetromino.size);

		this.blockRenderer.renderTetromino(tetromino);

		tetromino.left = tempLeft;
		tetromino.top = tempTop;
		tetromino.board = tempBoard;
	}

	private clearBoard() {
		if (this.holdContainer) {
			while (this.holdContainer.firstChild) {
				this.holdContainer.removeChild(this.holdContainer.firstChild);
			}
		}
	}

	getHeldTetromino(): Tetromino | null {
		return this.currentTetromino;
	}
}
