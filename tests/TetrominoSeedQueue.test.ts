import { TetrominoSeedQueue } from "../src/TetrominoSeedQueue";
import { describe, beforeEach, expect, jest } from "@jest/globals";

describe('TetrominoSeedQueue', () => {
    let seedQueue: TetrominoSeedQueue;

    beforeEach(() => {
        seedQueue = new TetrominoSeedQueue();
    });

    describe('Constructor', () => {
        it('should initialize with empty items array', () => {
            expect(seedQueue.items).toEqual([]);
        });

        it('should initialize with all available seeds', () => {
            expect(seedQueue.availableSeeds).toEqual([0, 1, 2, 3, 4, 5, 6]);
        });
    });

    describe('enqueue', () => {
        it('should add single item to queue', () => {
            seedQueue.enqueue(1);
            expect(seedQueue.items).toEqual([1]);
        });

        it('should add multiple items to queue', () => {
            seedQueue.enqueue(1, 2, 3);
            expect(seedQueue.items).toEqual([1, 2, 3]);
        });

        it('should append items to existing queue', () => {
            seedQueue.enqueue(1);
            seedQueue.enqueue(2, 3);
            expect(seedQueue.items).toEqual([1, 2, 3]);
        });

        it('should handle empty enqueue call', () => {
            seedQueue.enqueue();
            expect(seedQueue.items).toEqual([]);
        });
    });

    describe('dequeue', () => {
        it('should return and remove first item from queue', () => {
            seedQueue.enqueue(1, 2, 3);

            const result = seedQueue.dequeue();

            expect(result).toBe(1);
            expect(seedQueue.items).toEqual([2, 3]);
        });

        it('should return items in FIFO order', () => {
            seedQueue.enqueue(5, 3, 1, 4);

            expect(seedQueue.dequeue()).toBe(5);
            expect(seedQueue.dequeue()).toBe(3);
            expect(seedQueue.dequeue()).toBe(1);
            expect(seedQueue.dequeue()).toBe(4);
        });

        it('should return random seed when queue is empty', () => {
            const result = seedQueue.dequeue();

            expect(seedQueue.availableSeeds).toContain(result);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(6);
        });

        it('should return different random seeds when called multiple times on empty queue', () => {
            const results = [];
            for (let i = 0; i < 20; i++) {
                results.push(seedQueue.dequeue());
            }

            // Should have some variety (not all the same)
            const uniqueResults = [...new Set(results)];
            expect(uniqueResults.length).toBeGreaterThan(1);

            // All results should be valid seeds
            results.forEach(result => {
                expect(seedQueue.availableSeeds).toContain(result);
            });
        });

        it('should handle mixed enqueue/dequeue operations', () => {
            seedQueue.enqueue(1);
            expect(seedQueue.dequeue()).toBe(1);

            seedQueue.enqueue(2, 3);
            expect(seedQueue.dequeue()).toBe(2);

            seedQueue.enqueue(4);
            expect(seedQueue.dequeue()).toBe(3);
            expect(seedQueue.dequeue()).toBe(4);

            // Now queue is empty, should return random
            const randomResult = seedQueue.dequeue();
            expect(seedQueue.availableSeeds).toContain(randomResult);
        });
    });

    describe('Random seed generation', () => {
        it('should use Math.random for seed selection', () => {
            const originalRandom = Math.random;
            Math.random = jest.fn().mockReturnValue(0.5) as () => number;

            const result = seedQueue.dequeue();

            // With 7 seeds and random = 0.5, should select index 3 (seed 3)
            expect(result).toBe(3);

            Math.random = originalRandom;
        });

        it('should handle edge cases of Math.random', () => {
            const originalRandom = Math.random;

            // Test with 0 (should select first seed)
            Math.random = jest.fn().mockReturnValue(0) as () => number;
            expect(seedQueue.dequeue()).toBe(0);

            // Test with value close to 1 (should select last seed)
            Math.random = jest.fn().mockReturnValue(0.999) as () => number;
            expect(seedQueue.dequeue()).toBe(6);

            Math.random = originalRandom;
        });
    });

    describe('State management', () => {
        it('should maintain separate items and availableSeeds arrays', () => {
            seedQueue.enqueue(1, 2);

            expect(seedQueue.items).toEqual([1, 2]);
            expect(seedQueue.availableSeeds).toEqual([0, 1, 2, 3, 4, 5, 6]);

            seedQueue.dequeue();

            expect(seedQueue.items).toEqual([2]);
            expect(seedQueue.availableSeeds).toEqual([0, 1, 2, 3, 4, 5, 6]);
        });

        it('should not modify availableSeeds during normal operation', () => {
            const originalAvailableSeeds = [...seedQueue.availableSeeds];

            seedQueue.enqueue(1, 2, 3);
            seedQueue.dequeue();
            seedQueue.dequeue();
            seedQueue.dequeue();
            seedQueue.dequeue(); // This should use random

            expect(seedQueue.availableSeeds).toEqual(originalAvailableSeeds);
        });
    });
});