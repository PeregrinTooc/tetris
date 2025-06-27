import { Tetromino } from "./tetromino-base.js";
import { TetrominoT } from "./tetromino-t.js";
import { TetrominoI } from "./tetromino-i.js";

export class TetrominoFactory {
  static createNew(left, document, board, seed) {
    if (seed === 0) {
      return new TetrominoT(left, document, board);
    }
    if (seed === 1) {
      return new TetrominoI(left, document, board);
    }
    if (seed === 1337) {
      return new Tetromino(left, document, board, seed);
    }
    throw new Error("Unsupported tetromino seed: " + seed);
  }
}
