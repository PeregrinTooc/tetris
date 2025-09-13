import { Board } from "../src/board";
import { TetrominoT } from "../src/tetromino-t";
import { TetrominoO } from "../src/tetromino-o";
import { Block } from "../src/tetromino-base";
import { describe, beforeEach, expect, afterEach } from "@jest/globals";

describe("Board - Drop Collision Detection Fix", () => {
	let board: Board;
	let mockElement: HTMLElement;

	beforeEach(() => {
		mockElement = document.createElement("div");
		document.body.appendChild(mockElement);
		board = new Board(10, 5, mockElement, null, { dequeue: () => 0 });
	});

	afterEach(() => {
		document.body.removeChild(mockElement);
	});

	it("should correctly drop tetromino without self-collision interference", () => {
		// This test verifies the fix for the bug where tetrominoes couldn't drop
		// into available spaces due to incorrect collision detection with their own blocks

		const tetromino = new TetrominoT(2, board);
		tetromino.locked = true;

		// Create T-tetromino blocks
		const blocks = [
			new Block({ x: 2, y: 1, parent: tetromino }), // top
			new Block({ x: 1, y: 2, parent: tetromino }), // left
			new Block({ x: 2, y: 2, parent: tetromino }), // center
			new Block({ x: 3, y: 2, parent: tetromino }), // right
		];
		tetromino.blocks = blocks;

		// Create obstacle that should limit the drop
		const obstacle = new TetrominoO(0, board);
		obstacle.locked = true;
		const obstacleBlocks = [
			new Block({ x: 2, y: 8, parent: obstacle }), // obstacle below center
		];
		obstacle.blocks = obstacleBlocks;

		board["occupiedPositions"] = [...blocks, ...obstacleBlocks];

		// Record initial positions
		const initialY = blocks.map((b) => b.y);

		// Call the fixed method
		board["_dropTetrominoAsUnit"](tetromino, blocks);

		// Verify the tetromino dropped correctly
		const finalY = blocks.map((b) => b.y);
		const actualDrop = Math.min(...finalY) - Math.min(...initialY);

		// Should drop 5 positions (from y=1 to y=6, limited by obstacle at y=8)
		expect(actualDrop).toBe(5);

		// Verify tetromino maintains its shape
		const drops = finalY.map((y, i) => y - initialY[i]);
		const uniqueDrops = [...new Set(drops)];
		expect(uniqueDrops.length).toBe(1); // All blocks drop the same amount
	});

	it("should handle multiple tetrominoes dropping without interference", () => {
		// Test that multiple tetrominoes can drop simultaneously without
		// interfering with each other's collision detection

		const tetrominoA = new TetrominoO(1, board);
		tetrominoA.locked = true;
		const blocksA = [
			new Block({ x: 1, y: 1, parent: tetrominoA }),
			new Block({ x: 2, y: 1, parent: tetrominoA }),
			new Block({ x: 1, y: 2, parent: tetrominoA }),
			new Block({ x: 2, y: 2, parent: tetrominoA }),
		];
		tetrominoA.blocks = blocksA;

		const tetrominoB = new TetrominoO(3, board);
		tetrominoB.locked = true;
		const blocksB = [
			new Block({ x: 3, y: 1, parent: tetrominoB }),
			new Block({ x: 4, y: 1, parent: tetrominoB }),
			new Block({ x: 3, y: 2, parent: tetrominoB }),
			new Block({ x: 4, y: 2, parent: tetrominoB }),
		];
		tetrominoB.blocks = blocksB;

		board["occupiedPositions"] = [...blocksA, ...blocksB];

		// Record initial positions
		const initialA = blocksA.map((b) => b.y);
		const initialB = blocksB.map((b) => b.y);

		// Drop both tetrominoes
		board["_dropAllBlocks"]();

		// Both should drop to the bottom
		const finalA = blocksA.map((b) => b.y);
		const finalB = blocksB.map((b) => b.y);

		const dropA = Math.min(...finalA) - Math.min(...initialA);
		const dropB = Math.min(...finalB) - Math.min(...initialB);

		expect(dropA).toBeGreaterThan(5); // Should drop significantly
		expect(dropB).toBeGreaterThan(5); // Should drop significantly
	});
});
