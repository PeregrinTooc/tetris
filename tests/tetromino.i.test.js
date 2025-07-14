import { TetrominoFactory } from "../src/tetromino.js";
import { Board } from "../src/board.js";
import { PreviewBoard } from "../src/preview-board.js";
import { TetrominoI } from "../src/tetromino-i.js";

describe("TetrominoI", () => {
  let tetromino;
  let board;
  const element = document.createElement("div");
  const nextPiece = document.createElement("div");
  nextPiece.id = "next-piece";
  element.appendChild(nextPiece);
  let stubQueue;
  beforeEach(() => {
    stubQueue = { dequeue: () => 1 };
    board = new Board(
      20,
      11,
      document.createElement("div"),
      new PreviewBoard(element),
      stubQueue
    );
    tetromino = TetrominoFactory.createNew(5, document, board, 1);
  });
  test("should create I tetromino with correct initial position and shape", () => {
    const tetromino = new TetrominoI(5, document);
    expect(tetromino.left).toBe(5);
    expect(tetromino.top).toBe(0);
    const positions = tetromino.getBlockPositions();
    expect(positions).toEqual([
      { x: 4, y: 0 },
      { x: 5, y: 0 },
      { x: 6, y: 0 },
      { x: 7, y: 0 },
    ]);
  });

  test("should rotate I tetromino to vertical", () => {
    const tetromino = new TetrominoI(5, document);
    tetromino.rotate();
    const positions = tetromino.getBlockPositions();
    expect(positions).toEqual([
      { x: 4, y: 0 },
      { x: 5, y: 0 },
      { x: 6, y: 0 },
      { x: 7, y: 0 },
    ]);
  });
});
