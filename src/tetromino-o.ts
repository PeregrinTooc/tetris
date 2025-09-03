import { Tetromino, Block } from "./tetromino-base";

export class TetrominoO extends Tetromino {


	getClassName(): string {
		return "tetromino tetromino-o";
	}

	protected createBlocks(): void {
		const blocks = [
			new Block({ x: this.pivot.x, y: this.pivot.y + 1, parent: this }),
			new Block({ x: this.pivot.x + 1, y: this.pivot.y + 1, parent: this }),
			new Block({ x: this.pivot.x + 1, y: this.pivot.y, parent: this }),
			this.pivot,
		];
		this.blocks = blocks;
	}

	getBlocks(): Block[] {
		if (this.locked) return this.blocks;
		const blocks = [
			new Block({ x: this.pivot.x, y: this.pivot.y + 1, parent: this }),
			new Block({ x: this.pivot.x + 1, y: this.pivot.y + 1, parent: this }),
			new Block({ x: this.pivot.x + 1, y: this.pivot.y, parent: this }),
			this.pivot,
		];
		this.blocks = blocks;
		return blocks;
	}

	rotate(): void {
		// O tetromino does not rotate
	}
}
