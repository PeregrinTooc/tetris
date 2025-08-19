import { describe, beforeEach, test, expect, jest } from "@jest/globals";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { Board } from "../src/board";

describe("O-shaped Tetromino", () => {
	let board: Board;

	beforeEach(() => {
		board = new Board(20, 10, { appendChild: jest.fn() } as any, null, { dequeue: () => 2 });
	});

	test("should create a 2x2 square shape", () => {
		const tetromino = TetrominoFactory.createNew(5, board, 2);
		expect(tetromino.getBlockPositions()).toEqual([
			{ x: 5, y: 1 },
			{ x: 6, y: 1 },
			{ x: 6, y: 0 },
			{ x: 5, y: 0 },
		]);
	});

	test("should not rotate (remain same shape)", () => {
		const tetromino = TetrominoFactory.createNew(5, board, 2);
		const originalShape = tetromino.getBlockPositions();
		tetromino.rotate();
		expect(tetromino.getBlockPositions()).toEqual(originalShape);
	});
});