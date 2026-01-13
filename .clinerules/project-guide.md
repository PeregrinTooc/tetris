# Tetris Game – Cline AI Contributor Guide

## Project Overview

TypeScript Tetris game built with strict TDD (Jest unit + Cypress E2E) and deterministic piece generation. All changes must be test-driven and maintain deterministic behavior.

## Core Architecture (src/)

### Main Components

- **board.ts**: Central game state. Owns active/next/held pieces, occupied blocks, event dispatch, coordinate rendering.
- **tetromino-\*.ts**: Shape subclasses of `Tetromino` (from `tetromino-base.ts`) defining block geometry via `getBlocks()` + rotation logic.
- **tetrominoFactory.ts**: Deterministic creation by numeric seed (0=T, 1=I, 2=O, 3=J, 4=L, 5=Z, 6=S, 1337=single/base). Always use factory in tests/features.
- **TetrominoSeedQueue.ts**: Queue abstraction for exact spawn order control; dequeue on spawn + prefetch preview.
- **preview-board.ts / hold-board.ts**: Visual/state isolation for next + held piece; board-driven but stateless.
- **score-board.ts**: Listens for `scoreEvent` custom events from tetrominos (soft drop, hard drop, lock) to aggregate points.
- **audio.ts**: `AudioManager` invoked on key tetromino events (`locked`, `hardDrop`). Inject as optional dep into `Board`.
- **key-binding-manager.ts**: Maps keys to semantic actions (move, rotate, hold, drop) so tests avoid hard-coding raw key strings.

### Event & Data Flow

1. **Spawn**: `Board.spawnTetromino()` reuses prefetched `nextTetromino` or factory-creates one, then preloads NEXT piece and updates `PreviewBoard`.
2. **Control**: Active tetromino listens via `KeyBindingManager`; movement delegates to `Board.moveTetromino()` for bounds + collision with `occupiedPositions`.
3. **Lock**: `Tetromino.lock()` dispatches `locked` → board absorbs blocks into `occupiedPositions`, clears lines, scores, then spawns next.
4. **Scoring**: `Tetromino` dispatches `scoreEvent` for soft drop (+10/row), hard drop (+15/row), lock (+5); line clears scored in board.
5. **Hold**: `Board.hold()` swaps active with stored (only once per spawn via `canHoldPiece` flag) and restarts falling logic.

## Testing Workflow (CRITICAL: Always write/adjust tests first)

### Test Commands

- Unit tests: `npm run test:unit:output` → read `test-output.txt`
- Single unit test file: `npx jest tests/tetromino.t.test.ts --verbose > specific-test-output.txt 2>&1`
- E2E tests: `npm run test:e2e:output` → read `test-output-e2e.txt`
- Single E2E test file: `npx cypress run --spec cypress/e2e/mobile-controls.spec.cy.ts --headless --browser electron > specific-e2e-output.txt 2>&1`
- Parallel suite: `npm run test:parallel`
- All tests: `npm test`

### Targeted Test Execution (IMPORTANT)

When fixing a specific failing test:

1. **Run only the specific test file first** to get fast feedback
    - E2E: `npx cypress run --spec cypress/e2e/[filename].spec.cy.ts --headless --browser electron > specific-e2e-output.txt 2>&1`
    - Unit: `npx jest tests/[filename].test.ts --verbose > specific-test-output.txt 2>&1`
2. Only run full test suite (`npm run test:e2e:output` or `npm test`) after specific test passes
3. This saves significant time during iterative test fixing

### Deterministic Testing Hooks

Global helpers exposed on `window`:

- `setTetrominoDropTime(ms)`: Adjusts falling interval
- `pushTetrominoSeed(seed)`: Enqueue exact spawn order
- `logBoard()`: Debug helper for board state

Example E2E seeding:

```javascript
cy.window().then((win) => {
	win.setTetrominoDropTime(80);
	win.pushTetrominoSeed(1337, 0, 1);
});
```

### Cypress Support Helpers (cypress/support/testUtils.ts)

**Piece enqueue**: `addTetrominoT(win)`, `addTetrominoI(win)`, `addTetrominoO(win)`, `addTetrominoJ(win)`, `addTetrominoL(win)`, `addTetrominoZ(win)`, `addTetrominoS(win)`, `addTetrominoBase(win)`
**Timing**: `setTetrominoDropTimeInMiliseconds(win, ms)`
**Input**: `pressLeft()`, `pressRight()`, `pressDown()`, `pressRotate()`, `pressHardDrop()`, `pressHold()`, `pressPause()`
**Utility**: `doTimes(n, fn)`, `addTetrominoSeeds(win, ...seeds)`

### Jest Unit Test Helpers (tests/testUtils.unit.ts)

- `createTestBoard({ height, width, seeds, preview, element, keyBindings })`
- `createTetromino(board, seed, left)`
- Actions: `moveTetromino(t, dir)`, `rotateTetromino(t, dir)`, `hardDropTetromino(t)`, `lockTetromino(t)`, `holdPiece(board)`
- Events/assertions: `listenForEvent(el, name)`, `expectTetrominoPosition(t, { left, top })`, `expectTetrominoLocked(t)`, `expectTetrominoBlocks(t, blocks)`, `expectLinesCleared(event, n)`

## Code Conventions & Constraints

### Style Requirements

- No inline comments—use expressive names
- Functions/methods aim ≤10 lines (split helpers early)
- Tabs + double quotes
- Only `const`/`let` (no `var`)
- Keep shape logic inside each tetromino subclass
- Never special-case by class name—use polymorphism
- For scoring rules, emit new `scoreEvent` detail payloads instead of direct scoreboard mutation

### Adding New Features

1. **New piece types**: Extend `Tetromino`, implement `getBlocks()` & rotation, register seed in `tetrominoFactory.ts`, add focused unit tests + spawn/rotation E2E, add seed to `TetrominoSeedQueue`
2. **New services**: Inject optional services via `Board` constructor—favor dependency injection
3. **New deterministic hooks**: Expose ONLY via `window` wrapper functions (mirror existing naming)

## Safe Change Playbook (MUST FOLLOW)

1. Add failing unit test in `tests/` (mirror existing naming e.g., `board.feature-name.test.ts`)
2. (If visual/flow) add Cypress test seeding exact piece order
3. Implement minimal code; prefer adding helper methods on `Board` or `Tetromino` over expanding existing long methods
4. Run unit then E2E output scripts; inspect artifacts
5. If tests pass, check for necessary refactors (extract method, clarify name)
6. Create new tests if feature not completely described by existing tests and goto 3
7. Update `TODO-TETRIS.md` with new edge cases discovered

## Common Pitfalls to Avoid

- ❌ Direct DOM mutation outside provided element containers (breaks tests). Use board/tetromino APIs
- ❌ Skipping factory & queue (breaks determinism). Always seed via `pushTetrominoSeed` in tests
- ❌ Forgetting to reset listeners on piece swap/hold—use existing `_resetActiveTetromino()` pattern
- ❌ Calling helpers mid-drop expecting retroactive effect on already spawned active tetromino
- ❌ Using ad-hoc `cy.get('body').trigger(...)` instead of wrapper functions

## Command Execution Rules (CRITICAL)

### Important Command Chaining Policy

**Under no circumstances should commands be chained in the terminal.** Always execute commands separately to ensure clarity and prevent unintended consequences.

### Git Push Policy

- **Always run `git push` as a separate command**
- Do NOT chain it with other commands (e.g., avoid `&& git push`)
- Pre-push hook runs E2E suite which can take time
- Never bypass the pre-push hook

## Test Reporting Rules (CRITICAL)

**For efficient test execution, prefer output scripts over direct terminal runs:**

### Preferred Test Workflow (Fast Feedback)

1. **E2E tests**: `npm run test:e2e:output` (writes to `test-output-e2e.txt`)
    - Start the command in background
    - Read `test-output-e2e.txt` while tests are running to identify failures early
    - Much faster than waiting for terminal output
2. **Unit tests**: `npm run test:unit:output` (writes to `test-output.txt`)
    - Same approach: read output file while tests execute
3. **All tests**: `npm test` (only when you need terminal output)

### Reading Test Output Files While Running

- After starting `npm run test:e2e:output`, immediately use `read_file` on `test-output-e2e.txt`
- File updates as tests complete, allowing you to see failures without waiting for full suite
- This approach saves significant time during iterative development

### Fallback to Terminal (Only if needed)

- Use `npm run test:unit` or `npm run test:e2e` if output scripts fail
- Terminal output is slower but guaranteed to show results

## Development Commands

- Dev server: `npm run dev`
- All tests (sequential): `npm test`
- Unit only (verbose file output): `npm run test:unit:output`
- E2E deterministic output: `npm run test:e2e:output`
- Parallel full suite: `npm run test:parallel`

## Test Guidelines

### Cypress E2E

1. Always enqueue ALL pieces needed for scenario up front (before start or before previous lock)
2. Use `pressDown()` only when validating incremental soft-drop scoring; otherwise prefer `pressHardDrop()` to shorten runtime
3. After `pressHardDrop()`, allow existing 50ms wait (already inside helper) to avoid race conditions
4. When adding new input helpers, follow naming `press<Action>` and implement in `testUtils.ts`

### Jest Unit

1. Prefer helpers over dispatching keyboard events in unit tests
2. Always specify `seeds` up front for deterministic spawns
3. Pass `preview: false` unless preview is asserted
4. Keep tests focused on one behavior
5. Extract small helpers if test exceeds ~10 lines of logic

## Coordinate Rendering Debug Mode

Toggle via `(window as any).USE_COORDINATE_RENDERING === true` triggers block overlay rendering for debugging (board hides container, draws blocks individually).

## When Unclear

If any section is unclear (scoring specifics, rotation edge cases, line-clear sequencing), request refinement and include failing test context. The goal is confident, effective contribution with strict TDD adherence.
