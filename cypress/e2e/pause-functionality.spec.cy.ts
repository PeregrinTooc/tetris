import { pressPause } from "../support/testUtils";

describe("Pause functionality", () => {
	beforeEach(() => {
		cy.visit("/");
		cy.window().then((win) => {
			win.setTetrominoDropTime(100);
			win.pushTetrominoSeed(1337);
		});
		cy.get("#start-button").click();
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
});
