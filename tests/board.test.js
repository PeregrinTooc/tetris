import { Board } from "../src/board.js";
import { Tetromino } from "../src/tetromino.js";

describe("Board", () => {
    let board;
    let mockElement;
    let mockPreviewBoard;
    let mockDocument;

    beforeEach(() => {
        mockDocument = {
            createElement: jest.fn(() => ({
                style: {},
                className: "",
                setAttribute: jest.fn(),
                dispatchEvent: jest.fn(),
                remove: jest.fn(),
            }))
        };
        mockElement = {
            appendChild: jest.fn(),
            innerHTML: "",
            dispatchEvent: jest.fn()
        };
        mockPreviewBoard = {
            showNextTetromino: jest.fn()
        };
        board = new Board(20, 11, mockElement, mockPreviewBoard);
    });

    test("should add tetromino to board", () => {
        const tetromino = new Tetromino(5, mockDocument, board);
        board.addTetromino(tetromino);
        expect(mockElement.appendChild).toHaveBeenCalledWith(tetromino.element);
    });

    test("should move tetromino within boundaries", () => {
        const tetromino = new Tetromino(5, mockDocument, board);
        expect(board.moveTetromino(tetromino, "left")).toBe(true);
        expect(tetromino.left).toBe(4);
    });

    test("should prevent movement outside boundaries", () => {
        const tetromino = new Tetromino(0, mockDocument, board);
        expect(board.moveTetromino(tetromino, "left")).toBe(false);
        expect(tetromino.left).toBe(0);
    });

    test("should check movement boundaries", () => {
        const tetromino = new Tetromino(0, mockDocument, board);
        expect(board._canMove(tetromino, "left")).toBe(false);
        tetromino.left = 10;
        expect(board._canMove(tetromino, "right")).toBe(false);
    });

    test("should detect tetromino collisions", () => {
        const tetromino1 = new Tetromino(5, mockDocument, board);
        tetromino1.top = 1;
        const tetromino2 = new Tetromino(5, mockDocument, board);
        tetromino2.top = 0;
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

    test("should make tetromino immobile when at bottom", () => {
        const tetromino = new Tetromino(5, mockDocument, board);
        tetromino.drop();
        expect(tetromino.locked).toBe(true);
        tetromino.move("left");
        expect(tetromino.left).toBe(5);
        tetromino.move("right");
        expect(tetromino.left).toBe(5);
    });

    test("tetrominos should block movement", () => {
        const blockingTetromino = new Tetromino(5, mockDocument, board);
        const movingTetromino = new Tetromino(4, mockDocument, board);
        expect(board.moveTetromino(movingTetromino, "right")).toBe(false);
        movingTetromino.left = 6;
        expect(board.moveTetromino(movingTetromino, "left")).toBe(false);
    });

    test("should reset the board and clear tetrominos", () => {
        const tetromino = new Tetromino(5, mockDocument, board);
        board.tetrominos.add(tetromino);
        board.reset();
        expect(board.tetrominos.size).toBe(0);
        expect(mockElement.innerHTML).toBe("");
    });
});