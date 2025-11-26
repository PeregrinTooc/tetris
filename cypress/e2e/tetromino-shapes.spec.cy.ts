import {
	setTetrominoDropTimeInMiliseconds,
	addTetrominoT,
	addTetrominoI,
	addTetrominoO,
	addTetrominoJ,
	addTetrominoL,
	addTetrominoZ,
	addTetrominoS,
	pressHardDrop,
	doTimes,
	getBlocksByTetrominoId,
} from "../support/testUtils";

const tetrominoSeeds = [0, 1, 2, 3, 4, 5, 6]; // T, I, O, J, L, Z, S
const tetrominoClasses = [
	".tetromino-t",
	".tetromino-i",
	".tetromino-o",
	".tetromino-j",
	".tetromino-l",
	".tetromino-z",
	".tetromino-s",
];

describe("All Tetromino Shapes", () => {
	tetrominoSeeds.forEach((seed, idx) => {
		it(`should spawn and render the correct shape for seed ${seed}`, () => {
			cy.visit("/index.html");
			cy.window().then((win) => {
				setTetrominoDropTimeInMiliseconds(win, 100000);
				const addFns = [
					addTetrominoT,
					addTetrominoI,
					addTetrominoO,
					addTetrominoJ,
					addTetrominoL,
					addTetrominoZ,
					addTetrominoS,
				];
				addFns[idx](win);
			});
			cy.get("#start-button-desktop").click();

			// Verify tetromino spawned using class selector
			cy.get("#game-board " + tetrominoClasses[idx]).should("exist");

			// Get the tetromino ID and verify using ID-based selectors
			cy.get("#game-board " + tetrominoClasses[idx]).then(($tetromino) => {
				const tetrominoId = $tetromino.attr("data-tetromino-id") as string;

				// Verify all blocks have the same tetromino ID and correct count using rendering-agnostic helper
				getBlocksByTetrominoId(tetrominoId).should("have.length", 4);
			});

			// Drop and check next tetromino does not match previous
			pressHardDrop();
		});
	});
});

describe("Hard Drop Action", () => {
	it("should instantly drop the tetromino to the bottom when space is pressed", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 2147483647);
			addTetrominoI(win);
		});
		cy.get("#start-button-desktop").click();

		// Get the I-tetromino using ID selector
		cy.get(".tetromino-i").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;
			const initialTop = parseInt($tetromino.css("top"), 10);

			pressHardDrop();

			cy.get(`[data-tetromino-id="${tetrominoId}"]`)
				.not(".block")
				.should(($el2) => {
					const newTop = parseInt($el2.css("top"), 10);
					expect(newTop).to.be.greaterThan(initialTop);
				});
		});
	});
});
