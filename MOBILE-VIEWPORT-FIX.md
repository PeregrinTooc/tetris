# Mobile Viewport Boundary Fix - iPhone 15 Safari

## Problem Summary

On iPhone 15 Safari (iOS), tetromino pieces were rendering outside the white game board border, despite working correctly on:

- iPhone 17 simulator (Xcode)
- Desktop browsers
- After device rotation

## Root Cause

The issue was a **canvas drawing buffer vs display size mismatch**:

1. **Canvas element attribute**: `canvas.width = 300` (browser default)
2. **Canvas CSS display size**: `184.7px` (scaled by CSS)
3. **Container size**: `193px` (47vw + 8px borders)

### Why This Happened

The canvas HTML element was never being initialized with explicit `width` and `height` attributes. The browser used its default 300×600px drawing buffer, while CSS was trying to scale the display to fit the mobile viewport using `!important` rules:

```css
#game-board canvas {
	width: 47vw !important;
	height: calc(47vw * 20 / 11) !important;
}
```

This created a scaling mismatch:

- Pieces were drawn at 300px coordinate system
- But displayed at 184.7px width
- Scale factor: 184.7 / 300 = 0.616
- Result: Pieces appeared to overflow because their coordinates weren't scaled

### Why Rotation Fixed It

Device rotation triggered a complete layout recalculation, forcing the canvas dimensions to be recalculated correctly, synchronizing the drawing buffer with the display size.

## The Fix

### Changes Made

1. **Added canvas initialization in Board constructor** (`src/board.ts`):

    ```typescript
    private _initializeCanvas(): void {
      const canvas = this.element.querySelector("canvas") as HTMLCanvasElement;
      if (!canvas) {
        return;
      }

      const widthPx = SizingConfig.BOARD_WIDTH_PX;
      const heightPx = SizingConfig.BOARD_HEIGHT_PX;

      canvas.width = widthPx;
      canvas.height = heightPx;
    }
    ```

2. **Removed CSS forced canvas sizing** (`src/mobile.css`):
    - Deleted the `#game-board canvas` rule that forced canvas display size
    - Kept the `#game-board` container sizing (47vw)

### Why This Works

Now the canvas drawing buffer is explicitly set to match the calculated block-based dimensions:

- iPhone 15: `canvas.width = 176px` (16px × 11 blocks)
- Drawing coordinates match pixel dimensions exactly
- No CSS scaling applied to canvas
- Pieces render within bounds

The canvas will be slightly smaller than its container (176px vs 185px content area), but this small margin is acceptable and keeps pieces properly contained.

## Test Coverage

Added comprehensive unit tests (`tests/board.canvas-initialization.test.ts`):

- ✅ Desktop viewport canvas initialization
- ✅ Mobile viewport canvas initialization (iPhone 15 dimensions)
- ✅ Canvas dimensions match SizingConfig calculations
- ✅ Drawing buffer is exact multiple of block size
- ✅ Graceful handling of missing canvas element

All 267 unit tests pass, including 10 new canvas initialization tests.

## Verification Steps

To verify the fix on iPhone 15:

1. Deploy updated code to GitHub Pages
2. Open on iPhone 15 Safari
3. Verify pieces stay within board boundaries on initial load
4. Verify pieces still stay within bounds after rotation
5. Check that iPhone 17 simulator still works correctly
6. Confirm desktop browsers remain unaffected

## Technical Details

### Affected Files

- `src/board.ts` - Added `_initializeCanvas()` method
- `src/mobile.css` - Removed forced canvas sizing
- `tests/board.canvas-initialization.test.ts` - New test coverage

### Key Insights

- Canvas has TWO sizes: drawing buffer (width/height attributes) and display size (CSS)
- These MUST match to avoid scaling artifacts and coordinate mismatches
- Mobile Safari may delay viewport stabilization on initial load
- Always initialize canvas dimensions explicitly before rendering

## Related Issues

This fix resolves the iPhone 15 specific boundary issue without requiring:

- Option 1 (viewport-scaler.ts with CSS transforms)
- Option 3 (DOM-reading for dynamic sizing)

The solution maintains the existing fluid sizing approach while ensuring canvas initialization happens correctly before any rendering occurs.
</content>
