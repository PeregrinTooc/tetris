// tests/tetromino.rotation.blocked.test.js
// Dedicated tests for tetromino rotation blocked by board boundaries or other tetrominos

import { describe, beforeEach, test, expect } from "@jest/globals";
import { Board } from "../src/board";
import { TetrominoFactory } from "../src/tetrominoFactory";

describe("Tetromino rotation with boundaries and collisions", () => {
	let board: Board;
	let element: HTMLDivElement;
	let stubQueue: any;
	let previewBoard: any;

	beforeEach(() => {
		element = document.createElement("div");
		stubQueue = { dequeue: () => 1 };
		previewBoard = null;
		board = new Board(20, 10, element, previewBoard, stubQueue);
	});

	test("Tetromino does not rotate if it would go out of left boundary", () => {
		const tetromino = TetrominoFactory.createNew(1, board, 1); // I piece, left edge (pivot at 1)
		tetromino.rotate();
		expect(tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y])).toEqual([
			[0, 0],
			[1, 0],
			[2, 0],
			[3, 0],
		]);
	});

	test("Tetromino does not rotate if it would go out of right boundary", () => {
		const tetromino = TetrominoFactory.createNew(7, board, 1); // I piece, right edge (pivot at 7)
		tetromino.rotate();
		expect(tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y])).toEqual([
			[6, 0],
			[7, 0],
			[8, 0],
			[9, 0],
		]);
	});

	test("Tetromino does not rotate if it would go out of top boundary", () => {
		const tetromino = TetrominoFactory.createNew(4, board, 1); // I piece, top (pivot at 4,0)
		tetromino.rotate();
		expect(tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y])).toEqual([
			[3, 0],
			[4, 0],
			[5, 0],
			[6, 0],
		]);
	});

	test("Tetromino does not rotate if it would go out of bottom boundary", () => {
		const tetromino = TetrominoFactory.createNew(4, board, 1); // I piece, bottom (pivot at 4,18)
		tetromino.top = 18;
		tetromino.rotate();
		expect(tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y])).toEqual([
			[4, 17],
			[4, 18],
			[4, 19],
			[4, 20],
		]);
	});

	test("Tetromino does not rotate if another block is in the way", () => {
		// Place a blocking tetromino at (4,0)
		const blocker = TetrominoFactory.createNew(4, board, 2); // O piece, but only one block matters
		blocker.top = 0;
		board.tetrominos.add(blocker);
		const tetromino = TetrominoFactory.createNew(4, board, 1); // I piece, blocked (pivot at 4,0)
		tetromino.rotate();
		expect(tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y])).toEqual([
			[3, 0],
			[4, 0],
			[5, 0],
			[6, 0],
		]);
	});

	test("Tetromino rotates if there is space", () => {
		const tetromino = TetrominoFactory.createNew(4, board, 1); // I piece, free (pivot at 4,0)
		tetromino.rotate();
		expect(tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y])).toEqual([
			[3, 0],
			[4, 0],
			[5, 0],
			[6, 0],
		]);
	});

	test("O tetromino does not rotate (should be unchanged)", () => {
		const tetromino = TetrominoFactory.createNew(4, board, 2); // O piece
		tetromino.rotate();
		expect(tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y])).toEqual([
			[4, 1],
			[5, 1],
			[5, 0],
			[4, 0],
		]);
	});

	test("T tetromino does not rotate if blocked by another block", () => {
		// Place a blocking tetromino at (5,1)
		const blocker = TetrominoFactory.createNew(5, board, 2); // O piece
		blocker.top = 1;
		board.tetrominos.add(blocker);
		const tetromino = TetrominoFactory.createNew(4, board, 0); // T piece
		tetromino.rotate();
		expect(tetromino.getBlocks().map(({ x, y }: { x: number; y: number }) => [x, y])).toEqual([
			[4, 0],
			[3, 0],
			[5, 0],
			[4, 1],
		]);
	});
});
