import { addTetrominoT } from "../support/testUtils";

describe("Fluid Sizing (Option 3)", () => {
	const viewportSizes = [
		{ width: 375, height: 667, name: "iPhone SE" },
		{ width: 414, height: 896, name: "iPhone 11 Pro Max" },
		{ width: 360, height: 640, name: "Galaxy S5" },
		{ width: 320, height: 568, name: "iPhone 5" },
	];

	viewportSizes.forEach((viewport) => {
		describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
			beforeEach(() => {
				cy.viewport(viewport.width, viewport.height);
				cy.visit("http://localhost:5173");
			});

			it("should use viewport-relative units for game board", () => {
				cy.get("#game-board").should("have.css", "width").and("match", /px$/);

				cy.window().then((win) => {
					const gameBoard = win.document.getElementById("game-board");
					const computedStyle = win.getComputedStyle(gameBoard);
					const widthPx = parseFloat(computedStyle.width);
					const expectedWidth = (viewport.width * 47) / 100;
					expect(widthPx).to.be.closeTo(expectedWidth, 2);
				});
			});

			it("should make all game elements visible", () => {
				cy.get("#game-board").should("be.visible");
				cy.get("#touch-controls").should("be.visible");
				cy.get("#score-board").should("be.visible");
				cy.get("#level-board").should("be.visible");
				cy.get("#next-board").should("be.visible");
				cy.get("#hold-board").should("be.visible");
			});

			it("should make game playable with fluid sizing", () => {
				cy.window().then((win) => {
					addTetrominoT(win);
				});
				cy.get("#start-button").click();
				cy.wait(100);
				cy.get(".tetromino").should("exist");

				cy.get("[data-touch-left]").click();
				cy.wait(50);
				cy.get(".tetromino").should("exist");

				cy.get("[data-touch-rotate]").click();
				cy.wait(50);
				cy.get(".tetromino").should("exist");
			});

			it("should calculate block size dynamically", () => {
				cy.window().then((win) => {
					const blockSize = win.SizingConfig.BLOCK_SIZE;
					const expectedBlockSize = Math.floor((viewport.width * 47) / 100 / 11);
					expect(blockSize).to.equal(expectedBlockSize);
				});
			});
		});
	});

	describe("Desktop viewport", () => {
		beforeEach(() => {
			cy.viewport(1024, 768);
			cy.visit("http://localhost:5173");
		});

		it("should use fixed desktop sizing", () => {
			cy.window().then((win) => {
				const blockSize = win.SizingConfig.BLOCK_SIZE;
				expect(blockSize).to.equal(24);
			});
		});

		it("should hide touch controls on desktop", () => {
			cy.get("#touch-controls").should("not.be.visible");
		});
	});

	describe("Responsive behavior", () => {
		it("should adapt to landscape orientation", () => {
			cy.viewport(667, 375);
			cy.visit("http://localhost:5173");

			cy.get("#game-board").should("be.visible");

			cy.window().then((win) => {
				const gameBoard = win.document.getElementById("game-board");
				const computedStyle = win.getComputedStyle(gameBoard);
				const widthPx = parseFloat(computedStyle.width);
				const expectedWidth = (667 * 47) / 100;
				expect(widthPx).to.be.closeTo(expectedWidth, 2);
			});
		});
	});
});
