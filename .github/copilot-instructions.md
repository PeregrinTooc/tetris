This repository contains a Tetris Game. It uses ATDD and TDD to develop the game. The code is written in JavaScript and uses cypress for acceptance testing and jest for unit testing.

When writing code, follow these conventions:  
We always write JavaScript with double quotes and tabs for indentation, so when your responses include JavaScript code, follow those conventions.

Functions shall exceed 10 lines only if absolutely necessary. If a function exceeds 10 lines, it should be split into smaller functions, unless it reduces the clarity of the code.
Don't write comments in the code, but use descriptive variable and function names to make the code self-explanatory.

When writing functions, ensure they are reusable and modular. Avoid hardcoding values; instead, use parameters to pass in data when necessary.

Never write production code without first writing a test for it. Always write tests before implementing the functionality.
When writing tests, ensure they are clear and descriptive. Use meaningful names for test cases to indicate what they are testing.
When writing the production code to pass the tests, ensure that the code is clean, efficient, and follows best practices.
When writing tests, ensure they are isolated and do not depend on external state. Use mocks or stubs where necessary to isolate the functionality being tested.
Never delete tests or assertions without eplicit consent from the developer. If a test is failing, fix the code to make it pass instead of deleting the test.

When writing acceptance tests, ensure they cover the user stories and requirements of the game. Use Cypress for acceptance testing and Jest for unit testing.
When writing unit tests, ensure they cover the functionality of individual components and functions. Use Jest for unit testing.
Use unit tests as the primary means of verifying the functionality of the code. Acceptance tests should be used to verify the overall functionality of the game and the UI functionality.
In unit tests, do not mock out dependencies to other code written in this repository. Instead, use the actual implementations of those dependencies to ensure that the tests are testing the real functionality of the code.

When writing code, ensure it is well-structured and follows best practices. Use ES6+ features where appropriate, such as arrow functions, destructuring, and template literals.

When a new edge case is discovered, add it to the file `TODO-TETRIS.md` in the root of the repository. This file is used to track missing features and test cases for the Tetris game.

When implementing new features or fixing bugs, ensure that you update the `TODO-TETRIS.md` file accordingly. This helps keep track of what has been implemented and what still needs to be done.
