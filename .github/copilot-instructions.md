This repository contains a Tetris Game. It uses ATDD and TDD to develop the game. The code is written in JavaScript and uses Cypress for acceptance testing and Jest for unit testing.

**Coding Conventions:**

- Always use double quotes and tabs for indentation in JavaScript code.
- Functions should not exceed 10 lines unless absolutely necessary. If a function is longer, split it into smaller functions unless it reduces clarity.
- Do not write comments in the code. Use descriptive variable and function names to make the code self-explanatory.
- Write reusable and modular functions. Avoid hardcoding values; use parameters instead.
- Use `const` for variables that do not change and `let` for variables that may change. Avoid using `var`.
- Use object oriented programming (OOP) principles where appropriate. Prefer classes, objects and methods over procedural code.

**Test-Driven Development (TDD) Rules:**

- Never write production code without first writing a test for it.
- Always write the test before implementing the functionality.
- After writing the test, run it and make sure it fails.
- Only then, implement the production code to make the test pass.
- If you ever write production code before a test, immediately revert the code, add the test, and then re-implement the code to pass the test.
- Tests must be clear, descriptive, and use meaningful names for test cases.
- Tests must be isolated and not depend on external state. Use mocks or stubs only for external dependencies, not for code within this repository.
- Never delete tests or assertions without explicit consent from the developer. If a test fails, fix the code to make it pass instead of deleting the test.
- When fixing bugs, always write a test that reproduces the bug first and make sure that the test fails. Only then, implement the fix to make the test pass. Never fix a bug without a failing test that reproduces it.

**Testing Practices:**

- Use Cypress for acceptance (E2E) tests and Jest for unit tests.
- Acceptance tests should cover user stories and requirements of the game.
- Unit tests should cover the functionality of individual components and functions.
- Use unit tests as the primary means of verifying code functionality. Use acceptance tests to verify overall game and UI functionality.
- In unit tests, always use the actual implementations of dependencies from this repository (do not mock them).

**Code Quality:**

- Ensure code is well-structured and follows best practices.
- Use ES6+ features where appropriate (arrow functions, destructuring, template literals, etc.).

**Project Management:**

- When a new edge case is discovered, add it to `TODO-TETRIS.md` in the root of the repository.
- When implementing new features or fixing bugs, update `TODO-TETRIS.md` accordingly to track progress.
- the "npm test" command runs both Cypress and Jest tests. Husky will run this command before pushing code to ensure all tests pass.
- Frequently commit your changes with clear, descriptive commit messages, tag them as 'WIP' if they are not yet complete. This helps reverting to stable previous states if needed.
