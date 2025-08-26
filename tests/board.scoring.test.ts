import { describe, expect } from "@jest/globals";
import { Board } from "../src/board";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { ScoreBoard } from "../src/score-board";

describe("Board scoring", () => {
    it("increments score by 100 per line cleared using real tetrominos", () => {
        // Setup DOM and ScoreBoard
        const scoreElem = document.createElement('div');
        const scoreBoard = new ScoreBoard(scoreElem);
        const element = document.createElement("div");
        const board = new Board(2, 4, element, null as any, { dequeue: () => 2 }, scoreBoard); // O tetromino seed

        // Add two O tetrominos to fill the board (2x2 blocks each)
        const t1 = TetrominoFactory.createNew(0, board, 2); // O
        t1.lock();

        const t2 = TetrominoFactory.createNew(2, board, 2); // O
        t2.lock();

        expect(board.score).toBe(200);
        // Score element should also be updated
        expect(scoreElem.textContent).toBe('Score: 200');
    });
});
