import { Board } from "./board";
import { Tetromino, Block } from "./tetromino-base";

export class TetrominoI extends Tetromino {

	getClassName(): string {
		return "tetromino tetromino-i";
	}

	getBlocks(): Block[] {
		if (this.locked) return this.blocks;
		let blocks: Block[];
		if (this.rotation % 2 === 0) {
			blocks = [
				new Block({ x: this.left - 1, y: this.top, parent: this }),
				new Block({ x: this.left, y: this.top, parent: this }),
				new Block({ x: this.left + 1, y: this.top, parent: this }),
				new Block({ x: this.left + 2, y: this.top, parent: this }),
			];
		} else {
			blocks = [
				new Block({ x: this.left, y: this.top - 1, parent: this }),
				new Block({ x: this.left, y: this.top, parent: this }),
				new Block({ x: this.left, y: this.top + 1, parent: this }),
				new Block({ x: this.left, y: this.top + 2, parent: this }),
			];
		}
		this.blocks = blocks;
		return blocks;
	}
}
