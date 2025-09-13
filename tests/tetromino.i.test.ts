import { describe, beforeEach, test, expect } from "@jest/globals";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { TetrominoI } from "../src/tetromino-i";
import { createTestBoard, createTetromino, rotateTetromino } from "./testUtils.unit";

describe("TetrominoI", () => {
	let tetromino: TetrominoI;
	let board: any;

	beforeEach(() => {
		board = createTestBoard({
			height: 20,
			width: 11,
			seeds: [1],
			preview: false,
			keyBindings: false,
		});
		tetromino = createTetromino(board, 1, 5) as TetrominoI;
	});
	test("should create I tetromino with correct initial position and shape", () => {
		const tetromino = TetrominoFactory.createNew(5, board, 1);
		expect(tetromino.left).toBe(5);
		expect(tetromino.top).toBe(0);
		const positions = tetromino.getBlocks();
		expect(positions).toEqual([
			{ x: 4, y: 0, parent: tetromino },
			{ x: 5, y: 0, parent: tetromino },
			{ x: 6, y: 0, parent: tetromino },
			{ x: 7, y: 0, parent: tetromino },
		]);
	});

	test("should rotate I tetromino to vertical", () => {
		const t = TetrominoFactory.createNew(5, board, 1) as TetrominoI;
		rotateTetromino(t);
		const positions = t.getBlocks();
		expect(positions).toEqual([
			{ x: 4, y: 0, parent: t },
			{ x: 5, y: 0, parent: t },
			{ x: 6, y: 0, parent: t },
			{ x: 7, y: 0, parent: t },
		]);
	});
});
