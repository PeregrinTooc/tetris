
import { setTetrominoDropTimeInMiliseconds, addTetrominoI, addTetrominoT, pressLeft, pressRight, pressDown, pressRotate, pressHardDrop, doTimes } from "../support/testUtils";

describe("Line completion with O and L pieces", () => {
    beforeEach(() => {
        cy.visit("/index.html");
        cy.window().then((win) => {
            setTetrominoDropTimeInMiliseconds(win, 10000);
            // Fill left to right, 2 blocks high (1 O-pieces per column)
            for (let i = 0; i < 5; i++) {
                addTetrominoI(win);
            }
            // L-piece for the far right
            addTetrominoT(win);
        });
    });

    it("should collapse tetrominos after line completion", () => {
        cy.get("#start-button").click();

        doTimes(2, () => {
            doTimes(4, pressRight);
            pressHardDrop();
        });

        doTimes(2, () => {
            pressLeft();
            pressHardDrop();
        });

        pressDown();
        pressRotate();
        doTimes(5, pressLeft);
        pressHardDrop();

        pressDown();
        pressRotate();
        doTimes(4, pressLeft);
        pressHardDrop();

        //assert that the blocks of the I-piece (ID "5") have collapsed after line completion
        cy.get('#game-board [data-tetromino-id="5"].block').should("exist").then($blocks => {
            // Get absolute positions of all blocks for this I-tetromino
            const positions = Array.from($blocks).map(block => {
                const blockTop = parseInt(block.style.top);
                let absoluteTop = blockTop;

                // For container-based rendering, add the container's position
                const container = block.closest('.tetromino') as HTMLElement;
                if (container && container.style.display !== 'none') {
                    const containerTop = parseInt(container.style.top || '0');
                    absoluteTop = containerTop + blockTop;
                }

                return Math.round(absoluteTop / 24); // Convert to grid position
            });

            cy.log(`I-tetromino absolute grid positions: ${positions.join(', ')}`);

            // After line completion, I-piece blocks should be in the bottom area
            // The horizontal bar should have dropped down after the lines completed
            const bottomAreaBlocks = positions.filter(y => y > 17);
            expect(bottomAreaBlocks.length, `I-tetromino blocks should be in bottom area after line completion, got positions: ${positions}`).to.be.equal(3);
        });
    });
});
