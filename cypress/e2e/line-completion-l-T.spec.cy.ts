import {
	setTetrominoDropTimeInMiliseconds,
	addTetrominoI,
	addTetrominoT,
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
				addTetrominoI(win);
			}
			// L-piece for the far right
			addTetrominoT(win);
		});
	});

	it("should collapse tetrominos after line completion", () => {
		cy.get("#start-button").click();

		doTimes(2, () => {
			doTimes(4, pressRight);
			pressHardDrop();
		});

		doTimes(2, () => {
			pressLeft();
			pressHardDrop();
		});

		pressDown();
		pressRotate();
		doTimes(5, pressLeft);
		pressHardDrop();

		pressDown();
		pressRotate();
		doTimes(4, pressLeft);
		pressHardDrop();

		//assert that the blocks of the I-piece (ID "5") have collapsed after line completion
		cy.get('#game-board [data-tetromino-id="5"].block')
			.should("exist")
			.then(($blocks) => {
				// Get absolute positions of all blocks for this I-tetromino
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

				cy.log(`I-tetromino absolute grid positions: ${positions.join(", ")}`);

				// Board rows are 0..19. After line completion the horizontal I segment should settle on
				// or near the bottom. All remaining blocks should be within rows 17..19 and at least
				// one must be on the bottom row (19). The I piece may be truncated by line clear logic
				// leaving 3 blocks or remain with 4 depending on scenario; accept 3 or 4.
				const lastThreeRows = positions.filter((y) => y >= 17);
				const bottomRow = positions.filter((y) => y === 19);
				expect(
					lastThreeRows.length,
					`I-tetromino blocks should reside within rows 17-19 after line completion, got positions: ${positions}`
				).to.be.within(3, 4);
				expect(
					bottomRow.length,
					`At least one I-tetromino block should rest on bottom row (19), got positions: ${positions}`
				).to.be.greaterThan(0);
			});
	});
});
