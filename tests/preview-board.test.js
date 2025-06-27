import { PreviewBoard } from "../src/preview-board.js";
import { TetrominoFactory } from "../src/tetromino.js";
import { Board } from "../src/board.js";

describe("PreviewBoard", () => {
  let element;
  let previewBoard;
  let board;
  let stubQueue;
  beforeEach(() => {
    element = document.createElement("div");
    const previewContainer = document.createElement("div");
    previewContainer.id = "preview-container";
    const nextPiece = document.createElement("div");
    nextPiece.id = "next-piece";
    previewContainer.appendChild(nextPiece);
    element.appendChild(previewContainer);
    previewBoard = new PreviewBoard(element);
    stubQueue = { dequeue: () => 1337 };
    board = new Board(
      20,
      11,
      document.createElement("div"),
      previewBoard,
      stubQueue
    );
  });
  test("should clear preview container and add tetromino element", () => {
    const tetromino = TetrominoFactory.createNew(5, document, board, 1337);
    previewBoard.showNextTetromino(tetromino);
    expect(previewBoard.previewContainer.innerHTML).toContain("tetromino");
  });
});
