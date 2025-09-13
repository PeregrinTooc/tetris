import { setTetrominoDropTimeInMiliseconds, addTetrominoBase, doTimes } from "../support/testUtils";

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
		cy.get("#preview-container").find(".tetromino").should("exist");
	});
});
