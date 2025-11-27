import { BoardSnapshot, TetrominoState } from "../src/board-snapshot";
import { Block } from "../src/tetromino-base";
import { createTestBoard, createTetromino } from "./testUtils.unit";

describe("BoardSnapshot", () => {
	describe("serialization", () => {
		it("should capture occupied positions with deep copy", () => {
			const board = createTestBoard({ seeds: [0], preview: false });
			const tetromino = createTetromino(board, 0, 5);
			tetromino.lock();

			const snapshot = BoardSnapshot.fromBoard(board);

			expect(snapshot.occupiedPositions.length).toBe(4);
			expect(snapshot.occupiedPositions[0]).not.toBe(board["occupiedPositions"][0]);
			expect(snapshot.occupiedPositions[0].x).toBe(board["occupiedPositions"][0].x);
			expect(snapshot.occupiedPositions[0].y).toBe(board["occupiedPositions"][0].y);
		});

		it("should capture active tetromino state", () => {
			const board = createTestBoard({ seeds: [1], preview: false });
			const tetromino = board.spawnTetromino();
			tetromino.left = 3;
			tetromino.top = 5;
			tetromino.rotation = 1;

			const snapshot = BoardSnapshot.fromBoard(board);

			expect(snapshot.activeTetromino).not.toBeNull();
			expect(snapshot.activeTetromino!.seed).toBe(1);
			expect(snapshot.activeTetromino!.left).toBe(3);
			expect(snapshot.activeTetromino!.top).toBe(5);
			expect(snapshot.activeTetromino!.rotation).toBe(1);
			expect(snapshot.activeTetromino!.locked).toBe(false);
		});

		it("should capture next tetromino state", () => {
			const board = createTestBoard({ seeds: [0, 2], preview: false });
			board.spawnTetromino();

			const snapshot = BoardSnapshot.fromBoard(board);

			expect(snapshot.nextTetromino).not.toBeNull();
			expect(snapshot.nextTetromino!.seed).toBe(2);
		});

		it("should capture hold board state", () => {
			const holdElement = document.createElement("div");
			holdElement.innerHTML = '<div class="hold-container"></div>';
			const board = createTestBoard({
				seeds: [0, 1],
				preview: false,
				holdElement: holdElement,
			});
			board.spawnTetromino();
			board.hold();

			const snapshot = BoardSnapshot.fromBoard(board);

			expect(snapshot.holdTetromino).not.toBeNull();
			expect(snapshot.holdTetromino!.seed).toBe(0);
			expect(snapshot.canHoldPiece).toBe(false);
		});

		it("should capture animation state", () => {
			const board = createTestBoard({ seeds: [0], preview: false });
			board["isAnimating"] = true;

			const snapshot = BoardSnapshot.fromBoard(board);

			expect(snapshot.isAnimating).toBe(true);
		});

		it("should include timestamp", () => {
			const board = createTestBoard({ seeds: [0], preview: false });
			const before = Date.now();

			const snapshot = BoardSnapshot.fromBoard(board);

			const after = Date.now();
			expect(snapshot.timestamp).toBeGreaterThanOrEqual(before);
			expect(snapshot.timestamp).toBeLessThanOrEqual(after);
		});

		it("should handle empty board state", () => {
			const board = createTestBoard({ seeds: [], preview: false });

			const snapshot = BoardSnapshot.fromBoard(board);

			expect(snapshot.occupiedPositions).toEqual([]);
			expect(snapshot.activeTetromino).toBeNull();
			expect(snapshot.nextTetromino).toBeNull();
			expect(snapshot.holdTetromino).toBeNull();
		});
	});

	describe("metadata", () => {
		it("should generate metadata with summary info", () => {
			const holdElement = document.createElement("div");
			holdElement.innerHTML = '<div class="hold-container"></div>';
			const board = createTestBoard({
				seeds: [0, 1],
				preview: false,
				holdElement: holdElement,
			});
			board.spawnTetromino();
			board.hold();

			const snapshot = BoardSnapshot.fromBoard(board);
			const metadata = snapshot.getMetadata();

			expect(metadata.timestamp).toBe(snapshot.timestamp);
			expect(metadata.occupiedBlockCount).toBe(0);
			expect(metadata.hasActiveTetromino).toBe(true);
			expect(metadata.hasNextTetromino).toBe(true);
			expect(metadata.hasHoldTetromino).toBe(true);
			expect(metadata.canHoldPiece).toBe(false);
			expect(metadata.isAnimating).toBe(false);
		});

		it("should format timestamp as readable string", () => {
			const board = createTestBoard({ seeds: [0], preview: false });
			const snapshot = BoardSnapshot.fromBoard(board);
			const metadata = snapshot.getMetadata();

			expect(metadata.formattedTime).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3}/);
		});
	});

	describe("deep copy validation", () => {
		it("should not share block references with original board", () => {
			const board = createTestBoard({ seeds: [0], preview: false });
			const tetromino = createTetromino(board, 0, 5);
			tetromino.lock();

			const snapshot = BoardSnapshot.fromBoard(board);
			const originalBlock = board["occupiedPositions"][0];
			const snapshotBlock = snapshot.occupiedPositions[0];

			originalBlock.x = 999;

			expect(snapshotBlock.x).not.toBe(999);
		});

		it("should create independent block parent references", () => {
			const board = createTestBoard({ seeds: [0], preview: false });
			const tetromino = createTetromino(board, 0, 5);
			tetromino.lock();

			const snapshot = BoardSnapshot.fromBoard(board);

			expect(snapshot.occupiedPositions[0].parent).toBeDefined();
			expect(snapshot.occupiedPositions[0].parent.id).toBe(tetromino.id);
		});
	});

	describe("toJSON", () => {
		it("should serialize to JSON-compatible object", () => {
			const board = createTestBoard({ seeds: [0, 1], preview: false });
			board.spawnTetromino();

			const snapshot = BoardSnapshot.fromBoard(board);
			const json = snapshot.toJSON();

			expect(json.timestamp).toBe(snapshot.timestamp);
			expect(json.occupiedPositions).toBeDefined();
			expect(json.activeTetromino).toBeDefined();
			expect(json.nextTetromino).toBeDefined();
			expect(json.canHoldPiece).toBe(true);
			expect(json.isAnimating).toBe(false);
		});

		it("should be JSON.stringify compatible", () => {
			const board = createTestBoard({ seeds: [0], preview: false });
			const snapshot = BoardSnapshot.fromBoard(board);

			expect(() => JSON.stringify(snapshot)).not.toThrow();
		});
	});
});
