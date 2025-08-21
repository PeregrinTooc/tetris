import { Tetromino, Block } from "./tetromino-base";

export class TetrominoZ extends Tetromino {


	getClassName(): string {
		return "tetromino tetromino-z";
	}

	getBlocks(): Block[] {
		switch (this.rotation % 2) {
			case 0:
				return [
					new Block({ x: this.left, y: this.top, parent: this }),
					new Block({ x: this.left + 1, y: this.top, parent: this }),
					new Block({ x: this.left, y: this.top + 1, parent: this }),
					new Block({ x: this.left - 1, y: this.top + 1, parent: this })
				];
			default:
				return [
					new Block({ x: this.left, y: this.top, parent: this }),
					new Block({ x: this.left, y: this.top + 1, parent: this }),
					new Block({ x: this.left + 1, y: this.top, parent: this }),
					new Block({ x: this.left + 1, y: this.top - 1, parent: this })
				];
		}
	}
}
