import { Tetromino, Block } from "./tetromino-base";

export class TetrominoO extends Tetromino {


	getClassName(): string {
		return "tetromino tetromino-o";
	}

	getBlocks(): Block[] {
		if (this.locked) return this.blocks;
		const blocks = [
			new Block({ x: this.left, y: this.top + 1, parent: this }),
			new Block({ x: this.left + 1, y: this.top + 1, parent: this }),
			new Block({ x: this.left + 1, y: this.top, parent: this }),
			new Block({ x: this.left, y: this.top, parent: this }),
		];
		this.blocks = blocks;
		return blocks;
	}

	rotate(): void {
		// O tetromino does not rotate
	}
}
