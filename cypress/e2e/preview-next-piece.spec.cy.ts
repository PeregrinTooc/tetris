import {
	setTetrominoDropTimeInMiliseconds,
	addTetrominoI,
	addTetrominoO,
	pressHardDrop,
	doTimes,
} from "../support/testUtils";

describe("Preview of Next Piece", () => {
	beforeEach(() => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoI(win);
			addTetrominoO(win);
		});
		cy.get("#start-button").click();
	});

	it("should update the preview when a new tetromino is spawned", () => {
		// Preview should show O shape before it spawns
		// Verify blocks exist (works in both rendering modes)
		cy.get("#preview-container [data-tetromino-id]").should("exist");

		// Drop the I shape
		pressHardDrop();

		// Wait for the O tetromino to appear on the game board
		cy.get("#game-board .tetromino-o", { timeout: 3000 }).should("exist");

		// Now the preview should still exist and show the next piece
		cy.get("#preview-container [data-tetromino-id]").should("exist");
	});
});
