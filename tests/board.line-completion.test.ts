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

    test("should detect and remove completed line", () => {
        // Create and position O piece on right
        const tetroO1 = TetrominoFactory.createNew(1, board, 1337);
        tetroO1.top = 19;
        tetroO1.lock();

        // Create and position I piece on left
        const tetro02 = TetrominoFactory.createNew(0, board, 1337);
        tetro02.top = 19;

        //locking triggers line removal
        tetro02.lock();

        // Check if line was cleared
        expect(board.occupiedPositions.filter(pos => pos.y === 19).length).toBe(0);

    });

      test("should detect and remove completed line", () => {
        // Create and position O piece on right
        const tetroO1 = TetrominoFactory.createNew(1, board, 1337);
        tetroO1.top = 19;
        tetroO1.lock();
;
        // Create and position I piece on left
        const tetro02 = TetrominoFactory.createNew(0, board, 1337);
        tetro02.top = 19;

        const tetro03 = TetrominoFactory.createNew(1, board, 1337);
        tetro03.top = 18;
        tetro03.lock();

        //locking triggers line removal
        tetro02.lock();

        // Check if blocks above dropped down
        const blocks = tetro03.getBlocks();
        expect(blocks[0].y).toBe(18);

    });
});
