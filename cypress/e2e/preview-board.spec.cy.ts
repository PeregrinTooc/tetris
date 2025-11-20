import {
	setTetrominoDropTimeInMiliseconds,
	addTetrominoBase,
	doTimes,
	getBlocks,
} from "../support/testUtils";

describe("Preview Board", () => {
	beforeEach(() => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			for (let i = 0; i < 5; i++) addTetrominoBase(win);
		});
		cy.get("#start-button").click();
	});

	it("should show a tetromino in the preview area when the game starts", () => {
		// In coordinate mode, blocks are rendered directly in preview-container
		// In container mode, there's a .tetromino container
		getBlocks("#preview-container").should("exist");
	});
});
