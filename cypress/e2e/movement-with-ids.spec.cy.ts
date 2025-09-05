/// <reference types="cypress" />

import { setTetrominoDropTimeInMiliseconds, addTetrominoBase, pressLeft, pressRight } from "../support/testUtils";

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
        cy.get("#game-board [data-tetromino-id]").first().then($tetromino => {
            const tetrominoId = $tetromino.attr("data-tetromino-id");
            const initialLeft = parseInt($tetromino.css("left"));

            pressRight();

            // Verify container moved using ID selector
            cy.get(`[data-tetromino-id="${tetrominoId}"]`).not(".block").should($movedTetromino => {
                const newLeft = parseInt($movedTetromino.css("left"));
                expect(newLeft).to.be.greaterThan(initialLeft);
            });
        });
    });

    it("should verify all blocks of a tetromino have the same ID", () => {
        cy.get("#start-button").click();

        cy.get("#game-board .tetromino").first().then($tetromino => {
            const tetrominoId = $tetromino.attr("data-tetromino-id");

            // All blocks should have the same tetromino ID
            cy.get(`[data-tetromino-id="${tetrominoId}"].block`).should("have.length.greaterThan", 0);
            cy.get(`[data-tetromino-id="${tetrominoId}"].block`).each($block => {
                expect($block.attr("data-tetromino-id")).to.equal(tetrominoId);
            });
        });
    });

    it("should allow selecting tetromino and its blocks by ID", () => {
        cy.get("#start-button").click();

        cy.get("#game-board .tetromino").first().then($tetromino => {
            const tetrominoId = $tetromino.attr("data-tetromino-id");

            // Can select the tetromino container by ID
            cy.get(`[data-tetromino-id="${tetrominoId}"]`).not(".block").should("have.length", 1);

            // Can select all blocks of this tetromino by ID  
            cy.get(`[data-tetromino-id="${tetrominoId}"].block`).should("have.length.greaterThan", 0);

            // Total elements with this ID = container + blocks
            cy.get(`[data-tetromino-id="${tetrominoId}"]`).should("have.length.greaterThan", 1);
        });
    });

    it("should work with both old and new selector approaches", () => {
        cy.get("#start-button").click();

        // Old approach: container-based
        cy.get("#game-board .tetromino .block").should("exist");

        // New approach: ID-based 
        cy.get("#game-board [data-tetromino-id].block").should("exist");

        // Both should find blocks
        cy.get("#game-board .tetromino").first().then($tetromino => {
            const tetrominoId = $tetromino.attr("data-tetromino-id");

            cy.get(".tetromino .block").should("have.length.greaterThan", 0);
            cy.get(`[data-tetromino-id="${tetrominoId}"].block`).should("have.length.greaterThan", 0);
        });
    });
});
