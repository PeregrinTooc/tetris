// Jest unit test helpers for deterministic Tetris board and tetromino testing
import { describe, beforeEach, test, expect, jest } from "@jest/globals";
import { Board } from "../src/board";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { PreviewBoardImpl } from "../src/preview-board";
import { KeyBindingManager } from "../src/key-binding-manager";

// Create a test board with stub queue and preview
interface CreateTestBoardOptions {
	height?: number;
	width?: number;
	seeds?: number[];
	element?: HTMLElement;
	preview?: boolean;
	keyBindings?: boolean;
}
export function createTestBoard({
	height = 20,
	width = 10,
	seeds = [0],
	element,
	preview = true,
	keyBindings = true,
}: CreateTestBoardOptions = {}): Board {
	const el = element || document.createElement("div");
	const previewBoard = preview ? new PreviewBoardImpl(document.createElement("div")) : null;
	let i = 0;
	const queue = { dequeue: () => seeds[i++] ?? 0 };
	const keyBindingManager = keyBindings ? new KeyBindingManager() : null;
	return new Board(height, width, el, previewBoard, queue, null, keyBindingManager);
}

// Tetromino helpers
import type { Tetromino } from "../src/tetromino-base";
export function createTetromino(board: Board, seed = 0, left = 5): Tetromino {
	return TetrominoFactory.createNew(left, board, seed);
}

export function moveTetromino(tetromino: Tetromino, direction: string) {
	tetromino.move(direction);
}

export function rotateTetromino(tetromino: Tetromino, dir: 1 | -1 = 1) {
	tetromino.rotate(dir);
}

export function hardDropTetromino(tetromino: Tetromino) {
	tetromino.drop();
}

export function lockTetromino(tetromino: Tetromino) {
	tetromino.lock();
}

export function holdPiece(board: Board) {
	board.hold();
}

// Event helpers
export function listenForEvent(element: HTMLElement, eventName: string): Promise<Event> {
	return new Promise((resolve) => {
		element.addEventListener(eventName, resolve, { once: true });
	});
}

// Assertion helpers
export function expectTetrominoPosition(
	tetromino: Tetromino,
	pos: { left?: number; top?: number }
) {
	if (pos.left !== undefined) expect(tetromino.left).toBe(pos.left);
	if (pos.top !== undefined) expect(tetromino.top).toBe(pos.top);
}

export function expectTetrominoLocked(tetromino: Tetromino) {
	expect(tetromino.locked).toBe(true);
}

export function expectTetrominoBlocks(
	tetromino: Tetromino,
	expectedBlocks: { x: number; y: number }[]
) {
	const blocks = tetromino.getBlocks().map(({ x, y }) => ({ x, y }));
	expect(blocks).toEqual(expectedBlocks);
}

export function expectLinesCleared(event: CustomEvent, expected: number) {
	expect(event.detail.linesCompleted).toBe(expected);
}
