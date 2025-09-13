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
