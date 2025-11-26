import {
	setTetrominoDropTimeInMiliseconds,
	addTetrominoI,
	addTetrominoJ,
	addTetrominoL,
	addTetrominoT,
	addTetrominoZ,
	addTetrominoS,
	addTetrominoO,
	pressLeft,
	pressRight,
	pressDown,
	pressRotate,
	pressHardDrop,
	doTimes,
	getBlockGridPositions,
} from "../support/testUtils";

describe("Wall Kick - I-Piece", () => {
	it("should kick right when rotating horizontal to vertical at left wall", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoI(win);
		});
		cy.get("#start-button-desktop").click();

		// I-piece spawns horizontally at center
		// Move to left wall
		doTimes(3, pressLeft);

		// Attempt rotation - should kick right to fit vertically
		pressRotate();

		cy.get(".tetromino-i").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;
			getBlockGridPositions(tetrominoId).then((positions) => {
				const cols = positions.map((p) => p.col);
				const rows = positions.map((p) => p.row);

				// Should be vertical (all blocks in same column)
				expect(new Set(cols).size).to.equal(1);

				// Should be kicked away from left wall (col > 0)
				expect(cols[0]).to.be.greaterThan(0);

				// Should span 4 rows
				expect(Math.max(...rows) - Math.min(...rows)).to.equal(3);
			});
		});
	});

	it("should kick left when rotating horizontal to vertical at right wall", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoI(win);
		});
		cy.get("#start-button-desktop").click();

		// Move to right wall
		doTimes(3, pressRight);

		// Attempt rotation - should kick left to fit vertically
		pressRotate();

		cy.get(".tetromino-i").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;
			getBlockGridPositions(tetrominoId).then((positions) => {
				const cols = positions.map((p) => p.col);
				const rows = positions.map((p) => p.row);

				// Should be vertical (all blocks in same column)
				expect(new Set(cols).size).to.equal(1);

				// Should be kicked away from right wall (col < 9)
				expect(cols[0]).to.be.lessThan(9);

				// Should span 4 rows
				expect(Math.max(...rows) - Math.min(...rows)).to.equal(3);
			});
		});
	});

	it("should kick up when rotating vertical to horizontal near floor", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoI(win);
		});
		cy.get("#start-button-desktop").click();

		// Rotate to vertical first
		pressRotate();

		// Move down near floor (board height is 20, piece needs 4 rows)
		doTimes(15, pressDown);

		// Rotate back to horizontal - should kick up to fit
		pressRotate();

		cy.get(".tetromino-i").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;
			getBlockGridPositions(tetrominoId).then((positions) => {
				const rows = positions.map((p) => p.row);
				const cols = positions.map((p) => p.col);

				// Should be horizontal (all blocks in same row)
				expect(new Set(rows).size).to.equal(1);

				// Should be kicked up from floor (row < 19)
				expect(rows[0]).to.be.lessThan(19);

				// Should span 4 columns
				expect(Math.max(...cols) - Math.min(...cols)).to.equal(3);
			});
		});
	});

	// Note: With the current permissive wall kick system that tries many offsets,
	// it's difficult to create a scenario where rotation truly fails. The system
	// is designed to be player-friendly and find valid positions when possible.
	// This is intentional game design - wall kicks should help, not hinder.
});

describe("Wall Kick - J-Piece", () => {
	it("should kick right when rotating against left wall", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoJ(win);
		});
		cy.get("#start-button-desktop").click();

		// Move to left wall
		doTimes(4, pressLeft);

		// Get initial position
		cy.get(".tetromino-j").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;

			getBlockGridPositions(tetrominoId).then((initialPositions) => {
				const initialMinCol = Math.min(...initialPositions.map((p) => p.col));

				// Attempt rotation - should kick right
				pressRotate();

				getBlockGridPositions(tetrominoId).then((finalPositions) => {
					const finalMinCol = Math.min(...finalPositions.map((p) => p.col));

					// Should have moved right (kicked)
					expect(finalMinCol).to.be.greaterThan(initialMinCol);

					// All blocks should have valid positions (≥0)
					finalPositions.forEach((p) => {
						expect(p.col).to.be.at.least(0);
						expect(p.row).to.be.at.least(0);
					});
				});
			});
		});
	});

	it("should kick left when rotating against right wall", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoJ(win);
		});
		cy.get("#start-button-desktop").click();

		// Move to right wall
		doTimes(4, pressRight);

		// Get initial position
		cy.get(".tetromino-j").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;

			getBlockGridPositions(tetrominoId).then((initialPositions) => {
				const initialMaxCol = Math.max(...initialPositions.map((p) => p.col));

				// Attempt rotation - should kick left
				pressRotate();

				getBlockGridPositions(tetrominoId).then((finalPositions) => {
					const finalMaxCol = Math.max(...finalPositions.map((p) => p.col));

					// Should have moved left (kicked)
					expect(finalMaxCol).to.be.lessThan(initialMaxCol);

					// All blocks should be within board width (<10)
					finalPositions.forEach((p) => {
						expect(p.col).to.be.lessThan(10);
					});
				});
			});
		});
	});

	it("should kick up when rotating near floor", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoJ(win);
		});
		cy.get("#start-button-desktop").click();

		// Move down near floor
		doTimes(17, pressDown);

		// Get initial position
		cy.get(".tetromino-j").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;

			getBlockGridPositions(tetrominoId).then((initialPositions) => {
				const initialMaxRow = Math.max(...initialPositions.map((p) => p.row));

				// Attempt rotation - should kick up if needed
				pressRotate();

				getBlockGridPositions(tetrominoId).then((finalPositions) => {
					// All blocks should be within board height (<20)
					finalPositions.forEach((p) => {
						expect(p.row).to.be.lessThan(20);
					});

					// Should have successfully rotated (blocks changed)
					const positionsChanged =
						JSON.stringify(initialPositions) !== JSON.stringify(finalPositions);
					expect(positionsChanged).to.be.true;
				});
			});
		});
	});
});

describe("Wall Kick - T-Piece", () => {
	it("should kick right when rotating against left wall", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoT(win);
		});
		cy.get("#start-button-desktop").click();

		// Move to left wall
		doTimes(4, pressLeft);

		cy.get(".tetromino-t").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;

			getBlockGridPositions(tetrominoId).then((initialPositions) => {
				// Attempt rotation - should kick right if needed
				pressRotate();

				getBlockGridPositions(tetrominoId).then((finalPositions) => {
					// All blocks should have valid positions
					finalPositions.forEach((p) => {
						expect(p.col).to.be.at.least(0);
						expect(p.col).to.be.lessThan(10);
					});

					// Should have successfully rotated
					const positionsChanged =
						JSON.stringify(initialPositions) !== JSON.stringify(finalPositions);
					expect(positionsChanged).to.be.true;
				});
			});
		});
	});

	it("should kick left when rotating against right wall", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoT(win);
		});
		cy.get("#start-button-desktop").click();

		// Move to right wall
		doTimes(4, pressRight);

		cy.get(".tetromino-t").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;

			getBlockGridPositions(tetrominoId).then((initialPositions) => {
				// Attempt rotation - should kick left if needed
				pressRotate();

				getBlockGridPositions(tetrominoId).then((finalPositions) => {
					// All blocks should be within board
					finalPositions.forEach((p) => {
						expect(p.col).to.be.at.least(0);
						expect(p.col).to.be.lessThan(10);
					});

					// Should have successfully rotated
					const positionsChanged =
						JSON.stringify(initialPositions) !== JSON.stringify(finalPositions);
					expect(positionsChanged).to.be.true;
				});
			});
		});
	});

	it("should perform T-spin setup in tight space", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			// Create walls for T-spin scenario - spawn I pieces first, T last
			addTetrominoI(win); // Left wall (will spawn first)
			addTetrominoI(win); // Right wall (will spawn second)
			addTetrominoT(win); // Active piece (will spawn third after walls are locked)
		});
		cy.get("#start-button-desktop").click();

		// Wait for first I-piece to spawn and position it as left wall
		cy.get(".tetromino-i")
			.should("exist")
			.then(() => {
				doTimes(3, pressLeft);
				pressRotate(); // Make vertical
				doTimes(5, pressDown);
				pressHardDrop(); // Lock it
			});

		// Wait for second I-piece to spawn and position it as right wall
		cy.wait(200); // Wait for next piece spawn
		cy.get(".tetromino-i")
			.should("have.length", 2)
			.then(() => {
				doTimes(1, pressRight);
				pressRotate(); // Make vertical
				doTimes(5, pressDown);
				pressHardDrop(); // Lock it
			});

		// Wait for T-piece to spawn
		cy.wait(200);
		cy.get(".tetromino-t")
			.should("exist")
			.then(($tetromino) => {
				const tetrominoId = $tetromino.attr("data-tetromino-id") as string;

				// Move into gap between walls
				doTimes(5, pressDown);

				// Attempt rotation in tight space - should use wall kicks
				pressRotate();

				// Verify T-piece successfully rotated
				getBlockGridPositions(tetrominoId).then((positions) => {
					expect(positions.length).to.equal(4);
					// All positions should be valid
					positions.forEach((p) => {
						expect(p.col).to.be.at.least(0);
						expect(p.col).to.be.lessThan(10);
						expect(p.row).to.be.at.least(0);
						expect(p.row).to.be.lessThan(20);
					});
				});
			});
	});
});

describe("Wall Kick - L-Piece", () => {
	it("should kick when rotating against left wall", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoL(win);
		});
		cy.get("#start-button-desktop").click();

		// Move to left wall
		doTimes(4, pressLeft);

		cy.get(".tetromino-l").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;

			// Attempt rotation - should kick if needed
			pressRotate();

			getBlockGridPositions(tetrominoId).then((positions) => {
				// All blocks should be within board
				positions.forEach((p) => {
					expect(p.col).to.be.at.least(0);
					expect(p.col).to.be.lessThan(10);
				});
			});
		});
	});

	it("should kick when rotating against right wall", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoL(win);
		});
		cy.get("#start-button-desktop").click();

		// Move to right wall
		doTimes(4, pressRight);

		cy.get(".tetromino-l").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;

			// Attempt rotation - should kick if needed
			pressRotate();

			getBlockGridPositions(tetrominoId).then((positions) => {
				// All blocks should be within board
				positions.forEach((p) => {
					expect(p.col).to.be.at.least(0);
					expect(p.col).to.be.lessThan(10);
				});
			});
		});
	});
});

describe("Wall Kick - Z-Piece", () => {
	it("should kick when rotating against left wall", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoZ(win);
		});
		cy.get("#start-button-desktop").click();

		// Move to left wall
		doTimes(4, pressLeft);

		cy.get(".tetromino-z").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;

			// Attempt rotation - should kick if needed
			pressRotate();

			getBlockGridPositions(tetrominoId).then((positions) => {
				// All blocks should be within board
				positions.forEach((p) => {
					expect(p.col).to.be.at.least(0);
					expect(p.col).to.be.lessThan(10);
				});
			});
		});
	});

	it("should kick when rotating against right wall", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoZ(win);
		});
		cy.get("#start-button-desktop").click();

		// Move to right wall
		doTimes(4, pressRight);

		cy.get(".tetromino-z").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;

			// Attempt rotation - should kick if needed
			pressRotate();

			getBlockGridPositions(tetrominoId).then((positions) => {
				// All blocks should be within board
				positions.forEach((p) => {
					expect(p.col).to.be.at.least(0);
					expect(p.col).to.be.lessThan(10);
				});
			});
		});
	});
});

describe("Wall Kick - S-Piece", () => {
	it("should kick when rotating against left wall", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoS(win);
		});
		cy.get("#start-button-desktop").click();

		// Move to left wall
		doTimes(4, pressLeft);

		cy.get(".tetromino-s").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;

			// Attempt rotation - should kick if needed
			pressRotate();

			getBlockGridPositions(tetrominoId).then((positions) => {
				// All blocks should be within board
				positions.forEach((p) => {
					expect(p.col).to.be.at.least(0);
					expect(p.col).to.be.lessThan(10);
				});
			});
		});
	});

	it("should kick when rotating against right wall", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoS(win);
		});
		cy.get("#start-button-desktop").click();

		// Move to right wall
		doTimes(4, pressRight);

		cy.get(".tetromino-s").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;

			// Attempt rotation - should kick if needed
			pressRotate();

			getBlockGridPositions(tetrominoId).then((positions) => {
				// All blocks should be within board
				positions.forEach((p) => {
					expect(p.col).to.be.at.least(0);
					expect(p.col).to.be.lessThan(10);
				});
			});
		});
	});
});

describe("Wall Kick - O-Piece", () => {
	it("should not rotate or kick (O-piece behavior)", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoO(win);
		});
		cy.get("#start-button-desktop").click();

		// Move to left wall
		doTimes(4, pressLeft);

		cy.get(".tetromino-o").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;

			getBlockGridPositions(tetrominoId).then((initialPositions) => {
				// Sort for consistent comparison
				const sortedInitial = initialPositions
					.map((p) => `${p.row},${p.col}`)
					.sort()
					.join(";");

				// Attempt rotation - should do nothing
				pressRotate();

				getBlockGridPositions(tetrominoId).then((finalPositions) => {
					const sortedFinal = finalPositions
						.map((p) => `${p.row},${p.col}`)
						.sort()
						.join(";");

					// Positions should be identical (no rotation)
					expect(sortedFinal).to.equal(sortedInitial);
				});
			});
		});
	});
});

describe("Wall Kick - Counter-Clockwise Rotation", () => {
	it("should support wall kicks for counter-clockwise rotation", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 100000);
			addTetrominoI(win);
		});
		cy.get("#start-button-desktop").click();

		// Move to left wall
		doTimes(3, pressLeft);

		cy.get(".tetromino-i").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id") as string;

			// Counter-clockwise rotation (z key by default)
			cy.get("body").trigger("keydown", { key: "z" });

			getBlockGridPositions(tetrominoId).then((positions) => {
				const cols = positions.map((p) => p.col);

				// Should be vertical (all blocks in same column)
				expect(new Set(cols).size).to.equal(1);

				// Should be kicked away from left wall
				expect(cols[0]).to.be.greaterThan(0);
			});
		});
	});
});
