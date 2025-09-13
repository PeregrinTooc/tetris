/// <reference types="cypress" />

import { setTetrominoDropTimeInMiliseconds, addTetrominoBase } from "../support/testUtils";

describe("Tetromino ID on Blocks", () => {
	beforeEach(() => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100);
			addTetrominoBase(win);
		});
	});

	it("should add tetromino ID to all blocks in original rendering system", () => {
		cy.get("#start-button").click();

		// Get the tetromino container ID
		cy.get("#game-board .tetromino")
			.first()
			.then(($tetromino) => {
				const tetrominoId = $tetromino.attr("data-tetromino-id");

				// Verify all blocks have the same tetromino ID
				cy.get("#game-board .tetromino .block").each(($block) => {
					expect($block.attr("data-tetromino-id")).to.equal(tetrominoId);
				});
			});
	});

	it("should allow selecting blocks by tetromino ID", () => {
		cy.get("#start-button").click();

		// Get the first tetromino's ID
		cy.get("#game-board .tetromino")
			.first()
			.then(($tetromino) => {
				const tetrominoId = $tetromino.attr("data-tetromino-id");

				// Should be able to select blocks using the tetromino ID
				cy.get(`[data-tetromino-id="${tetrominoId}"].block`).should(
					"have.length.greaterThan",
					0
				);
			});
	});

	it("should work with both container and block selectors", () => {
		cy.get("#start-button").click();

		// Traditional selector
		cy.get("#game-board .tetromino .block").should("exist");

		// New ID-based selector
		cy.get("#game-board [data-tetromino-id]").should("exist");
		cy.get("#game-board [data-tetromino-id].block").should("exist");
	});
});
