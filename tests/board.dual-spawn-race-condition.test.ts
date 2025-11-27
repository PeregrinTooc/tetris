import { describe, test, expect } from "@jest/globals";
import { Board } from "../src/board";
import { PreviewBoard } from "../src/preview-board";
import { TetrominoSeedQueue } from "../src/TetrominoSeedQueue";
import { createTestBoard } from "./testUtils.unit";

describe("Board - Dual Spawn Race Condition Fix", () => {
	it("should not spawn multiple pieces when line clear completes", (done) => {
		const seeds = [1, 0, 0, 0];
		const board = createTestBoard({
			height: 20,
			width: 11,
			seeds,
			preview: false,
		});

		const spawnCount = { count: 0 };
		const originalSpawn = board.spawnTetromino.bind(board);
		board.spawnTetromino = function () {
			spawnCount.count++;
			return originalSpawn();
		};

		const initialTetromino = board.spawnTetromino();
		expect(spawnCount.count).toBe(1);

		for (let i = 0; i < 19; i++) {
			initialTetromino.drop();
		}
		initialTetromino.lock();

		setTimeout(() => {
			expect(spawnCount.count).toBe(2);

			const secondTetromino = board.getActiveTetromino();
			for (let i = 0; i < 10; i++) {
				board.moveTetromino(secondTetromino, "left");
			}
			for (let i = 0; i < 19; i++) {
				secondTetromino.drop();
			}
			secondTetromino.lock();

			setTimeout(() => {
				expect(spawnCount.count).toBe(3);

				const thirdTetromino = board.getActiveTetromino();
				for (let i = 0; i < 10; i++) {
					board.moveTetromino(thirdTetromino, "left");
				}
				thirdTetromino.rotate(1);
				for (let i = 0; i < 19; i++) {
					thirdTetromino.drop();
				}
				thirdTetromino.lock();

				setTimeout(() => {
					expect(spawnCount.count).toBe(4);

					const fourthTetromino = board.getActiveTetromino();
					for (let i = 0; i < 10; i++) {
						board.moveTetromino(fourthTetromino, "left");
					}
					fourthTetromino.rotate(1);
					for (let i = 0; i < 19; i++) {
						fourthTetromino.drop();
					}
					fourthTetromino.lock();

					setTimeout(() => {
						expect(spawnCount.count).toBe(5);
						expect(board.getActiveTetromino()).toBeDefined();
						expect(board.getActiveTetromino().locked).toBe(false);

						done();
					}, 1500);
				}, 100);
			}, 100);
		}, 100);
	});

	it("should only spawn one piece after line clear animation completes", (done) => {
		const seeds = [1, 0, 0, 0, 5];
		const board = createTestBoard({
			height: 20,
			width: 11,
			seeds,
			preview: false,
		});

		const spawnedIds: string[] = [];
		const originalSpawn = board.spawnTetromino.bind(board);
		board.spawnTetromino = function () {
			const result = originalSpawn();
			spawnedIds.push((result as any).id);
			return result;
		};

		const firstTetromino = board.spawnTetromino();
		for (let i = 0; i < 19; i++) {
			firstTetromino.drop();
		}
		firstTetromino.lock();

		setTimeout(() => {
			const secondTetromino = board.getActiveTetromino();
			for (let i = 0; i < 10; i++) {
				board.moveTetromino(secondTetromino, "left");
			}
			for (let i = 0; i < 19; i++) {
				secondTetromino.drop();
			}
			secondTetromino.lock();

			setTimeout(() => {
				const uniqueSpawnedIds = new Set(spawnedIds);
				expect(spawnedIds.length).toBe(uniqueSpawnedIds.size);

				done();
			}, 1500);
		}, 100);
	});
});
