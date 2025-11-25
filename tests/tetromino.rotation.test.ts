import { describe, beforeEach, test, expect } from "@jest/globals";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { TetrominoT } from "../src/tetromino-t";
import { Board } from "../src/board";

describe("Tetromino rotation", () => {
	let tetromino: TetrominoT;
	let board: Board;
	let stubQueue: any;
	const element = document.createElement("div");
	const nextPiece = document.createElement("div");
	nextPiece.id = "next-piece";
	element.appendChild(nextPiece);
	beforeEach(() => {
		stubQueue = { dequeue: () => 0 };
		board = new Board(20, 11, document.createElement("div"), null, stubQueue);
		tetromino = TetrominoFactory.createNew(5, board, 0) as TetrominoT;
	});
	test("should rotate T tetromino counter-clockwise", () => {
		const tetromino = TetrominoFactory.createNew(5, board, 0);
		const initialBlocks = tetromino.getBlocks().map((b) => ({ x: b.x, y: b.y }));
		tetromino.rotate();
		const rotatedBlocks = tetromino.getBlocks().map((b) => ({ x: b.x, y: b.y }));

		// Should have 4 blocks
		expect(rotatedBlocks.length).toBe(4);

		// Blocks should have changed position (rotated)
		const initialPositions = initialBlocks
			.map((b) => `${b.x},${b.y}`)
			.sort()
			.join(";");
		const rotatedPositions = rotatedBlocks
			.map((b) => `${b.x},${b.y}`)
			.sort()
			.join(";");
		expect(rotatedPositions).not.toEqual(initialPositions);

		// All blocks should be in valid positions
		rotatedBlocks.forEach((block) => {
			expect(block.x).toBeGreaterThanOrEqual(0);
			expect(block.x).toBeLessThan(11); // board width is 11
			expect(block.y).toBeGreaterThanOrEqual(0);
			expect(block.y).toBeLessThan(20); // board height is 20
		});
	});
});
