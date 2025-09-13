import { describe, beforeEach, test, expect, jest } from "@jest/globals";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { createTestBoard, createTetromino, rotateTetromino } from "./testUtils.unit";

describe("O-shaped Tetromino", () => {
	let board: any;

	beforeEach(() => {
		board = createTestBoard({ height: 20, width: 10, seeds: [2], preview: false, keyBindings: false, element: { appendChild: jest.fn() } as any });
	});

	test("should create a 2x2 square shape", () => {
		const tetromino = TetrominoFactory.createNew(5, board, 2);
		expect(tetromino.getBlocks()).toEqual([
			{ x: 5, y: 1, parent: tetromino },
			{ x: 6, y: 1, parent: tetromino },
			{ x: 6, y: 0, parent: tetromino },
			{ x: 5, y: 0, parent: tetromino },
		]);
	});

	test("should not rotate (remain same shape)", () => {
		const tetromino = createTetromino(board, 2, 5);
		const originalShape = tetromino.getBlocks();
		rotateTetromino(tetromino);
		expect(tetromino.getBlocks()).toEqual(originalShape);
	});
});