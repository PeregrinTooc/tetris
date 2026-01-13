#!/bin/bash
# Generate build version in format YYYY-MM-DD.seq
# Sequence increments for multiple builds on the same day

set -e

DATE=$(date +%Y-%m-%d)
CACHE_FILE=".last-build-version"

# Read last version if exists
if [ -f "$CACHE_FILE" ]; then
	LAST_VERSION=$(cat "$CACHE_FILE")
	LAST_DATE=$(echo "$LAST_VERSION" | cut -d'.' -f1)

	if [ "$LAST_DATE" = "$DATE" ]; then
		LAST_SEQ=$(echo "$LAST_VERSION" | cut -d'.' -f2)
		SEQ=$((LAST_SEQ + 1))
	else
		SEQ=1
	fi
else
	SEQ=1
fi

VERSION="$DATE.$SEQ"

# Save version for next run
echo "$VERSION" > "$CACHE_FILE"

# Output version (can be captured by caller)
echo "$VERSION"
