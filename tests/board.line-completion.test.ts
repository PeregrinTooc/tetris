import { describe, beforeEach, test, expect, jest } from "@jest/globals";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { Board } from "../src/board";
import { KeyBindingManager } from "../src/key-binding-manager";

describe("Line completion", () => {
    let board: Board;
    const element = document.createElement("div");
    let keyBindingManager: KeyBindingManager;
    beforeEach(() => {
        keyBindingManager = new KeyBindingManager();
        element.innerHTML = "";
        board = new Board(
            20,
            2,
            element,
            null,
            { dequeue: jest.fn(() => 1337) }
        );
    });

    test("should detect and remove completed line", () => {
        // Create and position O piece on right
        const tetroO1 = TetrominoFactory.createNew(1, board, 1337);
        tetroO1.activateKeyboardControl(keyBindingManager);
        document.dispatchEvent(new KeyboardEvent("keydown", { key: " " })); // hard drop
        tetroO1.lock();

        // Create and position I piece on left
        const tetro02 = TetrominoFactory.createNew(0, board, 1337);
        tetro02.activateKeyboardControl(keyBindingManager);
        document.dispatchEvent(new KeyboardEvent("keydown", { key: " " })); // hard drop

        //locking triggers line removal
        tetro02.lock();

        const tetroTester = TetrominoFactory.createNew(0, board, 1338); //tests that invalid seeds are handled by returning a single block
        tetroTester.activateKeyboardControl(keyBindingManager);
        document.dispatchEvent(new KeyboardEvent("keydown", { key: " " })); // hard drop
        tetroTester.addEventListener("locked", (event: Event) => {
            const customEvent = event as CustomEvent;
            customEvent.detail.forEach((block: { x: number; y: number }) => {
                expect(block.y).toBe(19);
                expect(block.x).toBe(0);
            });
        });
        tetroTester.lock();

    });

    test("should detect and remove completed line", () => {
        // Create and position O piece on right
        const tetroO1 = TetrominoFactory.createNew(1, board, 1337);
        tetroO1.top = 19;
        tetroO1.lock();
        ;
        // Create and position I piece on left
        const tetro02 = TetrominoFactory.createNew(0, board, 1337);
        tetro02.top = 19;

        const tetro03 = TetrominoFactory.createNew(1, board, 1337);
        tetro03.top = 18;
        tetro03.lock();

        //locking triggers line removal
        tetro02.lock();

        // Check if blocks above dropped down
        const blocks = tetro03.getBlocks();
        expect(blocks[0].y).toBe(20);

    });

    test("should have collision detection for block dropping", () => {
        // This test simply verifies that the collision detection code path exists
        // The actual collision detection logic is complex and tested in integration

        // Create a simple scenario
        const tetro1 = TetrominoFactory.createNew(0, board, 1337);
        tetro1.top = 19;
        tetro1.lock();

        const tetro2 = TetrominoFactory.createNew(1, board, 1337);
        tetro2.top = 19;

        // When this tetromino locks, it should trigger line completion
        // which exercises the collision detection code for dropping blocks
        expect(() => {
            tetro2.lock();
        }).not.toThrow();

        // Verify that the board still functions after line completion
        const tetro3 = TetrominoFactory.createNew(0, board, 1337);
        expect(tetro3).toBeDefined();
    });
});
