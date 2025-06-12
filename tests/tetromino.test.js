import { Tetromino } from "../src/tetromino.js";
describe("Tetromino",
    () => {
        let tetromino;
        let mockDocument;
        let mockBoard;
        beforeEach(() => {
            mockBoard = {
                addTetromino: jest.fn(),
                moveTetromino: jest.fn()
            };
            mockDocument = { createElement: jest.fn(() => ({ style: {}, setAttribute: jest.fn(), className: "", addEventListener: jest.fn(), dispatchEvent: jest.fn() })) };
            tetromino = new Tetromino(5, mockDocument, mockBoard);
        });
        test("should create with correct initial position", () => {
            expect(tetromino.left).toBe(5);
            expect(tetromino.top).toBe(0);
        });
        test("should delegate movement to board", () => {
            tetromino.move("left");
            expect(mockBoard.moveTetromino).toHaveBeenCalledWith(tetromino, "left");
        });
        test("should lock tetromino", () => {
            tetromino.lock();
            tetromino.move("left");
            expect(mockBoard.moveTetromino).not.toHaveBeenCalled();
        });
    });