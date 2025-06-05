describe('Tetris Game Acceptance Tests', () => {
  beforeEach(() => {
    cy.visit('/index.html');
    cy.window().then((win) => {
      win.setTetrominoDropTime(10);
    });
  });
  it('should display the game board when the page loads', () => {
    cy.get('h1').should('contain', 'Tetris'); // Check if the title is present
    cy.get('#game-board').should('be.visible');
    cy.get('#start-button').should('be.visible'); // Check if the start button is present
    cy.get('#next-piece').should('be.visible'); // Check if the next piece frame is present
  });

  it('should start the game and spawn a tetromino when "Start Game" is clicked', () => {
    cy.get('#start-button').click(); // Click the start button
    cy.get('.tetromino').should('exist'); // Check if a tetromino is spawned
    cy.get('#game-over').should('not.exist'); // Ensure game over message is not displayed
  });

  it('should make the tetromino fall automatically', () => {
    cy.get('#start-button').click();
    cy.wait(10);
    cy.get('.tetromino').should('have.css', 'top').and('not.equal', '0px');
    cy.wait(30);
    validateTetrominoDrop();
  });

  it.skip('should allow the player to move and rotate the tetromino', () => {
    // Acceptance Test 4
  });

  it.skip('should preview the next tetromino in the next piece frame', () => {
    // Acceptance Test 5
  });

  it.skip('should detect and display game over when the stack reaches the top', () => {
    // Acceptance Test 6
  });
});

function validateTetrominoDrop() {
  cy.get('.tetromino').then(($el) => {
    const topAfterFirstMove = parseInt($el.css('top'), 10);
    cy.wait(30);
    cy.get('.tetromino').should(($el2) => {
      const topAfterSecondMove = parseInt($el2.css('top'), 10);
      expect(topAfterSecondMove).to.be.greaterThan(topAfterFirstMove);
    });
  });
}
