/// <reference types="cypress" />

describe("Line completion with O and L pieces", () => {
    beforeEach(() => {
        cy.visit("/index.html");
        cy.window().then((win) => {
            win.setTetrominoDropTime(10000);
            // Fill left to right, 2 blocks high (1 O-pieces per column)
            for (let i = 0; i < 5; i++) {
                win.pushTetrominoSeed(2); // O-shape
            }
            // L-piece for the far right
            win.pushTetrominoSeed(4); // L-shape
        });
    });

    it("should fill 4 rows with O-pieces and complete 2 lines with an L-piece on the right", () => {
        cy.get("#start-button").click();

        // Drop O-pieces from left to right
        for (let i = 0; i < 5; i++) cy.get("body").type("{leftarrow}");
        cy.get("body").type(" "); // drop O
        cy.wait(50);
        for (let i = 0; i < 3; i++) cy.get("body").type("{leftarrow}");
        cy.get("body").type(" "); // drop O
        cy.wait(50);
        cy.get("body").type("{leftarrow}");
        cy.get("body").type(" "); // drop O
        cy.wait(50);
        cy.get("body").type("{rightarrow}");
        cy.get("body").type(" "); // drop O
        cy.wait(50);
        for (let i = 0; i < 3; i++) cy.get("body").type("{rightarrow}");
        cy.get("body").type(" "); // drop O
        cy.wait(50);

        // Move L-piece to far right
        cy.get("body").type("{downarrow}");
        for (let i = 0; i < 3; i++)cy.get("body").type("{uparrow}");
        for (let i = 0; i < 9; i++) cy.get("body").type("{rightarrow}");
        cy.get("body").type(" "); // drop L-piece
        cy.wait(200);

        
        // Assert that the bottom two rows are cleared and the horizontal bar of the L is dropped
        cy.get('#game-board [data-tetromino-id="6"]').should(($el) => {
            const top = parseInt($el.css("top"), 10);
            expect(top).to.be.equal(480); // 24px per block, so y=20 is 480px
        });
    });
});
