import { describe, beforeEach, test, expect } from "@jest/globals";
import { TetrominoFactory } from "../src/tetromino";
import { Board } from "../src/board";
import { PreviewBoard } from "../src/preview-board";
import { TetrominoI } from "../src/tetromino-i";

describe("TetrominoI", () => {
	let tetromino: TetrominoI;
	let board: Board;
	const element = document.createElement("div");
	const nextPiece = document.createElement("div");
	nextPiece.id = "next-piece";
	element.appendChild(nextPiece);
	let stubQueue: any;
	beforeEach(() => {
		stubQueue = { dequeue: () => 1 };
		board = new Board(
			20,
			11,
			document.createElement("div"),
			new PreviewBoard(element),
			stubQueue
		);
		tetromino = TetrominoFactory.createNew(5, document, board, 1) as TetrominoI;
	});
	test("should create I tetromino with correct initial position and shape", () => {
		const tetromino = new TetrominoI(5, document, board);
		expect(tetromino.left).toBe(5);
		expect(tetromino.top).toBe(0);
		const positions = tetromino.getBlockPositions();
		expect(positions).toEqual([
			{ x: 4, y: 0 },
			{ x: 5, y: 0 },
			{ x: 6, y: 0 },
			{ x: 7, y: 0 },
		]);
	});

	test("should rotate I tetromino to vertical", () => {
		const tetromino = new TetrominoI(5, document, board);
		tetromino.rotate(board);
		const positions = tetromino.getBlockPositions();
		expect(positions).toEqual([
			{ x: 4, y: 0 },
			{ x: 5, y: 0 },
			{ x: 6, y: 0 },
			{ x: 7, y: 0 },
		]);
	});
});
