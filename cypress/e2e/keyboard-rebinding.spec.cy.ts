describe("Keyboard Rebinding", () => {
	beforeEach(() => {
		cy.visit("/");
		// Ensure consistent test environment
		cy.window().then((win) => {
			win.setTetrominoDropTime(100);
			win.pushTetrominoSeed(0); // T piece for consistent testing
		});
	});

	it("should allow rebinding movement keys", () => {
		// Open settings menu
		cy.get("[data-settings-button]").click();
		cy.get("[data-key-rebind-menu]").should("be.visible");

		// Rebind left movement from ArrowLeft to 'A'
		cy.get("[data-rebind-left]").click();
		cy.get("[data-rebind-prompt]").should("contain.text", "Press a key to bind move left");
		cy.get("body").trigger("keydown", { key: "a" });
		cy.get("[data-current-left-bind]").should("contain.text", "A");

		// Close settings
		cy.get("[data-settings-close]").click();

		// Start game
		cy.get("#start-button-desktop").click();
		// Verify new binding works - press 'A' to move left (use CSS left for hidden containers)
		cy.get("[data-tetromino-id='1']")
			.not(".block")
			.not(".coordinate-block")
			.then(($tetromino) => {
				const initialX = parseInt($tetromino.css("left"), 10);
				cy.get("body").trigger("keydown", { key: "a" });
				cy.get("[data-tetromino-id='1']")
					.not(".block")
					.not(".coordinate-block")
					.should(($movedTetromino) => {
						const newX = parseInt($movedTetromino.css("left"), 10);
						expect(newX).to.be.lessThan(initialX);
					});
			});

		// Verify old binding (ArrowLeft) no longer works
		cy.get("[data-tetromino-id='1']")
			.not(".block")
			.not(".coordinate-block")
			.then(($tetromino) => {
				const initialX = parseInt($tetromino.css("left"), 10);
				cy.get("body").trigger("keydown", { key: "ArrowLeft" });
				cy.get("[data-tetromino-id='1']")
					.not(".block")
					.not(".coordinate-block")
					.should(($notMovedTetromino) => {
						const newX = parseInt($notMovedTetromino.css("left"), 10);
						expect(newX).to.equal(initialX);
					});
			});
	});
});
