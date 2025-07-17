import { Tetromino } from "./tetromino-base.js";

export class TetrominoS extends Tetromino {
	constructor(left, document, board) {
		super(left, document, null);
		this.type = "S";
		this.rotation = 0;
		this.element = this._createElement(document);
		if (board) {
			this.board = board;
			board.addTetromino(this);
		}
	}

	getClassName() {
		return "tetromino tetromino-s";
	}

	getBlockPositions() {
		switch (this.rotation % 2) {
			case 0:
				// Horizontal
				return [
					{ x: this.left, y: this.top },
					{ x: this.left - 1, y: this.top },
					{ x: this.left, y: this.top + 1 },
					{ x: this.left + 1, y: this.top + 1 }
				];
			case 1:
				// Vertical
				return [
					{ x: this.left, y: this.top },
					{ x: this.left, y: this.top + 1 },
					{ x: this.left - 1, y: this.top },
					{ x: this.left - 1, y: this.top - 1 }
				];
			default:
				return [];
		}
	}
}
