#!/bin/bash

# Parallel Cypress execution script
# Groups tests by estimated execution time for optimal load balancing

# Fast tests (< 2 seconds each)
FAST_TESTS=(
  "cypress/e2e/preview-board.spec.cy.ts"
  "cypress/e2e/preview-next-piece.spec.cy.ts" 
  "cypress/e2e/movement.spec.cy.ts"
)

# Medium tests (2-5 seconds each)  
MEDIUM_TESTS=(
  "cypress/e2e/tetromino-shapes.spec.cy.ts"
  "cypress/e2e/tetromino-t.spec.cy.ts"
  "cypress/e2e/line-completion.spec.cy.ts"
)

# Slow tests (> 5 seconds each)
SLOW_TESTS=(
  "cypress/e2e/game-setup.spec.cy.ts"
  "cypress/e2e/line-completion-after-drop.spec.cy.ts"
  "cypress/e2e/line-completion-o-l.spec.cy.ts"
  "cypress/e2e/scoring-system.spec.cy.ts"
)

# Run tests in parallel groups
echo "Running Cypress tests in optimized parallel groups..."

# Start fast tests
cypress run --spec "cypress/e2e/preview-board.spec.cy.ts,cypress/e2e/preview-next-piece.spec.cy.ts,cypress/e2e/movement.spec.cy.ts" --quiet &
FAST_PID=$!

# Start medium tests  
cypress run --spec "cypress/e2e/tetromino-shapes.spec.cy.ts,cypress/e2e/tetromino-t.spec.cy.ts,cypress/e2e/line-completion.spec.cy.ts" --quiet &
MEDIUM_PID=$!

# Start slow tests
cypress run --spec "cypress/e2e/game-setup.spec.cy.ts,cypress/e2e/line-completion-after-drop.spec.cy.ts,cypress/e2e/line-completion-o-l.spec.cy.ts,cypress/e2e/scoring-system.spec.cy.ts" --quiet &
SLOW_PID=$!

# Wait for all groups to complete
wait $FAST_PID
FAST_EXIT=$?

wait $MEDIUM_PID  
MEDIUM_EXIT=$?

wait $SLOW_PID
SLOW_EXIT=$?

# Report results
if [ $FAST_EXIT -eq 0 ] && [ $MEDIUM_EXIT -eq 0 ] && [ $SLOW_EXIT -eq 0 ]; then
  echo "All test groups passed!"
  exit 0
else
  echo "Some test groups failed. Fast: $FAST_EXIT, Medium: $MEDIUM_EXIT, Slow: $SLOW_EXIT"
  exit 1
fi
