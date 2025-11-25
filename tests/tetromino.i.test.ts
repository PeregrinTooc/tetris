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
		const positions = t.getBlocks().map((b) => ({ x: b.x, y: b.y }));

		// Should have 4 blocks
		expect(positions.length).toBe(4);

		// Should be vertical (all blocks in same column)
		const cols = positions.map((p) => p.x);
		expect(new Set(cols).size).toBe(1);

		// Should span 4 rows
		const rows = positions.map((p) => p.y);
		expect(Math.max(...rows) - Math.min(...rows)).toBe(3);

		// All positions should be valid
		positions.forEach((pos) => {
			expect(pos.x).toBeGreaterThanOrEqual(0);
			expect(pos.x).toBeLessThan(11);
			expect(pos.y).toBeGreaterThanOrEqual(0);
			expect(pos.y).toBeLessThan(20);
		});
	});
});
