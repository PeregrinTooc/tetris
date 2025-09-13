import { describe, beforeEach, afterEach, test, expect, jest } from "@jest/globals";
import { Board } from "../src/board";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { PreviewBoardImpl } from "../src/preview-board";

describe("Board logging", () => {
	let element: HTMLElement;
	let previewBoard: PreviewBoardImpl;
	let stubQueue: any;

	beforeEach(() => {
		element = document.createElement("div");
		previewBoard = new PreviewBoardImpl(document.createElement("div"));
		stubQueue = { dequeue: () => 1337 };
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test("logs board meta information", () => {
		const board = new Board(20, 11, element, previewBoard, stubQueue);

		const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
		const groupSpy = jest.spyOn(console, "group").mockImplementation(() => {});
		const groupEndSpy = jest.spyOn(console, "groupEnd").mockImplementation(() => {});

		(board as any).log();

		expect(logSpy).toHaveBeenCalledWith(
			"meta",
			expect.objectContaining({ height: 20, width: 11 })
		);
		expect(groupSpy).toHaveBeenCalledWith("Board");
		expect(groupEndSpy).toHaveBeenCalled();
	});

	test("groups occupied positions by y and sorts blocks by x ascending", () => {
		const board = new Board(20, 11, element, previewBoard, stubQueue);

		// Spy on console methods
		const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "group").mockImplementation(() => {});
		jest.spyOn(console, "groupCollapsed").mockImplementation(() => {});
		jest.spyOn(console, "groupEnd").mockImplementation(() => {});

		// Create two single-block tetrominoes at the same y but different x
		const t1 = TetrominoFactory.createNew(2, board, 1337); // x=2
		t1.top = 5;
		// ensure blocks updated before locking
		t1.updateBlocks();
		t1.lock();

		const t2 = TetrominoFactory.createNew(1, board, 1337); // x=1
		t2.top = 5;
		t2.updateBlocks();
		t2.lock();

		// Clear any prior console calls emitted during tetromino creation/lock
		logSpy.mockClear && logSpy.mockClear();

		// Call log
		(board as any).log();

		// Find block log calls and extract the payloads (only those produced by Board.log)
		const blockLogs = (logSpy.mock.calls as any[]).filter((call) => call[0] === "  Block ->");
		// Should have two block logs
		expect(blockLogs.length).toBeGreaterThanOrEqual(2);
		const payloads = blockLogs.map((c) => c[1]);

		// The occupied-positions block logs should be the last two block logs emitted
		const lastTwo = payloads.slice(-2);
		expect(lastTwo[0]).toEqual(expect.objectContaining({ x: 1, y: 5 }));
		expect(lastTwo[1]).toEqual(expect.objectContaining({ x: 2, y: 5 }));
	});
});
