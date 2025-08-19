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
		if (seed === 0) {
			return new TetrominoT(left, board);
		}
		if (seed === 1) {
			return new TetrominoI(left, board);
		}
		if (seed === 2) {
			return new TetrominoO(left, board);
		}
		if (seed === 3) {
			return new TetrominoJ(left, board);
		}
		if (seed === 4) {
			return new TetrominoL(left, board);
		}
		if (seed === 5) {
			return new TetrominoZ(left, board);
		}
		if (seed === 6) {
			return new TetrominoS(left, board);
		}
		if (seed === 1337) {
			return new TetrominoSingle(left, board);
		}
		throw new Error("Unsupported tetromino seed: " + seed);
	}
}
