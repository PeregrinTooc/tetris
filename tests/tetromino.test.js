import { Tetromino } from "../src/tetromino.js";
import { Board } from "../src/board.js";
import { PreviewBoard } from "../src/preview-board.js";

describe("Tetromino", () => {
  let tetromino;
  let board;
  const element = document.createElement("div");
  const nextPiece = document.createElement("div");
  nextPiece.id = "next-piece";
  element.appendChild(nextPiece);
  beforeEach(() => {
    board = new Board(
      20,
      11,
      document.createElement("div"),
      new PreviewBoard(element)
    );
    tetromino = Tetromino.createNew(5, document, board);
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
});
