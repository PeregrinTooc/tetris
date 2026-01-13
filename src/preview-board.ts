import { Tetromino } from "./tetromino-base";
import { SizingConfig } from "./sizing-config";
import { BlockRenderer } from "./block-renderer";

export class PreviewBoardImpl {
	element: HTMLElement;
	previewContainer: HTMLElement;
	private blockRenderer: BlockRenderer;

	constructor(element: HTMLElement) {
		this.element = element;
		this.previewContainer = element.querySelector("#preview-container") as HTMLElement;
		this.blockRenderer = new BlockRenderer(this.previewContainer);
		this._applyDimensions();
	}

	private _applyDimensions(): void {
		this.element.style.width = SizingConfig.PREVIEW_BOARD_WIDTH + "px";
	}

	showNextTetromino(tetromino: any): void {
		this.previewContainer.innerHTML = "";

		const centerOffset = (SizingConfig.PREVIEW_BOARD_WIDTH - tetromino.size * 2) / 2;

		const tempBoard = tetromino.board;
		tetromino.board = {
			getBlockRenderer: () => this.blockRenderer,
			getBlockSize: () => SizingConfig.BLOCK_SIZE,
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
}
export interface PreviewBoard {
	element: HTMLElement;
	previewContainer: HTMLElement;
	showNextTetromino?: (tetromino: Tetromino) => void;
}
