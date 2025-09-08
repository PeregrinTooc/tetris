import { describe, beforeEach, test, expect } from "@jest/globals";
import { TetrominoJ } from "../src/tetromino-j";
import { Board } from "../src/board";
import { PreviewBoardImpl } from "../src/preview-board";
import { TetrominoFactory } from "../src/tetrominoFactory";

describe("TetrominoJ", () => {
	let tetromino: TetrominoJ;
	let board: Board;
	const element = document.createElement("div");
	const nextPiece = document.createElement("div");
	nextPiece.id = "next-piece";
	element.appendChild(nextPiece);
	let stubQueue: any;
	beforeEach(() => {
		stubQueue = { dequeue: () => 4 };
		board = new Board(
			20,
			11,
			document.createElement("div"),
			new PreviewBoardImpl(element),
			stubQueue
		);
		tetromino = TetrominoFactory.createNew(5, board, 3) as TetrominoJ;
	});
	test("should create J tetromino with correct initial position and shape", () => {
		expect(tetromino.left).toBe(5);
		expect(tetromino.top).toBe(0);
		const positions = tetromino.getBlocks();
		expect(positions).toEqual([
			{ x: 5, y: 0, parent: tetromino },
			{ x: 4, y: 0, parent: tetromino },
			{ x: 6, y: 0, parent: tetromino },
			{ x: 6, y: 1, parent: tetromino },
		]);
	});
	test("rotation 0: correct block positions", () => {
		tetromino.rotation = 0;
		tetromino.top = 2;
		expect(tetromino.getBlocks()).toEqual([
			{ x: 5, y: 2, parent: tetromino },
			{ x: 4, y: 2, parent: tetromino },
			{ x: 6, y: 2, parent: tetromino },
			{ x: 6, y: 3, parent: tetromino },
		]);
	});
	test("rotation 1: correct block positions", () => {
		tetromino.rotation = 1;
		tetromino.top = 2;
		expect(tetromino.getBlocks()).toEqual([
			{ x: 5, y: 2, parent: tetromino },
			{ x: 5, y: 3, parent: tetromino },
			{ x: 5, y: 1, parent: tetromino },
			{ x: 6, y: 1, parent: tetromino },
		]);
	});
	test("rotation 2: correct block positions", () => {
		tetromino.rotation = 2;
		tetromino.top = 2;
		expect(tetromino.getBlocks()).toEqual([
			{ x: 5, y: 2, parent: tetromino },
			{ x: 6, y: 2, parent: tetromino },
			{ x: 4, y: 2, parent: tetromino },
			{ x: 4, y: 1, parent: tetromino },
		]);
	});
	test("rotation 3: correct block positions", () => {
		tetromino.rotation = 3;
		tetromino.top = 2;
		expect(tetromino.getBlocks()).toEqual([
			{ x: 5, y: 2, parent: tetromino },
			{ x: 5, y: 1, parent: tetromino },
			{ x: 5, y: 3, parent: tetromino },
			{ x: 4, y: 3, parent: tetromino },
		]);
	});
});
