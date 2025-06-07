describe("Tetris Game Setup", () => {
    beforeEach(() => {
        cy.visit("/index.html");
        cy.window().then((win) => {
            win.setTetrominoDropTime(100);
        });
    });

    it("should display the game board when the page loads", () => {
        cy.get("h1").should("contain", "Tetris");
        cy.get("#game-board").should("be.visible");
        cy.get("#start-button").should("be.visible");
        cy.get("#next-piece").should("be.visible");
    });

    it("should start the game and spawn a tetromino when \"Start Game\" is clicked", () => {
        cy.get("#start-button").click();
        cy.get(".tetromino").should("exist");
        cy.get("#game-over").should("not.exist");
    });

    it.skip("should preview the next tetromino in the next piece frame", () => {
    });

    it.skip("should spawn the next tetromino when the current one stops moving", () => {
    });

    it.skip("should detect and clear complete lines", () => {
    });

    it.skip("should detect and display game over when the stack reaches the top", () => {
    });
});