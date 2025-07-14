// tests/tetromino.rotation.blocked.test.js
// Dedicated tests for tetromino rotation blocked by board boundaries or other tetrominos

import { Board } from "../src/board.js";
import { TetrominoFactory } from "../src/tetromino.js";

describe("Tetromino rotation with boundaries and collisions", () => {
  let board;
  let element;

  beforeEach(() => {
    element = document.createElement("div");
    board = new Board(20, 10, element);
  });

  test("Tetromino does not rotate if it would go out of left boundary", () => {
    const tetromino = TetrominoFactory.createNew(1, document, board, 1); // I piece, left edge (pivot at 1)
    tetromino.rotate(board);
    expect(tetromino.getBlockPositions().map(({ x, y }) => [x, y])).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ]);
  });

  test("Tetromino does not rotate if it would go out of right boundary", () => {
    const tetromino = TetrominoFactory.createNew(7, document, board, 1); // I piece, right edge (pivot at 7)
    tetromino.rotate(board);
    expect(tetromino.getBlockPositions().map(({ x, y }) => [x, y])).toEqual([
      [6, 0],
      [7, 0],
      [8, 0],
      [9, 0],
    ]);
  });

  test("Tetromino does not rotate if it would go out of top boundary", () => {
    const tetromino = TetrominoFactory.createNew(4, document, board, 1); // I piece, top (pivot at 4,0)
    tetromino.rotate(board);
    expect(tetromino.getBlockPositions().map(({ x, y }) => [x, y])).toEqual([
      [3, 0],
      [4, 0],
      [5, 0],
      [6, 0],
    ]);
  });

  test("Tetromino does not rotate if it would go out of bottom boundary", () => {
    const tetromino = TetrominoFactory.createNew(4, document, board, 1); // I piece, bottom (pivot at 4,18)
    tetromino.top = 18;
    tetromino.rotate(board);
    expect(tetromino.getBlockPositions().map(({ x, y }) => [x, y])).toEqual([
      [3, 18],
      [4, 18],
      [5, 18],
      [6, 18],
    ]);
  });

  test("Tetromino does not rotate if another block is in the way", () => {
    // Place a blocking tetromino at (4,0)
    const blocker = TetrominoFactory.createNew(4, document, board, 2); // O piece, but only one block matters
    blocker.top = 0;
    board.tetrominos.add(blocker);
    const tetromino = TetrominoFactory.createNew(4, document, board, 1); // I piece, blocked (pivot at 4,0)
    tetromino.rotate(board);
    expect(tetromino.getBlockPositions().map(({ x, y }) => [x, y])).toEqual([
      [3, 0],
      [4, 0],
      [5, 0],
      [6, 0],
    ]);
  });

  test("Tetromino rotates if there is space", () => {
    const tetromino = TetrominoFactory.createNew(4, document, board, 1); // I piece, free (pivot at 4,0)
    tetromino.rotate(board);
    expect(tetromino.getBlockPositions().map(({ x, y }) => [x, y])).toEqual([
      [3, 0],
      [4, 0],
      [5, 0],
      [6, 0],
    ]);
  });

  test("O tetromino does not rotate (should be unchanged)", () => {
    const tetromino = TetrominoFactory.createNew(4, document, board, 2); // O piece
    tetromino.rotate(board);
    expect(tetromino.getBlockPositions().map(({ x, y }) => [x, y])).toEqual([
      [4, 1],
      [5, 1],
      [5, 0],
      [4, 0],
    ]);
  });

  test("T tetromino does not rotate if blocked by another block", () => {
    // Place a blocking tetromino at (5,1)
    const blocker = TetrominoFactory.createNew(5, document, board, 2); // O piece
    blocker.top = 1;
    board.tetrominos.add(blocker);
    const tetromino = TetrominoFactory.createNew(4, document, board, 0); // T piece
    tetromino.rotate(board);
    expect(tetromino.getBlockPositions().map(({ x, y }) => [x, y])).toEqual([
      [4, 0],
      [3, 0],
      [5, 0],
      [4, 1],
    ]);
  });
});
