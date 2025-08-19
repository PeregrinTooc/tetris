import { describe, beforeEach, test, expect } from "@jest/globals";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { Board } from "../src/board";
import { PreviewBoard } from "../src/preview-board";
import { TetrominoI } from "../src/tetromino-i";

describe("TetrominoI", () => {
	let tetromino: TetrominoI;
	let board: Board;
	const element = document.createElement("div");

	beforeEach(() => {
		board = new Board(
			20,
			11,
			document.createElement("div"),
			new PreviewBoard(element),
			{ dequeue: () => 1 } // Mocked TetrominoSeedQueue			
		);
		tetromino = TetrominoFactory.createNew(5, board, 1) as TetrominoI;
	});
	test("should create I tetromino with correct initial position and shape", () => {
		const tetromino = TetrominoFactory.createNew(5, board, 1);
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
		const tetromino = TetrominoFactory.createNew(5, board, 1);
		tetromino.rotate();
		const positions = tetromino.getBlockPositions();
		expect(positions).toEqual([
			{ x: 4, y: 0 },
			{ x: 5, y: 0 },
			{ x: 6, y: 0 },
			{ x: 7, y: 0 },
		]);
	});
});
