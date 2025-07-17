describe("Preview of Next Piece", () => {
  beforeEach(() => {
    cy.visit("/index.html");
    cy.window().then((win) => {
      win.setTetrominoDropTime(100000);
      win.pushTetrominoSeed(1); // I shape
      win.pushTetrominoSeed(2); // O shape
    });
    cy.get("#start-button").click();
  });

  it("should update the preview when a new tetromino is spawned", () => {
    // Preview should show O shape before it spawns
    cy.get("#preview-container .tetromino-o").should("exist");
    // Drop the I shape
    cy.get("body").type(" ");
    // Wait for the O tetromino to appear on the game board
    cy.get("#game-board .tetromino-o", { timeout: 3000 }).should("exist");
    // Now the preview should the next piece
    cy.get("#preview-container").should(($container) => {
      expect($container.length).to.eq(1);
    });
  });
});
