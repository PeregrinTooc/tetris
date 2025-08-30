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
                detail: { points: 10 }
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

        // After hard drop, we should get 2 events: hard drop points + lock points (5)
        expect(calls.length).toBe(2);

        // Find the hard drop points (should be divisible by 15 and > 5)
        const hardDropCall = calls.find((call: any) => {
            const points = call[0].detail.points;
            return points > 5 && points % 15 === 0;
        });
        expect(hardDropCall).toBeDefined();

        // Find the lock points (should be exactly 5)
        const lockCall = calls.find((call: any) => call[0].detail.points === 5);
        expect(lockCall).toBeDefined();
    });

    test("should award 5 points when tetromino locks", () => {
        const scoreListener = jest.fn();
        boardElement.addEventListener("scoreEvent", scoreListener);

        tetromino.lock();

        expect(scoreListener).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: { points: 5 }
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

        // Should not fire any score events since tetromino didn't move
        expect(scoreListener).not.toHaveBeenCalled();
    });

    test("should award correct points for multiple actions", () => {
        const scoreListener = jest.fn();
        boardElement.addEventListener("scoreEvent", scoreListener);

        tetromino.activateKeyboardControl();

        // Soft drop once (10 points)
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));

        // Hard drop (15 points per line + 5 for lock)
        document.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));

        // Check all score events were fired
        const calls = scoreListener.mock.calls as any[];
        expect(calls.length).toBeGreaterThanOrEqual(3); // At least soft drop, hard drop, and piece locked

        // Check that we have the expected point values
        const pointValues = calls.map((call: any) => call[0].detail.points);

        // Should have 10 points for soft drop
        expect(pointValues).toContain(10);

        // Should have 5 points for piece lock
        expect(pointValues).toContain(5);

        // Should have some hard drop points (multiple of 15, > 5)
        const hardDropPoints = pointValues.find((points: number) => points > 5 && points % 15 === 0);
        expect(hardDropPoints).toBeDefined();
    });
});
