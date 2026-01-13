import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { BlockRenderer } from "../src/block-renderer";
import { SizingConfig } from "../src/sizing-config";
import { createTestBoard, createTetromino } from "./testUtils.unit";

describe("BlockRenderer sizing", () => {
	let boardElement: HTMLElement;
	let renderer: BlockRenderer;
	let board: any;

	beforeEach(() => {
		boardElement = document.createElement("div");
		document.body.appendChild(boardElement);
		renderer = new BlockRenderer(boardElement);
		board = createTestBoard({ element: boardElement, seeds: [0] });
	});

	afterEach(() => {
		document.body.removeChild(boardElement);
	});

	it("should use SizingConfig block size for coordinate blocks", () => {
		const tetromino = createTetromino(board, 0, 5);
		renderer.renderTetromino(tetromino);

		const coordinateBlocks = boardElement.querySelectorAll(".coordinate-block");
		expect(coordinateBlocks.length).toBeGreaterThan(0);

		coordinateBlocks.forEach((block) => {
			const htmlBlock = block as HTMLElement;
			expect(htmlBlock.style.width).toBe(SizingConfig.BLOCK_SIZE + "px");
			expect(htmlBlock.style.height).toBe(SizingConfig.BLOCK_SIZE + "px");
		});
	});

	it("should position coordinate blocks using block size", () => {
		const tetromino = createTetromino(board, 0, 5);
		renderer.renderTetromino(tetromino);

		const coordinateBlocks = boardElement.querySelectorAll(".coordinate-block");
		coordinateBlocks.forEach((blockElement) => {
			const htmlBlock = blockElement as HTMLElement;
			const left = parseInt(htmlBlock.style.left);
			const top = parseInt(htmlBlock.style.top);

			expect(left % SizingConfig.BLOCK_SIZE).toBe(0);
			expect(top % SizingConfig.BLOCK_SIZE).toBe(0);
		});
	});

	it("should hide tetromino container in coordinate mode", () => {
		const tetromino = createTetromino(board, 0, 5);
		renderer.renderTetromino(tetromino);

		expect(tetromino.element.style.display).toBe("none");
	});
});
