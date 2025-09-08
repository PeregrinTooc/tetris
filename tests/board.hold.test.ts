import { Board } from "../src/board";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { HoldBoard } from "../src/hold-board";
import { TetrominoSeedQueueImpl } from "../src/TetrominoSeedQueue";
import { expect } from '@jest/globals';

describe("Board - Hold Functionality", () => {
    let board: Board;
    let element: HTMLElement;
    let holdBoard: HoldBoard;
    let holdElement: HTMLElement;
    let factory: TetrominoFactory;
    let seedQueue: TetrominoSeedQueueImpl;

    beforeEach(() => {
        element = document.createElement("div");
        holdElement = document.createElement("div");
        document.body.appendChild(element);
        document.body.appendChild(holdElement);

        holdBoard = new HoldBoard(holdElement);
        factory = new TetrominoFactory();
        seedQueue = new TetrominoSeedQueueImpl();

        seedQueue.enqueue(0, 0, 0); // Three T pieces in a row
        board = new Board(20, 10, element, null, seedQueue, holdBoard);
        board.spawnTetromino(); // Initialize like main.ts does
        board.canHoldPiece = true;
    });

    afterEach(() => {
        document.body.removeChild(element);
        document.body.removeChild(holdElement);
    });

    test("should hold current piece when hold action is triggered", () => {
        const initialActivePiece = board.getActiveTetromino();

        board.hold();

        expect(holdBoard.getHeldTetromino()).toBe(initialActivePiece);
        expect(board.getActiveTetromino()).not.toBe(initialActivePiece);
    });

    test("should swap held piece with active piece when hold is triggered again", () => {
        const firstPiece = board.getActiveTetromino();

        board.hold(); // Hold first piece
        const secondPiece = board.getActiveTetromino();

        board.hold(); // Swap pieces

        expect(board.getActiveTetromino().constructor.name).toBe(firstPiece.constructor.name);
        expect(holdBoard.getHeldTetromino()?.constructor.name).toBe(secondPiece.constructor.name);
    });

    test("cannot hold piece twice in succession without piece lock", () => {
        const firstPiece = board.getActiveTetromino();

        board.hold(); // First hold
        const secondPiece = board.getActiveTetromino();
        board.hold(); // Try to hold again immediately

        expect(board.getActiveTetromino()).toBe(secondPiece);
        expect(holdBoard.getHeldTetromino()).toBe(firstPiece);
    });

    test("can hold piece again after piece is locked", () => {
        const firstPiece = board.getActiveTetromino();

        board.hold(); // Hold first piece
        const activePiece = board.getActiveTetromino();
        activePiece.lock(); // Lock the active piece
        board.spawnTetromino(); // Spawn new piece (simulates natural game flow)
        board.hold(); // Should be able to hold again after lock

        expect(board.getActiveTetromino().constructor.name).toBe(firstPiece.constructor.name);
    });
});
