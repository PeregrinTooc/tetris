/// <reference types="cypress" />

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
	getBlocksByTetrominoId,
} from "../support/testUtils";

const tetrominoSeeds = [0, 1, 2, 3, 4, 5, 6]; // T, I, O, J, L, Z, S
const tetrominoClasses = [
	"tetromino-t",
	"tetromino-i",
	"tetromino-o",
	"tetromino-j",
	"tetromino-l",
	"tetromino-z",
	"tetromino-s",
];

describe("Tetromino Shapes with ID Selectors", () => {
	tetrominoSeeds.forEach((seed, idx) => {
		it(`should spawn and render correct shape for seed ${seed} using ID selectors`, () => {
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
			cy.get(`#game-board .${tetrominoClasses[idx]}`).should("exist");

			// Get the tetromino ID and verify using ID-based selectors
			cy.get(`#game-board .${tetrominoClasses[idx]}`).then(($tetromino) => {
				const tetrominoId = $tetromino.attr("data-tetromino-id");

				// Verify all blocks have the same tetromino ID using rendering-agnostic helper
				getBlocksByTetrominoId(tetrominoId).should("have.length", 4);
			});
		});
	});

	it("should work with both selector approaches for I-tetromino", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoI(win);
		});

		cy.get("#start-button-desktop").click();

		// ID-based approach using rendering-agnostic helper
		cy.get("#game-board .tetromino-i").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id");
			getBlocksByTetrominoId(tetrominoId).should("have.length", 4);
		});
	});

	it("should allow precise tetromino identification with multiple shapes", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			// Add multiple tetrominoes
			addTetrominoT(win);
			addTetrominoI(win);
			addTetrominoO(win);
		});

		cy.get("#start-button-desktop").click();

		// Should have first tetromino (T)
		cy.get("#game-board .tetromino-t").should("exist");

		// Get the T-tetromino's ID
		cy.get("#game-board .tetromino-t").then(($tTetromino) => {
			const tTetrominoId = $tTetromino.attr("data-tetromino-id");

			// Verify we can select only this tetromino's blocks using rendering-agnostic helper
			getBlocksByTetrominoId(tTetrominoId).should("have.length", 4);

			// Drop it and check next tetromino
			pressHardDrop();

			// Should now have I-tetromino with different ID
			cy.get("#game-board .tetromino-i").then(($iTetromino) => {
				const iTetrominoId = $iTetromino.attr("data-tetromino-id");

				// Should be different IDs
				expect(iTetrominoId).to.not.equal(tTetrominoId);

				// Should be able to select I-tetromino blocks by ID using rendering-agnostic helper
				getBlocksByTetrominoId(iTetrominoId).should("have.length", 4);
			});
		});
	});
});
