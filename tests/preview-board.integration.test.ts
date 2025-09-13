import { describe, beforeEach, test, expect } from "@jest/globals";
import { PreviewBoardImpl } from "../src/preview-board";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { Board } from "../src/board";

describe("PreviewBoard integration", () => {
	let previewElement: HTMLElement;
	let previewBoard: PreviewBoardImpl;
	let board: Board;
	let stubQueue: any;
	beforeEach(() => {
		const container = document.createElement("div");
		const previewContainer = document.createElement("div");
		previewContainer.id = "preview-container";
		const nextPiece = document.createElement("div");
		nextPiece.id = "next-piece";
		previewContainer.appendChild(nextPiece);
		container.appendChild(previewContainer);
		previewElement = container;
		previewBoard = new PreviewBoardImpl(previewElement);
		stubQueue = { dequeue: () => 1337 };
		board = new Board(20, 11, document.createElement("div"), previewBoard, stubQueue);
	});
	test("should show the next tetromino in the preview", () => {
		const tetromino = TetrominoFactory.createNew(5, board, 1337);
		previewBoard.showNextTetromino(tetromino);
		const previewTetromino = previewBoard.previewContainer.querySelector(".tetromino");
		expect(previewTetromino).not.toBeNull();
	});
});
