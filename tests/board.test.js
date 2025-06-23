import { Board } from "../src/board.js";
import { Tetromino } from "../src/tetromino.js";

describe("Board", () => {
  let board;
  let mockElement;
  let mockPreviewBoard;
  let mockDocument;
  let stubQueue;

  beforeEach(() => {
    mockDocument = {
      createElement: jest.fn(() => ({
        style: {},
        className: "",
        setAttribute: jest.fn(),
        dispatchEvent: jest.fn(),
        remove: jest.fn(),
      })),
    };
    mockElement = {
      appendChild: jest.fn(),
      innerHTML: "",
      dispatchEvent: jest.fn(),
    };
    mockPreviewBoard = {
      showNextTetromino: jest.fn(),
    };
    stubQueue = { dequeue: () => 1337 };
    board = new Board(20, 11, mockElement, mockPreviewBoard, stubQueue);
  });

  test("should add tetromino to board", () => {
    const tetromino = Tetromino.createNew(5, mockDocument, board, 1337);
    board.addTetromino(tetromino);
    expect(mockElement.appendChild).toHaveBeenCalledWith(tetromino.element);
  });

  test("should move tetromino within boundaries", () => {
    const tetromino = Tetromino.createNew(5, mockDocument, board, 1337);
    expect(board.moveTetromino(tetromino, "left")).toBe(true);
    expect(tetromino.left).toBe(4);
  });

  test("should prevent movement outside boundaries", () => {
    const tetromino = Tetromino.createNew(0, mockDocument, board, 1337);
    expect(board.moveTetromino(tetromino, "left")).toBe(false);
    expect(tetromino.left).toBe(0);
  });

  test("should check movement boundaries", () => {
    const tetromino = Tetromino.createNew(0, mockDocument, board, 1337);
    expect(board._canMove(tetromino, "left")).toBe(false);
    tetromino.left = 10;
    expect(board._canMove(tetromino, "right")).toBe(false);
  });

  test("should detect tetromino collisions", () => {
    const tetromino1 = Tetromino.createNew(5, mockDocument, board, 1337);
    tetromino1.top = 1;
    const tetromino2 = Tetromino.createNew(5, mockDocument, board, 1337);
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
    const tetromino = Tetromino.createNew(5, mockDocument, board, 1337);
    tetromino.drop();
    expect(tetromino.locked).toBe(true);
    tetromino.move("left");
    expect(tetromino.left).toBe(5);
    tetromino.move("right");
    expect(tetromino.left).toBe(5);
  });

  test("tetrominos should block movement", () => {
    const blockingTetromino = Tetromino.createNew(5, mockDocument, board, 1337);
    const movingTetromino = Tetromino.createNew(4, mockDocument, board, 1337);
    expect(board.moveTetromino(movingTetromino, "right")).toBe(false);
    movingTetromino.left = 6;
    expect(board.moveTetromino(movingTetromino, "left")).toBe(false);
  });

  test("should reset the board and clear tetrominos", () => {
    const tetromino = Tetromino.createNew(5, mockDocument, board, 1337);
    board.tetrominos.add(tetromino);
    board.reset();
    expect(board.tetrominos.size).toBe(0);
    expect(mockElement.innerHTML).toBe("");
  });
});
