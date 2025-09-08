describe('Tetris Hold Functionality', () => {
    beforeEach(() => {
        cy.visit('/');

        // Set up deterministic piece sequence for testing
        cy.window().then((win) => {
            win.setTetrominoDropTime(10000); // Very slow drops for testing
            // Queue up many of the same pieces for deterministic testing
            win.pushTetrominoSeed(0); // First T piece
            win.pushTetrominoSeed(0); // Second T piece for swap test
            win.pushTetrominoSeed(0); // Third T piece as backup
            win.pushTetrominoSeed(0); // Fourth T piece as backup
        });

        // Start game and wait for first piece
        cy.get('#start-button').click();
        cy.get('#game-board .tetromino').should('exist');
    });

    it('should display held piece in hold board when H is pressed', () => {
        // Get initial piece's ID
        cy.get('#game-board .tetromino').then($tetromino => {
            const initialId = $tetromino.attr('data-tetromino-id');
            expect(initialId).to.not.be.undefined;

            // Press H to hold
            cy.get('body').type('h');
            cy.wait(500);

            // First piece should now be in hold board with same ID
            cy.get('#hold-board').find(`[data-tetromino-id="${initialId}"]`).should('exist');

            // Second piece should be active with different ID
            cy.get('#game-board .tetromino').should($newTetromino => {
                const newId = $newTetromino.attr('data-tetromino-id');
                expect(newId).to.not.equal(initialId);
            });
        });
    });

    it('should swap pieces when H is pressed again', () => {
        // Get initial piece's ID
        cy.get('#game-board .tetromino').then($tetromino => {
            const firstId = "1";
            expect($tetromino.attr('data-tetromino-id')).to.equal(firstId);
            cy.log(`First piece ID: ${firstId}`);

            // Hold first piece
            cy.get('body').type('h');
            cy.wait(500);

            // Get second piece's ID
            cy.get('#game-board .tetromino').then($secondTetromino => {
                const secondId = $secondTetromino.attr('data-tetromino-id');
                expect(secondId).to.equal("2");
                cy.log(`Second piece ID: ${secondId}`);

                // Verify first piece is held and second piece is active
                cy.get('#hold-board').find(`[data-tetromino-id="${firstId}"]`).should('exist');
                cy.get('#game-board').find(`[data-tetromino-id="${secondId}"]`).should('exist');
                cy.log('First hold completed successfully');

                // Drop the current piece to lock it so we can hold again
                cy.get('body').trigger('keydown', { key: ' ' }); // Space bar for hard drop
                cy.wait(500); // Wait for the piece to lock and new piece to spawn

                // Get the third piece's ID (spawned after second piece locked)
                cy.get('#game-board .tetromino[data-tetromino-id="3"]').then($thirdTetromino => {
                    const thirdId = $thirdTetromino.attr('data-tetromino-id');
                    cy.log(`Third piece ID: ${thirdId}`);

                    // Press H again to swap third piece with first piece
                    cy.get('body').type('h');
                    cy.wait(500);

                    // Debug: Log what's actually on the game board
                    cy.get('#game-board').then($board => {
                        cy.log(`Game board HTML: ${$board.html()}`);
                    });

                    // Debug: Check if any tetromino exists on game board
                    cy.get('#game-board .tetromino').should('exist').then($el => {
                        const actualId = $el.attr('data-tetromino-id');
                        cy.log(`After swap - found tetromino with ID: ${actualId}`);
                    });

                    // After locking second piece and holding: first piece should be back in game board, third piece should be in hold
                    cy.get('#game-board').find(`[data-tetromino-id="${firstId}"]`).should('exist');
                    cy.get('#hold-board').find(`[data-tetromino-id="${thirdId}"]`).should('exist');
                });
            });
        });
    });

    it('should disable keyboard controls for held piece', () => {
        // Get initial piece's ID and position
        cy.get('#game-board .tetromino').then($tetromino => {
            const tetrominoId = $tetromino.attr('data-tetromino-id');
            const initialLeft = $tetromino.position().left;
            expect(tetrominoId).to.not.be.undefined;

            // Press H to hold piece
            cy.get('body').type('h');
            cy.wait(100);

            // Get held piece by ID
            cy.get(`#hold-board [data-tetromino-id="${tetrominoId}"]`).then($held => {
                const heldPosition = $held.position().left;

                // Try to move with arrow keys
                cy.get('body').type('{leftarrow}');
                cy.wait(100);

                // Position should not change
                cy.get(`#hold-board [data-tetromino-id="${tetrominoId}"]`).then($afterMove => {
                    expect($afterMove.position().left).to.equal(heldPosition);
                });
            });
        });
    });

    it('should re-enable keyboard controls when piece is swapped back in', () => {
        // Hold T piece
        cy.get('body').type('h');

        // Swap T piece back in
        cy.get('body').type('h');

        // Store reference to piece after swap
        cy.get('#game-board .tetromino-t')
            .as('swappedPiece');

        cy.get('@swappedPiece').then($initial => {
            const initialPos = $initial.position().left;

            // Try moving left
            cy.get('body').type('{leftarrow}');

            // Verify piece moved
            cy.get('#game-board .tetromino-t').then($afterMove => {
                expect($afterMove.position().left).to.be.lessThan(initialPos);
            });
        });
    });

    it('should allow remapping of hold key', () => {
        // Reset key bindings by clearing local storage and reload page
        cy.clearLocalStorage();
        cy.reload();
        cy.window().then((win) => {
            win.setTetrominoDropTime(10000); // Very slow drops for testing
            win.pushTetrominoSeed(0); // T piece for testing
        });
        // Open settings
        cy.get('[data-settings-button]').click();
        cy.get('[data-key-rebind-menu]').should('be.visible');

        // Find the hold button by its label text
        cy.contains('.key-bind-row', 'Hold Piece')
            .find('button')
            .click();

        // Wait for rebind prompt
        cy.get('[data-rebind-prompt]').should('be.visible');

        // Press 'X' as new key
        cy.get('body').type('x');

        // Close settings
        cy.get('[data-settings-close]').click();

        // Start game and wait for piece
        cy.get('#start-button').click();
        cy.get('#game-board .tetromino').should('have.class', 'tetromino-t');


        // Get a reference to the initial piece
        cy.get('#game-board .tetromino')
            .should('have.class', 'tetromino-t')
            .then($initial => {
                const initialId = $initial.attr('data-tetromino-id');

                // Try old key - should not trigger hold, piece should stay in same place
                cy.get('body').type('h');
                cy.wait(500);

                // Same piece should still be active on game board
                cy.get('#game-board').find(`[data-tetromino-id="${initialId}"]`).should('exist');
                cy.get('#hold-board .tetromino').should('not.exist');

                // Try new key - should trigger hold and move piece to hold board
                cy.get('body').type('x');
                cy.wait(500);
                cy.get('#hold-board').find(`[data-tetromino-id="${initialId}"]`).should('exist');
            });
    });

    it('should prevent holding piece twice without locking', () => {
        // Hold first T piece
        cy.get('body').type('h');
        cy.wait(500);

        // Store reference to second T piece
        cy.get('#game-board .tetromino')
            .should('have.class', 'tetromino-t')
            .as('secondPiece');

        cy.get('@secondPiece').then($initial => {
            const initialPos = $initial.position().left;

            // Try to hold again immediately
            cy.get('body').type('h');
            cy.wait(500);

            // T piece should still be active and in same position
            cy.get('#game-board .tetromino')
                .should('have.class', 'tetromino-t')
                .then($afterHold => {
                    expect($afterHold.position().left).to.equal(initialPos);
                });
        });
    });

    it('should allow holding after piece lock', () => {
        // Wait for first T piece and hold it
        cy.get('#game-board .tetromino').should('have.class', 'tetromino-t');
        cy.get('body').type('h');
        cy.wait(500);

        // Wait for second T piece and drop it
        cy.get('#game-board .tetromino').should('have.class', 'tetromino-t');
        cy.get('body').type('{downarrow}'.repeat(20));

        // Wait for lock and third T piece spawn
        cy.wait(1100);
        cy.get('#game-board .tetromino').should('have.class', 'tetromino-t');

        // Should be able to hold T piece now
        cy.get('body').type('h');
        cy.wait(500);
        cy.get('#hold-board .tetromino').should('have.class', 'tetromino-t');
    });

    it('should clear the hold board after reset', () => {
        // Wait for first T piece and hold it
        cy.get('#game-board .tetromino').should('have.class', 'tetromino-t');
        cy.get('body').type('h');
        cy.wait(500);

        // Start game and wait for first piece
        cy.get('#start-button').click();

        cy.get('#hold-board .tetromino[data-tetromino-id="1"]').should('not.exist');
    });
});
