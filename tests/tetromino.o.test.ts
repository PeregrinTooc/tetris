import { describe, beforeEach, test, expect, jest } from "@jest/globals";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { Board } from "../src/board";
import { KeyBindingManager } from "../src/key-binding-manager";

describe("O-shaped Tetromino", () => {
	let board: Board;
	let keyBindingManager: KeyBindingManager;

	beforeEach(() => {
		board = new Board(20, 10, { appendChild: jest.fn() } as any, null, { dequeue: () => 2 });
		keyBindingManager = new KeyBindingManager();
	});

	test("should create a 2x2 square shape", () => {
		const tetromino = TetrominoFactory.createNew(5, board, 2);
		expect(tetromino.getBlocks()).toEqual([
			{ x: 5, y: 1, parent: tetromino },
			{ x: 6, y: 1, parent: tetromino },
			{ x: 6, y: 0, parent: tetromino },
			{ x: 5, y: 0, parent: tetromino },
		]);
	});

	test("should not rotate (remain same shape)", () => {
		const tetromino = TetrominoFactory.createNew(5, board, 2);
		const originalShape = tetromino.getBlocks();
		tetromino.activateKeyboardControl(keyBindingManager);
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
		expect(tetromino.getBlocks()).toEqual(originalShape);
	});
});