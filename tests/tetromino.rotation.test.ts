import { describe, beforeEach, test, expect } from "@jest/globals";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { TetrominoT } from "../src/tetromino-t";
import { Board } from "../src/board";

describe("Tetromino rotation", () => {
  let tetromino: TetrominoT;
  let board: Board;
  let stubQueue: any;
  const element = document.createElement("div");
  const nextPiece = document.createElement("div");
  nextPiece.id = "next-piece";
  element.appendChild(nextPiece);
  beforeEach(() => {
    stubQueue = { dequeue: () => 0 };
    board = new Board(20, 11, document.createElement("div"), null, stubQueue);
    tetromino = TetrominoFactory.createNew(5, board, 0) as TetrominoT;
  });
  test("should rotate T tetromino counter-clockwise", () => {
    const tetromino = TetrominoFactory.createNew(5, board, 0);
    tetromino.rotate();
    const rotatedBlocks = tetromino.getBlocks();
    expect(rotatedBlocks).toEqual([
      { x: 5, y: 0, parent: tetromino },
      { x: 4, y: 0, parent: tetromino },
      { x: 6, y: 0, parent: tetromino },
      { x: 5, y: 1, parent: tetromino },
    ]);
  });
});
