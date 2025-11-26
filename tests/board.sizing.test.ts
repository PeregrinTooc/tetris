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

	it("should calculate dimensions based on constructor parameters", () => {
		const customHeight = 15;
		const customWidth = 8;
		board = new Board(customHeight, customWidth, element, null, seedQueue);

		const expectedWidth = SizingConfig.BLOCK_SIZE * customWidth;
		const expectedHeight = SizingConfig.BLOCK_SIZE * customHeight;

		expect(element.style.width).toBe(expectedWidth + "px");
		expect(element.style.height).toBe(expectedHeight + "px");
	});
});
