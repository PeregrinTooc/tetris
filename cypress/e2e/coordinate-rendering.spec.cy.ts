/// <reference types="cypress" />

import { setTetrominoDropTimeInMiliseconds, addTetrominoBase } from "../support/testUtils";

describe("Coordinate-Based Rendering", () => {
    beforeEach(() => {
        cy.visit("/index.html");
        cy.window().then((win) => {
            setTetrominoDropTimeInMiliseconds(win, 100);
            // Enable coordinate-based rendering
            (win as any).USE_COORDINATE_RENDERING = true;
            addTetrominoBase(win);
        });
    });

    it("should render blocks using coordinate positioning", () => {
        cy.get("#start-button").click();

        // In coordinate mode, blocks should be direct children of game-board with absolute positioning
        cy.get("#game-board .coordinate-block").should("exist");
        cy.get("#game-board .coordinate-block").should("have.css", "position", "absolute");
    });

    it("should move blocks when tetromino moves", () => {
        cy.get("#start-button").click();

        // Get initial position of a block
        cy.get("#game-board .coordinate-block").first().then($block => {
            const initialLeft = parseInt($block.css("left"));

            // Move tetromino right
            cy.get("body").type("{rightarrow}");

            // Block should have moved
            cy.get("#game-board .coordinate-block").first().should($movedBlock => {
                const newLeft = parseInt($movedBlock.css("left"));
                expect(newLeft).to.be.greaterThan(initialLeft);
            });
        });
    });

    it("should update block positions when tetromino falls", () => {
        cy.get("#start-button").click();

        // Get initial position of a block
        cy.get("#game-board .coordinate-block").first().then($block => {
            const initialTop = parseInt($block.css("top"));

            // Wait for tetromino to fall
            cy.wait(200);

            // Block should have moved down
            cy.get("#game-board .coordinate-block").first().should($movedBlock => {
                const newTop = parseInt($movedBlock.css("top"));
                expect(newTop).to.be.greaterThan(initialTop);
            });
        });
    });
});
