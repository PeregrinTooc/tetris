/**
 * Calls a function n times. Useful for repeated key presses in tests.
 */
export function doTimes(n: number, fn: () => void) {
	for (let i = 0; i < n; i++) fn();
}
/**
 * Adds a T-shaped tetromino to the game window.
 */
export function addTetrominoT(win: Window) {
	pushTetrominoSeed(win, 0);
}

/**
 * Adds an I-shaped tetromino to the game window.
 */
export function addTetrominoI(win: Window) {
	pushTetrominoSeed(win, 1);
}

/**
 * Adds an O-shaped tetromino to the game window.
 */
export function addTetrominoO(win: Window) {
	pushTetrominoSeed(win, 2);
}

/**
 * Adds a J-shaped tetromino to the game window.
 */
export function addTetrominoJ(win: Window) {
	pushTetrominoSeed(win, 3);
}

/**
 * Adds an L-shaped tetromino to the game window.
 */
export function addTetrominoL(win: Window) {
	pushTetrominoSeed(win, 4);
}

/**
 * Adds a Z-shaped tetromino to the game window.
 */
export function addTetrominoZ(win: Window) {
	pushTetrominoSeed(win, 5);
}

/**
 * Adds an S-shaped tetromino to the game window.
 */
export function addTetrominoS(win: Window) {
	pushTetrominoSeed(win, 6);
}

/**
 * Adds a base (single block) tetromino to the game window (for testing).
 */
export function addTetrominoBase(win: Window) {
	pushTetrominoSeed(win, 1337);
}
// cypress/support/testUtils.ts
// Utility functions for seed manipulation and user input in e2e tests

/**
 * Pushes a tetromino seed to the game window.
 * @param win Cypress window object
 * @param seed Tetromino seed (number)
 */
export function pushTetrominoSeed(win: Window, seed: number) {
	win.pushTetrominoSeed(seed);
}

/**
 * Sets the tetromino drop time in the game window.
 * @param win Cypress window object
 * @param ms Drop time in milliseconds
 */
export function setTetrominoDropTimeInMiliseconds(win: Window, ms: number) {
	win.setTetrominoDropTime(ms);
}

/**
 * Simulates pressing the left arrow key.
 */
export function pressLeft() {
	cy.get("body").trigger("keydown", { key: "ArrowLeft" });
}

/**
 * Simulates pressing the right arrow key.
 */
export function pressRight() {
	cy.get("body").trigger("keydown", { key: "ArrowRight" });
}

/**
 * Simulates pressing the down arrow key.
 */
export function pressDown() {
	cy.get("body").trigger("keydown", { key: "ArrowDown" });
}

/**
 * Simulates pressing the up arrow key (rotate).
 */
export function pressRotate() {
	cy.get("body").trigger("keydown", { key: "ArrowUp" });
}

/**
 * Simulates pressing the space bar (hard drop).
 */
export function pressHardDrop() {
	cy.get("body").trigger("keydown", { key: " " });
	cy.wait(50);
}

/**
 * Simulates pressing the hold key (default 'h'). Use instead of raw typing to ease future key remapping.
 */
export function pressHold() {
	cy.get("body").trigger("keydown", { key: "h" });
}

/**
 * Simulates toggling pause (default 'p').
 */
export function pressPause() {
	cy.get("body").trigger("keydown", { key: "p" });
}

/**
 * Convenience: enqueue multiple seeds in one call using existing window varargs push.
 */
export function addTetrominoSeeds(win: Window, ...seeds: number[]) {
	if (seeds.length === 0) return;
	// Prefer one push to reduce log noise; cast to any to satisfy variadic signature defined at runtime
	(win.pushTetrominoSeed as any)(...seeds);
}

/**
 * Rendering-mode-agnostic helper: Gets blocks regardless of rendering mode.
 * Works with both container-based (.block) and coordinate-based (.coordinate-block) rendering.
 * @param selector Optional parent selector to scope the search
 */
export function getBlocks(selector: string = "#game-board") {
	return cy.get(selector).then(($parent) => {
		const coordBlocks = $parent.find(".coordinate-block");
		if (coordBlocks.length > 0) {
			return cy.wrap(coordBlocks);
		}
		return cy.wrap($parent.find(".block"));
	});
}

/**
 * Rendering-mode-agnostic helper: Gets blocks with a specific data-tetromino-id.
 * Works with both rendering modes.
 * @param tetrominoId The tetromino ID to filter by
 * @param parentSelector Optional parent selector to scope the search
 */
export function getBlocksByTetrominoId(
	tetrominoId: string,
	parentSelector: string = "#game-board"
) {
	return cy.get(parentSelector).then(($parent) => {
		const coordBlocks = $parent.find(`.coordinate-block[data-tetromino-id="${tetrominoId}"]`);
		if (coordBlocks.length > 0) {
			return cy.wrap(coordBlocks);
		}
		return cy.wrap($parent.find(`[data-tetromino-id="${tetrominoId}"].block`));
	});
}

/**
 * Rendering-mode-agnostic helper: Checks if blocks exist in either rendering mode.
 * @param selector Parent selector to check within
 */
export function blocksExist(selector: string = "#game-board") {
	return cy.get(selector).then(($parent) => {
		const coordBlocks = $parent.find(".coordinate-block");
		const containerBlocks = $parent.find(".block");
		return coordBlocks.length > 0 || containerBlocks.length > 0;
	});
}

/**
 * Rendering-mode-agnostic helper: Counts blocks in either rendering mode.
 * @param selector Parent selector to count within
 */
export function getBlockCount(selector: string = "#game-board") {
	return cy.get(selector).then(($parent) => {
		const coordBlocks = $parent.find(".coordinate-block");
		if (coordBlocks.length > 0) {
			return coordBlocks.length;
		}
		return $parent.find(".block").length;
	});
}

/**
 * Gets relative block positions (relative to their container or as-is for coordinate mode).
 * In container mode: returns positions relative to container
 * In coordinate mode: converts absolute positions to relative by finding the center block (0,0)
 * @param tetrominoId The tetromino ID
 * @returns Array of {left, top} positions
 */
export function getRelativeBlockPositions(
	tetrominoId: string
): Cypress.Chainable<{ left: number; top: number }[]> {
	return cy.window().then((win) => {
		const coordBlocks = Cypress.$(
			`#game-board .coordinate-block[data-tetromino-id="${tetrominoId}"]`
		);

		if (coordBlocks.length > 0) {
			// Coordinate mode: blocks have absolute positions, convert to relative
			const positions = coordBlocks
				.map((i: number, el: HTMLElement) => ({
					left: parseInt(el.style.left, 10),
					top: parseInt(el.style.top, 10),
				}))
				.get();

			// Find the center block (the one with smallest top, then middle left)
			// For T-piece: center is the middle of top row
			const minTop = Math.min(...positions.map((p) => p.top));
			const topRowBlocks = positions.filter((p) => p.top === minTop);
			topRowBlocks.sort((a, b) => a.left - b.left);
			const centerBlock = topRowBlocks[Math.floor(topRowBlocks.length / 2)];

			// Make positions relative to center block
			return positions.map((p) => ({
				left: p.left - centerBlock.left,
				top: p.top - centerBlock.top,
			}));
		}

		// Container mode: blocks already have relative positions
		const container = Cypress.$(`[data-tetromino-id="${tetrominoId}"]`).not(".block");
		const blocks = container.find(".block");
		return blocks
			.map((i: number, el: HTMLElement) => ({
				left: parseInt(el.style.left, 10),
				top: parseInt(el.style.top, 10),
			}))
			.get();
	});
}

/**
 * Gets absolute block positions on the game board.
 * In container mode: adds container position to block position
 * In coordinate mode: returns block positions as-is (already absolute)
 * @param tetrominoId The tetromino ID
 * @returns Array of {left, top} absolute positions in pixels
 */
export function getAbsoluteBlockPositions(
	tetrominoId: string
): Cypress.Chainable<{ left: number; top: number }[]> {
	return cy.window().then((win) => {
		const coordBlocks = Cypress.$(
			`#game-board .coordinate-block[data-tetromino-id="${tetrominoId}"]`
		);

		if (coordBlocks.length > 0) {
			// Coordinate mode: positions are already absolute
			return coordBlocks
				.map((i: number, el: HTMLElement) => ({
					left: parseInt(el.style.left, 10),
					top: parseInt(el.style.top, 10),
				}))
				.get();
		}

		// Container mode: add container offset to block positions
		const container = Cypress.$(`[data-tetromino-id="${tetrominoId}"]`)
			.not(".block")
			.not(".coordinate-block");
		const containerLeft = parseInt(container.css("left") || "0", 10);
		const containerTop = parseInt(container.css("top") || "0", 10);

		const blocks = container.find(".block");
		return blocks
			.map((i: number, el: HTMLElement) => ({
				left: parseInt(el.style.left, 10) + containerLeft,
				top: parseInt(el.style.top, 10) + containerTop,
			}))
			.get();
	});
}

/**
 * Gets grid positions (row/col) for blocks.
 * Converts pixel positions to grid coordinates (dividing by 24).
 * @param tetrominoId The tetromino ID
 * @param blockSize Block size in pixels (default 24)
 * @returns Array of {row, col} grid positions
 */
export function getBlockGridPositions(
	tetrominoId: string,
	blockSize: number = 24
): Cypress.Chainable<{ row: number; col: number }[]> {
	return getAbsoluteBlockPositions(tetrominoId).then((positions) => {
		return positions.map((p) => ({
			row: Math.round(p.top / blockSize),
			col: Math.round(p.left / blockSize),
		}));
	});
}
