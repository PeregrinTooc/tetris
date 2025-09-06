#!/bin/bash


# Add timestamp and current commit id to log file
echo "=== E2E Test Run - $(date) ===" > cypress/post-commit.log
echo "Commit: $(git rev-parse HEAD)" >> cypress/post-commit.log
echo "" >> cypress/post-commit.log

# Run cypress and explicitly capture exit code
npx cypress run --record --key fddc7d69-cb6d-40c0-ae33-d332d294cc19 >> cypress/post-commit.log 2>&1
CYPRESS_EXIT=$?

echo "" >> cypress/post-commit.log
echo "Cypress exit code: $CYPRESS_EXIT" >> cypress/post-commit.log

if [ $CYPRESS_EXIT -ne 0 ]; then
    echo "E2E tests failed. Opening log in VS Code..." >> cypress/post-commit.log
    # Open VS Code - this should work better from a standalone script
    code cypress/post-commit.log
else
    echo "E2E tests passed successfully." >> cypress/post-commit.log
fi
