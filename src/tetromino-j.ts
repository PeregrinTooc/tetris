import { Tetromino, Block } from "./tetromino-base";

export class TetrominoJ extends Tetromino {
	getClassName(): string {
		return "tetromino tetromino-j";
	}

	getBlocks(): Block[] {
		switch (this.rotation % 4) {
			case 0:
				return [
					{ x: this.left, y: this.top, parent: this },
					{ x: this.left - 1, y: this.top, parent: this },
					{ x: this.left + 1, y: this.top, parent: this },
					{ x: this.left + 1, y: this.top + 1, parent: this },
				];
			case 1:
				return [
					{ x: this.left, y: this.top, parent: this },
					{ x: this.left, y: this.top + 1, parent: this },
					{ x: this.left, y: this.top - 1, parent: this },
					{ x: this.left + 1, y: this.top - 1, parent: this },
				];
			case 2:
				return [
					{ x: this.left, y: this.top, parent: this },
					{ x: this.left + 1, y: this.top, parent: this },
					{ x: this.left - 1, y: this.top, parent: this },
					{ x: this.left - 1, y: this.top - 1, parent: this },
				];
			case 3:
				return [
					{ x: this.left, y: this.top, parent: this },
					{ x: this.left, y: this.top - 1, parent: this },
					{ x: this.left, y: this.top + 1, parent: this },
					{ x: this.left - 1, y: this.top + 1, parent: this },
				];
			default:
				return [
					{ x: this.left, y: this.top, parent: this },
					{ x: this.left, y: this.top, parent: this },
					{ x: this.left, y: this.top, parent: this },
					{ x: this.left, y: this.top, parent: this },
				];
		}
	}
}
