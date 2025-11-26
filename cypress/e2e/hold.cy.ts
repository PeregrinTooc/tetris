import {
	pressHold,
	pressHardDrop,
	pressLeft,
	pressDown,
	addTetrominoSeeds,
	addTetrominoO,
	addTetrominoI,
	addTetrominoT,
	pressRight,
	pressRotate,
	doTimes,
} from "../support/testUtils";
import { LINE_CLEAR_ANIMATION_DURATION } from "../../src/constants";

describe("Tetris Hold Functionality", () => {
	beforeEach(() => {
		cy.visit("/");
		cy.window().then((win) => {
			win.setTetrominoDropTime(10000); // Slow fall to remove timing races
			addTetrominoSeeds(win, 0, 0, 0, 0); // deterministic sequence of T pieces
		});
		cy.get("#start-button-desktop").click();
		cy.get("#game-board .tetromino").should("exist");
	});

	it("should display held piece in hold board when H is pressed", () => {
		// Get initial piece's ID
		cy.get("#game-board .tetromino").then(($tetromino) => {
			const initialId = $tetromino.attr("data-tetromino-id");
			expect(initialId).to.not.be.undefined;

			pressHold();

			// First piece should now be in hold board with same ID
			cy.get("#hold-board")
				.find(`.tetromino[data-tetromino-id="${initialId}"]`)
				.should("exist");

			// Second piece should be active with different ID
			cy.get("#game-board .tetromino").should(($newTetromino) => {
				const newId = $newTetromino.attr("data-tetromino-id");
				expect(newId).to.not.equal(initialId);
			});
		});
	});

	it("should swap pieces when H is pressed again", () => {
		// Get initial piece's ID
		cy.get("#game-board .tetromino").then(($tetromino) => {
			const firstId = "1";
			expect($tetromino.attr("data-tetromino-id")).to.equal(firstId);
			cy.log(`First piece ID: ${firstId}`);

			pressHold();

			// Get second piece's ID
			cy.get("#game-board .tetromino").then(($secondTetromino) => {
				const secondId = $secondTetromino.attr("data-tetromino-id");
				expect(secondId).to.equal("2");
				cy.log(`Second piece ID: ${secondId}`);

				// Verify first piece is held and second piece is active
				cy.get("#hold-board")
					.find(`.tetromino[data-tetromino-id="${firstId}"]`)
					.should("exist");
				cy.get("#game-board")
					.find(`.tetromino[data-tetromino-id="${secondId}"]`)
					.should("exist");
				cy.log("First hold completed successfully");

				// Drop the current piece to lock it so we can hold again
				pressHardDrop();
				cy.get('#game-board .tetromino[data-tetromino-id="3"]').should("exist");

				// Get the third piece's ID (spawned after second piece locked)
				cy.get('#game-board .tetromino[data-tetromino-id="3"]').then(($thirdTetromino) => {
					const thirdId = $thirdTetromino.attr("data-tetromino-id");
					cy.log(`Third piece ID: ${thirdId}`);

					pressHold();

					// Debug: Log what's actually on the game board
					cy.get("#game-board").then(($board) => {
						cy.log(`Game board HTML: ${$board.html()}`);
					});

					// Debug: Check if any tetromino exists on game board
					cy.get("#game-board .tetromino")
						.should("exist")
						.then(($el) => {
							const actualId = $el.attr("data-tetromino-id");
							cy.log(`After swap - found tetromino with ID: ${actualId}`);
						});

					// After locking second piece and holding: first piece should be back in game board, third piece should be in hold
					cy.get("#game-board")
						.find(`.tetromino[data-tetromino-id="${firstId}"]`)
						.should("exist");
					cy.get("#hold-board")
						.find(`.tetromino[data-tetromino-id="${thirdId}"]`)
						.should("exist");
				});
			});
		});
	});

	it("should disable keyboard controls for held piece", () => {
		// Get initial piece's ID and position
		cy.get("#game-board .tetromino").then(($tetromino) => {
			const tetrominoId = $tetromino.attr("data-tetromino-id");
			const initialLeft = $tetromino.position().left;
			expect(tetrominoId).to.not.be.undefined;

			pressHold();

			// Get held piece by ID
			cy.get(`#hold-board [data-tetromino-id="${tetrominoId}"]`).then(($held) => {
				const heldPosition = $held.position().left;

				// Try to move with arrow keys
				pressLeft();

				// Position should not change
				cy.get(`#hold-board [data-tetromino-id="${tetrominoId}"]`).then(($afterMove) => {
					expect($afterMove.position().left).to.equal(heldPosition);
				});
			});
		});
	});

	it("should re-enable keyboard controls when piece is swapped back in", () => {
		pressHold();
		pressHold();

		// Store reference to piece after swap (use CSS left which works for hidden containers)
		cy.get("#game-board .tetromino-t").as("swappedPiece");

		cy.get("@swappedPiece").then(($initial) => {
			const initialPos = parseInt($initial.css("left"), 10);

			pressLeft();

			// Verify piece moved
			cy.get("#game-board .tetromino-t").then(($afterMove) => {
				const newPos = parseInt($afterMove.css("left"), 10);
				expect(newPos).to.be.lessThan(initialPos);
			});
		});
	});

	it("should allow remapping of hold key", () => {
		// Reset key bindings by clearing local storage and reload page
		cy.clearLocalStorage();
		cy.reload();
		cy.window().then((win) => {
			win.setTetrominoDropTime(10000);
			addTetrominoSeeds(win, 0);
		});
		// Open settings
		cy.get("[data-settings-button]").click();
		cy.get("[data-key-rebind-menu]").should("be.visible");

		// Find the hold button by its label text
		cy.contains(".key-bind-row", "Hold Piece").find("button").click();

		// Wait for rebind prompt
		cy.get("[data-rebind-prompt]").should("be.visible");

		// Press 'X' as new key
		cy.get("body").type("x");

		// Close settings
		cy.get("[data-settings-close]").click();

		// Start game and wait for piece
		cy.get("#start-button-desktop").click();
		cy.get("#game-board .tetromino").should("have.class", "tetromino-t");

		// Get a reference to the initial piece
		cy.get("#game-board .tetromino")
			.should("have.class", "tetromino-t")
			.then(($initial) => {
				const initialId = $initial.attr("data-tetromino-id");

				// Try old key - should not trigger hold, piece should stay in same place
				pressHold();

				// Same piece should still be active on game board
				cy.get("#game-board")
					.find(`.tetromino[data-tetromino-id="${initialId}"]`)
					.should("exist");
				cy.get("#hold-board .tetromino").should("not.exist");

				// Try new key - should trigger hold and move piece to hold board
				cy.get("body").type("x"); // custom rebind not wrapped; intentional
				cy.get("#hold-board")
					.find(`.tetromino[data-tetromino-id="${initialId}"]`)
					.should("exist");
			});
	});

	it("should prevent holding piece twice without locking", () => {
		pressHold();

		// Store reference to second T piece
		cy.get("#game-board .tetromino").should("have.class", "tetromino-t").as("secondPiece");

		cy.get("@secondPiece").then(($initial) => {
			const initialPos = $initial.position().left;

			// Try to hold again immediately
			pressHold();

			// T piece should still be active and in same position
			cy.get("#game-board .tetromino")
				.should("have.class", "tetromino-t")
				.then(($afterHold) => {
					expect($afterHold.position().left).to.equal(initialPos);
				});
		});
	});

	it("should allow holding after piece lock", () => {
		// Wait for first T piece and hold it
		cy.get("#game-board .tetromino-t").should("exist");
		pressHold();

		// Wait for second T piece and drop it
		cy.get("#game-board .tetromino-t").should("exist");
		for (let i = 0; i < 20; i++) pressDown();

		// Wait for third piece (after second locks)
		cy.get("#game-board .tetromino-t").should("exist");

		pressHold();
		// Verify a tetromino is in hold board by checking for blocks with data-tetromino-id
		cy.get("#hold-board [data-tetromino-id]").should("exist");
	});

	it("should clear the hold board after reset", () => {
		cy.get("#game-board .tetromino").should("have.class", "tetromino-t");
		pressHold();

		// Start game and wait for first piece
		cy.get("#start-button-desktop").click();

		cy.get('#hold-board .tetromino[data-tetromino-id="1"]').should("not.exist");
	});

	it("should block hold during line clear animation", () => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			win.setTetrominoDropTime(1000);
			// Sequence: O I T O (to complete line) then T (to test hold blocking)
			addTetrominoO(win);
			addTetrominoI(win);
			addTetrominoT(win);
			addTetrominoO(win);
			addTetrominoT(win);
		});

		cy.get("#start-button-desktop").click();

		// Position O piece on bottom right
		doTimes(5, pressRight);
		pressHardDrop();

		// Position I piece on bottom left
		doTimes(4, pressLeft);
		pressHardDrop();

		// Position T piece in center
		cy.wait(50);
		doTimes(2, pressDown);
		doTimes(2, pressRotate);
		pressHardDrop();

		// Complete the line with final O piece
		doTimes(2, pressRight);
		pressHardDrop();

		// Immediately try to hold - should be blocked
		cy.wait(50);
		pressHold();

		// Hold board should still be empty
		cy.get("#hold-board .tetromino").should("not.exist");

		// After animation, hold should work
		cy.wait(LINE_CLEAR_ANIMATION_DURATION + 100);
		pressHold();

		// Now hold board should have the piece
		cy.get("#hold-board .tetromino").should("exist");
	});
});
