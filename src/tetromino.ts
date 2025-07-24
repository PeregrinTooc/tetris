import { Tetromino } from "./tetromino-base";
import { TetrominoT } from "./tetromino-t";
import { TetrominoI } from "./tetromino-i";
import { TetrominoO } from "./tetromino-o";
import { TetrominoJ } from "./tetromino-j";
import { TetrominoL } from "./tetromino-l";
import { TetrominoZ } from "./tetromino-z";
import { TetrominoS } from "./tetromino-s";

export class TetrominoFactory {
	static createNew(left: number, document: Document, board: any, seed: number): Tetromino {
		if (seed === 0) {
			return new TetrominoT(left, document, board);
		}
		if (seed === 1) {
			return new TetrominoI(left, document, board);
		}
		if (seed === 2) {
			return new TetrominoO(left, document, board);
		}
		if (seed === 3) {
			return new TetrominoJ(left, document, board);
		}
		if (seed === 4) {
			return new TetrominoL(left, document, board);
		}
		if (seed === 5) {
			return new TetrominoZ(left, document, board);
		}
		if (seed === 6) {
			return new TetrominoS(left, document, board);
		}
		if (seed === 1337) {
			return new Tetromino(left, document, board);
		}
		throw new Error("Unsupported tetromino seed: " + seed);
	}
}
