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
});
