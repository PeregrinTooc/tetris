import { Board } from "../src/board.js";

describe("Board", () => {
    let board;
    let mockElement;
    let mockPreviewBoard;

    beforeEach(() => {
        mockElement = {
            appendChild: jest.fn(),
            innerHTML: ""
        };
        mockPreviewBoard = {
            showNextTetromino: jest.fn()
        };
        board = new Board(20, 11, mockElement, mockPreviewBoard);
    });

    test("should add tetromino to board", () => {
        const mockTetromino = { element: {} };
        board.addTetromino(mockTetromino);
        expect(mockElement.appendChild).toHaveBeenCalledWith(mockTetromino.element);
    });

    test("should move tetromino within boundaries", () => {
        const mockTetromino = { left: 5, top: 5, updatePosition: jest.fn() };
        expect(board.moveTetromino(mockTetromino, "left")).toBe(true);
        expect(mockTetromino.left).toBe(4);
    });

    test("should prevent movement outside boundaries", () => {
        const mockTetromino = { left: 0, top: 5, updatePosition: jest.fn() };
        expect(board.moveTetromino(mockTetromino, "left")).toBe(false);
        expect(mockTetromino.left).toBe(0);
    });

    test("should check movement boundaries", () => {
        const tetromino = { left: 0, top: 0 };
        expect(board._canMove(tetromino, "left")).toBe(false);
        tetromino.left = 10;
        expect(board._canMove(tetromino, "right")).toBe(false);
    });

    test.skip("should detect tetromino collisions", () => {
        const tetromino1 = { left: 5, top: 1 };
        const tetromino2 = { left: 5, top: 0 };
        board.tetrominos.add(tetromino1);
        expect(board._canMove(tetromino2, "down")).toBe(false);
    });

    test("should raise game over when stack reaches top", () => {
        const mockDispatchEvent = jest.fn();
        board.element.dispatchEvent = mockDispatchEvent;
        const tetromino = { top: 0, left: 5 };
        board._raiseGameOverIfStackReachesTop(tetromino);
        expect(mockDispatchEvent).toHaveBeenCalled();
    });
});