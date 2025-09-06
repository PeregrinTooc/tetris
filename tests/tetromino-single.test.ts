import { TetrominoSingle } from "../src/tetromino-single";
import { Board } from "../src/board";
import { KeyBindingManager } from "../src/key-binding-manager";
import { expect } from '@jest/globals';

describe('TetrominoSingle', () => {
    let mockElement: HTMLElement;
    let board: Board;
    let tetromino: TetrominoSingle;
    let keyBindingManager: KeyBindingManager;

    beforeEach(() => {
        keyBindingManager = new KeyBindingManager();
        mockElement = document.createElement("div");
        document.body.appendChild(mockElement);
        board = new Board(10, 5, mockElement, null, { dequeue: () => 0 });
        tetromino = new TetrominoSingle(2, board);
    });

    afterEach(() => {
        document.body.removeChild(mockElement);
    });

    describe('Constructor', () => {
        it('should create a TetrominoSingle instance', () => {
            expect(tetromino).toBeInstanceOf(TetrominoSingle);
        });

        it('should inherit from Tetromino base class', () => {
            expect(tetromino.id).toBeDefined();
            expect(tetromino.left).toBe(2);
            expect(tetromino.top).toBe(0);
            expect(tetromino.locked).toBe(false);
        });

        it('should initialize with board reference', () => {
            expect(tetromino.board).toBe(board);
        });

        it('should work without board reference', () => {
            const tetrominoWithoutBoard = new TetrominoSingle(3, null);
            expect(tetrominoWithoutBoard).toBeInstanceOf(TetrominoSingle);
            expect(tetrominoWithoutBoard.board).toBe(null);
        });
    });

    describe('getClassName', () => {
        it('should return "tetromino" as class name', () => {
            expect(tetromino.getClassName()).toBe("tetromino");
        });
    });

    describe('getBlocks', () => {
        it('should return array with single pivot block when not locked', () => {
            tetromino.locked = false;

            const blocks = tetromino.getBlocks();

            expect(blocks).toHaveLength(1);
            expect(blocks[0]).toBe(tetromino['pivot']);
            expect(blocks[0].x).toBe(2);
            expect(blocks[0].y).toBe(0);
            expect(blocks[0].parent).toBe(tetromino);
        });

        it('should return stored blocks array when locked', () => {
            tetromino.locked = true;

            // Manually set blocks array to test locked behavior
            const customBlocks = [tetromino['pivot']];
            tetromino.blocks = customBlocks;

            const blocks = tetromino.getBlocks();

            expect(blocks).toBe(customBlocks);
            expect(blocks).toHaveLength(1);
        });

        it('should update internal blocks array when not locked', () => {
            tetromino.locked = false;

            const blocks = tetromino.getBlocks();

            expect(tetromino.blocks).toBe(blocks);
            expect(tetromino.blocks).toHaveLength(1);
        });

        it('should always contain the pivot block', () => {
            const blocks = tetromino.getBlocks();

            expect(blocks).toContain(tetromino['pivot']);
        });
    });

    describe('Position management', () => {
        it('should update pivot position when left is changed', () => {
            tetromino.left = 5;

            const blocks = tetromino.getBlocks();
            expect(blocks[0].x).toBe(5);
        });

        it('should update pivot position when top is changed', () => {
            tetromino.top = 3;

            const blocks = tetromino.getBlocks();
            expect(blocks[0].y).toBe(3);
        });

        it('should maintain single block structure after position changes', () => {
            tetromino.left = 4;
            tetromino.top = 2;

            const blocks = tetromino.getBlocks();

            expect(blocks).toHaveLength(1);
            expect(blocks[0].x).toBe(4);
            expect(blocks[0].y).toBe(2);
        });
    });

    describe('Locking behavior', () => {
        it('should behave differently when locked vs unlocked', () => {
            // Test unlocked behavior
            tetromino.locked = false;
            const unlockedBlocks = tetromino.getBlocks();

            // Test locked behavior
            tetromino.locked = true;
            const lockedBlocks = tetromino.getBlocks();

            // When locked, should return the stored blocks array
            expect(lockedBlocks).toBe(tetromino.blocks);

            // When unlocked, creates new array each time
            tetromino.locked = false;
            const newUnlockedBlocks = tetromino.getBlocks();
            expect(newUnlockedBlocks).not.toBe(unlockedBlocks);
        });

        it('should preserve blocks array reference when locked', () => {
            tetromino.locked = true;

            const firstCall = tetromino.getBlocks();
            const secondCall = tetromino.getBlocks();

            expect(firstCall).toBe(secondCall);
        });
    });

    describe('Integration with base Tetromino functionality', () => {
        it('should support dropping', () => {
            const initialY = tetromino.top;

            tetromino.dropByOne();

            expect(tetromino.top).toBe(initialY + 1);

            const blocks = tetromino.getBlocks();
            expect(blocks[0].y).toBe(initialY + 1);
        });

        it('should support keyboard control activation', () => {
            expect(() => tetromino.activateKeyboardControl(keyBindingManager)).not.toThrow();
        });

        it('should support keyboard control deactivation', () => {
            tetromino.activateKeyboardControl(keyBindingManager);
            expect(() => tetromino.deactivateKeyboardControl()).not.toThrow();
        });

        it('should support locking', () => {
            tetromino.locked = false;

            tetromino.lock();

            expect(tetromino.locked).toBe(true);
        });

        it('should support pause functionality', () => {
            const initialPaused = tetromino['paused'] || false;

            tetromino.pause();

            expect(tetromino['paused']).toBe(!initialPaused);
        });
    });

    describe('Block parent relationship', () => {
        it('should maintain correct parent reference in pivot block', () => {
            const blocks = tetromino.getBlocks();

            expect(blocks[0].parent).toBe(tetromino);
        });

        it('should maintain parent reference after position changes', () => {
            tetromino.left = 7;
            tetromino.top = 5;

            const blocks = tetromino.getBlocks();

            expect(blocks[0].parent).toBe(tetromino);
        });
    });

    describe('Unique identifier', () => {
        it('should have unique ID', () => {
            const tetromino2 = new TetrominoSingle(3, board);

            expect(tetromino.id).not.toBe(tetromino2.id);
            expect(tetromino.id).toBeDefined();
            expect(tetromino2.id).toBeDefined();
        });
    });
});