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
				new Block({ x: this.pivot.x - 1, y: this.pivot.y, parent: this }),
				this.pivot,
				new Block({ x: this.pivot.x + 1, y: this.pivot.y, parent: this }),
				new Block({ x: this.pivot.x + 2, y: this.pivot.y, parent: this }),
			];
		} else {
			blocks = [
				new Block({ x: this.pivot.x, y: this.pivot.y - 1, parent: this }),
				this.pivot,
				new Block({ x: this.pivot.x, y: this.pivot.y + 1, parent: this }),
				new Block({ x: this.pivot.x, y: this.pivot.y + 2, parent: this }),
			];
		}
		this.blocks = blocks;
		return blocks;
	}
}
