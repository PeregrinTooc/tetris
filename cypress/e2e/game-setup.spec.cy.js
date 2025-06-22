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

  it('should start the game and spawn a tetromino when "Start Game" is clicked', () => {
    cy.get("#start-button").click();
    cy.get('[data-tetromino-id="1"]').should("exist");
    cy.get("#game-over").should("not.exist");
  });

  it("should spawn the next tetromino when the current one stops moving", () => {
    cy.get("#start-button").click();
    cy.get('[data-tetromino-id="1"]').then(($tetromino) => {
      cy.get("body").type("{downarrow}");
      cy.wait(10);
      cy.get("#game-board [data-tetromino-id]").should("have.length", 2);
      cy.get('#game-board [data-tetromino-id="2"]').then(($newTetromino) => {});
    });
  });

  it('should change the text of the start button to "Reset Game" after starting', () => {
    cy.get("#start-button").click();
    cy.get("#start-button").should("contain", "Reset Game");
  });

  it("should clear the game board when the game is restarted and reset the text to Start Game", () => {
    cy.get("#start-button").click();
    cy.get('[data-tetromino-id="1"]').should("exist");
    cy.get("#start-button").click();
    cy.get("[data-tetromino-id]").should("not.exist");
  });

  it("should preview the next tetromino in the next piece frame", () => {
    cy.get("#start-button").click();
    cy.get("#preview-container").should("be.visible");
    cy.get('[data-tetromino-id="1"]').then(($tetromino) => {
      const nextTetrominoId =
        parseInt($tetromino.attr("data-tetromino-id"), 10) + 1;
      cy.get("#preview-container")
        .find(`[data-tetromino-id="${nextTetrominoId}"]`)
        .should("exist");
    });
  });

  it.skip("should detect and clear complete lines", () => {
    cy.get("#start-button").click();
    cy.get('[data-tetromino-id="1"]').then(($tetromino) => {
      const initialTop = parseInt($tetromino.css("top"), 10);
      for (let i = 0; i < 20; i++) {
        cy.get("body").type("{downarrow}");
      }
      cy.get('[data-tetromino-id="1"]').should(($el) => {
        const newTop = parseInt($el.css("top"), 10);
        expect(newTop).to.be.greaterThan(initialTop);
      });
      cy.get("#game-board").find(".line-complete").should("exist");
    });
  });

  it("should detect and display game over when the stack reaches the top", () => {
    cy.get("#start-button").click();
    cy.get('[data-tetromino-id="1"]').then(($tetromino) => {
      const initialTop = parseInt($tetromino.css("top"), 10);
      for (let i = 0; i <= 20; i++) {
        cy.get("body").type("{downarrow}");
      }
      cy.get('[data-tetromino-id="1"]').should(($el) => {
        const newTop = parseInt($el.css("top"), 10);
        expect(newTop).to.be.greaterThan(initialTop);
      });
      cy.get("#game-over").should("be.visible");
      cy.get("#start-button").click();
      cy.get("#game-over").should("not.exist");
    });
  });
});
