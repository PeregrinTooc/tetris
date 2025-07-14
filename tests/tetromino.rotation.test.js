import { TetrominoFactory } from "../src/tetromino.js";
import { TetrominoT } from "../src/tetromino-t.js";
import { Board } from "../src/board.js";

describe("Tetromino rotation", () => {
  let tetromino;
  let board;
  let stubQueue;
  const element = document.createElement("div");
  const nextPiece = document.createElement("div");
  nextPiece.id = "next-piece";
  element.appendChild(nextPiece);
  beforeEach(() => {
    stubQueue = { dequeue: () => 0 };
    board = new Board(
      20,
      11,
      document.createElement("div"),
      undefined,
      stubQueue
    );
    tetromino = TetrominoFactory.createNew(5, document, board, 0);
  });
  test("should rotate T tetromino counter-clockwise", () => {
    const tetromino = new TetrominoT(5, document);
    tetromino.rotate();
    const rotatedBlocks = tetromino.getBlockPositions();
    expect(rotatedBlocks).toEqual([
      { x: 5, y: 0 },
      { x: 4, y: 0 },
      { x: 6, y: 0 },
      { x: 5, y: 1 },
    ]);
  });
});
