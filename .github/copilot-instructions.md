# Tetris Game - AI Coding Instructions

This TypeScript/JavaScript Tetris implementation follows strict TDD practices with Cypress (E2E) and Jest (unit) testing.

## Architecture Overview

**Core Components:**

- `Board` - Game state manager, tetromino spawning, collision detection
- `Tetromino` classes - Shape-specific behavior inheriting from `TetrominoBase`
- `TetrominoFactory` - Creates tetrominos by seed (0=T, 1=I, 2=O, 3=J, 4=L, 5=Z, 6=S, 1337=base)
- `PreviewBoard` - Next piece display
- `TetrominoSeedQueue` - Manages piece generation with seeds for deterministic testing

**Key Patterns:**

- Factory pattern for tetromino creation using numeric seeds
- Event-driven architecture (`locked`, `gameover`, `tick` events)
- Global functions exposed on `window` for test control (`setTetrominoDropTime`, `pushTetrominoSeed`)

## Development Workflow

**TDD Process:**

1. Write failing test first (unit tests for components, Cypress for user stories)
2. Run `npm run test:unit` or `npm run test:e2e` to verify failure
3. Implement minimal code to pass
4. Never write production code without a test

**Testing Strategy:**

- Unit tests: Use actual implementations, no mocks for internal dependencies
- E2E tests: Use `cy.window()` to seed tetrominos and control timing for deterministic tests
- Test setup pattern: `win.setTetrominoDropTime(100); win.pushTetrominoSeed(1337);`

**AI Testing Guidelines:**

- Always use `npm run test:unit:output` when running tests for debugging
- Read unit test results from `test-output.txt` file instead of terminal output
- Always use `npm run test:e2e:output` for Cypress with output to `test-output-e2e.txt`
- Read e2e test results from `test-output-e2e.txt` file instead of terminal output
- Use this pattern for specific test files: `npx jest path/to/test.file.ts --verbose > specific-test-output.txt 2>&1`

**Commands:**

- `npm run dev` - Start Vite dev server
- `npm test` - Run all tests
- `npm run test:unit` - Jest only
- `npm run test:e2e` - Cypress only

## Code Conventions

- TypeScript with strict typing, double quotes, tabs
- Functions ≤10 lines, split if longer unless clarity suffers
- No comments - use descriptive names
- Classes over procedural code
- `const`/`let` only, no `var`

## Critical Implementation Details

**Tetromino System:**

- Each shape has specific seed in factory
- `getBlockPositions()` returns array of `{x, y}` coordinates
- Collision detection via block position comparison
- DOM elements created with `data-tetromino-id` for testing

**Game Flow:**

- `main.ts` orchestrates game state, keyboard events, tick system
- Board manages tetromino lifecycle and collision
- Lock delay handled via `locked` event listeners
- Game over triggered when tetromino spawns at top with collision

**Testing Utilities:**

- Cypress tests use `cy.get('.tetromino')` and `data-tetromino-id` selectors
- Seed 1337 creates base tetromino for predictable testing
- Control timing with `setTetrominoDropTime()` for deterministic movement tests

Update `TODO-TETRIS.md` when adding features or discovering edge cases.
