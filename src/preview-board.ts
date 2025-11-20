import { Tetromino } from "./tetromino-base";
import { SizingConfig } from "./sizing-config";

export class PreviewBoardImpl {
	element: HTMLElement;
	previewContainer: HTMLElement;

	constructor(element: HTMLElement) {
		this.element = element;
		this.previewContainer = element.querySelector("#preview-container") as HTMLElement;
		this._applyDimensions();
	}

	private _applyDimensions(): void {
		this.element.style.width = SizingConfig.PREVIEW_BOARD_WIDTH + "px";
	}

	showNextTetromino(tetromino: any): void {
		this.previewContainer.innerHTML = "";

		// Ensure tetromino container is visible (may have been hidden in coordinate mode)
		tetromino.element.style.display = "";

		tetromino.element.style.position = "absolute";
		const centerOffset = (SizingConfig.PREVIEW_BOARD_WIDTH - tetromino.size * 2) / 2;
		tetromino.element.style.left = centerOffset + "px";
		tetromino.element.style.top = centerOffset + "px";
		this.previewContainer.appendChild(tetromino.element);
	}
}
export interface PreviewBoard {
	element: HTMLElement;
	previewContainer: HTMLElement;
	showNextTetromino?: (tetromino: Tetromino) => void;
}
