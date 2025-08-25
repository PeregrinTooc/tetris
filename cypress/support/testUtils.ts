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
export function setTetrominoDropTime(win: Window, ms: number) {
	win.setTetrominoDropTime(ms);
}

/**
 * Simulates pressing the left arrow key.
 */
export function pressLeft() {
	cy.get('body').trigger('keydown', { key: 'ArrowLeft' });
}

/**
 * Simulates pressing the right arrow key.
 */
export function pressRight() {
	cy.get('body').trigger('keydown', { key: 'ArrowRight' });
}

/**
 * Simulates pressing the down arrow key.
 */
export function pressDown() {
	cy.get('body').trigger('keydown', { key: 'ArrowDown' });
}

/**
 * Simulates pressing the up arrow key (rotate).
 */
export function pressRotate() {
	cy.get('body').trigger('keydown', { key: 'ArrowUp' });
}

/**
 * Simulates pressing the space bar (hard drop).
 */
export function pressHardDrop() {
	cy.get('body').trigger('keydown', { key: ' ' });
}

