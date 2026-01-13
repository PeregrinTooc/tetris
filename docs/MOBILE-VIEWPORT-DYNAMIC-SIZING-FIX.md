# Mobile Viewport Dynamic Sizing Fix

## Problem Statement

On iPhone 15 Safari, tetromino pieces were not reaching the right and bottom borders of the game board in portrait mode. When the device orientation changed mid-game, pieces would become completely misaligned as the board borders moved but tetromino positions remained fixed.

### User Report

- **Portrait mode**: Pieces don't reach right/bottom borders, leaving visible gaps
- **Landscape reload**: Works better but still has marginal gap at bottom
- **Orientation change**: Complete misalignment - tetrominoes keep positions relative to canvas but borders move

## Root Cause Analysis

The issue stemmed from **cached block size values** in the tetromino rendering system:

1. **Tetromino size property**: Was set once at construction time from `SizingConfig.BLOCK_SIZE`
2. **Board blockSize property**: Cached at board construction from `SizingConfig.BLOCK_SIZE`
3. **SizingConfig.BLOCK_SIZE**: A dynamic getter that recalculates based on `window.innerWidth`

When viewport changed (orientation, browser chrome showing/hiding):

- `SizingConfig.BLOCK_SIZE` would return new values
- But tetrominos used their cached `size` property from construction time
- Board's `getBlockSize()` returned the cached constructor parameter
- Result: Block positioning used stale size values, causing misalignment

### Failed Approach (Canvas Initialization)

Initial diagnosis incorrectly assumed the issue was canvas drawing buffer vs CSS display size mismatch. We implemented `_initializeCanvas()` to explicitly set canvas dimensions, but this didn't resolve the issue because:

- The canvas was already correctly sized by CSS
- The real problem was in the JavaScript coordinate calculations, not canvas sizing
- Tetromino positioning used cached size values that didn't update with viewport

## Solution

Convert all cached size values to **dynamic getters** that always return the current `SizingConfig.BLOCK_SIZE`:

### 1. Tetromino Size Property → Getter

**Before** (`src/tetromino-base.ts`):

```typescript
export abstract class Tetromino {
	size: number; // Cached at construction

	constructor(left: number, board: Board | null, seed?: number) {
		this.size = board?.getBlockSize() ?? SizingConfig.BLOCK_SIZE;
		// ... rest of constructor
	}
}
```

**After**:

```typescript
export abstract class Tetromino {
	get size(): number {
		if (this.board && typeof (this.board as any).getBlockSize === "function") {
			return (this.board as any).getBlockSize();
		}
		return SizingConfig.BLOCK_SIZE;
	}

	constructor(left: number, board: Board | null, seed?: number) {
		// size is now a getter, not set in constructor
		// ... rest of constructor
	}
}
```

### 2. Board getBlockSize() Returns Dynamic Value

**Before** (`src/board.ts`):

```typescript
export class Board {
	private blockSize: number;

	constructor(..., blockSize: number = SizingConfig.BLOCK_SIZE, ...) {
		this.blockSize = blockSize;  // Cached
	}

	public getBlockSize(): number {
		return this.blockSize;  // Returns cached value
	}
}
```

**After**:

```typescript
export class Board {
	private blockSize: number;  // Still used for _applyDimensions

	constructor(..., blockSize: number = SizingConfig.BLOCK_SIZE, ...) {
		this.blockSize = blockSize;
	}

	public getBlockSize(): number {
		return SizingConfig.BLOCK_SIZE;  // Always returns current value
	}
}
```

### 3. Fix Circular Dependencies

Preview and hold boards were creating circular dependencies by calling `tetromino.size` in their mock board's `getBlockSize()`:

**Before** (`src/preview-board.ts` & `src/hold-board.ts`):

```typescript
tetromino.board = {
	getBlockRenderer: () => this.blockRenderer,
	getBlockSize: () => tetromino.size, // Circular!
};
```

**After**:

```typescript
tetromino.board = {
	getBlockRenderer: () => this.blockRenderer,
	getBlockSize: () => SizingConfig.BLOCK_SIZE, // Direct reference
};
```

## Benefits

1. **Viewport Responsiveness**: Tetrominoes now correctly adapt to viewport changes
2. **Orientation Change Support**: Device rotation works seamlessly without reloading
3. **No Manual Recalculation**: Size automatically updates through getter pattern
4. **Browser Chrome Handling**: Handles Safari address bar showing/hiding
5. **Consistent Rendering**: All blocks use the same current size value

## Technical Details

### How SizingConfig Calculates Block Size

```typescript
// src/sizing-config.ts
static get BLOCK_SIZE(): number {
	if (!this.isMobileViewport()) {
		return this.DESKTOP_BLOCK_SIZE;  // 24px
	}

	const viewportWidth = window.innerWidth;
	const gameWidthPx = (viewportWidth * this.MOBILE_GAME_WIDTH_VW) / 100;
	return Math.floor(gameWidthPx / this.BOARD_WIDTH_BLOCKS);
}

static isMobileViewport(): boolean {
	return window.innerWidth <= 768;
}
```

### iPhone 15 Specific Calculations

- **Portrait** (393px width): `Math.floor((393 * 0.47) / 11)` = **16px** block size
- **Landscape** (852px width): `Math.floor((852 * 0.47) / 11)` = **36px** block size

### Block Positioning

All block positioning uses `tetromino.size` which now dynamically reflects viewport:

```typescript
// src/block-renderer.ts
blockElement.style.left = `${block.x * tetromino.size}px`;
blockElement.style.top = `${block.y * tetromino.size}px`;
```

When viewport changes:

1. `window.innerWidth` changes
2. `SizingConfig.BLOCK_SIZE` getter returns new value
3. `tetromino.size` getter returns new value from board
4. `board.getBlockSize()` returns new `SizingConfig.BLOCK_SIZE`
5. Next `updatePosition()` or render uses new size automatically

## Testing

### Unit Tests

Created comprehensive test suite in `tests/tetromino.dynamic-sizing.test.ts`:

- ✅ Size updates when viewport changes
- ✅ Position calculations use current size
- ✅ Coordinate blocks render with current size
- ✅ Mobile orientation changes handled correctly
- ✅ Multiple tetrominos share same current size
- ✅ Rapid viewport changes don't cause inconsistencies
- ✅ Shadow blocks use current size

### Test Approach

Tests manipulate `window.innerWidth` using `Object.defineProperty`:

```typescript
Object.defineProperty(window, "innerWidth", {
	writable: true,
	configurable: true,
	value: 393, // iPhone 15 portrait
});

const tetromino = createTetromino(board, 0);
expect(tetromino.size).toBe(SizingConfig.BLOCK_SIZE); // 16px

Object.defineProperty(window, "innerWidth", {
	writable: true,
	configurable: true,
	value: 852, // iPhone 15 landscape
});

expect(tetromino.size).toBe(SizingConfig.BLOCK_SIZE); // 36px
```

## Verification

To verify the fix on iPhone 15:

1. Open game in Safari portrait mode
2. Pieces should now reach all borders exactly
3. Rotate device to landscape
4. Game should continue playing with properly sized/positioned pieces
5. Rotate back to portrait
6. Pieces should maintain correct positioning

## Files Modified

- `src/tetromino-base.ts` - Convert size property to getter
- `src/board.ts` - Make getBlockSize() return dynamic value
- `src/preview-board.ts` - Fix circular dependency
- `src/hold-board.ts` - Fix circular dependency
- `tests/tetromino.dynamic-sizing.test.ts` - New comprehensive test suite
- `tests/tetromino.sizing.test.ts` - Update test expectations

## Related Documentation

- `docs/BUILD_VERSION_AUTOMATION.md` - Build versioning system
- `MOBILE-VIEWPORT-FIX.md` - Original (failed) canvas initialization approach
- `.clinerules` - Project development guidelines

## Future Considerations

### Potential Enhancements

1. **Viewport Change Event Listener**: Could add explicit handler for resize events to trigger re-render
2. **Debouncing**: Add debounce to prevent excessive recalculations during rapid resizing
3. **Viewport Meta Tag**: Consider adding stricter viewport configuration to prevent unexpected scaling

### Known Limitations

- Desktop sizing still uses cached board constructor parameter for `_applyDimensions()`
- Canvas initialization code remains but is now supplementary to the main fix
- No explicit handling of extreme viewport sizes (very small/large)

## Conclusion

By converting cached size values to dynamic getters, the game now properly adapts to viewport changes on mobile devices. This fix ensures tetrominos always use the current calculated block size, eliminating the positioning gaps and misalignment issues reported on iPhone 15 Safari.
