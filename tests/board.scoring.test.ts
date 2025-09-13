import { describe, expect } from "@jest/globals";
import { createTestBoard, createTetromino, moveTetromino } from "./testUtils.unit";

describe("Board scoring", () => {
	it("dispatches linesCompleted event with correct data for a double line clear", () => {
		let linesCompletedCount = 0;
		const element = document.createElement("div");
		const board = createTestBoard({
			height: 4,
			width: 4,
			seeds: [2, 2],
			preview: false,
			element,
		});

		element.addEventListener("linesCompleted", (event: Event) => {
			const customEvent = event as CustomEvent;
			linesCompletedCount = customEvent.detail.linesCompleted;
		});

		const t1 = createTetromino(board, 2, 0);
		t1.lock();

		const t2 = createTetromino(board, 2, 2);
		t2.lock();

		expect(linesCompletedCount).toBe(2);
	});
	it("dispatches linesCompleted event with correct data for a single line clear", () => {
		let linesCompletedCount = 0;
		const element = document.createElement("div");
		const board = createTestBoard({
			height: 10,
			width: 4,
			seeds: [1337, 1337, 1337, 1337],
			preview: false,
			element,
		});

		element.addEventListener("linesCompleted", (event: Event) => {
			const customEvent = event as CustomEvent;
			linesCompletedCount = customEvent.detail.linesCompleted;
		});

		for (let i = 0; i < 4; i++) {
			const t = createTetromino(board, 1337, i);
			moveTetromino(t, "down");
			t.lock();
		}
		expect(linesCompletedCount).toBe(1);
	});
});
