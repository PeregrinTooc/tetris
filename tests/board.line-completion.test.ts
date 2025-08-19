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
            10,
            element,
            null,
            { dequeue: jest.fn(() => 1337) }
        );
    });

    test.skip("should detect and remove completed line", () => {
        // Create and position O piece on right
        const tetroO1 = TetrominoFactory.createNew(8, board, 2);
        tetroO1.top = 19;
        tetroO1.lock();

        // Create and position I piece on left
        const tetroI = TetrominoFactory.createNew(1, board, 1);
        tetroI.top = 19;
        tetroI.lock();

        // Create and position T piece in center 
        const tetroT = TetrominoFactory.createNew(5, board, 0);
        tetroT.top = 19;
        tetroT.lock();

        // Create and position another O piece to fill gap and trigger line completion
        const tetroO2 = TetrominoFactory.createNew(6, board, 2);
        tetroO2.top = 19;

        // Create a test piece above the line
        const tetroTest = TetrominoFactory.createNew(5, board, 1337);
        tetroTest.top = 18;
        tetroTest.lock();

        // Complete the line by locking last piece, should trigger line clear
        tetroO2.lock();

        // Check if line was cleared
        expect(board.occupiedPositions.filter(pos => pos.y === 19).length).toBe(0);

        // Check if blocks above dropped down
        const blocks = tetroTest.getBlocks();
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
