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

  it('should allow the player to move the tetromino to the right', () => {
    cy.get('#start-button').click();
    cy.get('.tetromino').then(($el) => {
      const initialLeft = parseInt($el.css('left'), 10);
      cy.get('body').type('{rightarrow}');
      cy.get('.tetromino').should(($el2) => {
        const newLeft = parseInt($el2.css('left'), 10);
        expect(newLeft).to.be.greaterThan(initialLeft);
      });
    });
  });


  it.skip('should make the tetromino stop when it reaches the bottom after the drop time has passed', () => {

  });

  it.skip('should make the tetromino stop when it collides with another tetromino after the drop time has passed', () => {

  });




  it.skip('should preview the next tetromino in the next piece frame', () => {

  });

  it.skip('should spawn the next tetromino when the current one stops moving', () => { });

  it.skip('should allow the player to drop the tetromino immediately', () => { });

  it.skip('should detect and clear complete lines', () => { });



  it.skip('should detect and display game over when the stack reaches the top', () => {

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
