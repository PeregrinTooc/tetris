import {
	setTetrominoDropTimeInMiliseconds,
	addTetrominoO,
	addTetrominoI,
	doTimes,
	pressLeft,
	pressRight,
	pressHardDrop,
	pressDown,
	pressRotate,
} from "../support/testUtils";

describe("Scoring System", () => {
	beforeEach(() => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 10000);
			// Fill bottom row for a single line clear
			doTimes(5, () => addTetrominoO(win));
			addTetrominoI(win);
		});
		cy.get("#start-button-desktop").click();
	});

	it("should increase the score when a line is cleared", () => {
		// Drop O pieces to fill the row
		doTimes(5, pressLeft);
		pressHardDrop();
		doTimes(3, pressLeft);
		pressHardDrop();
		pressLeft();
		pressHardDrop();
		pressRight();
		pressHardDrop();
		doTimes(3, pressRight);
		pressHardDrop();
		doTimes(3, pressDown);
		pressRotate();
		doTimes(5, pressRight);
		pressHardDrop();

		// Assert that the score increased (assuming #score is the score display)
		cy.get("#score-board")
			.invoke("text")
			.then((scoreText) => {
				const score = parseInt(scoreText.replace(/[^0-9]/g, ""), 10);
				expect(score).to.be.greaterThan(0);
			});
	});
});
