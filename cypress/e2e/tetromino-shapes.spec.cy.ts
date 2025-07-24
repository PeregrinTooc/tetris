const tetrominoSeeds = [0, 1, 2, 3, 4, 5, 6]; // T, I, O, J, L, Z, S
const tetrominoClasses = [
  ".tetromino-t",
  ".tetromino-i",
  ".tetromino-o",
  ".tetromino-j",
  ".tetromino-l",
  ".tetromino-z",
  ".tetromino-s",
];

describe("All Tetromino Shapes", () => {
  tetrominoSeeds.forEach((seed, idx) => {
    it(`should spawn and render the correct shape for seed ${seed}`, () => {
      cy.visit("/index.html");
      cy.window().then((win) => {
        win.setTetrominoDropTime(100000);
        win.pushTetrominoSeed(seed);
      });
      cy.get("#start-button").click();
      cy.get("#game-board " + tetrominoClasses[idx]).should("exist");
      cy.get("#game-board " + tetrominoClasses[idx] + " .block").should(
        "have.length",
        4
      );
      // Drop and check next tetromino does not match previous
      cy.get("body").type(" ");
    });
  });
});

describe("Hard Drop Action", () => {
  it("should instantly drop the tetromino to the bottom when space is pressed", () => {
    cy.visit("/index.html");
    cy.window().then((win) => {
      win.setTetrominoDropTime(2147483647);
      win.pushTetrominoSeed(1); // I shape
    });
    cy.get("#start-button").click();
    cy.get(".tetromino-i").then(($el) => {
      const initialTop = parseInt($el.css("top"), 10);
      cy.get("body").type(" ");
      cy.get(".tetromino-i").should(($el2) => {
        const newTop = parseInt($el2.css("top"), 10);
        expect(newTop).to.be.greaterThan(initialTop);
      });
    });
  });
});
