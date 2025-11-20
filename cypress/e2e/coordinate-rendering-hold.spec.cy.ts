/// <reference types="cypress" />

import {
	setTetrominoDropTimeInMiliseconds,
	addTetrominoT,
	addTetrominoO,
	pressHold,
	pressHardDrop,
} from "../support/testUtils";

describe("Coordinate-Based Rendering - Hold Functionality", () => {
	beforeEach(() => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100);
		});
	});

	it("should clear coordinate blocks from game board when holding a piece", () => {
		cy.window().then((win) => {
			addTetrominoT(win);
			addTetrominoO(win);
		});

		cy.get("#start-button").click();

		cy.wait(200);

		cy.get("#game-board .coordinate-block").should("have.length", 4);

		pressHold();

		cy.wait(100);

		cy.get("#game-board .coordinate-block").should("have.length", 4);

		cy.get(".hold-container .coordinate-block").should("have.length", 4);
	});

	it("should not leave duplicate blocks when swapping held piece", () => {
		cy.window().then((win) => {
			addTetrominoT(win);
			addTetrominoO(win);
			addTetrominoT(win);
		});

		cy.get("#start-button").click();

		cy.wait(200);

		cy.get("#game-board .coordinate-block").should("have.length", 4);

		pressHold();

		cy.wait(100);

		cy.get("#game-board .coordinate-block").should("have.length", 4);

		pressHold();

		cy.wait(100);

		cy.get("#game-board .coordinate-block").should("have.length", 4);

		cy.get(".hold-container .coordinate-block").should("have.length", 4);
	});

	it("should properly render held piece after hard drop and hold", () => {
		cy.window().then((win) => {
			addTetrominoT(win);
			addTetrominoO(win);
			addTetrominoT(win);
		});

		cy.get("#start-button").click();

		cy.wait(100);

		pressHardDrop();

		cy.wait(100);

		cy.get("#game-board .coordinate-block").should("have.length", 8);

		pressHold();

		cy.wait(100);

		cy.get("#game-board .coordinate-block").should("have.length", 8);

		cy.get(".hold-container .coordinate-block").should("have.length", 4);
	});

	it("should handle multiple hold swaps without leaving orphaned blocks", () => {
		cy.window().then((win) => {
			addTetrominoT(win);
			addTetrominoO(win);
			addTetrominoT(win);
			addTetrominoO(win);
		});

		cy.get("#start-button").click();

		cy.wait(200);

		const initialBlockCount = 4;
		cy.get("#game-board .coordinate-block").should("have.length", initialBlockCount);

		pressHold();
		cy.wait(100);

		pressHardDrop();
		cy.wait(100);

		cy.get("#game-board .coordinate-block").should("have.length", 8);

		pressHold();
		cy.wait(100);

		cy.get("#game-board .coordinate-block").should("have.length", 8);

		cy.get(".hold-container .coordinate-block").should("have.length", 4);
	});
});
