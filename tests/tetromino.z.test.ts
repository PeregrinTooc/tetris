import { describe, beforeEach, test, expect } from "@jest/globals";
import { TetrominoFactory } from "../src/tetrominoFactory";
import { Tetromino } from "../src/tetromino-base";

describe("TetrominoZ", () => {
	const left = 5;
	let tetro: Tetromino;

	beforeEach(() => {
		tetro = TetrominoFactory.createNew(left, null, 5);
	});

	test("rotation 0: correct block positions (horizontal)", () => {
		tetro.rotation = 0;
		expect(tetro.getBlocks()).toEqual([
			{ x: 5, y: 0, parent: tetro },
			{ x: 4, y: 0, parent: tetro },
			{ x: 5, y: 1, parent: tetro },
			{ x: 6, y: 1, parent: tetro },
		]);
	});

	test("rotation 1: correct block positions (vertical)", () => {
		tetro.rotation = 1;
		expect(tetro.getBlocks()).toEqual([
			{ x: 5, y: -1, parent: tetro },
			{ x: 5, y: 0, parent: tetro },
			{ x: 4, y: 0, parent: tetro },
			{ x: 4, y: 1, parent: tetro },
		]);
	});
});
