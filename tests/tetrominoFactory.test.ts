import { describe, beforeEach, test, expect, jest } from "@jest/globals";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { Board } from "../src/board";
import { TetrominoT } from "../src/tetromino-t";
import { TetrominoI } from "../src/tetromino-i";
import { TetrominoO } from "../src/tetromino-o";
import { TetrominoJ } from "../src/tetromino-j";
import { TetrominoL } from "../src/tetromino-l";
import { TetrominoZ } from "../src/tetromino-z";
import { TetrominoS } from "../src/tetromino-s";
import { TetrominoSingle } from "../src/tetromino-single";
import { KeyBindingManager } from "../src/key-binding-manager";

describe("TetrominoFactory", () => {
	let mockElement: HTMLElement;
	let board: Board;

	beforeEach(() => {
		mockElement = document.createElement("div");
		document.body.appendChild(mockElement);
		board = new Board(10, 5, mockElement, null, { dequeue: () => 0 });
	});

	afterEach(() => {
		document.body.removeChild(mockElement);
	});

	describe("createNew", () => {
		it("should create TetrominoT for seed 0", () => {
			const tetromino = TetrominoFactory.createNew(3, board, 0);

			expect(tetromino).toBeInstanceOf(TetrominoT);
			expect(tetromino.left).toBe(3);
			expect(tetromino.board).toBe(board);
		});

		it("should create TetrominoI for seed 1", () => {
			const tetromino = TetrominoFactory.createNew(2, board, 1);

			expect(tetromino).toBeInstanceOf(TetrominoI);
			expect(tetromino.left).toBe(2);
			expect(tetromino.board).toBe(board);
		});

		it("should create TetrominoO for seed 2", () => {
			const tetromino = TetrominoFactory.createNew(4, board, 2);

			expect(tetromino).toBeInstanceOf(TetrominoO);
			expect(tetromino.left).toBe(4);
			expect(tetromino.board).toBe(board);
		});

		it("should create TetrominoJ for seed 3", () => {
			const tetromino = TetrominoFactory.createNew(1, board, 3);

			expect(tetromino).toBeInstanceOf(TetrominoJ);
			expect(tetromino.left).toBe(1);
			expect(tetromino.board).toBe(board);
		});

		it("should create TetrominoL for seed 4", () => {
			const tetromino = TetrominoFactory.createNew(5, board, 4);

			expect(tetromino).toBeInstanceOf(TetrominoL);
			expect(tetromino.left).toBe(5);
			expect(tetromino.board).toBe(board);
		});

		it("should create TetrominoZ for seed 5", () => {
			const tetromino = TetrominoFactory.createNew(0, board, 5);

			expect(tetromino).toBeInstanceOf(TetrominoZ);
			expect(tetromino.left).toBe(0);
			expect(tetromino.board).toBe(board);
		});

		it("should create TetrominoS for seed 6", () => {
			const tetromino = TetrominoFactory.createNew(6, board, 6);

			expect(tetromino).toBeInstanceOf(TetrominoS);
			expect(tetromino.left).toBe(6);
			expect(tetromino.board).toBe(board);
		});

		it("should create TetrominoSingle for seed 1337", () => {
			const tetromino = TetrominoFactory.createNew(3, board, 1337);

			expect(tetromino).toBeInstanceOf(TetrominoSingle);
			expect(tetromino.left).toBe(3);
			expect(tetromino.board).toBe(board);
		});

		it("should create TetrominoSingle for unknown seeds (default case)", () => {
			const unknownSeeds = [7, 8, 9, 10, 100, -1, 999];

			unknownSeeds.forEach((seed) => {
				const tetromino = TetrominoFactory.createNew(2, board, seed);

				expect(tetromino).toBeInstanceOf(TetrominoSingle);
				expect(tetromino.left).toBe(2);
				expect(tetromino.board).toBe(board);
			});
		});
	});

	describe("Board parameter handling", () => {
		it("should work with null board", () => {
			const tetromino = TetrominoFactory.createNew(3, null, 0);

			expect(tetromino).toBeInstanceOf(TetrominoT);
			expect(tetromino.left).toBe(3);
			expect(tetromino.board).toBe(null);
		});

		it("should pass board reference correctly to all tetromino types", () => {
			const seeds = [0, 1, 2, 3, 4, 5, 6, 1337];

			seeds.forEach((seed) => {
				const tetromino = TetrominoFactory.createNew(2, board, seed);
				expect(tetromino.board).toBe(board);
			});
		});
	});

	describe("Position parameter handling", () => {
		it("should set correct left position for all tetromino types", () => {
			const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
			const seeds = [0, 1, 2, 3, 4, 5, 6];

			positions.forEach((position) => {
				seeds.forEach((seed) => {
					const tetromino = TetrominoFactory.createNew(position, board, seed);
					expect(tetromino.left).toBe(position);
				});
			});
		});

		it("should handle negative positions", () => {
			const tetromino = TetrominoFactory.createNew(-1, board, 0);

			expect(tetromino).toBeInstanceOf(TetrominoT);
			expect(tetromino.left).toBe(-1);
		});

		it("should handle large positions", () => {
			const tetromino = TetrominoFactory.createNew(100, board, 0);

			expect(tetromino).toBeInstanceOf(TetrominoT);
			expect(tetromino.left).toBe(100);
		});
	});

	describe("Tetromino properties", () => {
		it("should create tetrominoes with unique IDs", () => {
			const tetromino1 = TetrominoFactory.createNew(2, board, 0);
			const tetromino2 = TetrominoFactory.createNew(2, board, 0);

			expect(tetromino1.id).not.toBe(tetromino2.id);
		});

		it("should create tetrominoes with initial unlocked state", () => {
			const seeds = [0, 1, 2, 3, 4, 5, 6, 1337];

			seeds.forEach((seed) => {
				const tetromino = TetrominoFactory.createNew(2, board, seed);
				expect(tetromino.locked).toBe(false);
			});
		});

		it("should create tetrominoes with correct initial top position", () => {
			const seeds = [0, 1, 2, 3, 4, 5, 6, 1337];

			seeds.forEach((seed) => {
				const tetromino = TetrominoFactory.createNew(2, board, seed);
				expect(tetromino.top).toBe(0);
			});
		});
	});

	describe("Static method behavior", () => {
		it("should be a static method", () => {
			expect(typeof TetrominoFactory.createNew).toBe("function");

			// Should be callable without instantiation
			const tetromino = TetrominoFactory.createNew(2, board, 0);
			expect(tetromino).toBeInstanceOf(TetrominoT);
		});

		it("should not require factory instance", () => {
			// Should work without creating a TetrominoFactory instance
			expect(() => {
				TetrominoFactory.createNew(2, board, 0);
			}).not.toThrow();
		});
	});

	describe("Comprehensive seed mapping", () => {
		it("should map all standard seeds correctly", () => {
			const expectedTypes = [
				{ seed: 0, type: TetrominoT },
				{ seed: 1, type: TetrominoI },
				{ seed: 2, type: TetrominoO },
				{ seed: 3, type: TetrominoJ },
				{ seed: 4, type: TetrominoL },
				{ seed: 5, type: TetrominoZ },
				{ seed: 6, type: TetrominoS },
				{ seed: 1337, type: TetrominoSingle },
			];

			expectedTypes.forEach(({ seed, type }) => {
				const tetromino = TetrominoFactory.createNew(2, board, seed);
				expect(tetromino).toBeInstanceOf(type);
			});
		});

		it("should handle edge case seeds", () => {
			const edgeCases = [
				{ seed: -1, expectedType: TetrominoSingle },
				{ seed: 7, expectedType: TetrominoSingle },
				{ seed: 1000, expectedType: TetrominoSingle },
				{ seed: 0.5, expectedType: TetrominoSingle }, // Non-integer
			];

			edgeCases.forEach(({ seed, expectedType }) => {
				const tetromino = TetrominoFactory.createNew(2, board, seed);
				expect(tetromino).toBeInstanceOf(expectedType);
			});
		});
	});

	describe("Integration", () => {
		it("should create functional tetrominoes that can be used immediately", () => {
			const seeds = [0, 1, 2, 3, 4, 5, 6];

			seeds.forEach((seed) => {
				const tetromino = TetrominoFactory.createNew(2, board, seed);

				// Should have blocks
				expect(tetromino.getBlocks().length).toBeGreaterThan(0);

				// Should be able to activate keyboard control
				expect(() =>
					tetromino.activateKeyboardControl(new KeyBindingManager())
				).not.toThrow();

				// Should be able to drop
				expect(() => tetromino.dropByOne()).not.toThrow();

				// Should be able to lock
				expect(() => tetromino.lock()).not.toThrow();
			});
		});
	});
});
