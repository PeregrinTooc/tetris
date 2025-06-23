import { PreviewBoard } from "../src/preview-board.js";
import { Tetromino } from "../src/tetromino.js";
import { Board } from "../src/board.js";

describe("PreviewBoard integration", () => {
  let previewElement;
  let previewBoard;
  let board;
  let stubQueue;
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
    stubQueue = { dequeue: () => 1337 };
    board = new Board(20, 11, document.createElement("div"), previewBoard, stubQueue);
  });
  test("should show the next tetromino in the preview", () => {
    const tetromino = Tetromino.createNew(5, document, board, 1337);
    previewBoard.showNextTetromino(tetromino);
    const previewTetromino =
      previewBoard.previewContainer.querySelector(".tetromino");
    expect(previewTetromino).not.toBeNull();
  });
});
