import { Tetromino, BlockPosition } from "./tetromino-base";

export class TetrominoO extends Tetromino {
	type: string;

	constructor(left: number, document: Document, board: any) {
		super(left, document, null);
		this.type = "O";
		this.rotation = 0;
		this.element = this._createElement(document);
		if (board) {
			this.board = board;
			board.addTetromino(this);
		}
	}

	getClassName(): string {
		return "tetromino tetromino-o";
	}

	getBlockPositions(): BlockPosition[] {
		return [
			{ x: this.left, y: this.top + 1 },
			{ x: this.left + 1, y: this.top + 1 },
			{ x: this.left + 1, y: this.top },
			{ x: this.left, y: this.top },
		];
	}

	rotate(): void {
		// O tetromino does not rotate
	}
}
