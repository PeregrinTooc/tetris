import { describe, beforeEach, test, expect, jest } from "@jest/globals";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { Board } from "../src/board";
import { PreviewBoard } from "../src/preview-board";
import { Tetromino } from "../src/tetromino-base";

describe("Tetromino Scoring", () => {
    let tetromino: Tetromino;
    let board: Board;
    let element: HTMLElement;
    let nextPiece: HTMLElement;
    let boardElement: HTMLElement;
    let stubQueue: any;

    beforeEach(() => {
        // Create fresh DOM elements for each test
        element = document.createElement("div");
        nextPiece = document.createElement("div");
        boardElement = document.createElement("div");
        nextPiece.id = "next-piece";
        element.appendChild(nextPiece);

        stubQueue = { dequeue: () => 1337 };
        board = new Board(
            20,
            11,
            boardElement,
            new PreviewBoard(element),
            stubQueue
        );
        tetromino = TetrominoFactory.createNew(5, board, 1337);

        // Ensure no existing listeners
        tetromino.deactivateKeyboardControl();
    });

    afterEach(() => {
        // Clean up event listeners
        tetromino.deactivateKeyboardControl();
    });

    test("should award 10 points for soft drop when tetromino moves down", () => {
        const scoreListener = jest.fn();
        boardElement.addEventListener("scoreEvent", scoreListener);

        tetromino.activateKeyboardControl();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));

        expect(scoreListener).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: { action: "softDrop", points: 10 }
            })
        );
    });

    test("should award 15 points per line for hard drop", () => {
        const scoreListener = jest.fn();
        boardElement.addEventListener("scoreEvent", scoreListener);

        // Position tetromino high up so it has distance to drop
        tetromino.top = 5;
        tetromino.activateKeyboardControl();

        // Clear any existing calls
        scoreListener.mockClear();

        document.dispatchEvent(new KeyboardEvent("keydown", { key: " " })); // space for hard drop

        const calls = scoreListener.mock.calls as any[];
        console.log("All score events:", calls.map(call => call[0].detail));

        const hardDropCalls = calls.filter(
            (call: any) => call[0].detail.action === "hardDrop"
        );
        expect(hardDropCalls.length).toBe(1);
        const points = hardDropCalls[0][0].detail.points;
        expect(points).toBeGreaterThan(0);
        // Should be 15 points per line dropped
        expect(points % 15).toBe(0);
    });

    test("should award 5 points when tetromino locks", () => {
        const scoreListener = jest.fn();
        boardElement.addEventListener("scoreEvent", scoreListener);

        tetromino.lock();

        expect(scoreListener).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: { action: "pieceLocked", points: 5 }
            })
        );
    });

    test("should not award soft drop points if tetromino doesn't move", () => {
        const scoreListener = jest.fn();
        boardElement.addEventListener("scoreEvent", scoreListener);

        // Drop tetromino to bottom first
        tetromino.activateKeyboardControl();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: " " })); // hard drop to bottom

        // Clear previous calls
        scoreListener.mockClear();

        // Try to move down when already at bottom
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));

        const calls = scoreListener.mock.calls as any[];
        const softDropCalls = calls.filter(
            (call: any) => call[0].detail.action === "softDrop"
        );
        expect(softDropCalls.length).toBe(0);
    });

    test("should award correct points for multiple actions", () => {
        const scoreListener = jest.fn();
        boardElement.addEventListener("scoreEvent", scoreListener);

        tetromino.activateKeyboardControl();

        // Soft drop once (10 points)
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));

        // Hard drop (15 points per line)
        document.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));

        // Check all score events were fired
        const calls = scoreListener.mock.calls as any[];
        expect(calls.length).toBeGreaterThanOrEqual(2); // At least soft drop and piece locked

        // Find specific action calls
        const softDropCall = calls.find((call: any) => call[0].detail.action === "softDrop");
        const pieceLockCall = calls.find((call: any) => call[0].detail.action === "pieceLocked");

        expect(softDropCall).toBeDefined();
        if (softDropCall) {
            expect(softDropCall[0].detail.points).toBe(10);
        }

        expect(pieceLockCall).toBeDefined();
        if (pieceLockCall) {
            expect(pieceLockCall[0].detail.points).toBe(5);
        }
    });
});
