import { describe, beforeEach, test, expect } from "@jest/globals";
import { TetrominoFactory } from "../src/tetrominoFactory";

describe("TetrominoS", () => {
	const left = 5;
	let tetro: any;

	beforeEach(() => {
		tetro = TetrominoFactory.createNew(left, null, 6);
	});


	test("rotation 0: correct block positions (horizontal)", () => {
		tetro.rotation = 0;
		expect(tetro.getBlockPositions()).toEqual([
			{ x: 5, y: 0 },
			{ x: 4, y: 0 },
			{ x: 5, y: 1 },
			{ x: 6, y: 1 }
		]);
	});

	test("rotation 1: correct block positions (vertical)", () => {
		tetro.rotation = 1;
		expect(tetro.getBlockPositions()).toEqual([
			{ x: 5, y: 0 },
			{ x: 5, y: 1 },
			{ x: 4, y: 0 },
			{ x: 4, y: -1 }
		]);
	});
});
