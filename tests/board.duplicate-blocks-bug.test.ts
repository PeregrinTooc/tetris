import { describe, it, expect } from "@jest/globals";
import { createTestBoard, createTetromino, hardDropTetromino } from "./testUtils.unit";

describe("Board - Duplicate Blocks Bug", () => {
	it("should not create duplicate blocks in occupiedPositions after line clear", () => {
		const board = createTestBoard({
			height: 20,
			width: 11,
			seeds: [2, 2, 2, 2, 2, 0],
			preview: false,
		});

		board.spawnTetromino();

		// Fill bottom row with O-pieces (each is 2x2)
		for (let i = 0; i < 5; i++) {
			const t = board.getActiveTetromino();
			t.left = i * 2;
			t.updatePosition();
			hardDropTetromino(t);
		}

		// Add one more T piece that will trigger line completion
		const tPiece = board.getActiveTetromino();
		tPiece.left = 4;
		tPiece.updatePosition();
		hardDropTetromino(tPiece);

		// Check for duplicate blocks at the same coordinates
		const coordinateCounts = new Map<string, number>();
		board["occupiedPositions"].forEach((block) => {
			const key = `${block.x},${block.y}`;
			coordinateCounts.set(key, (coordinateCounts.get(key) || 0) + 1);
		});

		const duplicates: string[] = [];
		coordinateCounts.forEach((count, coord) => {
			if (count > 1) {
				duplicates.push(`${coord} (${count} blocks)`);
			}
		});

		expect(duplicates.length).toBe(0);
	});

	it("should ensure each coordinate has at most one block after multiple line clears", () => {
		const board = createTestBoard({
			height: 20,
			width: 11,
			seeds: [2, 2, 2, 2, 2, 0, 1],
			preview: false,
		});

		board.spawnTetromino();

		// Fill bottom rows with O-pieces
		for (let i = 0; i < 5; i++) {
			const t = board.getActiveTetromino();
			t.left = i * 2;
			t.updatePosition();
			hardDropTetromino(t);
		}

		// Add a T piece
		const tPiece = board.getActiveTetromino();
		tPiece.left = 9;
		tPiece.updatePosition();
		hardDropTetromino(tPiece);

		// Add an I piece to complete lines
		const iPiece = board.getActiveTetromino();
		iPiece.rotation = 1;
		iPiece.updateBlocks();
		iPiece.left = 5;
		iPiece.updatePosition();
		hardDropTetromino(iPiece);

		// Verify no duplicates
		const positions = board["occupiedPositions"];
		const uniqueCoords = new Set(positions.map((b) => `${b.x},${b.y}`));
		expect(positions.length).toBe(uniqueCoords.size);
	});
});
