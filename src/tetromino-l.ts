import { Tetromino, BlockPosition } from "./tetromino-base";

export class TetrominoL extends Tetromino {

	getClassName(): string {
		return "tetromino tetromino-l";
	}

	getBlockPositions(): BlockPosition[] {
		switch (this.rotation % 4) {
			case 0:
				return [
					{ x: this.left, y: this.top },
					{ x: this.left - 1, y: this.top },
					{ x: this.left + 1, y: this.top },
					{ x: this.left - 1, y: this.top + 1 },
				];
			case 1:
				return [
					{ x: this.left, y: this.top },
					{ x: this.left, y: this.top + 1 },
					{ x: this.left, y: this.top - 1 },
					{ x: this.left + 1, y: this.top + 1 },
				];
			case 2:
				return [
					{ x: this.left, y: this.top },
					{ x: this.left + 1, y: this.top },
					{ x: this.left - 1, y: this.top },
					{ x: this.left + 1, y: this.top - 1 },
				];
			case 3:
				return [
					{ x: this.left, y: this.top },
					{ x: this.left, y: this.top - 1 },
					{ x: this.left, y: this.top + 1 },
					{ x: this.left - 1, y: this.top - 1 },
				];
			default:
				return [];
		}
	}
}
