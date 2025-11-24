import { describe, beforeEach, afterEach, test, expect, jest } from "@jest/globals";
import { Board } from "../src/board";
import { createTestBoard } from "./testUtils.unit";
import { LINE_CLEAR_ANIMATION_DURATION } from "../src/constants";

describe("Board line clear animation", () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	test("should set isAnimating flag during line clear animation", () => {
		const board = createTestBoard({
			height: 20,
			width: 10,
			seeds: [1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337],
			preview: false,
		});

		board.spawnTetromino();

		for (let i = 0; i < 9; i++) {
			const t = board.getActiveTetromino();
			t.left = i;
			t.top = 19;
			t.updatePosition();
			t.lock();
			expect((board as any).isAnimating).toBe(false);
		}

		const lastTetromino = board.getActiveTetromino();
		lastTetromino.left = 9;
		lastTetromino.top = 19;
		lastTetromino.updatePosition();
		lastTetromino.lock();

		expect((board as any).isAnimating).toBe(true);

		jest.advanceTimersByTime(LINE_CLEAR_ANIMATION_DURATION);

		expect((board as any).isAnimating).toBe(false);
	});

	test("should block spawning during animation", () => {
		const board = createTestBoard({
			height: 20,
			width: 10,
			seeds: [1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337, 0],
			preview: false,
		});

		board.spawnTetromino();

		for (let i = 0; i < 9; i++) {
			const t = board.getActiveTetromino();
			t.left = i;
			t.top = 19;
			t.updatePosition();
			t.lock();
		}

		const idBefore = board.getActiveTetromino().id;

		const lastTetromino = board.getActiveTetromino();
		lastTetromino.left = 9;
		lastTetromino.top = 19;
		lastTetromino.updatePosition();
		lastTetromino.lock();

		const activeAfterLock = board.getActiveTetromino();
		expect(activeAfterLock.id).toBe(idBefore);

		jest.advanceTimersByTime(LINE_CLEAR_ANIMATION_DURATION);

		const activeAfterAnimation = board.getActiveTetromino();
		expect(activeAfterAnimation.id).not.toBe(idBefore);
	});

	test("should block hold during animation", () => {
		const holdElement = document.createElement("div");
		const board = createTestBoard({
			height: 20,
			width: 10,
			seeds: [1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337, 0],
			preview: false,
			holdElement,
		});

		board.spawnTetromino();

		for (let i = 0; i < 9; i++) {
			const t = board.getActiveTetromino();
			t.left = i;
			t.top = 19;
			t.updatePosition();
			t.lock();
		}

		const lastTetromino = board.getActiveTetromino();
		lastTetromino.left = 9;
		lastTetromino.top = 19;
		lastTetromino.updatePosition();
		lastTetromino.lock();

		board.hold();

		expect((board as any).holdBoard?.getHeldTetromino()).toBeNull();

		jest.advanceTimersByTime(LINE_CLEAR_ANIMATION_DURATION);

		board.hold();

		expect((board as any).holdBoard?.getHeldTetromino()).not.toBeNull();
	});

	test("should block pause during animation", () => {
		const board = createTestBoard({
			height: 20,
			width: 10,
			seeds: [1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337, 0],
			preview: false,
		});

		board.spawnTetromino();

		for (let i = 0; i < 9; i++) {
			const t = board.getActiveTetromino();
			t.left = i;
			t.top = 19;
			t.updatePosition();
			t.lock();
		}

		expect(board.getActiveTetromino().paused).toBe(false);

		const lastTetromino = board.getActiveTetromino();
		lastTetromino.left = 9;
		lastTetromino.top = 19;
		lastTetromino.updatePosition();
		lastTetromino.lock();

		board.pauseGame();

		expect(board.getActiveTetromino().paused).toBe(false);

		jest.advanceTimersByTime(LINE_CLEAR_ANIMATION_DURATION);

		board.pauseGame();

		expect(board.getActiveTetromino().paused).toBe(true);
	});

	test("should cancel animation on reset", () => {
		const board = createTestBoard({
			height: 20,
			width: 10,
			seeds: [1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337, 0],
			preview: false,
		});

		board.spawnTetromino();

		for (let i = 0; i < 9; i++) {
			const t = board.getActiveTetromino();
			t.left = i;
			t.top = 19;
			t.updatePosition();
			t.lock();
		}

		const lastTetromino = board.getActiveTetromino();
		lastTetromino.left = 9;
		lastTetromino.top = 19;
		lastTetromino.updatePosition();
		lastTetromino.lock();

		expect((board as any).isAnimating).toBe(true);

		board.reset();

		expect((board as any).isAnimating).toBe(false);
		expect((board as any).animationTimeouts.length).toBe(0);
	});

	test("should block movement during animation", () => {
		const board = createTestBoard({
			height: 20,
			width: 10,
			seeds: [1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337, 1337, 0],
			preview: false,
		});

		board.spawnTetromino();

		for (let i = 0; i < 9; i++) {
			const t = board.getActiveTetromino();
			t.left = i;
			t.top = 19;
			t.updatePosition();
			t.lock();
		}

		const lastTetromino = board.getActiveTetromino();
		lastTetromino.left = 9;
		lastTetromino.top = 19;
		lastTetromino.updatePosition();
		lastTetromino.lock();

		const leftDuringAnimation = board.getActiveTetromino().left;
		const moved = board.moveTetromino(board.getActiveTetromino(), "left");

		expect(moved).toBe(false);
		expect(board.getActiveTetromino().left).toBe(leftDuringAnimation);

		jest.advanceTimersByTime(LINE_CLEAR_ANIMATION_DURATION);

		const newPieceLeft = board.getActiveTetromino().left;
		const movedAfter = board.moveTetromino(board.getActiveTetromino(), "left");

		expect(movedAfter).toBe(true);
		expect(board.getActiveTetromino().left).toBe(newPieceLeft - 1);
	});
});
