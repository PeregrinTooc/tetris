describe("Preview Board", () => {
  beforeEach(() => {
    cy.visit("/index.html");
    cy.window().then((win) => {
      win.setTetrominoDropTime(100000);
    });
    cy.get("#start-button").click();
  });

  it("should show a tetromino in the preview area when the game starts", () => {
    cy.get("#preview-container").find(".tetromino").should("exist");
  });
});
