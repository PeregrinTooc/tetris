import { Tetromino, Block } from "./tetromino-base";

export class TetrominoO extends Tetromino {


	getClassName(): string {
		return "tetromino tetromino-o";
	}

	getBlocks(): Block[] {
		return [
			new Block({ x: this.left, y: this.top + 1, parent: this }),
			new Block({ x: this.left + 1, y: this.top + 1, parent: this }),
			new Block({ x: this.left + 1, y: this.top, parent: this }),
			new Block({ x: this.left, y: this.top, parent: this }),
		];
	}

	rotate(): void {
		// O tetromino does not rotate
	}
}
