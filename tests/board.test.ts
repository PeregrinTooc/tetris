import { describe, beforeEach, test, expect, jest } from "@jest/globals";
import { Board } from "../src/board";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { PreviewBoard } from "../src/preview-board";

describe("Board", () => {
	let board: Board;
	let stubQueue: any;
	const element = document.createElement("div");
	const previewBoard = new PreviewBoard(document.createElement("div"));

	beforeEach(() => {
		stubQueue = { dequeue: () => 1337 };
		board = new Board(20, 11, element, previewBoard, stubQueue);
	});

	test("adds a tetromino element to the board DOM", () => {
		const tetromino = TetrominoFactory.createNew(5, board, 1337);
		expect(board.tetrominos.size).toEqual(1);
	});

	test("moves tetromino left within board boundaries", () => {
		const tetromino = TetrominoFactory.createNew(5, board, 1337);
		expect(board.moveTetromino(tetromino, "left")).toBe(true);
		expect(tetromino.left).toBe(4);
	});

	test("prevents tetromino from moving left outside board boundaries", () => {
		const tetromino = TetrominoFactory.createNew(0, board, 1337);
		expect(board.moveTetromino(tetromino, "left")).toBe(false);
		expect(tetromino.left).toBe(0);
	});

	test("prevents tetromino from moving left or right outside board boundaries (via moveTetromino)", () => {
		const tetromino = TetrominoFactory.createNew(0, board, 1337);
		const leftResult = board.moveTetromino(tetromino, "left");
		expect(leftResult).toBe(false);
		expect(tetromino.left).toBe(0);
		tetromino.left = 10;
		const rightResult = board.moveTetromino(tetromino, "right");
		expect(rightResult).toBe(false);
		expect(tetromino.left).toBe(10);
	});

	test("detects collision when tetromino moves down onto a locked tetromino", () => {
		const tetromino1 = TetrominoFactory.createNew(5, board, 1337);
		tetromino1.top = 1;
		tetromino1.lock();
		const tetromino2 = TetrominoFactory.createNew(5, board, 1337);
		tetromino2.top = 0;
		expect(board._canMove("down")).toBe(false);
	});

	test("dispatches game over event when a tetromino is added at the top row", () => {
		const mockDispatchEvent = jest.fn() as unknown as (event: Event) => boolean;
		board.element.dispatchEvent = mockDispatchEvent;
		const tetromino = TetrominoFactory.createNew(5, board, 1337);
		board._raiseGameOverIfStackReachesTop();
		expect(mockDispatchEvent).toHaveBeenCalled();
	});

	test("locks tetromino at the bottom and prevents further movement", () => {
		const tetromino = TetrominoFactory.createNew(5, board, 1337);
		tetromino.drop();
		expect(tetromino.locked).toBe(true);
		tetromino.move("left");
		expect(tetromino.left).toBe(5);
		tetromino.move("right");
		expect(tetromino.left).toBe(5);
	});

	test("prevents movement when another tetromino blocks the path (left/right)", () => {
		const blockingTetromino = TetrominoFactory.createNew(
			5,
			board,
			1337
		);
		blockingTetromino.lock();
		const movingTetromino = TetrominoFactory.createNew(
			4,
			board,
			1337
		);
		expect(board.moveTetromino(movingTetromino, "right")).toBe(false);
		movingTetromino.left = 6;
		expect(board.moveTetromino(movingTetromino, "left")).toBe(false);
	});

	test("reset clears all tetrominos and board DOM", () => {
		const tetromino = TetrominoFactory.createNew(5, board, 1337);
		board.tetrominos.add(tetromino);
		board.reset();
		expect(board.tetrominos.size).toBe(0);
		expect(element.innerHTML).toBe("");
	});

	test("T tetromino drop results in correct blocks on the floor", () => {
		const tetromino = TetrominoFactory.createNew(5, board, 0);
		tetromino.drop();
		const positions = tetromino.getBlocks();
		const floorBlocks = positions.filter((p) => p.y === 20);
		const aboveFloorBlocks = positions.filter((p) => p.y === 19);
		expect(floorBlocks.length).toBe(1); // Only the pivot block is at y === 20
		expect(aboveFloorBlocks.length).toBe(3); // The arms are at y === 19
	});

	test("blocksMovement returns true if any block of a tetromino would collide moving right (T shape, left arm)", () => {
		const tTetromino = TetrominoFactory.createNew(5, board, 0);
		tTetromino.top = 10;
		tTetromino.lock();
		const singleTetromino = TetrominoFactory.createNew(
			4,
			board,
			1337
		);
		singleTetromino.top = 10;
		singleTetromino.left = 3;
		expect(board.moveTetromino(singleTetromino, "right")).toBe(false);
	});

	test("blocksMovement returns true if any block of a tetromino would collide moving left (T shape, right arm)", () => {
		const tTetromino = TetrominoFactory.createNew(5, board, 0);
		tTetromino.top = 10;
		tTetromino.lock();
		const singleTetromino = TetrominoFactory.createNew(
			6,
			board,
			1337
		);
		singleTetromino.top = 10;
		singleTetromino.left = 7;
		expect(board.moveTetromino(singleTetromino, "left")).toBe(false);
	});

	test("blocksMovement returns true if any block of a tetromino would collide moving down (T shape, left arm)", () => {
		const tTetromino = TetrominoFactory.createNew(5, board, 0);
		tTetromino.top = 10;
		tTetromino.lock();
		const singleTetromino = TetrominoFactory.createNew(
			4,
			board,
			1337
		);
		singleTetromino.top = 9;
		expect(board.moveTetromino(singleTetromino, "down")).toBe(false);
	});
});
