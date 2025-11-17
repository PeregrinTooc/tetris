import { createTestBoard, createTetromino } from "./testUtils.unit";
import { SizingConfig } from "../src/sizing-config";

describe("Tetromino sizing", () => {
	let board: any;

	beforeEach(() => {
		board = createTestBoard({ seeds: [0] });
	});

	it("should use SizingConfig block size", () => {
		const tetromino = createTetromino(board, 0);

		expect(tetromino.size).toBe(SizingConfig.BLOCK_SIZE);
	});

	it("should position elements using block size", () => {
		const tetromino = createTetromino(board, 0, 5);
		tetromino.updatePosition();

		const expectedLeft = 5 * SizingConfig.BLOCK_SIZE;
		const expectedTop = 0 * SizingConfig.BLOCK_SIZE;

		expect(tetromino.element.style.left).toBe(expectedLeft + "px");
		expect(tetromino.element.style.top).toBe(expectedTop + "px");
	});

	it("should inherit block size from board", () => {
		const customBlockSize = 30;
		const element = document.createElement("div");
		const seedQueue = { dequeue: () => 0 };
		const customBoard = new (require("../src/board").Board)(
			19,
			10,
			element,
			null,
			seedQueue,
			null,
			null,
			null,
			customBlockSize
		);

		const tetromino = createTetromino(customBoard, 0);

		expect(tetromino.size).toBe(customBlockSize);
	});
});
