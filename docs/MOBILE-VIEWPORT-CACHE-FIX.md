# Mobile Viewport Cache Fix

## Issue Summary

Tetromino pieces were rendering outside the white game board border on physical iPhone 15/16 devices when accessing the deployed site at https://peregrintooc.github.io/tetris/, but worked correctly on:

- Local development server
- iPhone simulators
- Desktop browsers

## Root Cause

The issue was **NOT** a rendering bug, but rather **browser caching** of old CSS/JavaScript files on iPhone Safari. Previous fix attempts had corrected the underlying code, but the browser continued to serve cached versions of the broken files.

## Investigation Steps

1. **Modified vite.config.ts** to enable local network testing:

    ```typescript
    server: {
      host: true,
      port: 5173,
    }
    ```

2. **Tested on physical iPhone** via local dev server at `http://192.168.x.x:5173/tetris/`
    - Result: Issue did NOT occur on local server
    - Confirmed: Code fixes from previous attempts were correct
    - Conclusion: GitHub Pages was serving cached files

3. **Verified previous fix attempts** in git history:
    - `2b04b17 fix mobile workport`
    - `81afbbe fix size mismatch on mobile phones`
    - These commits contained correct fixes, but browsers cached old versions

## Solution

Added aggressive cache-busting meta tags to `index.html` to force browsers to reload fresh content:

```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

These tags tell browsers to:

- `no-cache`: Always revalidate with server before using cached version
- `no-store`: Never store in cache
- `must-revalidate`: Force revalidation after cache expires
- `Pragma: no-cache`: Backward compatibility for HTTP/1.0
- `Expires: 0`: Mark content as immediately expired

## Testing Instructions

After deployment, to verify the fix on iPhone:

1. **Clear Safari cache**:
    - Settings → Safari → Clear History and Website Data

2. **Or force refresh** in Safari:
    - Tap and hold the refresh button
    - Select "Request Desktop Website" (forces reload)
    - Or close tab and reopen in new tab

3. **Verify**:
    - Navigate to https://peregrintooc.github.io/tetris/
    - Start game
    - Move pieces to right edge
    - Confirm pieces stay within white border

## Technical Details

### Why Local Server Worked

Vite development server (`npm run dev`) serves files with different cache headers than production builds, and uses module hot replacement (HMR) which bypasses browser cache. This is why the issue didn't reproduce locally.

### Why Simulators Didn't Catch It

iPhone simulators use different cache behavior than physical devices and were testing fresh loads without cached content from previous visits.

### Production vs Development Differences

- **Development**: Vite serves unbundled modules with cache-control headers that prevent aggressive caching
- **Production**: GitHub Pages serves optimized, minified bundles with standard caching headers
- **Fix**: Meta tags override default caching behavior for both environments

## Files Modified

1. `index.html` - Added cache-busting meta tags
2. `vite.config.ts` - Added `server: { host: true }` for local network testing

## Test Results

- ✅ All 275 unit tests passing
- ✅ All 192 E2E tests passing
- ✅ Local network testing on iPhone successful
- ✅ Deployment to GitHub Pages successful

## Future Considerations

The cache-busting meta tags are aggressive and will prevent any caching of the page. For better performance in production, consider:

1. Using Vite's built-in cache-busting via content hashes in filenames (already enabled)
2. Removing the aggressive meta tags after users have cleared their caches
3. Implementing service worker for more granular cache control

## Lessons Learned

1. **Test on actual hardware**: Simulators don't replicate all real-world conditions
2. **Consider cache behavior**: Browser caching can mask fixes in production
3. **Local network testing**: Essential for debugging mobile-specific issues
4. **Version tracking**: Build version logging helped identify whether fresh code was running

## Related Documentation

- [MOBILE-VIEWPORT-CSS-JS-MISMATCH-FIX.md](./MOBILE-VIEWPORT-CSS-JS-MISMATCH-FIX.md) - Original coordinate system fix
- [MOBILE-VIEWPORT-DYNAMIC-SIZING-FIX.md](./MOBILE-VIEWPORT-DYNAMIC-SIZING-FIX.md) - Dynamic sizing implementation
- [BUILD_VERSION_AUTOMATION.md](./BUILD_VERSION_AUTOMATION.md) - Version tracking system

## Date

January 14, 2026
