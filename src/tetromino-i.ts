import { Board } from "./board";
import { Tetromino, BlockPosition } from "./tetromino-base";

export class TetrominoI extends Tetromino {

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
