import { Tetromino, Block } from "./tetromino-base";

export class TetrominoSingle extends Tetromino {

	getClassName(): string {
		return "tetromino";
	}

	getBlocks(): Block[] {
		return [new Block({ x: this.left, y: this.top, parent: this })];
	}
}
