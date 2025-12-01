import { addTetrominoSeeds, setTetrominoDropTimeInMiliseconds } from "../support/testUtils";

describe("Mute Button - Basic Functionality", () => {
	beforeEach(() => {
		cy.visit("/");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 10000);
			addTetrominoSeeds(win, 0, 1, 2);
		});
	});

	describe("Default State", () => {
		it("should be muted by default", () => {
			cy.get("#mute-toggle-desktop").should("have.attr", "data-muted", "true");
			cy.get("#mute-toggle-desktop .mute-icon").should("contain", "🔇");
			cy.get("#mute-toggle-desktop .mute-label").should("contain", "Unmute All");
		});

		it("should have sliders at default position (100) when muted", () => {
			cy.get("#music-volume").should("have.value", "100");
			cy.get("#sfx-volume").should("have.value", "100");
		});
	});

	describe("Mute Toggle", () => {
		it("should unmute when clicked", () => {
			cy.get("#mute-toggle-desktop").click();

			cy.get("#mute-toggle-desktop").should("have.attr", "data-muted", "false");
			cy.get("#mute-toggle-desktop .mute-icon").should("contain", "🔊");
			cy.get("#mute-toggle-desktop .mute-label").should("contain", "Mute All");
		});

		it("should not change slider positions when toggling mute", () => {
			cy.get("#mute-toggle-desktop").click();
			cy.get("#music-volume").invoke("val", 75).trigger("input");
			cy.get("#sfx-volume").invoke("val", 50).trigger("input");

			cy.get("#mute-toggle-desktop").click();

			cy.get("#music-volume").should("have.value", "75");
			cy.get("#sfx-volume").should("have.value", "50");

			cy.get("#mute-toggle-desktop").click();

			cy.get("#music-volume").should("have.value", "75");
			cy.get("#sfx-volume").should("have.value", "50");
		});
	});

	describe("Volume Controls Independent of Mute", () => {
		it("should allow changing slider values while muted without unmuting", () => {
			cy.get("#mute-toggle-desktop").should("have.attr", "data-muted", "true");

			cy.get("#music-volume").invoke("val", 60).trigger("input");
			cy.get("#sfx-volume").invoke("val", 40).trigger("input");

			cy.get("#mute-toggle-desktop").should("have.attr", "data-muted", "true");
			cy.get("#music-volume").should("have.value", "60");
			cy.get("#sfx-volume").should("have.value", "40");
		});

		it("should apply slider volume settings when unmuted", () => {
			cy.get("#music-volume").invoke("val", 30).trigger("input");
			cy.get("#sfx-volume").invoke("val", 80).trigger("input");

			cy.get("#mute-toggle-desktop").click();

			cy.get("#music-volume").should("have.value", "30");
			cy.get("#sfx-volume").should("have.value", "80");
		});
	});

	describe("Min/Max Buttons", () => {
		it("should set sliders without affecting mute state", () => {
			cy.get("#mute-toggle-desktop").should("have.attr", "data-muted", "true");

			cy.get("#music-max").click();

			cy.get("#music-volume").should("have.value", "100");
			cy.get("#mute-toggle-desktop").should("have.attr", "data-muted", "true");
		});

		it("should work when unmuted", () => {
			cy.get("#mute-toggle-desktop").click();

			cy.get("#music-min").click();
			cy.get("#sfx-max").click();

			cy.get("#music-volume").should("have.value", "0");
			cy.get("#sfx-volume").should("have.value", "100");
			cy.get("#mute-toggle-desktop").should("have.attr", "data-muted", "false");
		});
	});

	describe("Mobile Sync", () => {
		it("should sync mobile and desktop mute buttons", () => {
			cy.viewport(375, 667);

			cy.get("#mute-toggle-mobile").should("have.attr", "data-muted", "true");

			cy.get("#mute-toggle-mobile").click();

			cy.get("#mute-toggle-mobile").should("have.attr", "data-muted", "false");
		});
	});

	describe("Persistence", () => {
		it("should persist mute state across reloads", () => {
			cy.get("#mute-toggle-desktop").click();

			cy.reload();

			cy.get("#mute-toggle-desktop").should("have.attr", "data-muted", "false");
		});

		it("should default to muted on first visit", () => {
			cy.clearLocalStorage();
			cy.reload();

			cy.get("#mute-toggle-desktop").should("have.attr", "data-muted", "true");
		});
	});
});
