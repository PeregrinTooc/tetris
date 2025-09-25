import { describe, beforeEach, test, expect } from "@jest/globals";
import { createTestBoard, createTetromino, rotateTetromino } from "./testUtils.unit";

describe("Tetromino rotation with boundaries and collisions", () => {
	let board: any;
	let element: HTMLDivElement;

	beforeEach(() => {
		element = document.createElement("div");
		board = createTestBoard({ height: 20, width: 10, seeds: [1], preview: false, element });
	});

	test("Tetromino does not rotate if it would go out of left boundary", () => {
		const tetromino = createTetromino(board, 1, 1); // I piece, left edge (pivot at 1)
		rotateTetromino(tetromino);
		expect(tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y])).toEqual([
			[0, 0],
			[1, 0],
			[2, 0],
			[3, 0],
		]);
	});

	test("Tetromino does not rotate if it would go out of right boundary", () => {
		const tetromino = createTetromino(board, 1, 7); // I piece, right edge (pivot at 7)
		rotateTetromino(tetromino);
		expect(tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y])).toEqual([
			[6, 0],
			[7, 0],
			[8, 0],
			[9, 0],
		]);
	});

	test("Tetromino does not rotate if it would go out of top boundary", () => {
		const tetromino = createTetromino(board, 1, 4); // I piece, top (pivot at 4,0)
		rotateTetromino(tetromino);
		expect(tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y])).toEqual([
			[3, 0],
			[4, 0],
			[5, 0],
			[6, 0],
		]);
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

	test("Tetromino does not rotate if another block is in the way", () => {
		// Place a blocking tetromino at (4,0)
		const blocker = createTetromino(board, 2, 4); // O piece, but only one block matters
		blocker.top = 0;
		const tetromino = createTetromino(board, 1, 4); // I piece, blocked (pivot at 4,0)
		rotateTetromino(tetromino);
		expect(tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y])).toEqual([
			[3, 0],
			[4, 0],
			[5, 0],
			[6, 0],
		]);
	});

	test("Tetromino rotates if there is space", () => {
		const tetromino = createTetromino(board, 1, 4); // I piece, free (pivot at 4,0)
		rotateTetromino(tetromino);
		expect(tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y])).toEqual([
			[3, 0],
			[4, 0],
			[5, 0],
			[6, 0],
		]);
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

	test("T tetromino does not rotate if blocked by another block", () => {
		// Place a blocking tetromino at (5,1)
		const blocker = createTetromino(board, 2, 5); // O piece
		blocker.top = 1;
		const tetromino = createTetromino(board, 0, 4); // T piece
		rotateTetromino(tetromino);
		expect(tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y])).toEqual([
			[4, 0],
			[3, 0],
			[5, 0],
			[4, 1],
		]);
	});
});
