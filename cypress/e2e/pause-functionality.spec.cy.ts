import {
	pressPause,
	addTetrominoO,
	addTetrominoI,
	addTetrominoT,
	pressLeft,
	pressRight,
	pressDown,
	pressRotate,
	pressHardDrop,
	doTimes,
} from "../support/testUtils";
import { LINE_CLEAR_ANIMATION_DURATION } from "../../src/constants";

describe("Pause functionality", () => {
	beforeEach(() => {
		cy.visit("/");
		cy.window().then((win) => {
			win.setTetrominoDropTime(100);
			win.pushTetrominoSeed(1337);
		});
		cy.get("#start-button-desktop").click();
	});

	it("should pause and resume game with P key", () => {
		// Get initial position of tetromino (use CSS top which works for both hidden and visible containers)
		cy.get("[data-tetromino-id]")
			.not(".block")
			.not(".coordinate-block")
			.then(($tetromino) => {
				const initialTop = parseInt($tetromino.css("top"), 10);

				pressPause();

				// Verify pause overlay is shown
				cy.get("#pause-overlay").should("be.visible");
				cy.get("#pause-overlay").should("contain", "Paused");

				// Wait some time to verify tetromino doesn't move
				cy.wait(300);

				cy.get("[data-tetromino-id]")
					.not(".block")
					.not(".coordinate-block")
					.then(($pausedTetromino) => {
						const pausedTop = parseInt($pausedTetromino.css("top"), 10);
						expect(pausedTop).to.equal(initialTop);
					});

				pressPause();

				// Verify pause overlay is hidden
				cy.get("#pause-overlay").should("not.be.visible");

				cy.wait(300);

				cy.get("[data-tetromino-id]")
					.not(".block")
					.not(".coordinate-block")
					.then(($resumedTetromino) => {
						const resumedTop = parseInt($resumedTetromino.css("top"), 10);
						expect(resumedTop).to.be.greaterThan(initialTop);
					});
			});
	});

	it("should pause and resume game with Escape key", () => {
		// Get initial position of tetromino (use CSS top which works for both hidden and visible containers)
		cy.get("[data-tetromino-id]")
			.not(".block")
			.not(".coordinate-block")
			.then(($tetromino) => {
				const initialTop = parseInt($tetromino.css("top"), 10);

				// Press Escape to pause
				cy.get("body").type("{esc}");

				// Verify pause overlay is shown
				cy.get("#pause-overlay").should("be.visible");
				cy.get("#pause-overlay").should("contain", "Paused");

				// Wait some time to verify tetromino doesn't move
				cy.wait(300);

				cy.get("[data-tetromino-id]")
					.not(".block")
					.not(".coordinate-block")
					.then(($pausedTetromino) => {
						const pausedTop = parseInt($pausedTetromino.css("top"), 10);
						expect(pausedTop).to.equal(initialTop);
					});

				// Resume game with Escape and verify movement continues
				cy.get("body").type("{esc}");

				// Verify pause overlay is hidden
				cy.get("#pause-overlay").should("not.be.visible");

				cy.wait(300);

				cy.get("[data-tetromino-id]")
					.not(".block")
					.not(".coordinate-block")
					.then(($resumedTetromino) => {
						const resumedTop = parseInt($resumedTetromino.css("top"), 10);
						expect(resumedTop).to.be.greaterThan(initialTop);
					});
			});
	});

	it("should block pause during line clear animation", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			win.setTetrominoDropTime(1000);
			// Sequence: O I T O (to complete line) then base piece
			addTetrominoO(win);
			addTetrominoI(win);
			addTetrominoT(win);
			addTetrominoO(win);
			win.pushTetrominoSeed(1337);
		});

		cy.get("#start-button-desktop").click();

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

		// Immediately try to pause - should be blocked
		cy.wait(50);
		pressPause();

		// Pause overlay should not appear
		cy.get("#pause-overlay").should("not.be.visible");

		// After animation, pause should work
		cy.wait(LINE_CLEAR_ANIMATION_DURATION + 100);
		pressPause();

		// Now pause overlay should appear
		cy.get("#pause-overlay").should("be.visible");
	});
});
