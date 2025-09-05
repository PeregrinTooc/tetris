describe("Pause functionality", () => {
    beforeEach(() => {
        cy.visit("/");
        cy.window().then((win) => {
            win.setTetrominoDropTime(100);
            win.pushTetrominoSeed(1337);
        });
        cy.get("#start-button").click();
    });

    it("should pause and resume game with P key", () => {
        // Get initial position of tetromino
        cy.get("[data-tetromino-id]").then(($tetromino) => {
            const initialTop = $tetromino.position().top;

            // Press P to pause
            cy.get("body").type("p");

            // Verify pause overlay is shown
            cy.get("#pause-overlay").should("be.visible");
            cy.get("#pause-overlay").should("contain", "Paused");

            // Wait some time to verify tetromino doesn't move
            cy.wait(300);

            cy.get("[data-tetromino-id]").then(($pausedTetromino) => {
                expect($pausedTetromino.position().top).to.equal(initialTop);
            });

            // Resume game with P and verify movement continues
            cy.get("body").type("p");

            // Verify pause overlay is hidden
            cy.get("#pause-overlay").should("not.be.visible");

            cy.wait(300);

            cy.get("[data-tetromino-id]").then(($resumedTetromino) => {
                expect($resumedTetromino.position().top).to.be.greaterThan(initialTop);
            });
        });
    });

    it("should pause and resume game with Escape key", () => {
        // Get initial position of tetromino
        cy.get("[data-tetromino-id]").then(($tetromino) => {
            const initialTop = $tetromino.position().top;

            // Press Escape to pause
            cy.get("body").type("{esc}");

            // Verify pause overlay is shown
            cy.get("#pause-overlay").should("be.visible");
            cy.get("#pause-overlay").should("contain", "Paused");

            // Wait some time to verify tetromino doesn't move
            cy.wait(300);

            cy.get("[data-tetromino-id]").then(($pausedTetromino) => {
                expect($pausedTetromino.position().top).to.equal(initialTop);
            });

            // Resume game with Escape and verify movement continues
            cy.get("body").type("{esc}");

            // Verify pause overlay is hidden
            cy.get("#pause-overlay").should("not.be.visible");

            cy.wait(300);

            cy.get("[data-tetromino-id]").then(($resumedTetromino) => {
                expect($resumedTetromino.position().top).to.be.greaterThan(initialTop);
            });
        });
    });
});
