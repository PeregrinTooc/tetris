import { Tetromino, BlockPosition } from "./tetromino-base";

export class TetrominoI extends Tetromino {
	type: string;

	constructor(left: number, document: Document, board: any) {
		super(left, document, null);
		this.type = "I";
		this.rotation = 0;
		this.element = this._createElement(document);
		if (board) {
			this.board = board;
			board.addTetromino(this);
		}
	}

	getClassName(): string {
		return "tetromino tetromino-i";
	}

	getBlockPositions(): BlockPosition[] {
		if (this.rotation % 2 === 0) {
			return [
				{ x: this.left - 1, y: this.top },
				{ x: this.left, y: this.top },
				{ x: this.left + 1, y: this.top },
				{ x: this.left + 2, y: this.top },
			];
		} else {
			return [
				{ x: this.left, y: this.top - 1 },
				{ x: this.left, y: this.top },
				{ x: this.left, y: this.top + 1 },
				{ x: this.left, y: this.top + 2 },
			];
		}
	}
}
