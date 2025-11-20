/// <reference types="cypress" />

import {
	setTetrominoDropTimeInMiliseconds,
	addTetrominoI,
	addTetrominoO,
	pressHardDrop,
} from "../support/testUtils";

describe("Coordinate-Based Rendering - Locked Tetrominoes", () => {
	beforeEach(() => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100);
		});
	});

	it("should render locked blocks using coordinate positioning", () => {
		cy.window().then((win) => {
			addTetrominoI(win);
		});

		cy.get("#start-button").click();

		pressHardDrop();

		cy.wait(100);

		cy.get("#game-board .coordinate-block").should("exist");
		cy.get("#game-board .coordinate-block").should("have.length.greaterThan", 0);

		cy.get("#game-board .coordinate-block").each(($block) => {
			expect($block.css("position")).to.equal("absolute");
			const left = parseInt($block.css("left"));
			const top = parseInt($block.css("top"));
			expect(left).to.be.a("number");
			expect(top).to.be.a("number");
		});
	});

	it("should handle line clears with coordinate rendering", () => {
		cy.window().then((win) => {
			for (let i = 0; i < 6; i++) {
				addTetrominoO(win);
			}
		});

		cy.get("#start-button").click();

		const initialBlockCount = 4;
		cy.get("#game-board .coordinate-block").should("have.length", initialBlockCount);

		for (let i = 0; i < 5; i++) {
			pressHardDrop();
			cy.wait(50);
		}

		cy.wait(100);

		cy.get("#game-board .coordinate-block").should("have.length.greaterThan", 4);
	});

	it("should properly position blocks after line clear", () => {
		cy.window().then((win) => {
			for (let i = 0; i < 7; i++) {
				addTetrominoI(win);
			}
		});

		cy.get("#start-button").click();

		for (let i = 0; i < 5; i++) {
			pressHardDrop();
			cy.wait(100);
		}

		cy.wait(200);

		cy.get("#game-board .coordinate-block").each(($block) => {
			const top = parseInt($block.css("top"));
			const left = parseInt($block.css("left"));

			expect(top).to.be.a("number");
			expect(left).to.be.a("number");

			expect(top).to.be.at.least(0);
			expect(left).to.be.at.least(0);
		});
	});

	it("should not create duplicate blocks at same position", () => {
		cy.window().then((win) => {
			for (let i = 0; i < 6; i++) {
				addTetrominoO(win);
			}
		});

		cy.get("#start-button").click();

		for (let i = 0; i < 5; i++) {
			pressHardDrop();
			cy.wait(50);
		}

		cy.wait(100);

		const positions = new Map();
		cy.get("#game-board .coordinate-block").each(($block) => {
			const left = $block.css("left");
			const top = $block.css("top");
			const key = `${left},${top}`;

			expect(positions.has(key)).to.be.false;
			positions.set(key, true);
		});
	});
});
