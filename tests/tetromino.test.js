import { Tetromino } from "../src/tetromino.js";
describe("Tetromino",
    () => {
        let tetromino; let mockBoard; let mockDocument;
        beforeEach(() => {
            mockBoard = { addTetromino: jest.fn(), moveTetromino: jest.fn() };
            mockDocument = { createElement: jest.fn(() => ({ style: {}, setAttribute: jest.fn(), className: "", addEventListener: jest.fn() })) };
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
        test.skip("should lock tetromino", () => {
            tetromino.lock();
            expect(tetromino.locked).toBe(true); tetromino.move("left");
            expect(mockBoard.moveTetromino).not.toHaveBeenCalled();
        });
    });