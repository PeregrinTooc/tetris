import { Board } from "../src/board";
import { TetrominoT } from "../src/tetromino-t";
import { Block } from "../src/tetromino-base";
import { describe, beforeEach, expect, afterEach } from "@jest/globals";

describe("Board - Single Remaining Block Drop Bug", () => {
    let board: Board;
    let mockElement: HTMLElement;

    beforeEach(() => {
        mockElement = document.createElement("div");
        document.body.appendChild(mockElement);
        board = new Board(10, 5, mockElement, null, { dequeue: () => 0 });
    });

    afterEach(() => {
        document.body.removeChild(mockElement);
    });

    it("should drop single remaining block after other blocks are removed", () => {
        // This test reproduces the bug where a tetromino with only one block
        // remaining (after others were removed) cannot drop properly

        const tetromino = new TetrominoT(2, board);
        tetromino.locked = true;

        // Create T-tetromino blocks
        const blocks = [
            new Block({ x: 2, y: 2, parent: tetromino }), // center
            new Block({ x: 1, y: 2, parent: tetromino }), // left
            new Block({ x: 3, y: 2, parent: tetromino }), // right
            new Block({ x: 2, y: 1, parent: tetromino }), // top
        ];
        tetromino.blocks = blocks;

        // Add all blocks to occupied positions
        board['occupiedPositions'] = [...blocks];

        // Simulate line completion removing 3 of the 4 blocks
        // This mimics what happens in _removeCompletedLines
        const blocksToRemove = blocks.slice(0, 3); // Remove first 3 blocks
        const remainingBlock = blocks[3]; // Keep the top block

        // Simulate the deletion process
        blocksToRemove.forEach(block => {
            // This is what block.delete() does
            tetromino.removeBlock(block);
        });

        // Now simulate the occupiedPositions cleanup that happens AFTER block.delete()
        // This is the key: the deleted blocks are still in occupiedPositions temporarily
        // In the real code, this happens in _removeCompletedLines after all block.delete() calls

        // At this point:
        // - tetromino.blocks = [remainingBlock] (only 1 block)
        // - occupiedPositions still contains all 4 blocks (the bug!)

        console.log("Tetromino blocks count:", tetromino.blocks.length); // Should be 1
        console.log("Occupied positions count:", board['occupiedPositions'].length); // Still 4!

        // Record initial position of remaining block
        const initialY = remainingBlock.y;

        // Try to drop the tetromino - this should work but might not due to the bug
        board['_dropTetrominoAsUnit'](tetromino, tetromino.blocks);

        // The remaining block should drop to the bottom since there are no real obstacles
        const finalY = remainingBlock.y;
        const actualDrop = finalY - initialY;

        // Should drop significantly (from y=1 to near bottom)
        expect(actualDrop).toBeGreaterThan(5);

        // Now clean up occupiedPositions as the real code would do
        board['occupiedPositions'] = board['occupiedPositions'].filter(block =>
            tetromino.blocks.includes(block)
        );

        expect(board['occupiedPositions'].length).toBe(1);
    });

    it("reproduces the ghost blocks collision bug", () => {
        // This test specifically demonstrates how deleted blocks act as "ghosts"
        // that prevent remaining blocks from dropping

        const tetromino = new TetrominoT(2, board);
        tetromino.locked = true;

        // Create T-tetromino
        const centerBlock = new Block({ x: 2, y: 3, parent: tetromino });
        const leftBlock = new Block({ x: 1, y: 3, parent: tetromino });
        const rightBlock = new Block({ x: 3, y: 3, parent: tetromino });
        const topBlock = new Block({ x: 2, y: 2, parent: tetromino });

        const allBlocks = [centerBlock, leftBlock, rightBlock, topBlock];
        tetromino.blocks = allBlocks;
        board['occupiedPositions'] = [...allBlocks];

        // Remove 3 blocks, leaving only the top block
        [centerBlock, leftBlock, rightBlock].forEach(block => {
            tetromino.removeBlock(block);
        });

        // Now tetromino.blocks = [topBlock] but occupiedPositions still has all blocks
        expect(tetromino.blocks.length).toBe(1);
        expect(board['occupiedPositions'].length).toBe(4); // Ghost blocks!

        // The bug: when we create droppingBlocks = new Set(tetromino.blocks),
        // it only contains topBlock, so the ghost blocks are not excluded
        const droppingBlocks = new Set(tetromino.blocks);
        expect(droppingBlocks.has(centerBlock)).toBe(false); // Ghost block not excluded!

        // This means centerBlock will be treated as an obstacle for topBlock
        // even though centerBlock was "deleted"

        // Test the actual fixed method
        const initialY = topBlock.y;
        board['_dropTetrominoAsUnit'](tetromino, tetromino.blocks);
        const finalY = topBlock.y;
        const actualDrop = finalY - initialY;

        // After the fix: the block should drop significantly because ghost blocks
        // from the same tetromino are properly excluded
        expect(actualDrop).toBeGreaterThan(5); // Fixed!
    });
});