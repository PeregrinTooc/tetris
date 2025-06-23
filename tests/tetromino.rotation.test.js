import { Tetromino } from "../src/tetromino.js";
import { Board } from "../src/board.js";

describe("Tetromino rotation", () => {
	let tetromino;
	let board;
	let stubQueue;
	const element = document.createElement("div");
	const nextPiece = document.createElement("div");
	nextPiece.id = "next-piece";
	element.appendChild(nextPiece);
	beforeEach(() => {
		stubQueue = { dequeue: () => 0 };
		board = new Board(20, 11, document.createElement("div"), undefined, stubQueue);
		tetromino = Tetromino.createNew(5, document, board, 0);
	});
	test("should rotate T tetromino counter-clockwise", () => {
		const initialBlocks = tetromino.getBlockPositions();
		tetromino.rotate();
		const rotatedBlocks = tetromino.getBlockPositions();
		expect(rotatedBlocks).not.toEqual(initialBlocks);
	});
});
