import { Tetromino, Block } from "./tetromino-base";

export class TetrominoSingle extends Tetromino {

	getClassName(): string {
		return "tetromino";
	}

	getBlocks(): Block[] {
		if (this.locked) return this.blocks;
		const blocks = [new Block({ x: this.left, y: this.top, parent: this })];
		this.blocks = blocks;
		return blocks;
	}
}
