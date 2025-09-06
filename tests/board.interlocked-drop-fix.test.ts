import { Board } from "../src/board";
import { TetrominoZ } from "../src/tetromino-z";
import { TetrominoO } from "../src/tetromino-o";
import { Block } from "../src/tetromino-base";

describe("Board - Interlocked Tetrominoes Drop Fix", () => {
    let board: Board;
    let mockElement: HTMLElement;

    beforeEach(() => {
        mockElement = document.createElement("div");
        document.body.appendChild(mockElement);
        board = new Board(20, 11, mockElement, null, { dequeue: () => 0 });
    });

    afterEach(() => {
        document.body.removeChild(mockElement);
    });

    it("should drop interlocked tetrominoes in optimal order", () => {
        // This test reproduces the scenario from the debugger where
        // tetromino 4 and 5 are interlocked and prevent each other from dropping
        
        // Create tetromino 5 (the one that couldn't drop)
        const tetromino5 = new TetrominoZ(1, board);
        tetromino5.locked = true;
        const blocks5 = [
            new Block({ x: 1, y: 14, parent: tetromino5 }),
            new Block({ x: 1, y: 15, parent: tetromino5 }),
            new Block({ x: 0, y: 15, parent: tetromino5 }),
            new Block({ x: 0, y: 16, parent: tetromino5 }),
        ];
        tetromino5.blocks = blocks5;
        
        // Create tetromino 4 (the one blocking tetromino 5)
        const tetromino4 = new TetrominoZ(1, board);
        tetromino4.locked = true;
        const blocks4 = [
            new Block({ x: 1, y: 16, parent: tetromino4 }),
            new Block({ x: 1, y: 17, parent: tetromino4 }),
            new Block({ x: 0, y: 17, parent: tetromino4 }),
            new Block({ x: 0, y: 18, parent: tetromino4 }),
        ];
        tetromino4.blocks = blocks4;
        
        // Create some obstacles at the bottom
        const obstacle = new TetrominoO(0, board);
        obstacle.locked = true;
        const obstacleBlocks = [
            new Block({ x: 0, y: 20, parent: obstacle }),
            new Block({ x: 1, y: 20, parent: obstacle }),
        ];
        obstacle.blocks = obstacleBlocks;
        
        // Set up occupied positions
        board['occupiedPositions'] = [...blocks5, ...blocks4, ...obstacleBlocks];
        
        // Record initial positions
        const initial5 = blocks5.map(b => ({ x: b.x, y: b.y }));
        const initial4 = blocks4.map(b => ({ x: b.x, y: b.y }));
        
        // Before fix: tetromino 5 couldn't drop at all (maxDrop = 0)
        // After fix: tetrominoes should drop in optimal order
        
        // Test the individual drop calculations
        const maxDrop5Before = board['_calculateMaxDrop'](tetromino5, blocks5);
        const maxDrop4Before = board['_calculateMaxDrop'](tetromino4, blocks4);
        
        console.log(`Before dropping: tetromino5 maxDrop=${maxDrop5Before}, tetromino4 maxDrop=${maxDrop4Before}`);
        
        // The key insight: tetromino4 can drop more than tetromino5, so it should go first
        expect(maxDrop4Before).toBeGreaterThan(maxDrop5Before);
        
        // Apply the fix
        board['_dropAllBlocks']();
        
        // Check final positions
        const final5 = blocks5.map(b => ({ x: b.x, y: b.y }));
        const final4 = blocks4.map(b => ({ x: b.x, y: b.y }));
        
        const drop5 = Math.min(...final5.map(p => p.y)) - Math.min(...initial5.map(p => p.y));
        const drop4 = Math.min(...final4.map(p => p.y)) - Math.min(...initial4.map(p => p.y));
        
        // Both tetrominoes should have dropped
        expect(drop4).toBeGreaterThan(0);
        expect(drop5).toBeGreaterThan(0);
        
        console.log(`After dropping: tetromino5 dropped ${drop5}, tetromino4 dropped ${drop4}`);
    });

    it("should process tetrominoes in descending order of drop distance", () => {
        // Create three tetrominoes with different drop capabilities
        
        // Tetromino A: can drop a lot (no obstacles)
        const tetrominoA = new TetrominoO(3, board);
        tetrominoA.locked = true;
        const blocksA = [
            new Block({ x: 3, y: 5, parent: tetrominoA }),
            new Block({ x: 4, y: 5, parent: tetrominoA }),
        ];
        tetrominoA.blocks = blocksA;
        
        // Tetromino B: can drop medium amount
        const tetrominoB = new TetrominoO(6, board);
        tetrominoB.locked = true;
        const blocksB = [
            new Block({ x: 6, y: 8, parent: tetrominoB }),
            new Block({ x: 7, y: 8, parent: tetrominoB }),
        ];
        tetrominoB.blocks = blocksB;
        
        // Tetromino C: can drop very little (obstacle close below)
        const tetrominoC = new TetrominoO(9, board);
        tetrominoC.locked = true;
        const blocksC = [
            new Block({ x: 9, y: 18, parent: tetrominoC }),
            new Block({ x: 10, y: 18, parent: tetrominoC }),
        ];
        tetrominoC.blocks = blocksC;
        
        // Create obstacles
        const obstacle = new TetrominoO(9, board);
        obstacle.locked = true;
        const obstacleBlocks = [
            new Block({ x: 9, y: 20, parent: obstacle }),
            new Block({ x: 10, y: 20, parent: obstacle }),
        ];
        obstacle.blocks = obstacleBlocks;
        
        board['occupiedPositions'] = [...blocksA, ...blocksB, ...blocksC, ...obstacleBlocks];
        
        // Calculate drop distances
        const dropA = board['_calculateMaxDrop'](tetrominoA, blocksA);
        const dropB = board['_calculateMaxDrop'](tetrominoB, blocksB);
        const dropC = board['_calculateMaxDrop'](tetrominoC, blocksC);
        
        // Verify the expected order: A > B > C
        expect(dropA).toBeGreaterThan(dropB);
        expect(dropB).toBeGreaterThan(dropC);
        
        console.log(`Drop distances: A=${dropA}, B=${dropB}, C=${dropC}`);
        
        // The fix should process them in order A, B, C (descending drop distance)
        board['_dropAllBlocks']();
        
        // All should have dropped their maximum possible distance
        expect(blocksA[0].y).toBe(5 + dropA);
        expect(blocksB[0].y).toBe(8 + dropB);
        expect(blocksC[0].y).toBe(18 + dropC);
    });
});