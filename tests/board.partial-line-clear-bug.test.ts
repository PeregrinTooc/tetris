import { describe, beforeEach, test, expect, jest } from "@jest/globals";
import { createTestBoard, createTetromino, lockTetromino } from "./testUtils.unit";
import { Board } from "../src/board";
import { Tetromino } from "../src/tetromino-base";

describe("Board - Partial Tetromino Line Clear Bug", () => {
	let board: Board;

	beforeEach(() => {
		document.body.innerHTML = "";
	});

	test("should keep remaining blocks in occupiedPositions when tetromino is partially cleared", () => {
		board = createTestBoard({
			height: 10,
			width: 4,
			seeds: [1337, 1337, 1337, 1337, 1337],
			preview: false,
		});

		// Use single-block tetrominos for precise control
		// Place 4 blocks to form an "L" shape spanning rows 8-9:
		// Row 8: blocks at (0,8), (1,8), (2,8)
		// Row 9: block at (0,9)
		const block1 = createTetromino(board, 1337, 0);
		block1.left = 0;
		block1.top = 8;
		block1.updatePosition();
		lockTetromino(block1);
		const tetrominoId = block1.id;

		const block2 = createTetromino(board, 1337, 1);
		block2.left = 1;
		block2.top = 8;
		block2.updatePosition();
		lockTetromino(block2);

		const block3 = createTetromino(board, 1337, 2);
		block3.left = 2;
		block3.top = 8;
		block3.updatePosition();
		lockTetromino(block3);

		const block4 = createTetromino(board, 1337, 0);
		block4.left = 0;
		block4.top = 9;
		block4.updatePosition();
		lockTetromino(block4);

		// Now complete row 9 by adding blocks at (1,9), (2,9), (3,9)
		const filler1 = createTetromino(board, 1337, 1);
		filler1.left = 1;
		filler1.top = 9;
		filler1.updatePosition();
		lockTetromino(filler1);

		const filler2 = createTetromino(board, 1337, 2);
		filler2.left = 2;
		filler2.top = 9;
		filler2.updatePosition();
		lockTetromino(filler2);

		const filler3 = createTetromino(board, 1337, 3);
		filler3.left = 3;
		filler3.top = 9;
		filler3.updatePosition();
		lockTetromino(filler3);

		// At this point, row 9 should be complete (4 blocks) and should trigger line clear
		// block1, block2, block3 should remain at row 8
		// block4 should be removed (was on row 9)

		// ASSERTIONS TO VERIFY THE FIX:

		// 1. Blocks from row 8 should still be in occupiedPositions
		const remainingBlocks = (board as any).occupiedPositions.filter(
			(b: any) => [block1.id, block2.id, block3.id].includes(b.parent.id)
		);
		expect(remainingBlocks.length).toBe(3);

		// 2. Block4 (was on row 9) should have been removed from occupiedPositions
		const block4StillInOccupied = (board as any).occupiedPositions.some(
			(b: any) => b.parent.id === block4.id
		);
		expect(block4StillInOccupied).toBe(false);

		// 3. After line clear and drop, blocks should have dropped to row 9
		const blocksOnRow9After = (board as any).occupiedPositions.filter((b: any) => b.y === 9);
		expect(blocksOnRow9After.length).toBe(3);

		// 4. Row 8 should now be empty (blocks dropped)
		const blocksOnRow8 = (board as any).occupiedPositions.filter((b: any) => b.y === 8);
		expect(blocksOnRow8.length).toBe(0);
	});

	test("should remove DOM element when all blocks of a tetromino are cleared", () => {
		board = createTestBoard({
			height: 10,
			width: 4,
			seeds: [2, 2, 2, 2],
			preview: false,
		});

		// Create O-tetromino (seed 2 - 2x2 square) at bottom
		// This will have all 4 blocks on rows 8-9
		const tetromino1 = createTetromino(board, 2, 0);
		tetromino1.left = 0;
		tetromino1.top = 8;
		tetromino1.updatePosition();
		lockTetromino(tetromino1);

		const tetromino1Id = tetromino1.id;
		const tetromino1Element = tetromino1.element;

		// Fill the rest of row 9 to complete it
		const tetromino2 = createTetromino(board, 2, 2);
		tetromino2.left = 2;
		tetromino2.top = 8;
		tetromino2.updatePosition();
		lockTetromino(tetromino2);

		// Now fill row 8 to clear both rows (should remove ALL of tetromino1)
		const tetromino3 = createTetromino(board, 2, 0);
		tetromino3.left = 0;
		tetromino3.top = 6;
		tetromino3.updatePosition();
		lockTetromino(tetromino3);

		const tetromino4 = createTetromino(board, 2, 2);
		tetromino4.left = 2;
		tetromino4.top = 6;
		tetromino4.updatePosition();
		lockTetromino(tetromino4);

		// ASSERTIONS:

		// 1. Tetromino1 should be removed from set (all blocks gone)
		const tetromino1StillExists = Array.from(board["tetrominos"]).some(
			(t) => t.id === tetromino1Id
		);
		expect(tetromino1StillExists).toBe(false);

		// 2. Tetromino1's DOM element should be removed
		expect(tetromino1Element.parentNode).toBe(null);

		// 3. No orphaned blocks from tetromino1 in occupiedPositions
		const orphanedBlocks = (board as any).occupiedPositions.filter(
			(b: any) => b.parent.id === tetromino1Id
		);
		expect(orphanedBlocks.length).toBe(0);
	});
});
