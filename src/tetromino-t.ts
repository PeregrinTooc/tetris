import { Tetromino, Block } from "./tetromino-base";

export class TetrominoT extends Tetromino {
	getClassName(): string {
		return "tetromino tetromino-t";
	}

	getBlocks(): Block[] {
		if (this.locked) return this.blocks;
		let blocks: Block[];
		switch (this.rotation % 4) {
			case 0:
				blocks = [
					this.pivot,
					new Block({ x: this.pivot.x - 1, y: this.pivot.y, parent: this }),
					new Block({ x: this.pivot.x + 1, y: this.pivot.y, parent: this }),
					new Block({ x: this.pivot.x, y: this.pivot.y + 1, parent: this }),
				];
				break;
			case 1:
				blocks = [
					this.pivot,
					new Block({ x: this.pivot.x, y: this.pivot.y - 1, parent: this }),
					new Block({ x: this.pivot.x, y: this.pivot.y + 1, parent: this }),
					new Block({ x: this.pivot.x + 1, y: this.pivot.y, parent: this }),
				];
				break;
			case 2:
				blocks = [
					this.pivot,
					new Block({ x: this.pivot.x - 1, y: this.pivot.y, parent: this }),
					new Block({ x: this.pivot.x + 1, y: this.pivot.y, parent: this }),
					new Block({ x: this.pivot.x, y: this.pivot.y - 1, parent: this }),
				];
				break;
			default:
				blocks = [
					this.pivot,
					new Block({ x: this.pivot.x, y: this.pivot.y - 1, parent: this }),
					new Block({ x: this.pivot.x, y: this.pivot.y + 1, parent: this }),
					new Block({ x: this.pivot.x - 1, y: this.pivot.y, parent: this }),
				];
		}
		this.blocks = blocks;
		return blocks;
	}
}
