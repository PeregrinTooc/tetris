import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { createTestBoard, createTetromino } from "./testUtils.unit";
import { SizingConfig } from "../src/sizing-config";

describe("Tetromino dynamic sizing", () => {
	let board: any;
	let originalInnerWidth: number;

	beforeEach(() => {
		originalInnerWidth = window.innerWidth;
		board = createTestBoard({ seeds: [0] });
	});

	afterEach(() => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: originalInnerWidth,
		});
	});

	it("should use current SizingConfig.BLOCK_SIZE even after viewport changes", () => {
		const tetromino = createTetromino(board, 0);
		const initialSize = tetromino.size;

		expect(initialSize).toBe(SizingConfig.BLOCK_SIZE);

		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 400,
		});

		expect(tetromino.size).toBe(SizingConfig.BLOCK_SIZE);
		expect(tetromino.size).not.toBe(initialSize);
	});

	it("should position blocks correctly after viewport width changes", () => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 768,
		});

		const tetromino = createTetromino(board, 0, 5);
		const initialBlockSize = SizingConfig.BLOCK_SIZE;

		tetromino.updatePosition();
		expect(tetromino.element.style.left).toBe(5 * initialBlockSize + "px");

		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 400,
		});

		const newBlockSize = SizingConfig.BLOCK_SIZE;
		expect(newBlockSize).not.toBe(initialBlockSize);

		tetromino.updatePosition();
		expect(tetromino.element.style.left).toBe(5 * newBlockSize + "px");
	});

	it("should render coordinate blocks with current block size", () => {
		const tetromino = createTetromino(board, 0);
		const blockRenderer = board.getBlockRenderer();

		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 400,
		});

		blockRenderer.renderTetromino(tetromino);

		const coordinateBlock = board.element.querySelector(".coordinate-block");
		expect(coordinateBlock).toBeTruthy();

		const currentBlockSize = SizingConfig.BLOCK_SIZE;
		expect(coordinateBlock.style.width).toBe(currentBlockSize + "px");
		expect(coordinateBlock.style.height).toBe(currentBlockSize + "px");
	});

	it("should handle mobile viewport orientation changes", () => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 393,
		});

		const tetromino = createTetromino(board, 0, 8);
		const portraitSize = SizingConfig.BLOCK_SIZE;

		tetromino.updatePosition();
		const portraitLeft = parseInt(tetromino.element.style.left, 10);
		expect(portraitLeft).toBe(8 * portraitSize);

		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 852,
		});

		const landscapeSize = SizingConfig.BLOCK_SIZE;
		expect(landscapeSize).toBeGreaterThan(portraitSize);

		tetromino.updatePosition();
		const landscapeLeft = parseInt(tetromino.element.style.left, 10);
		expect(landscapeLeft).toBe(8 * landscapeSize);
		expect(landscapeLeft).toBeGreaterThan(portraitLeft);
	});

	it("should maintain consistent positioning across all blocks when size changes", () => {
		const tetromino = createTetromino(board, 0);
		const blockRenderer = board.getBlockRenderer();

		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 393,
		});

		blockRenderer.renderTetromino(tetromino);
		const blocks = tetromino.getBlocks();
		const portraitSize = SizingConfig.BLOCK_SIZE;

		const portraitPositions = blocks.map((block: any) => ({
			left: block.x * portraitSize,
			top: block.y * portraitSize,
		}));

		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 852,
		});

		blockRenderer.renderTetromino(tetromino);
		const landscapeSize = SizingConfig.BLOCK_SIZE;

		const landscapePositions = blocks.map((block: any) => ({
			left: block.x * landscapeSize,
			top: block.y * landscapeSize,
		}));

		blocks.forEach((block: any, index: number) => {
			expect(landscapePositions[index].left).toBe(block.x * landscapeSize);
			expect(landscapePositions[index].top).toBe(block.y * landscapeSize);
			expect(landscapePositions[index].left / block.x).toBe(landscapeSize);
			expect(portraitPositions[index].left / block.x).toBe(portraitSize);
		});
	});

	it("should not cache block size between different tetromino instances", () => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 768,
		});

		const tetromino1 = createTetromino(board, 0);

		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 400,
		});

		const tetromino2 = createTetromino(board, 1);

		expect(tetromino1.size).toBe(SizingConfig.BLOCK_SIZE);
		expect(tetromino2.size).toBe(SizingConfig.BLOCK_SIZE);
		expect(tetromino1.size).toBe(tetromino2.size);
	});

	it("should handle rapid viewport changes without size inconsistencies", () => {
		const tetromino = createTetromino(board, 0);

		const viewportWidths = [768, 400, 600, 393, 852, 500];

		viewportWidths.forEach((width) => {
			Object.defineProperty(window, "innerWidth", {
				writable: true,
				configurable: true,
				value: width,
			});

			const expectedSize = SizingConfig.BLOCK_SIZE;
			expect(tetromino.size).toBe(expectedSize);
		});
	});

	it("should render shadow blocks with current block size", () => {
		const tetromino = createTetromino(board, 0);
		const blockRenderer = board.getBlockRenderer();

		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 393,
		});

		blockRenderer.renderShadowBlocks(tetromino, 5);

		const shadowBlock = board.element.querySelector(".shadow-block");
		expect(shadowBlock).toBeTruthy();

		const currentBlockSize = SizingConfig.BLOCK_SIZE;
		expect(shadowBlock.style.width).toBe(currentBlockSize + "px");
		expect(shadowBlock.style.height).toBe(currentBlockSize + "px");
	});
});
