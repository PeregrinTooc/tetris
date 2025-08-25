import { setTetrominoDropTimeInMiliseconds, addTetrominoBase, pressLeft, pressRight, pressHardDrop } from "../support/testUtils";

describe("Tetris Game Movement", () => {
  beforeEach(() => {
    cy.visit("/index.html");
    cy.window().then((win) => {
      setTetrominoDropTimeInMiliseconds(win, 100);
  for (let i = 0; i < 10; i++) addTetrominoBase(win);
    });
  });

  afterEach(() => {
    cy.get("#start-button").click(); // Reset the game after each test
    cy.get(".tetromino").should("not.exist");
  });

  it("should make the tetromino fall automatically", () => {
    cy.get("#start-button").click();
    cy.wait(10);
    cy.get(".tetromino").should("have.css", "top").and("not.equal", "0px");
    cy.wait(30);
    validateTetrominoDrop();
  });

  it("should allow the player to move the tetromino to the right", () => {
    cy.get("#start-button").click();
    cy.get(".tetromino").then(($el) => {
      const initialLeft = parseInt($el.css("left"), 10);
      pressRight();
      cy.get(".tetromino").should(($el2) => {
        const newLeft = parseInt($el2.css("left"), 10);
        expect(newLeft).to.be.greaterThan(initialLeft);
      });
    });
  });

  it("should allow the player to move the tetromino to the left", () => {
    cy.get("#start-button").click();
    cy.get(".tetromino").then(($el) => {
      const initialRight = parseInt($el.css("right"), 10);
      pressLeft();
      cy.get(".tetromino").should(($el2) => {
        const newRight = parseInt($el2.css("right"), 10);
        expect(newRight).to.be.greaterThan(initialRight);
      });
    });
  });

  it("should allow the player to drop the tetromino immediately", () => {
    cy.window().then((win) => {
      setTetrominoDropTimeInMiliseconds(win, 2147483647);
    });
    cy.get("#start-button").click();
    cy.get(".tetromino").then(($el) => {
      const initialTop = parseInt($el.css("top"), 10);
      pressHardDrop();
      cy.get(".tetromino").should(($el2) => {
        const newTop = parseInt($el2.css("top"), 10);
        expect(newTop).to.equal(480);
      });
    });
  });

  it("should allow the player to soft drop the tetromino", () => {
    cy.window().then((win) => {
      win.setTetrominoDropTime(2147483647);
    });
    cy.get("#start-button").click();
    cy.get(".tetromino").then(($el) => {
      const initialTop = parseInt($el.css("top"), 10);
      cy.get("body").type("{downarrow}");
      cy.get(".tetromino").should(($el2) => {
        const newTop = parseInt($el2.css("top"), 10);
        expect(newTop).to.be.greaterThan(initialTop);
        expect(newTop).to.be.lessThan(480);
      });
    });
  });
});

function validateTetrominoDrop() {
  cy.get(".tetromino").then(($el) => {
    const topAfterFirstMove = parseInt($el.css("top"), 10);
    cy.wait(30);
    cy.get(".tetromino").should(($el2) => {
      const topAfterSecondMove = parseInt($el2.css("top"), 10);
      expect(topAfterSecondMove).to.be.greaterThan(topAfterFirstMove);
    });
  });
}

function moveTetrominoToLeftEdge() {
  cy.get(".tetromino").then(($el) => {
    const moveLeft = () => {
      cy.get(".tetromino").then(($tetromino) => {
        const left = parseInt($tetromino.css("left"), 10);
        if (left > 0) {
          cy.get("body").type("{leftarrow}");
          moveLeft();
        }
      });
    };
    moveLeft();
  });
}

function moveTetrominoToRightEdge() {
  cy.get(".tetromino").then(($el) => {
    const moveRight = () => {
      cy.get(".tetromino").then(($tetromino) => {
        const right = parseInt($tetromino.css("right"), 10);
        if (right > 0) {
          cy.get("body").type("{rightarrow}");
          moveRight();
        }
      });
    };
    moveRight();
  });
}
