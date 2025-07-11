import { TetrominoFactory } from "../src/tetromino.js";
import { Board } from "../src/board.js";
import { PreviewBoard } from "../src/preview-board.js";

describe("TetrominoJ", () => {
  let tetromino;
  let board;
  const element = document.createElement("div");
  const nextPiece = document.createElement("div");
  nextPiece.id = "next-piece";
  element.appendChild(nextPiece);
  let stubQueue;
  beforeEach(() => {
    stubQueue = { dequeue: () => 4 };
    board = new Board(
      20,
      11,
      document.createElement("div"),
      new PreviewBoard(element),
      stubQueue
    );
    tetromino = TetrominoFactory.createNew(5, document, board, 4);
  });
  test("should create J tetromino with correct initial position and shape", () => {
    expect(tetromino.left).toBe(5);
    expect(tetromino.top).toBe(0);
    const positions = tetromino.getBlockPositions();
    expect(positions).toEqual([
      { x: 5, y: 0 },
      { x: 4, y: 0 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
    ]);
  });
  test("should rotate J tetromino through all states", () => {
    let positions = tetromino.getBlockPositions();
    expect(positions).toEqual([
      { x: 5, y: 0 },
      { x: 4, y: 0 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
    ]);
    tetromino.rotate();
    positions = tetromino.getBlockPositions();
    expect(positions).toEqual([
      { x: 5, y: 0 },
      { x: 5, y: -1 },
      { x: 5, y: 1 },
      { x: 6, y: -1 },
    ]);
    tetromino.rotate();
    positions = tetromino.getBlockPositions();
    expect(positions).toEqual([
      { x: 5, y: 0 },
      { x: 4, y: 0 },
      { x: 6, y: 0 },
      { x: 4, y: -1 },
    ]);
    tetromino.rotate();
    positions = tetromino.getBlockPositions();
    expect(positions).toEqual([
      { x: 5, y: 0 },
      { x: 5, y: -1 },
      { x: 5, y: 1 },
      { x: 4, y: 1 },
    ]);
    tetromino.rotate();
    positions = tetromino.getBlockPositions();
    expect(positions).toEqual([
      { x: 5, y: 0 },
      { x: 4, y: 0 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
    ]);
  });
});
