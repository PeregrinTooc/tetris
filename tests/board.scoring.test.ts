import { describe, expect } from "@jest/globals";
import { Board } from "../src/board";
import { TetrominoFactory } from "../src/tetrominoFactory";

describe("Board scoring", () => {
    it("dispatches linesCompleted event with correct data for a double line clear", () => {
        let linesCompletedCount = 0;
        const element = document.createElement("div");
        const board = new Board(4, 4, element, null as any, { dequeue: () => 2 }); // O tetromino seed

        // Listen for the linesCompleted event
        element.addEventListener("linesCompleted", (event: Event) => {
            const customEvent = event as CustomEvent;
            linesCompletedCount = customEvent.detail.linesCompleted;
        });

        const t1 = TetrominoFactory.createNew(0, board, 2); // O
        t1.lock();

        const t2 = TetrominoFactory.createNew(2, board, 2); // O
        t2.lock();

        expect(linesCompletedCount).toBe(2);
    });
    it("dispatches linesCompleted event with correct data for a single line clear", () => {
        let linesCompletedCount = 0;
        const element = document.createElement("div");
        const board = new Board(10, 4, element, null as any, { dequeue: () => 1337 }); // base tetromino seed

        // Listen for the linesCompleted event
        element.addEventListener("linesCompleted", (event: Event) => {
            const customEvent = event as CustomEvent;
            linesCompletedCount = customEvent.detail.linesCompleted;
        });

        for (let i = 0; i < 4; i++) {
            const t = TetrominoFactory.createNew(i, board, 1337);
            t.activateKeyboardControl();
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
            t.lock();
        }
        expect(linesCompletedCount).toBe(1);
    });
});
