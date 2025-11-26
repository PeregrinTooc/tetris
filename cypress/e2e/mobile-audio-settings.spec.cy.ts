import {
	addTetrominoT,
	setTetrominoDropTimeInMiliseconds,
	pressLeft,
	pressHardDrop,
} from "../support/testUtils";

describe("Mobile Audio Settings", () => {
	beforeEach(() => {
		cy.viewport(375, 667);
		cy.visit("http://localhost:5173/tetris/");
	});

	describe("Settings button visibility", () => {
		it("should display gear icon button in mobile touch controls", () => {
			cy.get("#mobile-audio-settings-button").should("be.visible");
			cy.get("#mobile-audio-settings-button").should(
				"have.attr",
				"aria-label",
				"Audio Settings"
			);
			cy.get("#mobile-audio-settings-button .touch-icon").should("contain", "⚙");
		});

		it("should not display gear icon button on desktop", () => {
			cy.viewport(1024, 768);
			cy.get("#mobile-audio-settings-button").should("not.be.visible");
		});
	});

	describe("Opening audio settings modal", () => {
		it("should open modal when gear icon is clicked", () => {
			cy.get("#mobile-audio-modal").should("not.be.visible");
			cy.get("#mobile-audio-settings-button").click();
			cy.get("#mobile-audio-modal").should("be.visible");
		});

		it("should pause game when opening modal during active gameplay", () => {
			cy.window().then((win) => {
				setTetrominoDropTimeInMiliseconds(win, 100);
				addTetrominoT(win);
			});

			cy.get("#start-button").click();
			cy.wait(200);

			cy.get("#mobile-audio-settings-button").click();
			cy.get("#pause-overlay").should("be.visible");
		});

		it("should display horizontal sliders in modal", () => {
			cy.get("#mobile-audio-settings-button").click();
			cy.get("#mobile-music-volume").should("be.visible");
			cy.get("#mobile-music-volume").should("have.attr", "type", "range");
			cy.get("#mobile-sfx-volume").should("be.visible");
			cy.get("#mobile-sfx-volume").should("have.attr", "type", "range");
		});

		it("should display volume control buttons in modal", () => {
			cy.get("#mobile-audio-settings-button").click();
			cy.get("#mobile-music-min").should("be.visible");
			cy.get("#mobile-music-max").should("be.visible");
			cy.get("#mobile-sfx-min").should("be.visible");
			cy.get("#mobile-sfx-max").should("be.visible");
		});
	});

	describe("Closing audio settings modal", () => {
		it("should close modal when close button is clicked", () => {
			cy.get("#mobile-audio-settings-button").click();
			cy.get("#mobile-audio-modal").should("be.visible");
			cy.get("#mobile-audio-close").click();
			cy.get("#mobile-audio-modal").should("not.be.visible");
		});

		it("should keep game paused after closing modal", () => {
			cy.window().then((win) => {
				setTetrominoDropTimeInMiliseconds(win, 100);
				addTetrominoT(win);
			});

			cy.get("#start-button").click();
			cy.wait(200);

			cy.get("#mobile-audio-settings-button").click();
			cy.get("#pause-overlay").should("be.visible");

			cy.get("#mobile-audio-close").click();
			cy.get("#mobile-audio-modal").should("not.be.visible");
			cy.get("#pause-overlay").should("be.visible");
		});
	});

	describe("Volume slider functionality", () => {
		it("should sync mobile music slider with desktop music slider", () => {
			cy.get("#mobile-audio-settings-button").click();
			cy.get("#mobile-music-volume").invoke("val", 50).trigger("input");
			cy.get("#mobile-audio-close").click();
			cy.get("#music-volume").should("have.value", "50");
		});

		it("should sync mobile sfx slider with desktop sfx slider", () => {
			cy.get("#mobile-audio-settings-button").click();
			cy.get("#mobile-sfx-volume").invoke("val", 75).trigger("input");
			cy.get("#mobile-audio-close").click();
			cy.get("#sfx-volume").should("have.value", "75");
		});

		it("should set music volume to min when min button is clicked", () => {
			cy.get("#mobile-audio-settings-button").click();
			cy.get("#mobile-music-min").click();
			cy.get("#mobile-music-volume").should("have.value", "0");
		});

		it("should set music volume to max when max button is clicked", () => {
			cy.get("#mobile-audio-settings-button").click();
			cy.get("#mobile-music-volume").invoke("val", 50).trigger("input");
			cy.get("#mobile-music-max").click();
			cy.get("#mobile-music-volume").should("have.value", "100");
		});

		it("should set sfx volume to min when min button is clicked", () => {
			cy.get("#mobile-audio-settings-button").click();
			cy.get("#mobile-sfx-min").click();
			cy.get("#mobile-sfx-volume").should("have.value", "0");
		});

		it("should set sfx volume to max when max button is clicked", () => {
			cy.get("#mobile-audio-settings-button").click();
			cy.get("#mobile-sfx-volume").invoke("val", 30).trigger("input");
			cy.get("#mobile-sfx-max").click();
			cy.get("#mobile-sfx-volume").should("have.value", "100");
		});
	});
});
