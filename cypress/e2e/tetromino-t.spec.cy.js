describe("T-shaped Tetromino", () => {
  beforeEach(() => {
    cy.visit("/index.html");
    cy.window().then((win) => {
      win.setTetrominoDropTime(100000);
      if (win.pushTetrominoSeed) {
        win.pushTetrominoSeed(0); // 0 = T-shape
      }
    });
    cy.get("#start-button").click();
  });

  it("should spawn a T-shaped tetromino and render it on the board", () => {
    cy.get("#game-board .tetromino-t").should("exist");
    cy.get("#game-board .tetromino-t .block").should("have.length", 4);
  });

  it("should rotate the T tetromino clockwise and match expected block positions", () => {
    cy.get("#game-board .tetromino").first().as("tetromino");
    function getBlockOffsets($tetromino) {
      return $tetromino
        .find(".block")
        .map((i, el) => ({
          left: parseInt(el.style.left, 10),
          top: parseInt(el.style.top, 10),
        }))
        .get();
    }
    // Initial (rotation 0)
    cy.get("@tetromino").then(($tetromino) => {
      const blocks = getBlockOffsets($tetromino);
      expect(blocks).to.deep.equal([
        { left: 0, top: 0 },
        { left: -24, top: 0 },
        { left: 24, top: 0 },
        { left: 0, top: 24 },
      ]);
    });
    // Rotate to 1
    cy.get("body").type("{uparrow}");
    cy.wait(50);
    cy.get("@tetromino").then(($tetromino) => {
      const blocks = getBlockOffsets($tetromino);
      expect(blocks).to.deep.equal([
        { left: 0, top: 0 },
        { left: -24, top: 0 },
        { left: 0, top: -24 },
        { left: 0, top: 24 },
      ]);
    });
    // Rotate to 2
    cy.get("body").type("{uparrow}");
    cy.wait(50);
    cy.get("@tetromino").then(($tetromino) => {
      const blocks = getBlockOffsets($tetromino);
      expect(blocks).to.deep.equal([
        { left: 0, top: 0 },
        { left: 24, top: 0 },
        { left: -24, top: 0 },
        { left: 0, top: -24 },
      ]);
    });
    // Rotate to 3
    cy.get("body").type("{uparrow}");
    cy.wait(50);
    cy.get("@tetromino").then(($tetromino) => {
      const blocks = getBlockOffsets($tetromino);
      expect(blocks).to.deep.equal([
        { left: 0, top: 0 },
        { left: 24, top: 0 },
        { left: 0, top: -24 },
        { left: 0, top: 24 },
      ]);
    });
    // Rotate to 0 again
    cy.get("body").type("{uparrow}");
    cy.wait(50);
    cy.get("@tetromino").then(($tetromino) => {
      const blocks = getBlockOffsets($tetromino);
      expect(blocks).to.deep.equal([
        { left: 0, top: 0 },
        { left: -24, top: 0 },
        { left: 24, top: 0 },
        { left: 0, top: 24 },
      ]);
    });
  });
});
