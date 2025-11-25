import {
	setTetrominoDropTimeInMiliseconds,
	addTetrominoT,
	pressRotate,
	getBlocksByTetrominoId,
	getRelativeBlockPositions,
} from "../support/testUtils";

describe("T-shaped Tetromino", () => {
	beforeEach(() => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoT(win);
		});
		cy.get("#start-button").click();
	});

	it("should spawn a T-shaped tetromino and render it on the board", () => {
		// Verify T-tetromino spawned using class selector
		cy.get("#game-board .tetromino-t").should("exist");

		// Get the tetromino ID and verify using ID-based selectors
		cy.get("#game-board .tetromino-t").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;

			// Verify all blocks have the same tetromino ID and correct count using rendering-agnostic helper
			getBlocksByTetrominoId(tetrominoId).should("have.length", 4);
		});
	});

	it("should rotate the T tetromino clockwise and match expected block positions", () => {
		// Get the tetromino using ID selector instead of class
		cy.get("#game-board .tetromino-t").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;

			// Initial (rotation 0) - T shape pointing up
			cy.wait(50);
			getRelativeBlockPositions(tetrominoId).then((blocks) => {
				expect(blocks).to.deep.equal([
					{ left: 0, top: 0 },
					{ left: -24, top: 0 },
					{ left: 24, top: 0 },
					{ left: 0, top: 24 },
				]);
			});

			// Rotate to 1 - T shape pointing right
			pressRotate();
			cy.wait(50);
			getRelativeBlockPositions(tetrominoId).then((blocks) => {
				// Should be rotated 90 degrees clockwise
				const positions = blocks
					.map((b) => `${b.left},${b.top}`)
					.sort()
					.join(";");
				expect(positions).to.not.equal("0,0;-24,0;24,0;0,24"); // Should have changed
			});

			// Rotate to 2 - T shape pointing down
			pressRotate();
			cy.wait(50);
			getRelativeBlockPositions(tetrominoId).then((blocks) => {
				// Should be rotated 180 degrees from initial
				const positions = blocks
					.map((b) => `${b.left},${b.top}`)
					.sort()
					.join(";");
				expect(positions).to.not.equal("0,0;-24,0;24,0;0,24"); // Should have changed
			});

			// Rotate to 3 - T shape pointing left
			pressRotate();
			cy.wait(50);
			getRelativeBlockPositions(tetrominoId).then((blocks) => {
				// Should be rotated 270 degrees
				const positions = blocks
					.map((b) => `${b.left},${b.top}`)
					.sort()
					.join(";");
				expect(positions).to.not.equal("0,0;-24,0;24,0;0,24"); // Should have changed
			});

			// Rotate to 0 again - back to initial
			pressRotate();
			cy.wait(50);
			getRelativeBlockPositions(tetrominoId).then((blocks) => {
				// Should be back to original orientation
				expect(blocks).to.deep.equal([
					{ left: 0, top: 0 },
					{ left: -24, top: 0 },
					{ left: 24, top: 0 },
					{ left: 0, top: 24 },
				]);
			});
		});
	});
});
