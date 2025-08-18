import { Tetromino, BlockPosition } from "./tetromino-base";

export class TetrominoSingle extends Tetromino {

	getClassName(): string {
		return "tetromino";
	}

	getBlockPositions(): BlockPosition[] {
		return [{ x: this.left, y: this.top }];
	}
}
