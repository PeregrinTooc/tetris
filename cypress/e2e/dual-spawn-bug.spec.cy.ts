import {
	addTetrominoI,
	addTetrominoO,
	addTetrominoT,
	doTimes,
	pressHardDrop,
	pressHold,
	pressLeft,
	pressRight,
	pressRotate,
	setTetrominoDropTimeInMiliseconds,
} from "../support/testUtils";

describe("Dual Spawn Bug Prevention", () => {
	beforeEach(() => {
		cy.visit("http://localhost:5173");
	});

	it("should not spawn two active tetrominoes during line clear animation", () => {
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100);

			// Seed ALL tetrominoes before starting the game
			// Build up the bottom of the board to create a line clear scenario
			addTetrominoI(win); // 1
			addTetrominoI(win); // 2
			addTetrominoI(win); // 3
			addTetrominoI(win); // 4
			addTetrominoI(win); // 5
			addTetrominoO(win); // 6
			addTetrominoO(win); // 7
			addTetrominoO(win); // 8
			addTetrominoI(win); // 9
		});

		cy.get("#start-button-desktop").click();

		// I-piece 1: left wall
		doTimes(5, () => pressLeft());
		pressHardDrop();

		// I-piece 2: left wall
		doTimes(5, () => pressLeft());
		pressHardDrop();

		// I-piece 3: left wall
		doTimes(5, () => pressLeft());
		pressHardDrop();

		// I-piece 4: left wall
		doTimes(5, () => pressLeft());
		pressHardDrop();

		// I-piece 5: left wall
		doTimes(5, () => pressLeft());
		pressHardDrop();

		// O-piece 6: fill left-center
		doTimes(1, () => pressLeft());
		pressHardDrop();

		// O-piece 7: fill center-left
		doTimes(1, () => pressRight());
		pressHardDrop();

		// O-piece 8: fill center-right
		doTimes(3, () => pressRight());
		pressHardDrop();

		// I-piece 9: fill right - this should complete lines and trigger animation
		pressRotate();
		doTimes(5, () => pressRight());
		pressHardDrop();

		// Verify no duplicate active tetrominoes during/after line clear
		cy.wait(500); // Wait for animation to complete

		cy.get("#game-board").then(($board) => {
			const board = $board[0];
			const tetrominoElements = board.querySelectorAll("[data-tetromino-id]");

			// Get all unique tetromino IDs
			const tetrominoIds = new Set<string>();
			tetrominoElements.forEach((el) => {
				const id = el.getAttribute("data-tetromino-id");
				if (id) tetrominoIds.add(id);
			});

			// Count how many are NOT locked (active pieces should have falling listener)
			cy.window().then((win) => {
				const boardObj = (win as any).state?.board;
				if (boardObj && typeof boardObj.tetrominos !== "undefined") {
					const activeTetrominos = Array.from(boardObj.tetrominos).filter(
						(t: any) => !t.locked
					);

					// Should only be ONE active tetromino
					expect(activeTetrominos.length).to.equal(
						1,
						`Expected 1 active tetromino but found ${activeTetrominos.length}`
					);
				}
			});
		});
	});

	it("should not spawn duplicate during hold operation near line clear", () => {
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 80);

			// Seed all pieces upfront
			addTetrominoI(win); // 1
			addTetrominoI(win); // 2
			addTetrominoI(win); // 3
			addTetrominoI(win); // 4
			addTetrominoI(win); // 5
			addTetrominoO(win); // 6
			addTetrominoO(win); // 7
			addTetrominoO(win); // 8
			addTetrominoI(win); // 9 - completes line
			addTetrominoT(win); // 10 - piece we'll try to hold during line clear
		});

		cy.get("#start-button-desktop").click();

		// I-piece 1: left wall
		doTimes(5, () => pressLeft());
		pressHardDrop();

		// I-piece 2: left wall
		doTimes(5, () => pressLeft());
		pressHardDrop();

		// I-piece 3: left wall
		doTimes(5, () => pressLeft());
		pressHardDrop();

		// I-piece 4: left wall
		doTimes(5, () => pressLeft());
		pressHardDrop();

		// I-piece 5: left wall
		doTimes(5, () => pressLeft());
		pressHardDrop();

		// O-piece 6: fill left-center
		doTimes(1, () => pressLeft());
		pressHardDrop();

		// O-piece 7: fill center-left
		doTimes(1, () => pressRight());
		pressHardDrop();

		// O-piece 8: fill center-right
		doTimes(3, () => pressRight());
		pressHardDrop();

		// I-piece 9: rotate horizontal and complete line
		pressRotate();
		doTimes(5, () => pressRight());
		pressHardDrop();

		// T-piece 10: Try to hold during line clear animation
		cy.wait(10); // Minimal wait to enter animation phase
		pressHold(); // Try to hold during animation

		// Wait for animation to complete
		cy.wait(500);

		// Verify no duplicate active tetrominoes
		cy.window().then((win) => {
			const boardObj = (win as any).state?.board;
			if (boardObj && typeof boardObj.tetrominos !== "undefined") {
				const activeTetrominos = Array.from(boardObj.tetrominos).filter(
					(t: any) => !t.locked
				);

				expect(activeTetrominos.length).to.equal(
					1,
					`Expected 1 active tetromino but found ${activeTetrominos.length}`
				);
			}
		});
	});

	it("should maintain single active tetromino across rapid line clears", () => {
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 50);

			// Seed all pieces to create multiple consecutive line clears
			addTetrominoI(win); // 1
			addTetrominoI(win); // 2
			addTetrominoI(win); // 3
			addTetrominoI(win); // 4
			addTetrominoI(win); // 5
			addTetrominoI(win); // 6
			addTetrominoO(win); // 7
			addTetrominoO(win); // 8
			addTetrominoO(win); // 9
			addTetrominoI(win); // 10 - completes first line
			addTetrominoI(win); // 11 - will drop and complete second line
		});

		cy.get("#start-button-desktop").click();

		// Build base with I-pieces (vertical stacks)
		doTimes(5, () => pressLeft());
		pressHardDrop();

		doTimes(5, () => pressLeft());
		pressHardDrop();

		doTimes(5, () => pressLeft());
		pressHardDrop();

		doTimes(5, () => pressLeft());
		pressHardDrop();

		doTimes(5, () => pressLeft());
		pressHardDrop();

		doTimes(5, () => pressLeft());
		pressHardDrop();

		// Fill with O-pieces
		doTimes(1, () => pressLeft());
		pressHardDrop();

		doTimes(1, () => pressRight());
		pressHardDrop();

		doTimes(3, () => pressRight());
		pressHardDrop();

		// I-piece 10: complete first line (horizontal)
		pressRotate();
		doTimes(5, () => pressRight());
		pressHardDrop();

		// I-piece 11: will drop after first line clears and complete second line
		pressRotate();
		doTimes(5, () => pressRight());
		pressHardDrop();

		// Wait through multiple animations
		cy.wait(1000);

		// Verify only one active tetromino exists
		cy.window().then((win) => {
			const boardObj = (win as any).state?.board;
			if (boardObj) {
				const activeTetrominos = Array.from(boardObj.tetrominos || []).filter(
					(t: any) => !t.locked
				);

				expect(activeTetrominos.length).to.be.at.most(
					1,
					`Expected at most 1 active tetromino but found ${activeTetrominos.length}`
				);
			}
		});
	});
});
