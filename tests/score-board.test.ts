import { describe, beforeEach, test, expect } from "@jest/globals";
import { ScoreBoard } from "../src/score-board";

describe("ScoreBoard", () => {
	let scoreBoard: ScoreBoard;
	let scoreElement: HTMLElement;
	let levelElement: HTMLElement;

	beforeEach(() => {
		scoreElement = document.createElement("div");
		levelElement = document.createElement("div");
		scoreBoard = new ScoreBoard(scoreElement, levelElement, () => {}, 1000);
	});

	test("should display score", () => {
		scoreBoard.setScore(1500);
		expect(scoreElement.textContent).toBe("Score: 1500");
	});

	test("should display level", () => {
		expect(levelElement.textContent).toBe("Level: 1");
	});

	test("should start at level 1 with 0 score", () => {
		expect(scoreBoard.getCurrentLevel()).toBe(1);
	});

	test("should calculate correct level for given score", () => {
		// Level 1: 0-1999 points
		expect(scoreBoard.getLevelForScore(0)).toBe(1);
		expect(scoreBoard.getLevelForScore(1999)).toBe(1);

		// Level 2: 2000-5999 points (2000 = 1×2×2000/2)
		expect(scoreBoard.getLevelForScore(2000)).toBe(2);
		expect(scoreBoard.getLevelForScore(5999)).toBe(2);

		// Level 3: 6000-11999 points (6000 = 2×3×2000/2)
		expect(scoreBoard.getLevelForScore(6000)).toBe(3);
		expect(scoreBoard.getLevelForScore(11999)).toBe(3);

		// Level 4: 12000+ points (12000 = 3×4×2000/2)
		expect(scoreBoard.getLevelForScore(12000)).toBe(4);
		expect(scoreBoard.getLevelForScore(20000)).toBe(5);
	});

	test("should calculate correct drop time for level", () => {
		const baseDropTime = 1000; // 1 second base drop time

		// Level 1: base time
		expect(scoreBoard.getDropTimeForLevel(1, baseDropTime)).toBe(1000);

		// Level 2: 80% of previous (1000 × 0.8)
		expect(scoreBoard.getDropTimeForLevel(2, baseDropTime)).toBe(800);

		// Level 3: 80% of level 2 (800 × 0.8)
		expect(scoreBoard.getDropTimeForLevel(3, baseDropTime)).toBe(640);

		// Level 4: 80% of level 3 (640 × 0.8)
		expect(scoreBoard.getDropTimeForLevel(4, baseDropTime)).toBe(512);
	});

	test("should update current level when score changes", () => {
		expect(scoreBoard.getCurrentLevel()).toBe(1);

		scoreBoard.setScore(1999);
		expect(scoreBoard.getCurrentLevel()).toBe(1);

		scoreBoard.setScore(2000);
		expect(scoreBoard.getCurrentLevel()).toBe(2);
		expect(levelElement.textContent).toBe("Level: 2");

		scoreBoard.setScore(6000);
		expect(scoreBoard.getCurrentLevel()).toBe(3);
		expect(levelElement.textContent).toBe("Level: 3");
	});

	test("should emit level change event when level increases", () => {
		const levelChangeListener = jest.fn();
		scoreBoard.addEventListener("levelChange", levelChangeListener);

		// Level 1 to 2
		scoreBoard.setScore(2000);

		expect(levelChangeListener).toHaveBeenCalledWith(
			expect.objectContaining({
				detail: { oldLevel: 1, newLevel: 2 },
			})
		);
	});

	test("should not emit level change event when level stays same", () => {
		const levelChangeListener = jest.fn();
		scoreBoard.addEventListener("levelChange", levelChangeListener);

		// Stay at level 1
		scoreBoard.setScore(1000);

		expect(levelChangeListener).not.toHaveBeenCalled();
	});
});
