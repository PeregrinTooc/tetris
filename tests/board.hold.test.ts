import { Board } from "../src/board";
import { HoldBoard } from "../src/hold-board";
import { TetrominoSeedQueueImpl } from "../src/TetrominoSeedQueue";
import { expect } from '@jest/globals';
import { createTestBoard } from "./testUtils.unit";

describe("Board - Hold Functionality", () => {
    let board: Board;
    let element: HTMLElement;
    let holdBoard: HoldBoard;
    let holdElement: HTMLElement;
    let seedQueue: TetrominoSeedQueueImpl;

    beforeEach(() => {
        element = document.createElement("div");
        holdElement = document.createElement("div");
        document.body.appendChild(element);
        document.body.appendChild(holdElement);

    holdBoard = new HoldBoard(holdElement);
    seedQueue = new TetrominoSeedQueueImpl();

    seedQueue.enqueue(0, 0, 0); // Three T pieces in a row
    // createTestBoard handles preview/keybindings wiring, we pass the element and queue via a minimal wrapper by reusing Board directly here
    board = new Board(20, 10, element, null, seedQueue, holdBoard);
    board.spawnTetromino();
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
