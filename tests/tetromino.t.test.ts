import { describe, beforeEach, test, expect } from "@jest/globals";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { Tetromino } from "../src/tetromino-base";

// T-tetromino rotation tests

describe("TetrominoT", () => {
    const left = 5;
    let tetro: Tetromino;

    beforeEach(() => {
        tetro = TetrominoFactory.createNew(left, null, 0); // 0 = T-tetromino seed
    });

    test("rotation 0: correct block positions", () => {
        tetro.rotation = 0;
        expect(tetro.getBlocks()).toEqual([
            { x: 5, y: 0, parent: tetro },
            { x: 4, y: 0, parent: tetro },
            { x: 6, y: 0, parent: tetro },
            { x: 5, y: 1, parent: tetro },
        ]);
    });

    test("rotation 1: correct block positions", () => {
        tetro.rotation = 1;
        expect(tetro.getBlocks()).toEqual([
            { x: 5, y: 0, parent: tetro },
            { x: 5, y: -1, parent: tetro },
            { x: 5, y: 1, parent: tetro },
            { x: 6, y: 0, parent: tetro },
        ]);
    });

    test("rotation 2: correct block positions", () => {
        tetro.rotation = 2;
        expect(tetro.getBlocks()).toEqual([
            { x: 5, y: 0, parent: tetro },
            { x: 4, y: 0, parent: tetro },
            { x: 6, y: 0, parent: tetro },
            { x: 5, y: -1, parent: tetro },
        ]);
    });

    test("rotation 3: correct block positions", () => {
        tetro.rotation = 3;
        expect(tetro.getBlocks()).toEqual([
            { x: 5, y: 0, parent: tetro },
            { x: 5, y: -1, parent: tetro },
            { x: 5, y: 1, parent: tetro },
            { x: 4, y: 0, parent: tetro },
        ]);
    });
});
