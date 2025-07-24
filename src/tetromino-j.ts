import { Tetromino, BlockPosition } from "./tetromino-base";

export class TetrominoJ extends Tetromino {
	type: string;

	constructor(left: number, document: Document, board: any) {
		super(left, document, null);
		this.type = "J";
		this.rotation = 0;
		this.element = this._createElement(document);
		if (board) {
			this.board = board;
			board.addTetromino(this);
		}
	}

	getClassName(): string {
		return "tetromino tetromino-j";
	}

	getBlockPositions(): BlockPosition[] {
		switch (this.rotation % 4) {
			case 0:
				return [
					{ x: this.left, y: this.top },
					{ x: this.left - 1, y: this.top },
					{ x: this.left + 1, y: this.top },
					{ x: this.left + 1, y: this.top + 1 },
				];
			case 1:
				return [
					{ x: this.left, y: this.top },
					{ x: this.left, y: this.top + 1 },
					{ x: this.left, y: this.top - 1 },
					{ x: this.left + 1, y: this.top - 1 },
				];
			case 2:
				return [
					{ x: this.left, y: this.top },
					{ x: this.left + 1, y: this.top },
					{ x: this.left - 1, y: this.top },
					{ x: this.left - 1, y: this.top - 1 },
				];
			case 3:
				return [
					{ x: this.left, y: this.top },
					{ x: this.left, y: this.top - 1 },
					{ x: this.left, y: this.top + 1 },
					{ x: this.left - 1, y: this.top + 1 },
				];
			default:
				return [
					{ x: this.left, y: this.top },
					{ x: this.left, y: this.top },
					{ x: this.left, y: this.top },
					{ x: this.left, y: this.top },
				];
		}
	}
}
