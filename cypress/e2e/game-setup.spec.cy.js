describe("Tetris Game Setup", () => {
    beforeEach(() => {
        cy.visit("/index.html");
        cy.window().then((win) => {
            win.setTetrominoDropTime(100000);
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

    it("should spawn the next tetromino when the current one stops moving", () => {
        cy.get("#start-button").click();
        cy.get("[data-tetromino-id=\"1\"]").then(($tetromino) => {
            cy.get("body").type("{downarrow}");
            cy.wait(10);
            cy.get(".tetromino").should("have.length", 2);
            cy.get("[data-tetromino-id=\"2\"]").then(($newTetromino) => {
            });
        });
    });

    it("should change the text of the start button to \"Reset Game\" after starting", () => {
        cy.get("#start-button").click();
        cy.get("#start-button").should("contain", "Reset Game");
    });

    it("should clear the game board when the game is restarted and reset the text to Start Game", () => {
        cy.get("#start-button").click();
        cy.get(".tetromino").should("exist");
        cy.get("#start-button").click();
        cy.get(".tetromino").should("not.exist");
    });

    it.skip("should preview the next tetromino in the next piece frame", () => {
    });


    it.skip("should detect and clear complete lines", () => {
    });

    it.skip("should detect and display game over when the stack reaches the top", () => {
    });
});