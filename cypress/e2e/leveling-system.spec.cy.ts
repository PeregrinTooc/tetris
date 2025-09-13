import {
	setTetrominoDropTimeInMiliseconds,
	addTetrominoBase,
	addTetrominoT,
	pressLeft,
	pressRight,
	pressDown,
	pressRotate,
	pressHardDrop,
	doTimes,
} from "../support/testUtils";

describe("Leveling System", () => {
	beforeEach(() => {
		cy.visit("/");
	});

	it("should display level 1 at game start", () => {
		cy.get("#start-button").click();
		cy.get("#level-board").should("contain.text", "Level: 1");
	});

	it("should show level increase when scoring enough points", () => {
		cy.window().then((win) => {
			doTimes(20, () => addTetrominoBase(win));
		});
		cy.get("#start-button").click();

		// Verify we start at level 1
		cy.get("#level-board").should("contain.text", "Level: 1");

		// Score some points by dropping pieces manually to reach level 2 (2000 points)
		// Simulate rapid scoring by triggering hard drops
		doTimes(15, pressHardDrop);

		// Check if we reached level 2 eventually
		cy.get("#level-board", { timeout: 10000 }).should("contain.text", "Level: 2");
	});

	it("should drop tetrominos faster at higher levels", () => {
		const tickTimesLevel1: number[] = [];
		const tickTimesLevel2: number[] = [];

		cy.window().then((win) => {
			doTimes(20, () => addTetrominoBase(win));
		});
		cy.get("#start-button").click();
		cy.document().then((doc) => {
			function tickListenerLevel1() {
				tickTimesLevel1.push(Date.now());
				if (tickTimesLevel1.length === 2) {
					doc.removeEventListener("tick", tickListenerLevel1);
				}
			}
			doc.addEventListener("tick", tickListenerLevel1);
		});
		// Verify we start at level 1
		cy.get("#level-board").should("contain.text", "Level: 1");
		cy.wait(1600).then(() => {
			//accumulate some ticks
			expect(tickTimesLevel1.length).to.be.at.least(2);
		});

		// Score some points by dropping pieces manually to reach level 2 (2000 points)
		// Simulate rapid scoring by triggering hard drops
		doTimes(15, pressHardDrop);

		// Check if we reached level 2 eventually
		cy.get("#level-board", { timeout: 10000 }).should("contain.text", "Level: 2");

		cy.document().then((doc) => {
			function tickListenerLevel2() {
				tickTimesLevel2.push(Date.now());
				if (tickTimesLevel2.length === 2) {
					doc.removeEventListener("tick", tickListenerLevel2);
				}
			}
			doc.addEventListener("tick", tickListenerLevel2);
		});

		cy.wait(1300).then(() => {
			//accumulate some ticks
			expect(tickTimesLevel2.length).to.be.at.least(2);
			const interval1 = tickTimesLevel1[1] - tickTimesLevel1[0];
			const interval2 = tickTimesLevel2[1] - tickTimesLevel2[0];
			expect(interval2).to.be.lessThan(interval1);
		});
	});
});
