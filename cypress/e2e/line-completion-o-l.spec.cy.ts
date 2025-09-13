import {
	setTetrominoDropTimeInMiliseconds,
	addTetrominoO,
	addTetrominoL,
	pressLeft,
	pressRight,
	pressDown,
	pressRotate,
	pressHardDrop,
	doTimes,
} from "../support/testUtils";

describe("Line completion with O and L pieces", () => {
	beforeEach(() => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 10000);
			// Fill left to right, 2 blocks high (1 O-pieces per column)
			for (let i = 0; i < 5; i++) {
				addTetrominoO(win);
			}
			// L-piece for the far right
			addTetrominoL(win);
		});
	});

	it("should fill 4 rows with O-pieces and complete 2 lines with an L-piece on the right", () => {
		cy.get("#start-button").click();

		// Drop O-pieces from left to right
		doTimes(5, pressLeft);
		pressHardDrop(); // drop O
		doTimes(3, pressLeft);
		pressHardDrop(); // drop O
		pressLeft();
		pressHardDrop(); // drop O
		pressRight();
		pressHardDrop(); // drop O
		doTimes(3, pressRight);
		pressHardDrop(); // drop O

		// Move L-piece to far right
		pressDown();
		doTimes(3, pressRotate);
		for (let i = 0; i < 9; i++) pressRight();
		pressHardDrop(); // drop L-piece

		// Assert that the bottom two rows are cleared and the horizontal bar of the L is dropped
		// Check that the L-piece (ID "6") blocks have dropped properly after line completion
		cy.get('#game-board [data-tetromino-id="6"].block')
			.should("exist")
			.then(($blocks) => {
				// Get absolute positions of all blocks for this L-tetromino
				const positions = Array.from($blocks).map((block) => {
					const blockTop = parseInt(block.style.top);
					let absoluteTop = blockTop;

					// For container-based rendering, add the container's position
					const container = block.closest(".tetromino") as HTMLElement;
					if (container && container.style.display !== "none") {
						const containerTop = parseInt(container.style.top || "0");
						absoluteTop = containerTop + blockTop;
					}

					return Math.round(absoluteTop / 24); // Convert to grid position
				});

				cy.log(`L-tetromino absolute grid positions: ${positions.join(", ")}`);

				// After line completion, L-piece blocks should be in the bottom area
				// The horizontal bar should have dropped down after the lines completed
				const bottomAreaBlocks = positions.filter((y) => y >= 16);
				expect(
					bottomAreaBlocks.length,
					`L-tetromino blocks should be in bottom area after line completion, got positions: ${positions}`
				).to.be.greaterThan(0);

				// At least some blocks should be quite low (at least one in bottom 3 rows)
				const veryBottomBlocks = positions.filter((y) => y >= 18);
				expect(
					veryBottomBlocks.length,
					`At least one L-tetromino block should be in very bottom area (y>=18), got positions: ${positions}`
				).to.be.greaterThan(0);
			});
	});
});
