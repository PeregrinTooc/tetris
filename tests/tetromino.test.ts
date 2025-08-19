import { describe, beforeEach, test, expect, jest } from "@jest/globals";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { Board } from "../src/board";
import { PreviewBoard } from "../src/preview-board";
import { Tetromino } from "../src/tetromino-base";

describe("Tetromino", () => {
  let tetromino: Tetromino;
  let board: Board;
  const element = document.createElement("div");
  const nextPiece = document.createElement("div");
  nextPiece.id = "next-piece";
  element.appendChild(nextPiece);
  let stubQueue: any;
  beforeEach(() => {
    stubQueue = { dequeue: () => 1337 };
    board = new Board(
      20,
      11,
      document.createElement("div"),
      new PreviewBoard(element),
      stubQueue
    );
    tetromino = TetrominoFactory.createNew(5, board, 1337);
  });
  test("should create with correct initial position", () => {
    expect(tetromino.left).toBe(5);
    expect(tetromino.top).toBe(0);
  });
  test("should delegate movement to board", () => {
    const moveTetrominoSpy = jest.spyOn(board, "moveTetromino");
    tetromino.move("left");
    expect(moveTetrominoSpy).toHaveBeenCalledWith(tetromino, "left");
  });
  test("should lock tetromino", () => {
    tetromino.lock();
    const moveTetrominoSpy = jest.spyOn(board, "moveTetromino");
    tetromino.move("left");
    expect(moveTetrominoSpy).not.toHaveBeenCalled();
  });
  test("should not move left past the left border", () => {
    tetromino.left = 0;
    tetromino.move("left");
    expect(tetromino.left).toBe(0);
  });
  test("should not move right past the right border", () => {
    tetromino.left = board.width - 1;
    tetromino.move("right");
    expect(tetromino.left).toBe(board.width - 1);
  });
  test("I tetromino blocks should not go out of left border", () => {
    // Place I tetromino so all blocks are in-bounds
    tetromino = TetrominoFactory.createNew(2, board, 1); // 1 = I
    tetromino.left = 1; // leftmost block at 0
    const before = tetromino.getBlockPositions().map((b: { x: number }) => b.x);
    expect(Math.min(...before)).toBe(0);
    tetromino.move("left");
    const after = tetromino.getBlockPositions().map((b: { x: number }) => b.x);
    // Should not move, still at left edge
    expect(Math.min(...after)).toBe(0);
  });
  test("I tetromino blocks should not go out of right border", () => {
    // Place I tetromino so all blocks are in-bounds
    tetromino = TetrominoFactory.createNew(board.width - 3, board, 1); // 1 = I
    tetromino.left = board.width - 3; // rightmost block at width-1
    const before = tetromino.getBlockPositions().map((b: { x: number }) => b.x);
    expect(Math.max(...before)).toBe(board.width - 1);
    tetromino.move("right");
    const after = tetromino.getBlockPositions().map((b: { x: number }) => b.x);
    // Should not move, still at right edge
    expect(Math.max(...after)).toBe(board.width - 1);
  });
  test("should allow tetromino to soft drop down", () => {
    const initialTop = tetromino.top;
    tetromino.move("down");
    expect(tetromino.top).toBe(initialTop + 1);
  });
});
