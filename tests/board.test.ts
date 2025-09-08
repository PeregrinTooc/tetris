import { describe, beforeEach, test, expect, jest } from "@jest/globals";
import { Board } from "../src/board";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { PreviewBoardImpl } from "../src/preview-board";
import { KeyBindingManager } from "../src/key-binding-manager";

describe("Board", () => {
	let board: Board;
	let stubQueue: any;
	let keyBindingManager: KeyBindingManager;
	const element = document.createElement("div");
	const previewBoard = new PreviewBoardImpl(document.createElement("div"));

	beforeEach(() => {
		keyBindingManager = new KeyBindingManager();
		stubQueue = { dequeue: () => 1337 };
		board = new Board(20, 11, element, previewBoard, stubQueue);
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
		tetromino1.move("down");
		tetromino1.lock();
		const tetromino2 = TetrominoFactory.createNew(5, board, 1337);
		tetromino2.move("down");
		tetromino2.addEventListener("locked", (event) => {
			const customEvent = event as CustomEvent;
			customEvent.detail.forEach((block: { x: number; y: number }) => {
				expect(block.y).toBe(0);
				expect(block.x).toBe(5);
			});
		});
		tetromino2.lock();
	});

	test("locks tetromino at the bottom and prevents further movement", () => {
		const tetromino = TetrominoFactory.createNew(5, board, 1337);
		tetromino.activateKeyboardControl(keyBindingManager);
		document.dispatchEvent(new KeyboardEvent("keydown", { key: " " })); // hard drop
		expect(tetromino.locked).toBe(true);
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
		expect(tetromino.left).toBe(5);
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
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

	test("T tetromino drop results in correct blocks on the floor", () => {
		const tetromino = TetrominoFactory.createNew(5, board, 0);
		tetromino.activateKeyboardControl(keyBindingManager);
		document.dispatchEvent(new KeyboardEvent("keydown", { key: " " })); // hard drop
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

	describe("spawnTetromino", () => {
		test("spawns first tetromino when no nextTetromino exists", () => {
			// Use board without preview board to avoid null container issues
			const simpleBoard = new Board(20, 11, element, null, stubQueue);
			const spawnedTetromino = simpleBoard.spawnTetromino();
			expect(spawnedTetromino).toBeDefined();
			expect(spawnedTetromino.left).toBe(Math.floor(11 / 2)); // center of board
		});

		test("uses nextTetromino when it exists", () => {
			// Use board without preview board to avoid null container issues
			const simpleBoard = new Board(20, 11, element, null, stubQueue);

			// Spawn first tetromino to create nextTetromino
			const firstTetromino = simpleBoard.spawnTetromino();

			// Store reference to the nextTetromino
			const nextTetromino = (simpleBoard as any).nextTetromino;
			expect(nextTetromino).toBeDefined();

			// Lock the first tetromino, which should trigger spawning the next one
			firstTetromino.lock();
			const secondTetromino = simpleBoard.getActiveTetromino();
			expect(secondTetromino).toBe(nextTetromino);
		});

		test("removes nextTetromino from preview board when spawning", () => {
			// Mock the preview board to test element removal
			const mockPreviewBoard = {
				previewContainer: {
					contains: jest.fn().mockReturnValue(true),
					removeChild: jest.fn()
				},
				showNextTetromino: jest.fn()
			};

			const boardWithPreview = new Board(20, 11, element, mockPreviewBoard as any, stubQueue);

			// Spawn first tetromino to create nextTetromino
			const firstTetromino = boardWithPreview.spawnTetromino();
			firstTetromino.lock();

			// Spawn second tetromino
			boardWithPreview.spawnTetromino();

			// Verify removeChild was called
			expect(mockPreviewBoard.previewContainer.removeChild).toHaveBeenCalled();
		});

		test("shows next tetromino in preview board when spawning", () => {
			const mockPreviewBoard = {
				previewContainer: {
					contains: jest.fn().mockReturnValue(false),
					removeChild: jest.fn()
				},
				showNextTetromino: jest.fn()
			};

			const boardWithPreview = new Board(20, 11, element, mockPreviewBoard as any, stubQueue);
			boardWithPreview.spawnTetromino();

			// Verify showNextTetromino was called
			expect(mockPreviewBoard.showNextTetromino).toHaveBeenCalled();
		});
	});
});
