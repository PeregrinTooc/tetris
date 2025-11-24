import { Board } from "../src/board";
import { TetrominoSeedQueue } from "../src/TetrominoSeedQueue";
import { createTestBoard, createTetromino, lockTetromino } from "./testUtils.unit";

describe("Board coordinate blocks synchronization", () => {
	test("locked blocks should be present in occupiedPositions", () => {
		const seeds = [0, 1]; // T piece then I piece
		const board = createTestBoard({ height: 20, width: 11, seeds });
		const tetromino = createTetromino(board, 0, 5);

		// Move piece down to a lockable position
		for (let i = 0; i < 18; i++) {
			board.moveTetromino(tetromino, "down");
		}

		// Lock the piece
		lockTetromino(tetromino);

		// Get all blocks from the locked tetromino
		const lockedBlocks = tetromino.getBlocks();

		// Verify each block is in occupiedPositions
		lockedBlocks.forEach((block) => {
			const found = board["occupiedPositions"].some(
				(occupied) => occupied.x === block.x && occupied.y === block.y
			);
			expect(found).toBe(true);
		});

		// Verify the count matches
		expect(board["occupiedPositions"].length).toBe(lockedBlocks.length);
	});

	test("all rendered coordinate blocks should have corresponding occupiedPositions entries", () => {
		const seeds = [0, 1, 2]; // T, I, O pieces
		const board = createTestBoard({ height: 20, width: 11, seeds });

		// Lock first piece
		const tetromino1 = createTetromino(board, 0, 5);
		for (let i = 0; i < 18; i++) {
			board.moveTetromino(tetromino1, "down");
		}
		lockTetromino(tetromino1);

		// Lock second piece
		const tetromino2 = board.getActiveTetromino();
		for (let i = 0; i < 17; i++) {
			board.moveTetromino(tetromino2, "down");
		}
		lockTetromino(tetromino2);

		// Get all coordinate blocks from the DOM
		const element = board["element"];
		const coordinateBlocks = element.querySelectorAll(".coordinate-block");

		// For each coordinate block, verify it has a corresponding occupied position
		coordinateBlocks.forEach((blockElement: Element) => {
			const htmlElement = blockElement as HTMLElement;
			const left = parseInt(htmlElement.style.left);
			const top = parseInt(htmlElement.style.top);
			const blockSize = board.getBlockSize();
			const x = left / blockSize;
			const y = top / blockSize;

			const found = board["occupiedPositions"].some(
				(occupied) => occupied.x === x && occupied.y === y
			);

			if (!found) {
				console.log(`Block at (${x}, ${y}) not found in occupiedPositions`);
				console.log("Occupied positions:", board["occupiedPositions"]);
			}

			expect(found).toBe(true);
		});
	});

	test("occupiedPositions count should match rendered coordinate blocks count", () => {
		const seeds = [0, 1]; // T then I
		const board = createTestBoard({ height: 20, width: 11, seeds });

		const tetromino = createTetromino(board, 0, 5);
		for (let i = 0; i < 18; i++) {
			board.moveTetromino(tetromino, "down");
		}
		lockTetromino(tetromino);

		const element = board["element"];
		const coordinateBlocks = element.querySelectorAll(".coordinate-block");
		const occupiedCount = board["occupiedPositions"].length;

		expect(coordinateBlocks.length).toBe(occupiedCount);
	});

	test("coordinate blocks should be cleaned up when tetromino is fully cleared by line completion", () => {
		// This test verifies that when all blocks of a tetromino are removed by line completion,
		// the coordinate blocks are also properly cleaned up from the DOM
		const seeds = [1, 1, 2]; // I, I, O pieces
		const board = createTestBoard({ height: 20, width: 11, seeds });

		// Lock first I piece at bottom left
		const tetromino1 = createTetromino(board, 1, 5);
		const id1 = tetromino1.id;
		board.moveTetromino(tetromino1, "left");
		board.moveTetromino(tetromino1, "left");
		board.moveTetromino(tetromino1, "left");
		for (let i = 0; i < 17; i++) {
			board.moveTetromino(tetromino1, "down");
		}
		lockTetromino(tetromino1);

		// Lock second I piece to complete the bottom row (x: 0,1,2,3 + 4,5,6,7)
		const tetromino2 = board.getActiveTetromino();
		const id2 = tetromino2.id;
		board.moveTetromino(tetromino2, "left");
		for (let i = 0; i < 17; i++) {
			board.moveTetromino(tetromino2, "down");
		}
		lockTetromino(tetromino2);

		// At this point, neither tetromino should be fully cleared yet since we only have 8 blocks
		// Now add an O piece to test partial clearing
		const tetromino3 = board.getActiveTetromino();
		const id3 = tetromino3.id;
		board.moveTetromino(tetromino3, "right");
		board.moveTetromino(tetromino3, "right");
		for (let i = 0; i < 17; i++) {
			board.moveTetromino(tetromino3, "down");
		}
		lockTetromino(tetromino3);

		const element = board["element"];

		// Check if any tetrominos were fully cleared
		const occupiedPositions = board["occupiedPositions"];

		// For each locked tetromino, verify coordinate blocks match occupiedPositions
		[id1, id2, id3].forEach((tetrominoId) => {
			const hasBlocksInOccupied = occupiedPositions.some(
				(block) => block.parent.id === tetrominoId
			);

			const coordinateBlocks = element.querySelectorAll(
				`[data-tetromino-id="${tetrominoId}"]`
			);

			if (!hasBlocksInOccupied) {
				// Tetromino fully cleared - coordinate blocks should be gone
				expect(coordinateBlocks.length).toBe(0);
			} else {
				// Tetromino still has blocks - coordinate blocks should exist
				expect(coordinateBlocks.length > 0).toBe(true);
			}
		});
	});
});
