import { Tetromino, BlockPosition } from "./tetromino-base";

export class TetrominoO extends Tetromino {


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
