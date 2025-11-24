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
} from "../support/testUtils";
import { BOTTOM_ROW_PIXEL } from "../support/constants";
import { LINE_CLEAR_ANIMATION_DURATION } from "../../src/constants";

describe("Line completion", () => {
	beforeEach(() => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 1000);
			// Sequence: O I T O to fill bottom row
			addTetrominoO(win);
			addTetrominoI(win);
			addTetrominoT(win);
			addTetrominoO(win);
			addTetrominoBase(win);
		});
	});

	it("should clear completed line and drop remaining blocks", () => {
		cy.get("#start-button").click();

		// Position O piece on bottom right
		doTimes(5, pressRight);
		pressHardDrop(); // drop

		// Position I piece on bottom left
		doTimes(4, pressLeft);
		pressHardDrop(); // drop

		// Position T piece in center
		cy.wait(50); // ensure piece spawned
		doTimes(2, pressDown);
		doTimes(2, pressRotate);
		pressHardDrop(); // drop in center

		doTimes(2, pressRight);
		pressHardDrop(); // drop

		// By now bottom line should be complete and cleared
		cy.wait(LINE_CLEAR_ANIMATION_DURATION + 100);

		// Final piece should fall only 1 space to validate line was cleared
		doTimes(4, pressLeft);
		pressHardDrop(); // drop test piece

		cy.get('#game-board [data-tetromino-id="5"]').should(($el) => {
			const top = parseInt($el.css("top"), 10);
			// Bottom row index is 19 (0..19) so pixel top should equal BOTTOM_ROW_PIXEL.
			expect(top).to.equal(BOTTOM_ROW_PIXEL);
		});
	});

	it("should block spawning during line clear animation", () => {
		cy.get("#start-button").click();

		// Position O piece on bottom right
		doTimes(5, pressRight);
		pressHardDrop();

		// Position I piece on bottom left
		doTimes(4, pressLeft);
		pressHardDrop();

		// Position T piece in center
		cy.wait(50);
		doTimes(2, pressDown);
		doTimes(2, pressRotate);
		pressHardDrop();

		// The next piece is ID 4 (O). Complete the line with it
		doTimes(2, pressRight);
		pressHardDrop();

		// Immediately after line completion, the base piece (ID 5) should NOT have spawned yet
		// The cleared pieces are gone, but no new spawn should happen
		cy.wait(50);
		cy.get("#game-board [data-tetromino-id]")
			.not(".block")
			.not(".coordinate-block")
			.not('[style*="display: none"]')
			.should("not.exist");

		// After animation duration, base piece (ID 5) should have spawned
		cy.wait(LINE_CLEAR_ANIMATION_DURATION + 100);
		cy.get("#game-board [data-tetromino-id]")
			.not(".block")
			.not(".coordinate-block")
			.not('[style*="display: none"]')
			.invoke("attr", "data-tetromino-id")
			.should("equal", "5");
	});

	it("should interrupt line clear animation on reset", () => {
		cy.get("#start-button").click();

		// Position O piece on bottom right
		doTimes(5, pressRight);
		pressHardDrop();

		// Position I piece on bottom left
		doTimes(4, pressLeft);
		pressHardDrop();

		// Position T piece in center
		cy.wait(50);
		doTimes(2, pressDown);
		doTimes(2, pressRotate);
		pressHardDrop();

		// Complete the line with final O piece
		doTimes(2, pressRight);
		pressHardDrop();

		// Immediately reset during animation
		cy.wait(100);
		cy.get("#start-button").click();

		// Wait for reset to complete
		cy.wait(200);

		// Verify start button is ready for a new game
		cy.get("#start-button").should("have.text", "Start Game");

		// Board should be cleared and ready for new game
		cy.get("#game-board").find("[data-tetromino-id]").should("have.length", 0);
	});
});
