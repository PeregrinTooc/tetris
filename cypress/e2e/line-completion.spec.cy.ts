
import { setTetrominoDropTimeInMiliseconds, addTetrominoO, addTetrominoI, addTetrominoT, addTetrominoBase, pressLeft, pressRight, pressDown, pressRotate, pressHardDrop } from "../support/testUtils";

describe("Line completion", () => {
    beforeEach(() => {
        cy.visit("/index.html");
        cy.window().then((win) => {
            setTetrominoDropTimeInMiliseconds(win, 1000);
            // Sequence: O I T O to fill bottom row
            addTetrominoO(win);
            addTetrominoI(win);
            addTetrominoT(win);
            addTetrominoO(win);
            addTetrominoBase(win);
        });
    });

    it("should clear completed line and drop remaining blocks", () => {
        cy.get("#start-button").click();

        // Position O piece on bottom right
    for (let i = 0; i < 5; i++) pressRight();
    pressHardDrop(); // drop

        // Position I piece on bottom left
    for (let i = 0; i < 4; i++) pressLeft();
    pressHardDrop(); // drop

        // Position T piece in center
    cy.wait(50); // ensure piece spawned
    for (let i = 0; i < 2; i++) pressDown();
    for (let i = 0; i < 2; i++) pressRotate();
    pressHardDrop(); // drop in center

        // Position final O piece on bottom right edge of gap
    cy.wait(50);
    for (let i = 0; i < 2; i++) pressRight();
    pressHardDrop(); // drop

        // By now bottom line should be complete and cleared
    cy.wait(200); // wait for line clear animation/logic

        // Final piece should fall only 1 space to validate line was cleared
    for (let i = 0; i < 4; i++) pressLeft();
    pressHardDrop(); // drop test piece
        cy.wait(50); 

        cy.get('#game-board [data-tetromino-id="5"]').should(($el) => {
            const top = parseInt($el.css("top"), 10);
            expect(top).to.equal(480); // Should drop to bottom line
        });
    });
});
