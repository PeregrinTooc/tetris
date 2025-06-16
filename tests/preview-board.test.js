import { PreviewBoard } from "../src/preview-board.js";

describe("PreviewBoard", () => {
	let element;
	let previewBoard;
	beforeEach(() => {
		element = document.createElement("div");
		const nextPiece = document.createElement("div");
		nextPiece.id = "next-piece";
		element.appendChild(nextPiece);
		previewBoard = new PreviewBoard(element);
	});
	test("should clear preview container and add tetromino element", () => {
		const tetromino = { createElement: jest.fn(() => {
			const el = document.createElement("div");
			el.className = "tetromino";
			return el;
		}) };
		previewBoard.showNextTetromino(tetromino);
		expect(previewBoard.previewContainer.innerHTML).toContain("tetromino");
	});
});
