import { PreviewBoard } from "../src/preview-board.js";
import { Tetromino } from "../src/tetromino.js";
import { Board } from "../src/board.js";

describe("PreviewBoard", () => {
  let element;
  let previewBoard;
  let board;
  beforeEach(() => {
    element = document.createElement("div");
    const previewContainer = document.createElement("div");
    previewContainer.id = "preview-container";
    const nextPiece = document.createElement("div");
    nextPiece.id = "next-piece";
    previewContainer.appendChild(nextPiece);
    element.appendChild(previewContainer);
    previewBoard = new PreviewBoard(element);
    board = new Board(20, 11, document.createElement("div"), previewBoard);
  });
  test("should clear preview container and add tetromino element", () => {
    const tetromino = Tetromino.createNew(5, document, board);
    previewBoard.showNextTetromino(tetromino);
    expect(previewBoard.previewContainer.innerHTML).toContain("tetromino");
  });
});
