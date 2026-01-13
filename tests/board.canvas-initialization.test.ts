import { describe, beforeEach, afterEach, test, expect } from "@jest/globals";
import { Board } from "../src/board";
import { PreviewBoard } from "../src/preview-board";
import { TetrominoSeedQueue } from "../src/TetrominoSeedQueue";
import { SizingConfig } from "../src/sizing-config";

describe("Board canvas initialization", () => {
	let boardElement: HTMLElement;
	let canvas: HTMLCanvasElement;
	let previewBoard: PreviewBoard;
	let seedQueue: TetrominoSeedQueue;

	beforeEach(() => {
		boardElement = document.createElement("div");
		boardElement.id = "game-board";
		canvas = document.createElement("canvas");
		canvas.id = "tetris";
		boardElement.appendChild(canvas);
		document.body.appendChild(boardElement);

		const previewElement = document.createElement("div");
		previewElement.id = "preview-board";
		document.body.appendChild(previewElement);

		previewBoard = {
			showNextTetromino: jest.fn(),
			previewContainer: previewElement,
		} as any;

		seedQueue = {
			enqueue: jest.fn(),
			dequeue: jest.fn(() => 0),
		} as any;
	});

	afterEach(() => {
		document.body.innerHTML = "";
	});

	describe("Desktop viewport", () => {
		beforeEach(() => {
			Object.defineProperty(window, "innerWidth", {
				writable: true,
				configurable: true,
				value: 1024,
			});
		});

		test("sets canvas width to calculated board width", () => {
			const board = new Board(20, 11, boardElement, previewBoard, seedQueue);

			const expectedWidth = SizingConfig.BOARD_WIDTH_PX;
			expect(canvas.width).toBe(expectedWidth);
		});

		test("sets canvas height to calculated board height", () => {
			const board = new Board(20, 11, boardElement, previewBoard, seedQueue);

			const expectedHeight = SizingConfig.BOARD_HEIGHT_PX;
			expect(canvas.height).toBe(expectedHeight);
		});

		test("uses desktop block size for calculations", () => {
			const board = new Board(20, 11, boardElement, previewBoard, seedQueue);

			expect(canvas.width).toBe(SizingConfig.DESKTOP_BLOCK_SIZE * 11);
			expect(canvas.height).toBe(SizingConfig.DESKTOP_BLOCK_SIZE * 20);
		});
	});

	describe("Mobile viewport", () => {
		beforeEach(() => {
			Object.defineProperty(window, "innerWidth", {
				writable: true,
				configurable: true,
				value: 393,
			});
		});

		test("sets canvas width to calculated mobile board width", () => {
			const board = new Board(20, 11, boardElement, previewBoard, seedQueue);

			const expectedWidth = SizingConfig.BOARD_WIDTH_PX;
			expect(canvas.width).toBe(expectedWidth);
			expect(canvas.width < 393).toBe(true);
		});

		test("sets canvas height to calculated mobile board height", () => {
			const board = new Board(20, 11, boardElement, previewBoard, seedQueue);

			const expectedHeight = SizingConfig.BOARD_HEIGHT_PX;
			expect(canvas.height).toBe(expectedHeight);
		});

		test("uses mobile block size for calculations", () => {
			const board = new Board(20, 11, boardElement, previewBoard, seedQueue);

			const mobileBlockSize = SizingConfig.BLOCK_SIZE;
			expect(canvas.width).toBe(mobileBlockSize * 11);
			expect(canvas.height).toBe(mobileBlockSize * 20);
		});

		test("canvas drawing buffer matches coordinate system", () => {
			const board = new Board(20, 11, boardElement, previewBoard, seedQueue);

			const blockSize = SizingConfig.BLOCK_SIZE;
			const expectedWidth = blockSize * 11;
			const expectedHeight = blockSize * 20;

			expect(canvas.width).toBe(expectedWidth);
			expect(canvas.height).toBe(expectedHeight);
		});
	});

	describe("Canvas element missing", () => {
		test("handles missing canvas gracefully", () => {
			boardElement.innerHTML = "";

			expect(() => {
				const board = new Board(20, 11, boardElement, previewBoard, seedQueue);
			}).not.toThrow();
		});
	});

	describe("Canvas dimensions consistency", () => {
		test("canvas width is exact multiple of block width", () => {
			Object.defineProperty(window, "innerWidth", {
				writable: true,
				configurable: true,
				value: 393,
			});

			const board = new Board(20, 11, boardElement, previewBoard, seedQueue);
			const blockSize = SizingConfig.BLOCK_SIZE;

			expect(canvas.width % 11).toBe(0);
			expect(canvas.width / 11).toBe(blockSize);
		});

		test("canvas height is exact multiple of block height", () => {
			Object.defineProperty(window, "innerWidth", {
				writable: true,
				configurable: true,
				value: 393,
			});

			const board = new Board(20, 11, boardElement, previewBoard, seedQueue);
			const blockSize = SizingConfig.BLOCK_SIZE;

			expect(canvas.height % 20).toBe(0);
			expect(canvas.height / 20).toBe(blockSize);
		});
	});
});
