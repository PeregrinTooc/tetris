# Tetris Game: Features & Test Coverage

## Features

### Core Gameplay
- ~~Classic Tetris gameplay (falling blocks, stacking, game over)~~
- ~~Game board with correct dimensions~~
- ~~Tetrominoes spawn at the top and fall automatically~~
- ~~Player can move tetromino left/right/down~~
- ~~Tetromino locks when it can't move down~~
- ~~Game over when stack reaches the top~~
- ~~Tetromino rotation (clockwise/counterclockwise)~~ (T-shape, counter-clockwise, ArrowUp)
- [x] Add I tetromino shape with seed 1 (including tests and implementation)
- [ ] All 7 tetromino shapes (I, O, T, S, Z, J, L)
- [ ] Hold piece functionality
- ~~Hard drop (instantly drop tetromino)~~
- [ ] Soft drop (faster drop)
- [ ] Increasing speed/level progression
- [ ] Scoring system (points for line clears, soft/hard drop)
- [ ] Sound effects and music

### Board & Line Mechanics
- [ ] Line clear detection and removal
- [ ] Multiple line clears (double, triple, Tetris)
- [ ] Ghost piece (shows where tetromino will land)
- [ ] Wall kicks (rotation near walls)
- ~~Lock delay (brief pause before locking)~~

### UI/UX
- ~~Start/Reset game button~~
- ~~Game over message~~
- ~~Preview of next piece~~
- [ ] Display for score, level, and lines cleared
- [ ] Responsive/mobile-friendly UI
- [ ] Pause/resume functionality
- [ ] Settings (volume, controls, etc.)

### Accessibility
- [ ] Keyboard remapping
- [ ] Colorblind mode
- [ ] Screen reader support

## Test Coverage

### Acceptance (Cypress)
- ~~Game board, start button, and next piece preview are visible on load~~
- ~~Game starts and spawns tetromino on start~~
- ~~Tetromino falls automatically~~
- ~~Player can move tetromino left/right/down~~
- ~~Tetromino locks and new tetromino spawns~~
- ~~Game over is detected and displayed~~
- ~~Tetromino rotation via keyboard~~ (T-shape, ArrowUp)
- [ ] All tetromino shapes appear
- [ ] Line clear is detected and board updates
- [ ] Score/level/lines UI updates
- [ ] Hold and hard drop actions
- [ ] Preview of next piece is shown
- [ ] Pause/resume works
- [ ] Mobile/responsive controls

### Unit (Jest)
- ~~Board adds tetromino~~
- ~~Tetromino movement within boundaries~~
- ~~Tetromino blocked by board edges or other tetrominos~~
- ~~Game over event when stack reaches top~~
- ~~Tetromino locks and becomes immobile~~
- ~~Tetromino delegates movement to board~~
- ~~Tetromino initial position is correct~~
- ~~Board resets and clears tetrominos~~
- ~~PreviewBoard shows next tetromino~~
- ~~Tetromino rotation logic~~ (T-shape)
- [ ] Line clear logic
- [ ] Scoring and level logic
- [ ] Hold/next piece logic
- [ ] Preview of next piece logic
- [ ] Ghost piece logic
- [ ] Wall kick logic
- [ ] Lock delay logic

---

**Legend:**
- ~~Implemented~~
- [ ] Missing/To Do

This document tracks the current and missing features and test cases for a well-rounded Tetris game. Please update as features and tests are added.
