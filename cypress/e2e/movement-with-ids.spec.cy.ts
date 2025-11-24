/// <reference types="cypress" />

import {
	setTetrominoDropTimeInMiliseconds,
	addTetrominoBase,
	pressLeft,
	pressRight,
	getBlocks,
	getBlocksByTetrominoId,
} from "../support/testUtils";

describe("Movement with Tetromino ID Selectors", () => {
	beforeEach(() => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100);
			for (let i = 0; i < 10; i++) addTetrominoBase(win);
		});
	});

	afterEach(() => {
		cy.get("#start-button").click(); // Reset the game
		cy.get(".tetromino").should("not.exist");
	});

	it("should move tetromino container using ID selectors", () => {
		cy.get("#start-button").click();

		// Get the first tetromino using ID selector
		cy.get("#game-board [data-tetromino-id]")
			.first()
			.then(($tetromino) => {
				const tetrominoId = $tetromino.attr("data-tetromino-id");
				const initialLeft = parseInt($tetromino.css("left"));

				pressRight();

				// Verify container moved using ID selector
				cy.get(`[data-tetromino-id="${tetrominoId}"]`)
					.not(".block")
					.should(($movedTetromino) => {
						const newLeft = parseInt($movedTetromino.css("left"));
						expect(newLeft).to.be.greaterThan(initialLeft);
					});
			});
	});

	it("should verify all blocks of a tetromino have the same ID", () => {
		cy.get("#start-button").click();

		cy.get("#game-board .tetromino")
			.first()
			.then(($tetromino) => {
				const tetrominoId = $tetromino.attr("data-tetromino-id");

				// All blocks should have the same tetromino ID using rendering-agnostic helper
				getBlocksByTetrominoId(tetrominoId).should("have.length.greaterThan", 0);
				getBlocksByTetrominoId(tetrominoId).each(($block) => {
					expect($block.attr("data-tetromino-id")).to.equal(tetrominoId);
				});
			});
	});

	it("should allow selecting tetromino and its blocks by ID", () => {
		cy.get("#start-button").click();

		cy.get("#game-board .tetromino")
			.first()
			.then(($tetromino) => {
				const tetrominoId = $tetromino.attr("data-tetromino-id");

				// Can select the tetromino container by ID
				cy.get(`[data-tetromino-id="${tetrominoId}"]`)
					.not(".block")
					.not(".coordinate-block")
					.not(".shadow-block")
					.should("have.length", 1);

				// Can select all blocks of this tetromino by ID using rendering-agnostic helper
				getBlocksByTetrominoId(tetrominoId).should("have.length.greaterThan", 0);
			});
	});

	it("should work with both old and new selector approaches", () => {
		cy.get("#start-button").click();

		// Rendering-agnostic approach
		getBlocks("#game-board").should("exist");

		// ID-based approach
		cy.get("#game-board .tetromino")
			.first()
			.then(($tetromino) => {
				const tetrominoId = $tetromino.attr("data-tetromino-id");

				getBlocks("#game-board").should("have.length.greaterThan", 0);
				getBlocksByTetrominoId(tetrominoId).should("have.length.greaterThan", 0);
			});
	});
});
