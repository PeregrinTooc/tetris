import { Board } from "../src/board";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { HoldBoard } from "../src/hold-board";
import { TetrominoSeedQueueImpl } from "../src/TetrominoSeedQueue";
import { expect } from "@jest/globals";

describe("Hold Feature", () => {
	let board: Board;
	let boardElement: HTMLElement;
	let holdBoard: HoldBoard;
	let holdElement: HTMLElement;
	let seedQueue: TetrominoSeedQueueImpl;

	beforeEach(() => {
		boardElement = document.createElement("div");
		holdElement = document.createElement("div");
		holdElement.id = "holdBoard";
		document.body.appendChild(boardElement);
		document.body.appendChild(holdElement);

		holdBoard = new HoldBoard(holdElement);
		seedQueue = new TetrominoSeedQueueImpl();
		seedQueue.enqueue(0, 0, 0); // Three T pieces in a row

		board = new Board(20, 10, boardElement, null, seedQueue, holdBoard);
		board.spawnTetromino(); // Initialize like main.ts does
		board.canHoldPiece = true;
	});

	afterEach(() => {
		document.body.removeChild(boardElement);
		document.body.removeChild(holdElement);
	});

	describe("Game Logic", () => {
		test("should hold current piece when hold action is triggered", () => {
			const initialActivePiece = board.getActiveTetromino();

			board.hold();

			expect(holdBoard.getHeldTetromino()).toBe(initialActivePiece);
			expect(board.getActiveTetromino()).not.toBe(initialActivePiece);
		});

		test("should swap held piece with active piece when hold is triggered again after piece lock", () => {
			const firstPiece = board.getActiveTetromino();

			board.hold(); // Hold first piece
			const secondPiece = board.getActiveTetromino();

			// Lock the second piece to enable holding again (simulates piece hitting bottom)
			secondPiece.lock();

			// Spawn a new piece (simulates natural game flow)
			board.spawnTetromino();
			const thirdPiece = board.getActiveTetromino();

			board.hold(); // Now should swap third piece with first piece

			// Check that the first piece is back and third piece is held
			expect(board.getActiveTetromino()).toBe(firstPiece);
			expect(holdBoard.getHeldTetromino()).toBe(thirdPiece);
		});

		test("cannot hold piece twice in succession without piece lock", () => {
			const firstPiece = board.getActiveTetromino();

			board.hold(); // First hold
			const secondPiece = board.getActiveTetromino();
			board.hold(); // Try to hold again immediately

			expect(board.getActiveTetromino()).toBe(secondPiece);
			expect(holdBoard.getHeldTetromino()).toBe(firstPiece);
		});

		test("can hold piece again after piece is locked", () => {
			const firstPiece = board.getActiveTetromino();

			board.hold(); // Hold first piece
			const activePiece = board.getActiveTetromino();
			activePiece.lock(); // Lock the active piece
			board.hold(); // Should be able to hold again after lock

			expect(board.getActiveTetromino().constructor.name).toBe(firstPiece.constructor.name);
		});
	});

	describe("Visual Display", () => {
		test("should display held tetromino with correct number of blocks", () => {
			board.hold(); // Hold T piece
			// With coordinate rendering, blocks are rendered directly in holdElement (or holdContainer)
			const coordinateBlocks = holdElement.querySelectorAll(".coordinate-block");
			expect(coordinateBlocks.length).toBe(4); // T piece has 4 blocks
		});

		test("should clear previous held tetromino when showing new one", () => {
			board.hold(); // Hold first T piece
			const firstBlockCount = holdElement.querySelectorAll(".coordinate-block").length;
			expect(firstBlockCount).toBe(4);

			const activePiece = board.getActiveTetromino();
			activePiece.lock(); // Lock the active piece
			board.hold(); // Hold second T piece

			const secondBlockCount = holdElement.querySelectorAll(".coordinate-block").length;
			expect(secondBlockCount).toBe(4); // Should still be 4 blocks (old cleared, new rendered)
		});

		test("should maintain correct T piece shape in hold board", () => {
			board.hold(); // Hold T piece

			const heldTetromino = holdBoard.getHeldTetromino();
			expect(heldTetromino).not.toBeNull();

			if (heldTetromino) {
				const blocks = heldTetromino.getBlocks();
				const positions = blocks.map((block) => ({
					x: block.x - heldTetromino.left,
					y: block.y - heldTetromino.top,
				}));

				// T piece should maintain its shape relative to pivot
				expect(positions).toEqual(
					expect.arrayContaining([
						expect.objectContaining({ x: 0, y: 0 }), // Center
						expect.objectContaining({ x: -1, y: 0 }), // Left
						expect.objectContaining({ x: 1, y: 0 }), // Right
						expect.objectContaining({ x: 0, y: 1 }), // Bottom
					])
				);
			}
		});
	});
});
