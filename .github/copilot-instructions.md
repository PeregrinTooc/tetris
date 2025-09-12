## Tetris Game – AI Contributor Guide

Purpose: Enable rapid, safe changes to a TypeScript Tetris built with strict TDD (Jest unit + Cypress E2E) and deterministic piece generation.

### Core Architecture (see `src/`)
`board.ts`: Central game state. Owns active/next/held pieces, occupied blocks, event dispatch, coordinate rendering.
`tetromino-*.ts`: Shape subclasses of `Tetromino` (`tetromino-base.ts`) defining block geometry via `getBlocks()` + rotation logic.
`tetrominoFactory.ts`: Deterministic creation by numeric seed (0=T,1=I,2=O,3=J,4=L,5=Z,6=S,1337=single/base). Always use factory in tests/features.
`TetrominoSeedQueue.ts`: Queue abstraction allowing tests to enqueue exact spawn order; dequeue on spawn + prefetch preview.
`preview-board.ts` / `hold-board.ts`: Visual/state isolation for next + held piece; board drives them but they stay stateless aside from current piece ref.
`score-board.ts`: Listens for `scoreEvent` (custom events from tetrominos: soft drop, hard drop, lock) to aggregate points.
`audio.ts`: `AudioManager` invoked on key tetromino events (`locked`, `hardDrop`). Inject optional dep into `Board`.
`key-binding-manager.ts`: Maps keys to semantic actions (move, rotate, hold, drop) so tests/features avoid hard‑coding raw key strings.

### Event & Data Flow
Spawn: `Board.spawnTetromino()` either reuses prefetched `nextTetromino` or factory-creates one, then immediately preloads the NEXT piece and updates `PreviewBoard`.
Control: Active tetromino listens for keyboard via `KeyBindingManager`; movement delegates to `Board.moveTetromino()` for bounds + collision with `occupiedPositions`.
Lock: On `Tetromino.lock()` dispatches `locked` -> board absorbs blocks into `occupiedPositions`, clears lines, scores, then spawns next.
Scoring: `Tetromino` dispatches `scoreEvent` for soft drop (+10/row), hard drop (+15/row), lock (+5); line clears scored in board (see tests for point math).
Hold: `Board.hold()` swaps active with stored (only once per spawn cycle via `canHoldPiece` flag) and restarts falling logic.

### Deterministic Testing Hooks
Global helpers exposed on `window`: `setTetrominoDropTime(ms)`, `pushTetrominoSeed(seed)` (enqueue) used in Cypress via `cy.window()` before actions.
Coordinate rendering toggle: `(window as any).USE_COORDINATE_RENDERING === true` triggers block overlay rendering for debugging (board hides container, draws blocks individually).

### Testing Workflow (ALWAYS write/adjust tests first)
Unit: `npm run test:unit:output` -> read `test-output.txt` (CI-friendly, silence by default). For a single file: `npx jest tests/tetromino.t.test.ts --verbose > specific-test-output.txt 2>&1`.
E2E: `npm run test:e2e:output` -> read `test-output-e2e.txt`. Parallel optimized suites: `npm run test:parallel` or granular options in `package.json`.
Seeding pattern (E2E):
```
cy.window().then(win => {
	win.setTetrominoDropTime(80);
	win.pushTetrominoSeed(1337,0,1);
});
```

### Conventions & Constraints
No inline comments—prefer expressive names. Functions and methods aim <=10 lines (split helpers early). Tabs + double quotes. Only `const`/`let` (no `var`). Keep shape logic inside each tetromino subclass; never special‑case by class name elsewhere—use polymorphism.
Add new piece types: extend `Tetromino`, implement `getBlocks()` & rotation, register seed in `tetrominoFactory.ts`, add focused unit tests + a spawn/rotation E2E. Add the seed to the TetrominoSeedQueue. 
When adding scoring rules, emit new `scoreEvent` detail payloads instead of direct scoreboard mutation.

### Safe Change Playbook
1. Add failing unit test in `tests/` (mirror existing naming scheme e.g. `board.feature-name.test.ts`).
2. (If visual/flow) add Cypress test seeding exact piece order.
3. Implement minimal code; prefer adding helper methods on `Board` or `Tetromino` over expanding existing long methods.
4. Run unit then E2E output scripts; inspect artifacts.
5. If tests pass, check for necessary refactors (e.g. extract method, clarify name).
6. Create new tests if the feature is not yet completely described by existing tests and goto 3.
7. Update `TODO-TETRIS.md` with new edge cases discovered.

### Common Pitfalls
Direct DOM mutation outside provided element containers (breaks tests). Use board / tetromino APIs.
Skipping factory & queue (breaks determinism). Always seed via `pushTetrominoSeed` in tests.
Forgetting to reset listeners on piece swap/hold—use existing `_resetActiveTetromino()` pattern.

### Quick Command Reference
Dev server: `npm run dev`
All tests (sequential): `npm test`
Unit only (verbose file output): `npm run test:unit:output`
E2E deterministic output: `npm run test:e2e:output`
Parallel full suite: `npm run test:parallel`

### Extend / Integrate
Inject optional services (audio, key bindings) via `Board` constructor—favor dependency injection to keep pure logic testable.
Expose new deterministic hooks ONLY via `window` wrapper functions (mirroring existing naming) to keep E2E stable.

### Cypress Global Test Helpers
All deterministic E2E control is funneled through `window` helpers registered in `main.ts` (see `registerGlobalTetrominoFunctions`). Never reach into internal objects directly in Cypress – use these wrappers:

`setTetrominoDropTime(ms)`: Adjusts falling interval (restarts ticking). Use small values (60–120) for fast tests; restore to base (see `BASE_DROP_TIME` in `main.ts`) if timing-sensitive assertions follow.

`pushTetrominoSeed(...seeds)`: Enqueue one or more numeric seeds onto `TetrominoSeedQueue` (spawn order). Call BEFORE starting or before the next spawn point. Example spawn script:
```
cy.window().then(win => {
	win.setTetrominoDropTime(80);
	win.pushTetrominoSeed(0,4,6,5); // upcoming sequence: T,L,S,Z
});
```

`logBoard()`: Debug helper to print board state groups (active, next, occupied rows). Use sparingly—noise in CI logs can hide failures.

Usage sequencing pattern:
1. Visit page.
2. Seed queue & timing via helpers.
3. Trigger start (UI or key binding).
4. Perform interactions.
5. Assert DOM / score / held / preview.

Do NOT call helpers mid-drop expecting retroactive effect on already spawned active tetromino (except drop time which safely updates interval). For new helpers, follow naming: imperative verb + domain noun (e.g. `setX`, `pushY`, `logZ`) and register inside the same function to centralize exposure.

### Cypress Support Helper Wrappers (`cypress/support/testUtils.ts`)
Use these wrappers to keep tests concise and consistent; they layer on top of the global window helpers and abstract key events:

Piece enqueue helpers (each pushes a seed): `addTetrominoT(win)`, `addTetrominoI(win)`, `addTetrominoO(win)`, `addTetrominoJ(win)`, `addTetrominoL(win)`, `addTetrominoZ(win)`, `addTetrominoS(win)`, `addTetrominoBase(win)` (1337 single block). Internally call `pushTetrominoSeed`.

Timing: `setTetrominoDropTimeInMiliseconds(win, ms)` (note spelling retained in file—reuse exactly; consider refactor only with search + update tests).

Input simulation: `pressLeft()`, `pressRight()`, `pressDown()` (soft drop scoring), `pressRotate()`, `pressHardDrop()` (triggers hard drop event + waits 50ms), `pressHold()` (hold/swap current piece), `pressPause()` (toggle pause). Prefer these over ad‑hoc `cy.get('body').trigger(...)` to keep future key-binding centralization simple.

Loop utility: `doTimes(n, fn)` for repeated presses, e.g. lateral positioning:
```
cy.window().then(win => {
	win.pushTetrominoSeed(0); // T first
});
// Start game...
doTimes(4, () => pressLeft());
pressHardDrop();
```

Additional enqueue convenience: `addTetrominoSeeds(win, ...seeds)` batches multiple seeds in one call (reduces log noise versus multiple single pushes).

Guidelines:
1. Always enqueue ALL pieces needed for the scenario up front (before start or before previous lock) via wrappers.
2. Use `pressDown()` only when validating incremental soft-drop scoring; otherwise prefer `pressHardDrop()` to shorten test runtime.
3. After `pressHardDrop()`, allow the existing 50ms wait (already inside helper) to avoid race conditions with subsequent assertions.
4. When adding new input helpers, follow naming `press<Action>` and implement in `testUtils.ts` rather than duplicating triggers in tests.
5. If refactoring the drop-time helper name, update both instructions and every test that imports it—its current long name prevents accidental collision.

### Jest Unit Test Helpers (`tests/testUtils.unit.ts`)
Use these helpers to keep unit tests deterministic and concise without relying on DOM key events:

- `createTestBoard({ height, width, seeds, preview, element, keyBindings })`: Returns a `Board` wired with a stub queue that dequeues from `seeds` in order. Set `preview: false` when you don't assert preview behavior.
- `createTetromino(board, seed, left)`: Factory wrapper creating a tetromino by seed at a `left` position.
- Actions: `moveTetromino(t, dir)`, `rotateTetromino(t, dir)`, `hardDropTetromino(t)`, `lockTetromino(t)`, `holdPiece(board)`.
- Events/assertions: `listenForEvent(el, name)`, `expectTetrominoPosition(t, { left, top })`, `expectTetrominoLocked(t)`, `expectTetrominoBlocks(t, blocks)`, `expectLinesCleared(event, n)`.

Example patterns:
```
const element = document.createElement("div");
const board = createTestBoard({ height: 4, width: 4, seeds: [2,2], preview: false, element });

element.addEventListener("linesCompleted", (e: Event) => {
	const { linesCompleted } = (e as CustomEvent).detail;
	expect(linesCompleted).toBe(2);
});

const leftO = createTetromino(board, 2, 0);
lockTetromino(leftO);
const rightO = createTetromino(board, 2, 2);
lockTetromino(rightO);
```

Guidelines:
1. Prefer helpers over dispatching keyboard events in unit tests.
2. Always specify `seeds` up front for deterministic spawns; pass `preview: false` unless preview is asserted.
3. Keep tests focused on one behavior; extract small helpers if your test exceeds ~10 lines of logic.

---
If any section is unclear (e.g. scoring specifics, rotation edge cases, line-clear sequencing), request refinement and include failing test context.
