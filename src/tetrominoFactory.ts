import { Tetromino } from "./tetromino-base";
import { TetrominoT } from "./tetromino-t";
import { TetrominoI } from "./tetromino-i";
import { TetrominoO } from "./tetromino-o";
import { TetrominoJ } from "./tetromino-j";
import { TetrominoL } from "./tetromino-l";
import { TetrominoZ } from "./tetromino-z";
import { TetrominoS } from "./tetromino-s";
import { TetrominoSingle } from "./tetromino-single";
import { Board } from "./board";

export class TetrominoFactory {
	static createNew(left: number, board: Board | null, seed: number): Tetromino {
		switch (seed) {
			case 0:
				return new TetrominoT(left, board);
			case 1:
				return new TetrominoI(left, board);
			case 2:
				return new TetrominoO(left, board);
			case 3:
				return new TetrominoJ(left, board);
			case 4:
				return new TetrominoL(left, board);
			case 5:
				return new TetrominoZ(left, board);
			case 6:
				return new TetrominoS(left, board);
			case 1337:
				return new TetrominoSingle(left, board);
			default:
				return new TetrominoSingle(left, board);
		}
	}
}
