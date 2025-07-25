import { describe, beforeEach, test, expect, jest } from "@jest/globals";
import { Board } from "../src/board";
import { TetrominoFactory } from "../src/tetromino";

describe("Board", () => {
	let board: Board;
	let mockElement: any;
	let mockPreviewBoard: any;
	let mockDocument: any;
	let stubQueue: any;

	beforeEach(() => {
		mockDocument = {
			createElement: jest.fn(() => ({
				style: {},
				className: "",
				setAttribute: jest.fn(),
				dispatchEvent: jest.fn(),
				remove: jest.fn(),
				appendChild: jest.fn(),
				firstChild: null,
				removeChild: jest.fn(),
			})),
		};
		mockElement = {
			appendChild: jest.fn(),
			innerHTML: "",
			dispatchEvent: jest.fn(),
		};
		mockPreviewBoard = {
			showNextTetromino: jest.fn(),
		};
		stubQueue = { dequeue: () => 1337 };
		board = new Board(20, 11, mockElement, mockPreviewBoard, stubQueue);
	});

	test("adds a tetromino element to the board DOM", () => {
		const tetromino = TetrominoFactory.createNew(5, mockDocument, board, 1337);
		board.addTetromino(tetromino);
		expect(mockElement.appendChild).toHaveBeenCalledWith(tetromino.element);
	});

	test("moves tetromino left within board boundaries", () => {
		const tetromino = TetrominoFactory.createNew(5, mockDocument, board, 1337);
		expect(board.moveTetromino(tetromino, "left")).toBe(true);
		expect(tetromino.left).toBe(4);
	});

	test("prevents tetromino from moving left outside board boundaries", () => {
		const tetromino = TetrominoFactory.createNew(0, mockDocument, board, 1337);
		expect(board.moveTetromino(tetromino, "left")).toBe(false);
		expect(tetromino.left).toBe(0);
	});

	test("prevents tetromino from moving left or right outside board boundaries (via moveTetromino)", () => {
		const tetromino = TetrominoFactory.createNew(0, mockDocument, board, 1337);
		const leftResult = board.moveTetromino(tetromino, "left");
		expect(leftResult).toBe(false);
		expect(tetromino.left).toBe(0);
		tetromino.left = 10;
		const rightResult = board.moveTetromino(tetromino, "right");
		expect(rightResult).toBe(false);
		expect(tetromino.left).toBe(10);
	});

	test("detects collision when tetromino moves down onto a locked tetromino", () => {
		const tetromino1 = TetrominoFactory.createNew(5, mockDocument, board, 1337);
		tetromino1.top = 1;
		tetromino1.lock();
		const tetromino2 = TetrominoFactory.createNew(5, mockDocument, board, 1337);
		tetromino2.top = 0;
		expect(board._canMove(tetromino2, "down")).toBe(false);
	});

	test("dispatches game over event when a tetromino is added at the top row", () => {
			const mockDispatchEvent = jest.fn() as unknown as (event: Event) => boolean;
			board.element.dispatchEvent = mockDispatchEvent;
			const tetromino = { top: 0, left: 5 };
			board._raiseGameOverIfStackReachesTop(tetromino);
			expect(mockDispatchEvent).toHaveBeenCalled();
	});

	test("locks tetromino at the bottom and prevents further movement", () => {
		const tetromino = TetrominoFactory.createNew(5, mockDocument, board, 1337);
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
			mockDocument,
			board,
			1337
		);
		blockingTetromino.lock();
		const movingTetromino = TetrominoFactory.createNew(
			4,
			mockDocument,
			board,
			1337
		);
		expect(board.moveTetromino(movingTetromino, "right")).toBe(false);
		movingTetromino.left = 6;
		expect(board.moveTetromino(movingTetromino, "left")).toBe(false);
	});

	test("reset clears all tetrominos and board DOM", () => {
		const tetromino = TetrominoFactory.createNew(5, mockDocument, board, 1337);
		board.tetrominos.add(tetromino);
		board.reset();
		expect(board.tetrominos.size).toBe(0);
		expect(mockElement.innerHTML).toBe("");
	});

	test("T tetromino drop results in correct blocks on the floor", () => {
		const tetromino = TetrominoFactory.createNew(5, mockDocument, board, 0);
		tetromino.drop();
		const positions = tetromino.getBlockPositions();
		const floorBlocks = positions.filter((p) => p.y === 20);
		const aboveFloorBlocks = positions.filter((p) => p.y === 19);
		expect(floorBlocks.length).toBe(1); // Only the pivot block is at y === 20
		expect(aboveFloorBlocks.length).toBe(3); // The arms are at y === 19
	});

	test("blocksMovement returns true if any block of a tetromino would collide moving right (T shape, left arm)", () => {
		const tTetromino = TetrominoFactory.createNew(5, mockDocument, board, 0);
		tTetromino.top = 10;
		const singleTetromino = TetrominoFactory.createNew(
			4,
			mockDocument,
			board,
			1337
		);
		singleTetromino.top = 10;
		singleTetromino.left = 3;
		const result = tTetromino.blocksMovement("right", singleTetromino);
		expect(result).toBe(true);
	});

	test("blocksMovement returns true if any block of a tetromino would collide moving left (T shape, right arm)", () => {
		const tTetromino = TetrominoFactory.createNew(5, mockDocument, board, 0);
		tTetromino.top = 10;
		const singleTetromino = TetrominoFactory.createNew(
			6,
			mockDocument,
			board,
			1337
		);
		singleTetromino.top = 10;
		singleTetromino.left = 7;
		const result = tTetromino.blocksMovement("left", singleTetromino);
		expect(result).toBe(true);
	});

	test("blocksMovement returns true if any block of a tetromino would collide moving down (T shape, left arm)", () => {
		const tTetromino = TetrominoFactory.createNew(5, mockDocument, board, 0);
		tTetromino.top = 10;
		const singleTetromino = TetrominoFactory.createNew(
			4,
			mockDocument,
			board,
			1337
		);
		singleTetromino.top = 9;
		const tBlocks = tTetromino.getBlockPositions();
		const sBlocks = singleTetromino.getBlockPositions();
		const sBlocksMoved = sBlocks.map(({ x, y }) => ({ x, y: y + 1 }));
		const result = tTetromino.blocksMovement("down", singleTetromino);
		expect(result).toBe(true);
	});
});
