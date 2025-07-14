import { TetrominoJ } from "../src/tetromino-j.js";
import { Board } from "../src/board.js";
import { PreviewBoard } from "../src/preview-board.js";
import { TetrominoFactory } from "../src/tetromino.js";

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
    tetromino = TetrominoFactory.createNew(5, document, board, 3);
  });
  test("should create J tetromino with correct initial position and shape", () => {
    expect(tetromino.left).toBe(5);
    expect(tetromino.top).toBe(0);
    const positions = tetromino.getBlockPositions();
    expect(positions).toEqual([
      { x: 5, y: 0 }, // pivot
      { x: 4, y: 0 }, // left
      { x: 6, y: 0 }, // right
      { x: 6, y: 1 }, // bottom right
    ]);
  });
  test("should rotate J tetromino through all states", () => {
    let tetromino = TetrominoFactory.createNew(5, document, board, 3);
    tetromino.top = 2; // Move down to avoid boundary issues
    let positions = tetromino.getBlockPositions();
    expect(positions).toEqual([
      { x: 5, y: 2 }, // spawn: pivot
      { x: 4, y: 2 }, // left
      { x: 6, y: 2 }, // right
      { x: 6, y: 3 }, // bottom right
    ]);
    tetromino.rotate();
    positions = tetromino.getBlockPositions();
    expect(positions).toEqual([
      { x: 5, y: 2 }, // right: pivot
      { x: 5, y: 3 }, // down
      { x: 5, y: 1 }, // up
      { x: 6, y: 1 }, // up right
    ]);
    tetromino.rotate();
    positions = tetromino.getBlockPositions();
    expect(positions).toEqual([
      { x: 5, y: 2 }, // reverse: pivot
      { x: 6, y: 2 }, // right
      { x: 4, y: 2 }, // left
      { x: 4, y: 1 }, // top left
    ]);
    tetromino.rotate();
    positions = tetromino.getBlockPositions();
    expect(positions).toEqual([
      { x: 5, y: 2 }, // left: pivot
      { x: 5, y: 1 }, // up
      { x: 5, y: 3 }, // down
      { x: 4, y: 3 }, // down left
    ]);
  });
});
