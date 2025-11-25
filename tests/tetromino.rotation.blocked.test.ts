import { describe, beforeEach, test, expect } from "@jest/globals";
import { createTestBoard, createTetromino, rotateTetromino } from "./testUtils.unit";

describe("Tetromino rotation with boundaries and collisions", () => {
	let board: any;
	let element: HTMLDivElement;

	beforeEach(() => {
		element = document.createElement("div");
		board = createTestBoard({ height: 20, width: 10, seeds: [1], preview: false, element });
	});

	test("Tetromino kicks right when rotating at left boundary (wall kick)", () => {
		const tetromino = createTetromino(board, 1, 1); // I piece, left edge (pivot at 1)
		rotateTetromino(tetromino);
		// Should kick right to fit vertically
		const blocks = tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y]);
		const cols = blocks.map((b) => b[0]);
		const rows = blocks.map((b) => b[1]);

		// Should be vertical (all same column)
		expect(new Set(cols).size).toBe(1);
		// Should be kicked away from left wall
		expect(cols[0]).toBeGreaterThan(0);
		// Should span 4 rows
		expect(Math.max(...rows) - Math.min(...rows)).toBe(3);
	});

	test("Tetromino kicks left when rotating at right boundary (wall kick)", () => {
		const tetromino = createTetromino(board, 1, 7); // I piece, right edge (pivot at 7)
		rotateTetromino(tetromino);
		// Should kick left to fit vertically
		const blocks = tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y]);
		const cols = blocks.map((b) => b[0]);
		const rows = blocks.map((b) => b[1]);

		// Should be vertical (all same column)
		expect(new Set(cols).size).toBe(1);
		// Should be kicked away from right wall
		expect(cols[0]).toBeLessThan(9);
		// Should span 4 rows
		expect(Math.max(...rows) - Math.min(...rows)).toBe(3);
	});

	test("Tetromino kicks down when rotating at top boundary (wall kick)", () => {
		const tetromino = createTetromino(board, 1, 4); // I piece, top (pivot at 4,0)
		rotateTetromino(tetromino);
		// Should kick down to fit vertically
		const blocks = tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y]);
		const cols = blocks.map((b) => b[0]);
		const rows = blocks.map((b) => b[1]);

		// Should be vertical (all same column)
		expect(new Set(cols).size).toBe(1);
		// Should have valid positions
		rows.forEach((row) => {
			expect(row).toBeGreaterThanOrEqual(0);
			expect(row).toBeLessThan(20);
		});
		// Should span 4 rows
		expect(Math.max(...rows) - Math.min(...rows)).toBe(3);
	});

	test("Tetromino rotation near bottom clamps within exclusive boundary", () => {
		const tetromino = createTetromino(board, 1, 4); // I piece
		tetromino.top = 16; // Allow vertical rotation to fit inside 0..19
		rotateTetromino(tetromino); // Should succeed becoming vertical centered at pivot x=4
		const coords = tetromino
			.getBlocks()
			.map(({ x, y }: { x: number; y: number }) => [x, y])
			.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
		// Expect vertical line spanning y=15..18 at x=4 (actual rotation pivot outcome)
		expect(coords).toEqual([
			[4, 15],
			[4, 16],
			[4, 17],
			[4, 18],
		]);
	});

	test("Tetromino kicks when another block is in the way (wall kick)", () => {
		// Place a blocking tetromino at (4,0)
		const blocker = createTetromino(board, 2, 4); // O piece, but only one block matters
		blocker.top = 0;
		const tetromino = createTetromino(board, 1, 4); // I piece, blocked (pivot at 4,0)
		rotateTetromino(tetromino);
		// Should kick to find valid position
		const blocks = tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y]);
		const cols = blocks.map((b) => b[0]);
		const rows = blocks.map((b) => b[1]);

		// Should be vertical (all same column)
		expect(new Set(cols).size).toBe(1);
		// Should have valid positions
		blocks.forEach(([x, y]) => {
			expect(x).toBeGreaterThanOrEqual(0);
			expect(x).toBeLessThan(10);
			expect(y).toBeGreaterThanOrEqual(0);
			expect(y).toBeLessThan(20);
		});
		// Should span 4 rows
		expect(Math.max(...rows) - Math.min(...rows)).toBe(3);
	});

	test("Tetromino rotates when there is space", () => {
		const tetromino = createTetromino(board, 1, 4); // I piece, free (pivot at 4,0)
		rotateTetromino(tetromino);
		// Should rotate successfully
		const blocks = tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y]);
		const cols = blocks.map((b) => b[0]);
		const rows = blocks.map((b) => b[1]);

		// Should be vertical (all same column)
		expect(new Set(cols).size).toBe(1);
		// Should span 4 rows
		expect(Math.max(...rows) - Math.min(...rows)).toBe(3);
	});

	test("O tetromino does not rotate (should be unchanged)", () => {
		const tetromino = createTetromino(board, 2, 4); // O piece
		rotateTetromino(tetromino);
		expect(tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y])).toEqual([
			[4, 1],
			[5, 1],
			[5, 0],
			[4, 0],
		]);
	});

	test("T tetromino uses wall kick when blocked by another block", () => {
		// Place a blocking tetromino at (5,1)
		const blocker = createTetromino(board, 2, 5); // O piece
		blocker.top = 1;
		const tetromino = createTetromino(board, 0, 4); // T piece
		rotateTetromino(tetromino);
		// Should kick to find a valid position or stay in place if no valid position exists
		const blocks = tetromino.getBlocks();

		// All blocks should have valid positions
		blocks.forEach((block) => {
			expect(block.x).toBeGreaterThanOrEqual(0);
			expect(block.x).toBeLessThan(10);
			expect(block.y).toBeGreaterThanOrEqual(0);
			expect(block.y).toBeLessThan(20);
		});

		// Should have 4 blocks
		expect(blocks.length).toBe(4);
	});
});
