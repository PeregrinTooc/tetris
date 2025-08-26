import { describe, expect } from "@jest/globals";
import { Board, ScoreBoard } from "../src/board";
import { TetrominoFactory } from "../src/tetrominoFactory";

describe("Board scoring", () => {
    it("increments score by 300 for a double line clear", () => {
        let score = 0;
        const scoreBoard = { setScore: (newScore: number) => { score = newScore } } as ScoreBoard;
        const element = document.createElement("div");
        const board = new Board(4, 4, element, null as any, { dequeue: () => 2 }, scoreBoard); // O tetromino seed

        const t1 = TetrominoFactory.createNew(0, board, 2); // O
        t1.lock();

        const t2 = TetrominoFactory.createNew(2, board, 2); // O
        t2.lock();
        console.log(board);
        expect(score).toBe(300);
    });
    it("increments score by 100 for a single line clear", () => {
        let score = 0;
        const scoreBoard = { setScore: (newScore: number) => { score = newScore } } as ScoreBoard;
        const element = document.createElement("div");
        const board = new Board(10, 4, element, null as any, { dequeue: () => 1337 }, scoreBoard); // base tetromino seed

        for (let i = 0; i < 4; i++) {
            const t = TetrominoFactory.createNew(i, board, 1337);
            t.move("down");
            t.lock();
        }
        expect(score).toBe(100);
    });
});
