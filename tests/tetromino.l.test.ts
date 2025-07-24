import { describe, beforeEach, test, expect } from "@jest/globals";
import { TetrominoL } from "../src/tetromino-l";

describe("TetrominoL", () => {
	const left = 5;
	let tetro: TetrominoL;

	beforeEach(() => {
		tetro = new TetrominoL(left, document, null);
	});

	test("should have type L", () => {
		expect(tetro.type).toBe("L");
	});

	test("rotation 0: correct block positions", () => {
		tetro.rotation = 0;
		expect(tetro.getBlockPositions()).toEqual([
			{ x: 5, y: 0 },
			{ x: 4, y: 0 },
			{ x: 6, y: 0 },
			{ x: 4, y: 1 },
		]);
	});

	test("rotation 1: correct block positions", () => {
		tetro.rotation = 1;
		expect(tetro.getBlockPositions()).toEqual([
			{ x: 5, y: 0 },
			{ x: 5, y: 1 },
			{ x: 5, y: -1 },
			{ x: 6, y: 1 },
		]);
	});

	test("rotation 2: correct block positions", () => {
		tetro.rotation = 2;
		expect(tetro.getBlockPositions()).toEqual([
			{ x: 5, y: 0 },
			{ x: 6, y: 0 },
			{ x: 4, y: 0 },
			{ x: 6, y: -1 },
		]);
	});

	test("rotation 3: correct block positions", () => {
		tetro.rotation = 3;
		expect(tetro.getBlockPositions()).toEqual([
			{ x: 5, y: 0 },
			{ x: 5, y: -1 },
			{ x: 5, y: 1 },
			{ x: 4, y: -1 },
		]);
	});
});
