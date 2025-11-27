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
		let tetromino: Tetromino;
		switch (seed) {
			case 0:
				tetromino = new TetrominoT(left, board);
				break;
			case 1:
				tetromino = new TetrominoI(left, board);
				break;
			case 2:
				tetromino = new TetrominoO(left, board);
				break;
			case 3:
				tetromino = new TetrominoJ(left, board);
				break;
			case 4:
				tetromino = new TetrominoL(left, board);
				break;
			case 5:
				tetromino = new TetrominoZ(left, board);
				break;
			case 6:
				tetromino = new TetrominoS(left, board);
				break;
			case 1337:
				tetromino = new TetrominoSingle(left, board);
				break;
			default:
				tetromino = new TetrominoSingle(left, board);
		}
		tetromino.seed = seed;
		return tetromino;
	}
}
