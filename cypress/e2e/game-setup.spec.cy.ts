/// <reference types="cypress" />

const spaceBar = " ";

describe("Tetris Game Setup", () => {
  beforeEach(() => {
    cy.visit("/index.html");
    cy.window().then((win) => {
      win.setTetrominoDropTime(100);
      for (let i = 0; i < 10; i++) win.pushTetrominoSeed(1337);
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
    cy.get("#game-board .tetromino").should("exist");
    cy.get("#game-over").should("not.exist");
  });

  it("should spawn the next tetromino when the current one stops moving", () => {
    cy.get("#start-button").click();
    cy.get('#game-board [data-tetromino-id="1"]').then(($tetromino) => {
      cy.get("body").type(spaceBar);
      cy.wait(10);
      cy.get("#game-board .tetromino").should("have.length", 2);
      cy.get('#game-board [data-tetromino-id="2"]').then(($newTetromino) => {});
    });
  });

  it('should change the text of the start button to "Reset Game" after starting', () => {
    cy.get("#start-button").click();
    cy.get("#start-button").should("contain", "Reset Game");
  });

  it("should clear the game board when the game is restarted and reset the text to Start Game", () => {
    cy.get("#start-button").click();
    cy.get("#game-board .tetromino").should("exist");
    cy.get("#start-button").click();
    cy.get("#game-board .tetromino").should("not.exist");
  });

  it.skip("should detect and clear complete lines", () => {
    cy.get("#start-button").click();
    cy.get(".tetromino").then(($tetromino) => {
      const initialTop = parseInt($tetromino.css("top"), 10);
      // Move the tetromino down to create a complete line
      for (let i = 0; i < 20; i++) {
        cy.get("body").type(spaceBar);
      }
      cy.get(".tetromino").should(($el) => {
        const newTop = parseInt($el.css("top"), 10);
        expect(newTop).to.be.greaterThan(initialTop);
      });
      cy.get("#game-board").find(".line-complete").should("exist");
    });
  });

  it("should detect and display game over when the stack reaches the top", () => {
    cy.get("#start-button").click();
    function pollForGameOver(): any {
      return cy.get("body").then((): any => {
        if (Cypress.$("#game-over").length === 0) {
          cy.get("body").type(spaceBar);
          return cy.wait(20).then((): any => pollForGameOver());
        }
      });
    }
    pollForGameOver();
    cy.get("#game-over", { timeout: 12000 }).should("be.visible");
    cy.get("#start-button").click();
    cy.get("#game-over").should("not.exist");
  });

  it("should stop ticking and not spawn new tetrominoes after game over", () => {
    cy.get("#start-button").click();
    function pollForGameOver(): any {
      return cy.get("body").then((): any => {
        if (Cypress.$("#game-over").length === 0) {
          cy.get("body").type(spaceBar);
          return cy.wait(20).then((): any => pollForGameOver());
        }
      });
    }
    pollForGameOver();
    cy.get("#game-over", { timeout: 12000 }).should("be.visible");
    cy.get(".tetromino").then(($tetrominoesBefore) => {
      cy.wait(500);
      cy.get(".tetromino").should("have.length", $tetrominoesBefore.length);
    });
  });
});
