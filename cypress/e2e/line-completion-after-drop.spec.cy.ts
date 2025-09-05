import { setTetrominoDropTimeInMiliseconds, addTetrominoO, addTetrominoI, addTetrominoT, doTimes, pressRight, pressLeft, pressDown, pressRotate, pressHardDrop, addTetrominoBase } from "../support/testUtils";

describe("Line Completion", () => {
  beforeEach(() => {
    cy.visit("/index.html");
    cy.window().then((win) => {
      setTetrominoDropTimeInMiliseconds(win, 10000);
      doTimes(5, () => addTetrominoO(win));
      doTimes(2, () => addTetrominoI(win));
      doTimes(2, () => addTetrominoT(win));
      doTimes(2, () => addTetrominoBase(win));
    });
    cy.get("#start-button").click();
  });

  it("blocks drop after line completion if there is a gap under them", () => {
    // Sequence: 5 O's (IDs 1-5), 2 I's (IDs 6-7), 2 T's (IDs 8-9), 2 Base (IDs 10-11)
    // The first T-tetromino will have ID "8"
    const firstTTetrominoId = "8";

    // Execute the movements to complete a line
    doTimes(5, pressLeft);
    pressHardDrop();
    doTimes(3, pressLeft);
    pressHardDrop();
    pressLeft();
    pressHardDrop();
    doTimes(2, pressRight);
    pressHardDrop()
    doTimes(4, pressRight);
    pressHardDrop();
    doTimes(5, pressLeft);
    pressHardDrop();
    doTimes(4, pressRight);
    pressHardDrop();
    // Drop the T-tetromino down 2 blocks before rotating to avoid collision at top
    doTimes(2, pressDown);
    doTimes(3, pressRotate);
    pressLeft();
    pressHardDrop();
    // Drop the next T-tetromino down 2 blocks before rotating  
    doTimes(2, pressDown);
    doTimes(3, pressRotate);
    pressRight();
    pressHardDrop();

    // Debug: Check how many blocks we have
    cy.get(".block").then($blocks => {
      cy.log(`Total blocks found: ${$blocks.length}`);
    });

    // Check if line completion happened - should have fewer blocks now
    cy.get(".block").should("have.length.lessThan", 40); // Should be much less than 40 if line completion worked

    // Check that the first T-tetromino's blocks still exist and have correct count
    cy.get(`[data-tetromino-id="${firstTTetrominoId}"].block`).should("exist").then($blocks => {
      const blockCount = $blocks.length;
      cy.log(`T-tetromino (ID ${firstTTetrominoId}) has ${blockCount} blocks remaining`);

      // For T-tetromino after line completion, should have 3 blocks remaining
      expect(blockCount).to.equal(3);

      // Get absolute positions of all blocks for this T-tetromino
      const positions = Array.from($blocks).map(block => {
        // Get the block's position
        const blockTop = parseInt(block.style.top);

        // For container-based rendering, we need to add the container's position
        // For coordinate-based rendering, the position is already absolute
        let absoluteTop = blockTop;

        // Check if this is container-based rendering (block has a tetromino parent)
        const container = block.closest('.tetromino') as HTMLElement;
        if (container && container.style.display !== 'none') {
          const containerTop = parseInt(container.style.top || '0');
          absoluteTop = containerTop + blockTop;
        }

        const y = Math.round(absoluteTop / 24); // Convert pixels to grid position
        return y;
      });

      cy.log(`T-tetromino absolute grid positions: ${positions.join(', ')}`);

      // For a 20-row board (0-20), after line completion and dropping:
      // The blocks should drop to the bottom. Let's be strict about this to demonstrate the bug.
      // After line completion, T-tetromino blocks should be at bottom rows (19, 20)
      const bottomBlocks = positions.filter(y => y === 20);
      const nearBottomBlocks = positions.filter(y => y === 19);

      // This should fail initially due to the bug - blocks don't drop properly
      expect(bottomBlocks.length + nearBottomBlocks.length, `T-tetromino blocks should drop to bottom rows (19,20) after line completion, got positions: ${positions}`).to.equal(3);

      // Even more strict: at least 2 blocks should be at the very bottom (y=20)
      expect(bottomBlocks.length, `At least 2 T-tetromino blocks should be at bottom (y=20), got positions: ${positions}`).to.be.greaterThan(1);
    });
  });
});
