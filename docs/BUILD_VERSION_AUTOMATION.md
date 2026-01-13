# Build Version Automation

## Overview

The Tetris game automatically generates and injects build versions in the format `YYYY-MM-DD.seq` where:

- `YYYY-MM-DD` is the build date
- `seq` is a sequence number that increments for multiple builds on the same day

## How It Works

### Architecture

1. **Environment Variable**: `VITE_BUILD_VERSION` is injected at build time
2. **Vite Configuration**: Replaces `import.meta.env.VITE_BUILD_VERSION` with the actual version
3. **Window Property**: Version is exposed as `window.BUILD_VERSION` for console access
4. **No Source Code Changes**: Version stays out of committed code

### Automated Generation

#### GitHub Actions (Production Deployments)

When code is pushed to `main`:

1. **Test Job**: Runs all unit and E2E tests
2. **Deploy Job**:
    - Restores version cache from previous build
    - Runs `scripts/generate-build-version.sh`
    - Generates version (incrementing sequence if same day)
    - Builds app with `VITE_BUILD_VERSION` env var
    - Deploys to GitHub Pages

**Workflow File**: `.github/workflows/ci.yaml`

```yaml
- name: Generate build version
  run: |
      BUILD_VERSION=$(bash scripts/generate-build-version.sh)
      echo "BUILD_VERSION=$BUILD_VERSION" >> $GITHUB_ENV

- name: Build
  run: npm run build
  env:
      VITE_BUILD_VERSION: ${{ env.BUILD_VERSION }}
```

#### Local Development

By default, local dev builds use `"dev"` as the version.

To generate a real version locally:

```bash
# Generate and display version
npm run build:version

# Build with custom version
VITE_BUILD_VERSION=$(npm run build:version --silent) npm run build

# Or manually set version
VITE_BUILD_VERSION="2026-01-13.1" npm run build
```

## Files

### Core Files

- **`scripts/generate-build-version.sh`**: Version generation script
- **`.last-build-version`**: Cached version (gitignored, auto-generated)
- **`src/vite-env.d.ts`**: TypeScript declarations for env vars
- **`vite.config.ts`**: Vite configuration for env var injection

### Configuration

- **`.gitignore`**: Excludes `.last-build-version` from git
- **`.github/workflows/ci.yaml`**: GitHub Actions workflow with version generation
- **`package.json`**: Includes `build:version` script

## Version Generation Logic

```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
CACHE_FILE=".last-build-version"

if [ -f "$CACHE_FILE" ]; then
  LAST_VERSION=$(cat "$CACHE_FILE")
  LAST_DATE=$(echo "$LAST_VERSION" | cut -d'.' -f1)

  if [ "$LAST_DATE" = "$DATE" ]; then
    LAST_SEQ=$(echo "$LAST_VERSION" | cut -d'.' -f2)
    SEQ=$((LAST_SEQ + 1))  # Increment sequence
  else
    SEQ=1  # New day, reset to 1
  fi
else
  SEQ=1  # First build ever
fi

VERSION="$DATE.$SEQ"
echo "$VERSION" > "$CACHE_FILE"
echo "$VERSION"
```

## Accessing the Version

### In Browser Console

```javascript
// Check current build version
window.BUILD_VERSION; // e.g., "2026-01-13.2"
```

### In Source Code

```typescript
// Access via import.meta.env
const version = import.meta.env.VITE_BUILD_VERSION;
console.log(`Running version: ${version}`);
```

## Examples

### Production Builds (Same Day)

```
First push today:  2026-01-13.1
Second push today: 2026-01-13.2
Third push today:  2026-01-13.3
```

### Production Builds (Different Days)

```
Last push yesterday: 2026-01-12.5
First push today:    2026-01-13.1
```

### Local Development

```bash
npm run dev
# window.BUILD_VERSION === "dev"

VITE_BUILD_VERSION="test-build" npm run build
# window.BUILD_VERSION === "test-build"
```

## Troubleshooting

### Version Shows "dev" on Deployed Site

**Cause**: `VITE_BUILD_VERSION` wasn't set during build

**Fix**: Ensure GitHub Actions workflow includes:

```yaml
env:
    VITE_BUILD_VERSION: ${{ env.BUILD_VERSION }}
```

### Sequence Not Incrementing

**Cause**: `.last-build-version` cache not restored

**Fix**: Check GitHub Actions cache configuration:

```yaml
- name: Restore build version cache
  uses: actions/cache@v3
  with:
      path: .last-build-version
      key: build-version-${{ github.run_number }}
      restore-keys: |
          build-version-
```

### TypeScript Errors

**Cause**: Missing or incorrect type declarations

**Fix**: Ensure `src/vite-env.d.ts` exists and includes:

```typescript
interface ImportMetaEnv {
	readonly VITE_BUILD_VERSION: string;
}
```

## Best Practices

### ✅ Do

- Use `window.BUILD_VERSION` to check deployed version
- Let GitHub Actions handle production versioning automatically
- Use `"dev"` for local development (default)
- Test with custom versions locally if needed

### ❌ Don't

- Commit `.last-build-version` to git
- Hardcode versions in source code
- Manually edit version in main.ts
- Skip version generation in deployment workflow

## Migration from Hardcoded Version

**Old approach** (main.ts):

```typescript
window.BUILD_VERSION = "2026-01-13.1"; // ❌ Hardcoded
```

**New approach** (main.ts):

```typescript
window.BUILD_VERSION = import.meta.env.VITE_BUILD_VERSION; // ✅ Dynamic
```

Version is now:

- ✅ Generated automatically
- ✅ Incremented intelligently
- ✅ Never committed to source
- ✅ Injected at build time
- ✅ Consistent across environments

## Related Files

- Canvas initialization fix: `MOBILE-VIEWPORT-FIX.md`
- Project structure: `README.md`
- Contributing guide: `.clinerules`
