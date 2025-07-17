import { Tetromino } from "./tetromino-base.js";
import { TetrominoT } from "./tetromino-t.js";
import { TetrominoI } from "./tetromino-i.js";
import { TetrominoO } from "./tetromino-o.js";
import { TetrominoJ } from "./tetromino-j.js";
import { TetrominoL } from "./tetromino-l.js";

export class TetrominoFactory {
  static createNew(left, document, board, seed) {
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
    if (seed === 1337) {
      return new Tetromino(left, document, board, seed);
    }
    throw new Error("Unsupported tetromino seed: " + seed);
  }
}
