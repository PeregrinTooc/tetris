# Tetris Game: Features & Test Coverage

## Features

### Core Gameplay

- [x] Classic Tetris gameplay (falling blocks, stacking, game over)
- [x] Game board with correct dimensions
- [x] Tetrominoes spawn at the top and fall automatically
- [x] Player can move tetromino left/right/down
- [x] Tetromino locks when it can't move down
- [x] Game over when stack reaches the top
- [x] Tetromino rotation (clockwise/counterclockwise) (T-shape, counter-clockwise, ArrowUp)
- [x] Add I tetromino shape with seed 1 (including tests and implementation)
- [x] Add J tetromino shape (class, test, style, and factory integration)
- [x] Add L tetromino shape (class, test, style, and factory integration)
- [x] Add Z tetromino shape (class, test, style, and factory integration)
- [x] Add S tetromino shape (class, test, style, and factory integration)
- [x] Add O tetromino shape (class, test, style, and factory integration)
- [x] Add T tetromino shape (class, test, style, and factory integration)
- [x] All 7 tetromino shapes (I, O, T, S, Z, J, L) implemented
- [ ] Hold piece functionality
- [x] Hard drop (instantly drop tetromino)
- [x] Soft drop (faster drop)
- [ ] Increasing speed/level progression
- [ ] Scoring system (points for line clears, soft/hard drop)
- [ ] Sound effects and music

### Board & Line Mechanics

- [X] Line clear detection and removal
- [X] Multiple line clears (double, triple, Tetris)
- [ ] Ghost piece (shows where tetromino will land)
- [ ] Wall kicks (rotation near walls)
- [x] Lock delay (brief pause before locking)

### UI/UX

- [x] Start/Reset game button
- [x] Game over message
- [x] Preview of next piece
- [ ] Display for score, level, and lines cleared
- [ ] Responsive/mobile-friendly UI
- [ ] Pause/resume functionality
- [ ] Settings (volume, controls, etc.)

### Accessibility

- [ ] Keyboard remapping

## Test Coverage

### Acceptance (Cypress)

- [x] Game board, start button, and next piece preview are visible on load
- [x] Game starts and spawns tetromino on start
- [x] Tetromino falls automatically
- [x] Player can move tetromino left/right/down
- [x] Tetromino locks and new tetromino spawns
- [x] Game over is detected and displayed
- [x] Tetromino rotation via keyboard (T-shape, ArrowUp)
- [x] All tetromino shapes appear
- [X] Line clear is detected and board updates
- [ ] Score/level/lines UI updates
- [X] Hard drop action
- [ ] Hold action
- [x] Preview of next piece is shown
- [ ] Pause/resume works
- [ ] Mobile/responsive controls

### Unit (Jest)

- [x] Board adds tetromino
- [x] Tetromino movement within boundaries
- [x] Tetromino blocked by board edges or other tetrominos
- [x] Game over event when stack reaches top
- [x] Tetromino locks and becomes immobile
- [x] Tetromino delegates movement to board
- [x] Tetromino initial position is correct
- [x] Board resets and clears tetrominos
- [x] PreviewBoard shows next tetromino
- [x] Tetromino rotation logic (T-shape)
- [X] Line clear logic
- [ ] Scoring and level logic
- [ ] Hold/next piece logic
- [ ] Preview of next piece logic
- [ ] Ghost piece logic
- [ ] Wall kick logic
- [ ] Lock delay logic

---

**Legend:**
- [x] Implemented
- [ ] Missing/To Do

This document tracks the current and missing features and test cases for a well-rounded Tetris game. Please update as features and tests are added.
