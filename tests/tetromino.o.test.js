import { TetrominoFactory } from "../src/tetromino.js";
import { Board } from "../src/board.js";

describe("O-shaped Tetromino", () => {
    let board;

    beforeEach(() => {
        board = new Board(20, 10, { appendChild: jest.fn() });
    });

    test("should create a 2x2 square shape", () => {
        const tetromino = TetrominoFactory.createNew(5, document, board, 2);
        expect(tetromino.getBlockPositions()).toEqual([
            { x: 5, y: 1 },
            { x: 6, y: 1 },
            { x: 6, y: 0 },
            { x: 5, y: 0 },
        ]);
    });

    test("should not rotate (remain same shape)", () => {
        const tetromino = TetrominoFactory.createNew(5, document, board, 2);
        const originalShape = tetromino.getBlockPositions();
        tetromino.rotate();
        expect(tetromino.getBlockPositions()).toEqual(originalShape);
    });
});