import {
	addTetrominoBase,
	pressHardDrop,
	setTetrominoDropTimeInMiliseconds,
	getBlocks,
} from "../support/testUtils";
import { BOTTOM_ROW_PIXEL, BOTTOM_ROW_INDEX } from "../support/constants";

// Guard spec ensuring exclusive height (0..19) is preserved visually & logically.
describe("Board Bounds Guard", () => {
	beforeEach(() => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 2147483647);
			addTetrominoBase(win);
		});
	});

	it("hard drop lands exactly on bottom row pixel", () => {
		cy.get("#start-button").click();
		cy.get('#game-board [data-tetromino-id="1"]').then(($el) => {
			pressHardDrop();
			cy.wrap($el).should(($final) => {
				const top = parseInt($final.css("top"), 10);
				expect(top).to.equal(BOTTOM_ROW_PIXEL);
			});
		});
	});

	it("no block renders beyond bottom row", () => {
		cy.get("#start-button").click();
		pressHardDrop();
		// Use rendering-agnostic helper to get blocks
		getBlocks("#game-board").each(($block) => {
			const styleTop = parseInt(($block[0] as HTMLElement).style.top || "0", 10);
			// Blocks may have a 1px border; allow equality with bottom row pixel.
			expect(styleTop).to.be.at.most(BOTTOM_ROW_PIXEL);
			const gridY = Math.round(styleTop / 24);
			expect(gridY).to.be.at.most(BOTTOM_ROW_INDEX);
		});
	});
});
