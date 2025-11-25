import { describe, beforeEach, test, expect } from "@jest/globals";
import { createTestBoard, createTetromino, rotateTetromino } from "./testUtils.unit";

describe("Wall Kick - I-Piece", () => {
	let board: any;
	let element: HTMLDivElement;

	beforeEach(() => {
		element = document.createElement("div");
		board = createTestBoard({ height: 20, width: 10, seeds: [1], preview: false, element });
	});

	test("should kick right when rotating horizontal to vertical at left wall", () => {
		const tetromino = createTetromino(board, 1, 1);

		// Initial position: horizontal I-piece at left edge
		// Blocks at x: [0, 1, 2, 3], y: 0
		expect(tetromino.left).toBe(1);
		expect(tetromino.rotation).toBe(0);

		const initialBlocks = tetromino
			.getBlocks()
			.map(({ x, y }: { x: number; y: number }) => [x, y]);
		expect(initialBlocks).toEqual([
			[0, 0],
			[1, 0],
			[2, 0],
			[3, 0],
		]);

		// Attempt rotation - should kick right to make room for vertical orientation
		rotateTetromino(tetromino);

		// After kick: should be vertical at x=2 (kicked right from x=1)
		expect(tetromino.rotation).toBe(1);
		expect(tetromino.left).toBeGreaterThan(1); // Kicked right

		const finalBlocks = tetromino
			.getBlocks()
			.map(({ x, y }: { x: number; y: number }) => [x, y]);

		// Should be vertical (all blocks in same column)
		const uniqueX = new Set(finalBlocks.map(([x]) => x));
		expect(uniqueX.size).toBe(1);

		// Should span 4 rows vertically
		const yValues = finalBlocks.map(([, y]) => y).sort((a, b) => a - b);
		expect(yValues[3] - yValues[0]).toBe(3);
	});

	test("should kick left when rotating horizontal to vertical at right wall", () => {
		const tetromino = createTetromino(board, 1, 8);

		// Initial position: horizontal I-piece at right edge
		// Blocks at x: [7, 8, 9, 10] where 10 is out of bounds (width=10, so valid cols are 0-9)
		expect(tetromino.left).toBe(8);
		expect(tetromino.rotation).toBe(0);

		// Attempt rotation - should kick left to make room for vertical orientation
		rotateTetromino(tetromino);

		// After kick: should be vertical at x < 9
		expect(tetromino.rotation).toBe(1);
		expect(tetromino.left).toBeLessThan(9); // Kicked left

		const finalBlocks = tetromino
			.getBlocks()
			.map(({ x, y }: { x: number; y: number }) => [x, y]);

		// Should be vertical (all blocks in same column)
		const uniqueX = new Set(finalBlocks.map(([x]) => x));
		expect(uniqueX.size).toBe(1);

		// Column should be < 9
		expect(finalBlocks[0][0]).toBeLessThan(9);

		// Should span 4 rows vertically
		const yValues = finalBlocks.map(([, y]) => y).sort((a, b) => a - b);
		expect(yValues[3] - yValues[0]).toBe(3);
	});
});
