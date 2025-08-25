
import { setTetrominoDropTimeInMiliseconds, addTetrominoO, addTetrominoL, pressLeft, pressRight, pressDown, pressRotate, pressHardDrop, doTimes } from "../support/testUtils";

describe("Line completion with O and L pieces", () => {
    beforeEach(() => {
        cy.visit("/index.html");
        cy.window().then((win) => {
            setTetrominoDropTimeInMiliseconds(win, 10000);
            // Fill left to right, 2 blocks high (1 O-pieces per column)
            for (let i = 0; i < 5; i++) {
                addTetrominoO(win);
            }
            // L-piece for the far right
            addTetrominoL(win);
        });
    });

    it("should fill 4 rows with O-pieces and complete 2 lines with an L-piece on the right", () => {
        cy.get("#start-button").click();

        // Drop O-pieces from left to right
    doTimes(5, pressLeft);
    pressHardDrop(); // drop O
    doTimes(3, pressLeft);
    pressHardDrop(); // drop O
    pressLeft();
    pressHardDrop(); // drop O
    pressRight();
    pressHardDrop(); // drop O
    doTimes(3, pressRight);
    pressHardDrop(); // drop O

        // Move L-piece to far right
    pressDown();
    doTimes(3, pressRotate);
    for (let i = 0; i < 9; i++) pressRight();
    pressHardDrop(); // drop L-piece

        
        // Assert that the bottom two rows are cleared and the horizontal bar of the L is dropped
        cy.get('#game-board [data-tetromino-id="6"]').children().should(($el) => {
            const top = parseInt($el.css("top"), 10);
            expect(top).to.be.equal(24); //the blocks are one below the parent
        });
    });
});
