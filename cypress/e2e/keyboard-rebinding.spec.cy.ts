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
		cy.get("#start-button").click();
		// Verify new binding works - press 'A' to move left
		cy.get("[data-tetromino-id='1']").then(($tetromino) => {
			const initialX = $tetromino.position().left;
			cy.get("body").trigger("keydown", { key: "a" });
			cy.get("[data-tetromino-id='1']").should(($movedTetromino) => {
				expect($movedTetromino.position().left).to.be.lessThan(initialX);
			});
		});

		// Verify old binding (ArrowLeft) no longer works
		cy.get("[data-tetromino-id='1']").then(($tetromino) => {
			const initialX = $tetromino.position().left;
			cy.get("body").trigger("keydown", { key: "ArrowLeft" });
			cy.get("[data-tetromino-id='1']").should(($notMovedTetromino) => {
				expect($notMovedTetromino.position().left).to.equal(initialX);
			});
		});
	});
});
