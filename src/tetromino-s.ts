import { Tetromino, Block } from "./tetromino-base";

export class TetrominoS extends Tetromino {

	getClassName(): string {
		return "tetromino tetromino-s";
	}

	getBlocks(): Block[] {
		switch (this.rotation % 2) {
			case 0:
				return [
					{ x: this.left, y: this.top },
					{ x: this.left - 1, y: this.top },
					{ x: this.left, y: this.top + 1 },
					{ x: this.left + 1, y: this.top + 1 }
				];
			case 1:
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
