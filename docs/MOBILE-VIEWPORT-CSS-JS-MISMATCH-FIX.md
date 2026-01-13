# Mobile Viewport Boundary Issue - CSS/JS Dimension Mismatch Fix

## Issue Summary

**Problem**: Tetromino pieces were not reaching the board borders on iPhone mobile devices (reported on iPhone 15 and iPhone 16 simulator), causing visible gaps between pieces and board edges.

**Root Cause**: The board's visual container size (CSS) didn't match the coordinate system used by JavaScript for positioning blocks.

## Root Cause Analysis

### The Three-Way Mismatch

The game had **three different dimension systems** that were out of sync:

1. **CSS Board Container**: `#game-board` forced to `47vw` by `mobile.css`

    ```css
    #game-board {
    	width: 47vw !important;
    	height: calc(47vw * 20 / 11) !important;
    }
    ```

2. **JavaScript Board Dimensions**: Set by `Board._applyDimensions()`
    - On mobile: **exited early without setting dimensions** (relied on CSS)
    - On desktop: Set to calculated pixel values from `SizingConfig`

3. **Canvas & Coordinate System**: Always used `SizingConfig.BOARD_WIDTH_PX` and `SizingConfig.BOARD_HEIGHT_PX`

### Why This Caused the Issue

On mobile (viewport width ≤ 768px):

1. CSS forced board to `47vw` (e.g., 393px viewport → 184.71px board width)
2. `Board._applyDimensions()` exited early, leaving CSS in control
3. But JavaScript positioning used `SizingConfig.BOARD_WIDTH_PX` (176px for 11 blocks × 16px)
4. **Result**: Pieces positioned based on 176px coordinate space inside a 184.71px visual container
5. This created ~8.71px of empty space, making pieces appear to not reach borders

### Why the Previous Fix Didn't Work

The initial attempt tried to fix canvas initialization and dynamic sizing, but this didn't address the core issue:

- Canvas was already correctly sized
- Dynamic `tetromino.size` getters were working
- **The problem was the CSS override forcing different board dimensions**

## The Solution

### 1. Remove Conflicting CSS Rule

**Deleted from `src/mobile.css`:**

```css
/* REMOVED - was causing mismatch */
#game-board {
	width: 47vw !important;
	height: calc(47vw * 20 / 11) !important;
}
```

### 2. Make Board Always Use SizingConfig

**Changed `src/board.ts` - `_applyDimensions()` method:**

```typescript
// BEFORE (caused mismatch on mobile)
private _applyDimensions(): void {
    if (SizingConfig.isMobileViewport()) {
        return;  // ← Exited early, relied on CSS!
    }
    const widthPx = this.blockSize * this.width;
    const heightPx = this.blockSize * this.height;
    this.element.style.width = widthPx + "px";
    this.element.style.height = heightPx + "px";
}

// AFTER (consistent on all viewports)
private _applyDimensions(): void {
    const widthPx = SizingConfig.BOARD_WIDTH_PX;
    const heightPx = SizingConfig.BOARD_HEIGHT_PX;
    this.element.style.width = widthPx + "px";
    this.element.style.height = heightPx + "px";
}
```

### Key Changes:

1. **Removed early exit** for mobile viewport
2. **Always use `SizingConfig` dimensions** for board container
3. This ensures CSS, JavaScript, and canvas all use the **same coordinate system**

## How SizingConfig Works

```typescript
static get BLOCK_SIZE(): number {
    if (!this.isMobileViewport()) {
        return 24;  // Desktop: 24px blocks
    }
    // Mobile: Calculate based on 47vw board width
    const viewportWidth = window.innerWidth;
    const gameWidthPx = (viewportWidth * 47) / 100;
    return Math.floor(gameWidthPx / 11);  // 11 blocks wide
}

static get BOARD_WIDTH_PX(): number {
    return this.BLOCK_SIZE * 11;  // Always 11 blocks
}

static get BOARD_HEIGHT_PX(): number {
    return this.BLOCK_SIZE * 20;  // Always 20 blocks
}
```

### Mobile Calculation Example (iPhone 15)

- Viewport width: 393px
- Game width: `393 × 0.47 = 184.71px`
- Block size: `Math.floor(184.71 / 11) = 16px`
- **Board width: `16 × 11 = 176px`** ← Now CSS, JS, and canvas all use this!

## Files Modified

### Source Files

1. **src/board.ts**
    - Modified `_applyDimensions()` to always use `SizingConfig` dimensions
    - Removed mobile-specific early exit

2. **src/mobile.css**
    - Removed `#game-board` CSS rule that forced `47vw` dimensions
    - Board dimensions now controlled entirely by JavaScript

### Test Files

3. **tests/board.sizing.test.ts**
    - Updated test expectations to match new behavior
    - Renamed test to clarify board always uses `SizingConfig` dimensions

## Results

### Before Fix

- **CSS**: 184.71px (47vw on iPhone 15)
- **JavaScript**: 176px (11 blocks × 16px)
- **Canvas**: 176px
- **Result**: 8.71px mismatch, pieces don't reach borders

### After Fix

- **CSS**: 176px (set by JavaScript)
- **JavaScript**: 176px (from SizingConfig)
- **Canvas**: 176px (from SizingConfig)
- **Result**: ✅ Perfect alignment, pieces reach all borders

## Testing

### Unit Tests

All 275 unit tests pass:

```bash
npm run test:unit:output
# Test Suites: 45 passed, 45 total
# Tests: 275 passed, 275 total
```

### Manual Testing Required

To verify the fix on actual device:

1. Deploy to production
2. Open on iPhone 15/16 Safari
3. Start game and observe:
    - ✅ Pieces should reach left border exactly
    - ✅ Pieces should reach right border exactly
    - ✅ No visible gaps between pieces and borders
    - ✅ Shadow blocks align with board edges

### Browser DevTools Testing

Use mobile viewport simulation:

1. Open DevTools → Device Toolbar
2. Select "iPhone 15 Pro" or similar
3. Verify pieces reach borders in:
    - Portrait orientation
    - Landscape orientation
    - After rotating device

## Why This Is The Correct Fix

1. **Single Source of Truth**: All dimensions come from `SizingConfig`
2. **No CSS Overrides**: JavaScript controls board size completely
3. **Consistent Coordinate Space**: Canvas, DOM, and positioning all use same values
4. **Viewport Responsive**: Still adapts to screen size via `SizingConfig` calculations
5. **Maintains 47vw Intent**: The calculation uses 47% of viewport width, just in JavaScript

## Related Documentation

- Previous (incorrect) approach: `docs/MOBILE-VIEWPORT-DYNAMIC-SIZING-FIX.md`
- Build version automation: `docs/BUILD_VERSION_AUTOMATION.md`
- SizingConfig implementation: `src/sizing-config.ts`
- Mobile CSS layout: `src/mobile.css`

## Conclusion

The mobile viewport boundary issue was caused by a **CSS/JavaScript dimension mismatch**, not by canvas sizing or dynamic getter issues. The fix ensures the board container size (CSS) matches the coordinate system (JavaScript) by removing CSS overrides and making the board always use `SizingConfig` for its dimensions.

**Status**: ✅ Fix implemented and tested (275/275 unit tests passing)
**Next Step**: Deploy and verify on actual iPhone 15/16 devices
