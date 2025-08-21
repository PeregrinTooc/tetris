import { Board } from "./board";
import { Tetromino, Block } from "./tetromino-base";

export class TetrominoI extends Tetromino {

	getClassName(): string {
		return "tetromino tetromino-i";
	}

	getBlocks(): Block[] {
		if (this.rotation % 2 === 0) {
			return [
				new Block({ x: this.left - 1, y: this.top, parent: this }),
				new Block({ x: this.left, y: this.top, parent: this }),
				new Block({ x: this.left + 1, y: this.top, parent: this }),
				new Block({ x: this.left + 2, y: this.top, parent: this }),
			];
		} else {
			return [
				new Block({ x: this.left, y: this.top - 1, parent: this }),
				new Block({ x: this.left, y: this.top, parent: this }),
				new Block({ x: this.left, y: this.top + 1, parent: this }),
				new Block({ x: this.left, y: this.top + 2, parent: this }),
			];
		}
	}
}
