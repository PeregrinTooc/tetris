import { describe, beforeEach, test, expect, jest } from "@jest/globals";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { Board } from "../src/board";
import { PreviewBoard } from "../src/preview-board";

describe("Line completion", () => {
    let board: Board;
    const element = document.createElement("div");

    beforeEach(() => {
        element.innerHTML = "";
        board = new Board(
            20,
            2,
            element,
            null,
            { dequeue: jest.fn(() => 1337) }
        );
    });

    test.skip("should detect and remove completed line", () => {
        // Create and position O piece on right
        const tetroO1 = TetrominoFactory.createNew(1, board, 1337);
        tetroO1.top = 19;
        tetroO1.lock();

        // Create and position I piece on left
        const tetro02 = TetrominoFactory.createNew(0, board, 1337);
        tetro02.top = 19;
        tetro02.lock();

        const tetro03 = TetrominoFactory.createNew(1, board, 1337);
        tetro03.top = 18;

        // Check if line was cleared
        console.log(board.occupiedPositions.filter((pos) => pos.y === 19).sort((pos) => pos.x).map(pos => `(${pos.x}, ${pos.y})`));
        expect(board.occupiedPositions.filter(pos => pos.y === 19).length).toBe(0);

        // Check if blocks above dropped down
        const blocks = tetro03.getBlocks();
        expect(blocks[0].y).toBe(19);
    });

    test.skip("should remove completed blocks from parent tetrominos", () => {
        // Fill most of a line
        const tetroI1 = TetrominoFactory.createNew(1, board, 1); // 4 blocks wide
        tetroI1.top = 19;
        tetroI1.lock();

        const tetroI2 = TetrominoFactory.createNew(5, board, 1); // 4 blocks wide
        tetroI2.top = 19;
        tetroI2.lock();

        // Add blocks above that should remain
        const tetroO = TetrominoFactory.createNew(8, board, 2);
        tetroO.top = 18;
        tetroO.lock();

        // Complete the line
        const tetroTest = TetrominoFactory.createNew(9, board, 2); // 2 blocks to complete line
        tetroTest.top = 19;
        tetroTest.lock();

        // Original tetrominos should have their bottom blocks removed but top blocks remain
        const blocksI1 = tetroI1.getBlocks();
        const blocksI2 = tetroI2.getBlocks();
        const blocksO = tetroO.getBlocks();

        expect(blocksI1.length).toBe(0); // All blocks were in completed line
        expect(blocksI2.length).toBe(0); // All blocks were in completed line
        expect(blocksO.length).toBe(4); // All blocks were above line
        expect(blocksO[0].y).toBe(19); // Blocks dropped down one space
    });
});
