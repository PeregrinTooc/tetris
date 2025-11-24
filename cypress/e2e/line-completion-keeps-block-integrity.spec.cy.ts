import {
	setTetrominoDropTimeInMiliseconds,
	addTetrominoO,
	addTetrominoI,
	addTetrominoT,
	addTetrominoBase,
	pressLeft,
	pressRight,
	pressDown,
	pressRotate,
	pressHardDrop,
	doTimes,
	getBlocksByTetrominoId,
} from "../support/testUtils";
import { LINE_CLEAR_ANIMATION_DURATION } from "../../src/constants";

describe("Line completion", () => {
	beforeEach(() => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 1000);
			// Sequence: O O O O O T to fill bottom row with a gap, than a T to fill the gap
			addTetrominoO(win);
			addTetrominoO(win);
			addTetrominoO(win);
			addTetrominoO(win);
			addTetrominoO(win);
			addTetrominoT(win);
			addTetrominoBase(win);
		});
	});

	it("should not let blocks belonging to a tetromino that's being blocked fall", () => {
		cy.get("#start-button").click();

		// Position O piece on bottom right
		doTimes(4, pressRight);
		pressHardDrop(); // drop

		// Position O piece on bottom right
		doTimes(2, pressRight);
		pressHardDrop(); // drop

		// Position O piece on bottom left
		doTimes(5, pressLeft);
		pressHardDrop(); // drop

		// Position O piece on bottom left
		doTimes(3, pressLeft);
		pressHardDrop(); // drop

		pressHardDrop(); // drop

		// Position T piece in gap

		pressLeft();
		pressHardDrop(); // drop in center

		// By now bottom line should be complete and cleared
		cy.wait(LINE_CLEAR_ANIMATION_DURATION + 100);

		// Final piece should fall only 1 space to validate line was cleared
		doTimes(4, pressLeft);
		pressHardDrop(); // drop test piece

		getBlocksByTetrominoId("6", "#game-board").should(($blocks) => {
			expect($blocks).to.have.length(3);
		});
	});
});
