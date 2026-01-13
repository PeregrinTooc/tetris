import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { Board } from "../src/board";
import { SizingConfig } from "../src/sizing-config";

describe("Board sizing", () => {
	let element: HTMLElement;
	let board: Board;
	let seedQueue: any;

	beforeEach(() => {
		element = document.createElement("div");
		document.body.appendChild(element);
		seedQueue = { dequeue: () => 0 };
	});

	afterEach(() => {
		document.body.removeChild(element);
	});

	it("should apply width and height to board element", () => {
		board = new Board(20, 11, element, null, seedQueue);

		expect(element.style.width).toBe(SizingConfig.BOARD_WIDTH_PX + "px");
		expect(element.style.height).toBe(SizingConfig.BOARD_HEIGHT_PX + "px");
	});

	it("should use SizingConfig block size for internal calculations", () => {
		board = new Board(20, 10, element, null, seedQueue);

		expect(board.getBlockSize()).toBe(SizingConfig.BLOCK_SIZE);
	});

	it("should always use SizingConfig dimensions regardless of constructor parameters", () => {
		const customHeight = 15;
		const customWidth = 8;
		board = new Board(customHeight, customWidth, element, null, seedQueue);

		// Board always uses SizingConfig dimensions for consistency
		expect(element.style.width).toBe(SizingConfig.BOARD_WIDTH_PX + "px");
		expect(element.style.height).toBe(SizingConfig.BOARD_HEIGHT_PX + "px");
	});
});
