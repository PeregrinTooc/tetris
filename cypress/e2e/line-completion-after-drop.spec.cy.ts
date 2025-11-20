import {
	setTetrominoDropTimeInMiliseconds,
	addTetrominoO,
	addTetrominoI,
	addTetrominoT,
	doTimes,
	pressRight,
	pressLeft,
	pressDown,
	pressRotate,
	pressHardDrop,
	addTetrominoBase,
	getBlocks,
	getBlocksByTetrominoId,
	getBlockGridPositions,
} from "../support/testUtils";

describe("Line Completion", () => {
	beforeEach(() => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 10000);
			doTimes(5, () => addTetrominoO(win));
			doTimes(2, () => addTetrominoI(win));
			doTimes(2, () => addTetrominoT(win));
			doTimes(2, () => addTetrominoBase(win));
		});
		cy.get("#start-button").click();
	});

	it("blocks drop after line completion if there is a gap under them", () => {
		// Sequence: 5 O's (IDs 1-5), 2 I's (IDs 6-7), 2 T's (IDs 8-9), 2 Base (IDs 10-11)
		// The first T-tetromino will have ID "8"
		const firstTTetrominoId = "8";

		// Execute the movements to complete a line
		doTimes(5, pressLeft);
		pressHardDrop();
		doTimes(3, pressLeft);
		pressHardDrop();
		pressLeft();
		pressHardDrop();
		doTimes(2, pressRight);
		pressHardDrop();
		doTimes(4, pressRight);
		pressHardDrop();
		doTimes(5, pressLeft);
		pressHardDrop();
		doTimes(4, pressRight);
		pressHardDrop();
		// Drop the T-tetromino down 2 blocks before rotating to avoid collision at top
		doTimes(2, pressDown);
		doTimes(3, pressRotate);
		pressLeft();
		pressHardDrop();
		// Drop the next T-tetromino down 2 blocks before rotating
		doTimes(2, pressDown);
		doTimes(3, pressRotate);
		pressRight();
		pressHardDrop();

		// Debug: Check how many blocks we have using rendering-agnostic helper
		getBlocks("#game-board").then(($blocks) => {
			cy.log(`Total blocks found: ${$blocks.length}`);
		});

		// Check if line completion happened - should have fewer blocks now
		getBlocks("#game-board").should("have.length.lessThan", 40); // Should be much less than 40 if line completion worked

		// Check that the first T-tetromino's blocks still exist and have correct count
		getBlocksByTetrominoId(firstTTetrominoId).should("exist").should("have.length", 3);

		// Use grid position helper to get rows
		getBlockGridPositions(firstTTetrominoId).then((positions) => {
			const rows = positions.map((p) => p.row);
			cy.log(`T-tetromino grid rows: ${rows.join(", ")}`);

			// Board rows are 0..19. After line completion remaining blocks should settle
			// against the bottom (row=19) or just above if stacked. We only require all surviving blocks be
			// within the last two rows (18 or 19) and at least one block on the actual bottom row (19).
			const bottomRowBlocks = rows.filter((y) => y === 19);
			const lastTwoRowsBlocks = rows.filter((y) => y >= 18);
			expect(
				lastTwoRowsBlocks.length,
				`T-tetromino blocks should finish within rows 18-19 after line completion, got rows: ${rows}`
			).to.equal(3);
			expect(
				bottomRowBlocks.length,
				`At least one T-tetromino block should rest on bottom row (19), got rows: ${rows}`
			).to.be.greaterThan(0);
		});
	});
});
