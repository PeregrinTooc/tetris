import { PreviewBoard } from "../src/preview-board.js";
import { Tetromino } from "../src/tetromino.js";
import { Board } from "../src/board.js";

describe("PreviewBoard integration", () => {
  let previewElement;
  let previewBoard;
  let board;
  beforeEach(() => {
    const container = document.createElement("div");
    const previewContainer = document.createElement("div");
    previewContainer.id = "preview-container";
    const nextPiece = document.createElement("div");
    nextPiece.id = "next-piece";
    previewContainer.appendChild(nextPiece);
    container.appendChild(previewContainer);
    previewElement = container;
    previewBoard = new PreviewBoard(previewElement);
    board = new Board(20, 11, document.createElement("div"), previewBoard);
  });
  test("should show the next tetromino in the preview", () => {
    const tetromino = Tetromino.createNew(5, document, board);
    previewBoard.showNextTetromino(tetromino);
    const previewTetromino =
      previewBoard.previewContainer.querySelector(".tetromino");
    expect(previewTetromino).not.toBeNull();
  });
});
