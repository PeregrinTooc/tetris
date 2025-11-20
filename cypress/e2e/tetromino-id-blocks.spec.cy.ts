/// <reference types="cypress" />

import {
	setTetrominoDropTimeInMiliseconds,
	addTetrominoBase,
	getBlocks,
	getBlocksByTetrominoId,
} from "../support/testUtils";

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

				// Verify all blocks have the same tetromino ID using rendering-agnostic helper
				getBlocksByTetrominoId(tetrominoId).each(($block) => {
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

				// Should be able to select blocks using the tetromino ID with rendering-agnostic helper
				getBlocksByTetrominoId(tetrominoId).should("have.length.greaterThan", 0);
			});
	});

	it("should work with both container and block selectors", () => {
		cy.get("#start-button").click();

		// Rendering-agnostic block selector
		getBlocks("#game-board").should("exist");

		// ID-based selector
		cy.get("#game-board [data-tetromino-id]").should("exist");
	});
});
