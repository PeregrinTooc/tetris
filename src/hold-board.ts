import { Tetromino } from "./tetromino-base";
import { SizingConfig } from "./sizing-config";

export class HoldBoard {
	private element: HTMLElement;
	private currentTetromino: Tetromino | null = null;

	constructor(element: HTMLElement) {
		this.element = element;
		this._applyDimensions();
	}

	private _applyDimensions(): void {
		this.element.style.width = SizingConfig.HOLD_BOARD_WIDTH + "px";
		const holdContainer = this.element.querySelector(".hold-container") as HTMLElement;
		if (holdContainer) {
			holdContainer.style.width = SizingConfig.HOLD_CONTAINER_SIZE + "px";
			holdContainer.style.height = SizingConfig.HOLD_CONTAINER_SIZE + "px";
		}
	}

	showHeldTetromino(tetromino: Tetromino) {
		this.clearBoard();

		// Store the tetromino instance
		this.currentTetromino = tetromino;

		// Remove tetromino from its current parent if it has one
		if (tetromino.element.parentNode) {
			tetromino.element.parentNode.removeChild(tetromino.element);
		}

		// Position the tetromino element in hold board
		tetromino.element.style.position = "absolute";
		const centerOffset = (this.element.clientWidth - tetromino.size * 2) / 2;
		tetromino.element.style.left = `${centerOffset}px`;
		tetromino.element.style.top = `${centerOffset}px`;

		// Add the actual tetromino element to preserve its structure and ID
		this.element.appendChild(tetromino.element);
	}

	private clearBoard() {
		while (this.element.firstChild) {
			this.element.removeChild(this.element.firstChild);
		}
	}

	getHeldTetromino(): Tetromino | null {
		return this.currentTetromino;
	}
}
