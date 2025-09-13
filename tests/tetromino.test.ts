import { describe, beforeEach, test, expect, jest } from "@jest/globals";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { Board } from "../src/board";
import { PreviewBoardImpl } from "../src/preview-board";
import { Tetromino } from "../src/tetromino-base";
import { KeyBindingManager } from "../src/key-binding-manager";

describe("Tetromino", () => {
	let tetromino: Tetromino;
	let board: Board;
	let keyBindingManager: KeyBindingManager;
	const element = document.createElement("div");
	const nextPiece = document.createElement("div");
	const boardWidth = 11;
	nextPiece.id = "next-piece";
	element.appendChild(nextPiece);
	let stubQueue: any;
	beforeEach(() => {
		keyBindingManager = new KeyBindingManager();
		stubQueue = { dequeue: () => 1337 };
		board = new Board(
			20,
			boardWidth,
			document.createElement("div"),
			new PreviewBoardImpl(element),
			stubQueue
		);
		tetromino = TetrominoFactory.createNew(5, board, 1337);
	});
	test("should create with correct initial position", () => {
		expect(tetromino.left).toBe(5);
		expect(tetromino.top).toBe(0);
	});
	test("should delegate movement to board", () => {
		const moveTetrominoSpy = jest.spyOn(board, "moveTetromino");
		tetromino.activateKeyboardControl(keyBindingManager);
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
		expect(moveTetrominoSpy as any).toHaveBeenCalledWith(tetromino, "left");
	});
	test("should lock tetromino", () => {
		tetromino.activateKeyboardControl(keyBindingManager);
		tetromino.lock();
		const moveTetrominoSpy = jest.spyOn(board, "moveTetromino");
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
		expect(moveTetrominoSpy).not.toHaveBeenCalled();
	});
	test("should not move left past the left border", () => {
		tetromino.activateKeyboardControl(keyBindingManager);
		tetromino.left = 0;
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
		expect(tetromino.left).toBe(0);
	});
	test("should not move right past the right border", () => {
		tetromino.activateKeyboardControl(keyBindingManager);
		tetromino.left = boardWidth - 1;
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
		expect(tetromino.left).toBe(boardWidth - 1);
	});
	test("I tetromino blocks should not go out of left border", () => {
		// Place I tetromino so all blocks are in-bounds
		tetromino = TetrominoFactory.createNew(2, board, 1); // 1 = I
		tetromino.activateKeyboardControl(keyBindingManager);
		tetromino.left = 1; // leftmost block at 0
		const before = tetromino.getBlocks().map((b: { x: number }) => b.x);
		expect(Math.min(...before)).toBe(0);
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
		const after = tetromino.getBlocks().map((b: { x: number }) => b.x);
		// Should not move, still at left edge
		expect(Math.min(...after)).toBe(0);
	});
	test("I tetromino blocks should not go out of right border", () => {
		// Place I tetromino so all blocks are in-bounds
		tetromino = TetrominoFactory.createNew(boardWidth - 3, board, 1); // 1 = I
		tetromino.activateKeyboardControl(keyBindingManager);
		tetromino.left = boardWidth - 3; // rightmost block at width-1
		const before = tetromino.getBlocks().map((b: { x: number }) => b.x);
		expect(Math.max(...before)).toBe(boardWidth - 1);
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
		const after = tetromino.getBlocks().map((b: { x: number }) => b.x);
		// Should not move, still at right edge
		expect(Math.max(...after)).toBe(boardWidth - 1);
	});
	test("should allow tetromino to soft drop down", () => {
		tetromino.activateKeyboardControl(keyBindingManager);
		const initialTop = tetromino.top;
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
		expect(tetromino.top).toBe(initialTop + 1);
	});

	describe("startFalling", () => {
		test("should add tick event listener when tetromino starts falling", () => {
			const addEventListenerSpy = jest.spyOn(document, "addEventListener");
			tetromino.startFalling();
			expect(addEventListenerSpy).toHaveBeenCalledWith("tick", expect.any(Function));
			addEventListenerSpy.mockRestore();
		});

		test("should move tetromino down on tick event", () => {
			const moveTetrominoSpy = jest.spyOn(board, "moveTetromino").mockReturnValue(true);
			tetromino.startFalling();
			document.dispatchEvent(new CustomEvent("tick"));
			expect(moveTetrominoSpy as any).toHaveBeenCalledWith(tetromino, "down");
			moveTetrominoSpy.mockRestore();
		});

		test("should lock tetromino when it cannot move down on tick", () => {
			const moveTetrominoSpy = jest.spyOn(board, "moveTetromino").mockReturnValue(false);
			const lockSpy = jest.spyOn(tetromino, "lock");
			tetromino.startFalling();
			document.dispatchEvent(new CustomEvent("tick"));
			expect(lockSpy).toHaveBeenCalled();
			moveTetrominoSpy.mockRestore();
			lockSpy.mockRestore();
		});

		test("should not add tick listener if tetromino is already locked", () => {
			tetromino.lock();
			const addEventListenerSpy = jest.spyOn(document, "addEventListener");
			tetromino.startFalling();
			expect(addEventListenerSpy).not.toHaveBeenCalledWith("tick", expect.any(Function));
			addEventListenerSpy.mockRestore();
		});

		test("should not add tick listener if tetromino has no board", () => {
			tetromino.board = null;
			const addEventListenerSpy = jest.spyOn(document, "addEventListener");
			tetromino.startFalling();
			expect(addEventListenerSpy).not.toHaveBeenCalledWith("tick", expect.any(Function));
			addEventListenerSpy.mockRestore();
		});

		test("should not respond to tick events when locked", () => {
			const moveTetrominoSpy = jest.spyOn(board, "moveTetromino");
			tetromino.startFalling();
			tetromino.lock();
			document.dispatchEvent(new CustomEvent("tick"));
			expect(moveTetrominoSpy).not.toHaveBeenCalled();
			moveTetrominoSpy.mockRestore();
		});

		test("should not respond to tick events when board is null", () => {
			const moveTetrominoSpy = jest.spyOn(board, "moveTetromino");
			tetromino.startFalling();
			tetromino.board = null;
			document.dispatchEvent(new CustomEvent("tick"));
			expect(moveTetrominoSpy).not.toHaveBeenCalled();
			moveTetrominoSpy.mockRestore();
		});

		test("should not respond to keyboard events when board is null", () => {
			const moveTetrominoSpy = jest.spyOn(board, "moveTetromino");
			tetromino.activateKeyboardControl(keyBindingManager);
			tetromino.board = null;
			document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
			expect(moveTetrominoSpy).not.toHaveBeenCalled();
			moveTetrominoSpy.mockRestore();
		});
	});
});
