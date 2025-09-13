import { Tetromino, Block } from "./tetromino-base";

export class TetrominoS extends Tetromino {
	getClassName(): string {
		return "tetromino tetromino-s";
	}

	getBlocks(): Block[] {
		if (this.locked) return this.blocks;
		let blocks: Block[];
		switch (this.rotation % 2) {
			case 0:
				blocks = [
					this.pivot,
					new Block({ x: this.pivot.x + 1, y: this.pivot.y, parent: this }),
					new Block({ x: this.pivot.x, y: this.pivot.y + 1, parent: this }),
					new Block({ x: this.pivot.x - 1, y: this.pivot.y + 1, parent: this }),
				];
				break;
			default:
				blocks = [
					new Block({ x: this.pivot.x - 1, y: this.pivot.y - 1, parent: this }),
					new Block({ x: this.pivot.x - 1, y: this.pivot.y, parent: this }),
					this.pivot,
					new Block({ x: this.pivot.x, y: this.pivot.y + 1, parent: this }),
				];
		}
		this.blocks = blocks;
		return blocks;
	}
}
