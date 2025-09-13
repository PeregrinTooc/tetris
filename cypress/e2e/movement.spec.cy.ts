import {
	setTetrominoDropTimeInMiliseconds,
	addTetrominoBase,
	pressLeft,
	pressRight,
	pressHardDrop,
	pressDown,
	doTimes,
} from "../support/testUtils";

describe("Tetris Game Movement", () => {
	beforeEach(() => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100);
			for (let i = 0; i < 10; i++) addTetrominoBase(win);
		});
	});

	afterEach(() => {
		cy.get("#start-button").click(); // Reset the game after each test
		cy.get("[data-tetromino-id]").should("not.exist");
	});

	it("should make the tetromino fall automatically", () => {
		cy.get("#start-button").click();
		cy.wait(10);

		// Get the first tetromino using ID selector and verify it has moved down
		cy.get("#game-board [data-tetromino-id]")
			.first()
			.then(($tetromino) => {
				const tetrominoId = $tetromino.attr("data-tetromino-id") as string;
				cy.get(`[data-tetromino-id="${tetrominoId}"]`)
					.not(".block")
					.should("have.css", "top")
					.and("not.equal", "0px");

				cy.wait(30);
				validateTetrominoDrop(tetrominoId);
			});
	});

	it("should allow the player to move the tetromino to the right", () => {
		cy.get("#start-button").click();

		// Get the first tetromino using ID selector
		cy.get("#game-board [data-tetromino-id]")
			.first()
			.then(($tetromino) => {
				const tetrominoId = $tetromino.attr("data-tetromino-id") as string;
				const initialLeft = parseInt($tetromino.css("left"), 10);

				pressRight();

				cy.get(`[data-tetromino-id="${tetrominoId}"]`)
					.not(".block")
					.should(($el2) => {
						const newLeft = parseInt($el2.css("left"), 10);
						expect(newLeft).to.be.greaterThan(initialLeft);
					});
			});
	});

	it("should allow the player to move the tetromino to the left", () => {
		cy.get("#start-button").click();

		// Get the first tetromino using ID selector
		cy.get("#game-board [data-tetromino-id]")
			.first()
			.then(($tetromino) => {
				const tetrominoId = $tetromino.attr("data-tetromino-id") as string;
				const initialRight = parseInt($tetromino.css("right"), 10);

				pressLeft();

				cy.get(`[data-tetromino-id="${tetrominoId}"]`)
					.not(".block")
					.should(($el2) => {
						const newRight = parseInt($el2.css("right"), 10);
						expect(newRight).to.be.greaterThan(initialRight);
					});
			});
	});

	it("should allow the player to drop the tetromino immediately", () => {
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 2147483647);
		});
		cy.get("#start-button").click();

		// Get the first tetromino using ID selector
		cy.get("#game-board [data-tetromino-id]")
			.first()
			.then(($tetromino) => {
				const tetrominoId = $tetromino.attr("data-tetromino-id") as string;
				const initialTop = parseInt($tetromino.css("top"), 10);

				pressHardDrop();

				cy.get(`[data-tetromino-id="${tetrominoId}"]`)
					.not(".block")
					.should(($el2) => {
						const newTop = parseInt($el2.css("top"), 10);
						expect(newTop).to.equal(480);
					});
			});
	});

	it("should allow the player to soft drop the tetromino", () => {
		cy.window().then((win) => {
			win.setTetrominoDropTime(2147483647);
		});
		cy.get("#start-button").click();

		// Get the first tetromino using ID selector
		cy.get("#game-board [data-tetromino-id]")
			.first()
			.then(($tetromino) => {
				const tetrominoId = $tetromino.attr("data-tetromino-id") as string;
				const initialTop = parseInt($tetromino.css("top"), 10);

				pressDown();

				cy.get(`[data-tetromino-id="${tetrominoId}"]`)
					.not(".block")
					.should(($el2) => {
						const newTop = parseInt($el2.css("top"), 10);
						expect(newTop).to.be.greaterThan(initialTop);
						expect(newTop).to.be.lessThan(480);
					});
			});
	});
});

function validateTetrominoDrop(tetrominoId: string) {
	cy.get(`[data-tetromino-id="${tetrominoId}"]`)
		.not(".block")
		.then(($el) => {
			const topAfterFirstMove = parseInt($el.css("top"), 10);
			cy.wait(30);
			cy.get(`[data-tetromino-id="${tetrominoId}"]`)
				.not(".block")
				.should(($el2) => {
					const topAfterSecondMove = parseInt($el2.css("top"), 10);
					expect(topAfterSecondMove).to.be.greaterThan(topAfterFirstMove);
				});
		});
}

// Removed ad-hoc movement recursion helpers; prefer explicit directional presses via provided helpers.
