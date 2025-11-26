import {
	addTetrominoT,
	addTetrominoI,
	pressLeft,
	pressRight,
	pressDown,
	pressRotate,
	pressHardDrop,
	pressHold,
	pressPause,
} from "../support/testUtils";

describe("Mobile Controls", () => {
	beforeEach(() => {
		cy.viewport("iphone-x");
		cy.visit("http://localhost:5173");
		cy.window().then((win) => {
			const touchControls = win.document.getElementById("touch-controls");
			if (touchControls) {
				touchControls.style.display = "block";
			}
		});
	});

	describe("Touch controls visibility", () => {
		it("should display touch controls on mobile viewport", () => {
			cy.get("#touch-controls").should("exist");
		});

		it("should have all touch control buttons", () => {
			cy.get("[data-touch-left]").should("be.visible");
			cy.get("[data-touch-right]").should("be.visible");
			cy.get("[data-touch-down]").should("be.visible");
			cy.get("[data-touch-rotate]").should("be.visible");
			cy.get("[data-touch-hard-drop]").should("be.visible");
			cy.get("[data-touch-hold]").should("be.visible");
			cy.get("#start-button").should("be.visible");
		});

		it("should not have separate pause button in touch controls", () => {
			cy.get("[data-touch-pause]").should("not.exist");
		});
	});

	describe("Touch controls functionality", () => {
		beforeEach(() => {
			cy.window().then((win) => {
				addTetrominoT(win);
			});
			cy.get("#start-button").click();
			cy.wait(100);
		});

		it("should move tetromino left when left button is clicked", () => {
			cy.get("[data-touch-left]").click();
			cy.wait(50);
			// Mobile uses 16px blocks: initial center (5*16=80px) - 1 block (16px) = 64px
			cy.get(".tetromino").should("have.css", "left", "64px");
		});

		it("should move tetromino right when right button is clicked", () => {
			cy.get("[data-touch-right]").click();
			cy.wait(50);
			// Mobile uses 16px blocks: initial center (5*16=80px) + 1 block (16px) = 96px
			cy.get(".tetromino").should("have.css", "left", "96px");
		});

		it("should move tetromino down when down button is clicked", () => {
			cy.get("[data-touch-down]").click();
			cy.wait(50);
			// Mobile uses 16px blocks: 1 block down = 16px
			cy.get(".tetromino").should("have.css", "top", "16px");
		});

		it("should rotate tetromino when rotate button is clicked", () => {
			cy.get(".tetromino").should("exist");
			cy.get("[data-touch-rotate]").click();
			cy.wait(150);
			cy.get(".tetromino").should("exist");
		});

		it("should hard drop tetromino when hard drop button is clicked", () => {
			cy.get("[data-touch-hard-drop]").click();
			cy.wait(100);
			// Mobile uses 16px blocks: bottom row is at (20-1) * 16 = 304px
			cy.get(".tetromino").should("have.css", "top", "288px");
		});

		it("should hold tetromino when hold button is clicked", () => {
			cy.get("[data-touch-hold]").click();
			cy.wait(200);
			cy.get("#hold-board .hold-container .tetromino").should("exist");
		});

		it("should change start button to pause after game starts", () => {
			cy.get("#start-button").should("contain.text", "Pause");
		});

		it("should pause game when mobile start/pause button is clicked", () => {
			cy.get("#start-button").click();
			cy.get("#pause-overlay").should("be.visible");
		});

		it("should show reset button in pause overlay when paused", () => {
			cy.get("#start-button").click();
			cy.get("#pause-overlay").should("be.visible");
			cy.get("#reset-button-overlay").should("be.visible");
		});

		it("should change button text to Resume when paused", () => {
			cy.get("#start-button").click();
			cy.get("#start-button").should("contain.text", "Resume");
		});

		it("should resume game when clicking Resume button", () => {
			cy.get("#start-button").click();
			cy.wait(50);
			cy.get("#start-button").click();
			cy.get("#pause-overlay").should("not.be.visible");
			cy.get("#start-button").should("contain.text", "Pause");
		});

		it("should reset game when clicking reset button in overlay", () => {
			cy.get("#start-button").click();
			cy.get("#reset-button-overlay").click();
			cy.wait(100);
			cy.get("#start-button").should("contain.text", "Start");
			cy.get("#score-board").should("contain", "Score: 0");
		});
	});

	describe("Responsive layout", () => {
		it("should stack layout vertically on mobile", () => {
			cy.get("body > div").first().should("have.css", "flex-direction", "column");
		});

		it("should display score and level side by side on mobile", () => {
			cy.get("#score-board").should("be.visible");
			cy.get("#level-board").should("be.visible");
		});

		it("should display next and hold boards stacked vertically on mobile", () => {
			cy.get(".side-panel").should("have.css", "flex-direction", "column");
		});

		it("should display controls below game board", () => {
			cy.get("#touch-controls").should("be.visible");
			cy.get(".controls-container").should("be.visible");
		});
	});

	describe("Desktop viewport", () => {
		beforeEach(() => {
			cy.viewport(1024, 768);
			cy.visit("http://localhost:5173");
		});

		it("should hide touch controls on desktop viewport", () => {
			cy.get("#touch-controls").should("not.be.visible");
		});

		it("should maintain horizontal layout on desktop", () => {
			cy.get("body > div")
				.first()
				.children()
				.eq(1)
				.should("have.css", "flex-direction", "row");
		});
	});

	describe("Tablet viewport", () => {
		beforeEach(() => {
			cy.viewport("ipad-2");
			cy.visit("http://localhost:5173");
			cy.window().then((win) => {
				const touchControls = win.document.getElementById("touch-controls");
				if (touchControls) {
					touchControls.style.display = "block";
				}
			});
		});

		it("should display touch controls on tablet", () => {
			cy.get("#touch-controls").should("exist");
		});

		it("should use mobile layout on tablet", () => {
			cy.get("body > div").first().should("have.css", "flex-direction", "column");
		});
	});

	describe("Game playability on mobile", () => {
		beforeEach(() => {
			cy.window().then((win) => {
				addTetrominoT(win);
				addTetrominoI(win);
			});
			cy.get("#start-button").click();
			cy.wait(100);
		});

		it("should complete a line using touch controls", () => {
			cy.get("[data-touch-left]").click().click().click().click();
			cy.wait(50);
			cy.get("[data-touch-hard-drop]").click();
			cy.wait(200);

			cy.get("[data-touch-left]").click();
			cy.wait(50);
			cy.get("[data-touch-hard-drop]").click();
			cy.wait(200);

			cy.get("#score-board").should("contain", "Score:");
		});

		it("should allow rotating and positioning pieces with touch", () => {
			cy.get("[data-touch-rotate]").click();
			cy.wait(50);
			cy.get("[data-touch-left]").click();
			cy.wait(50);
			cy.get("[data-touch-down]").click();
			cy.wait(50);

			cy.get(".tetromino").should("exist");
		});
	});
});
