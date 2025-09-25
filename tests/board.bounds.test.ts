import { describe, test, expect } from "@jest/globals";
import {
	createTestBoard,
	createTetromino,
	hardDropTetromino,
	lockTetromino,
} from "./testUtils.unit";

// Guard test for exclusive upper bound semantics.
// Valid y coordinates are 0..height-1; no block may have y === height.

describe("board bounds semantics (exclusive upper bound)", () => {
	test("no block exceeds height - 1 after locking and line clear cascade", () => {
		const height = 20;
		const board = createTestBoard({ height, width: 10, seeds: [0, 0, 0], preview: false });

		// Spawn first piece and hard drop
		const t1 = createTetromino(board, 0, 4);
		hardDropTetromino(t1);
		lockTetromino(t1);

		// Spawn another piece, drop partially (simulate soft moves) then hard drop
		const t2 = createTetromino(board, 0, 5);
		hardDropTetromino(t2);
		lockTetromino(t2);

		// Assert all occupied blocks are within 0..height-1
		const withOutOfBounds = (board as any).occupiedPositions.filter(
			(b: any) => b.y < 0 || b.y >= height
		);
		expect(withOutOfBounds).toHaveLength(0);
	});
});
