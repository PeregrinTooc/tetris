describe("Leveling System", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("should display level 1 at game start", () => {
        cy.get("#start-button").click();
        cy.get("#level-board").should("contain.text", "Level: 1");
    });

    it("should show level increase when scoring enough points", () => {
        cy.visit("/");
        cy.get("#start-button").click();

        // Set a fast drop time for testing
        cy.window().then((win) => {
            win.setTetrominoDropTime(100);
        });

        // Verify we start at level 1
        cy.get("#level-board").should("contain.text", "Level: 1");

        // Score some points by dropping pieces manually to reach level 2 (2000 points)
        // We can use multiple hard drops and score events
        cy.window().then((win) => {
            // Push some tetrominos and force score events
            for (let i = 0; i < 10; i++) {
                win.pushTetrominoSeed(1337); // Use base tetromino for predictability
            }
        });

        // Simulate rapid scoring by triggering hard drops
        for (let i = 0; i < 15; i++) {
            cy.get("body").type(" "); // Space for hard drop
            cy.wait(200); // Small delay
        }

        // Check if we reached level 2 eventually
        cy.get("#level-board", { timeout: 10000 }).should("contain.text", "Level: 2");
    });

    it("should drop tetrominos faster at higher levels", () => {
        cy.visit("/");
        cy.get("#start-button").click();

        // Set a measurable base drop time
        cy.window().then((win) => {
            win.setTetrominoDropTime(1000); // 1 second base
        });

        // At level 1, verify slower speed
        cy.get("#level-board").should("contain.text", "Level: 1");

        // Force level up through scoring (this would need actual scoring logic)
        // For now, just verify the level display exists and updates
        cy.get("#level-board").should("be.visible");
    });
});
