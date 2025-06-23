describe("Tetris Game Movement", () => {
	beforeEach(() => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			win.setTetrominoDropTime(100);
			for (let i = 0; i < 10; i++) win.pushTetrominoSeed(0);
		});
	});

	it("should rotate the tetromino when up arrow is pressed", () => {
		cy.get("#start-button").click();
		cy.get(".tetromino-t .block").then(($blocks) => {
			const initialPositions = Array.from($blocks).map((b) => ({
				left: b.style.left,
				top: b.style.top
			}));
			cy.get("body").type("{uparrow}");
			cy.get(".tetromino-t .block").then(($rotated) => {
				const rotatedPositions = Array.from($rotated).map((b) => ({
					left: b.style.left,
					top: b.style.top
				}));
				expect(rotatedPositions).not.to.deep.equal(initialPositions);
			});
		});
	});
});
