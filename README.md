# Tetris Game

A browser-based Tetris implementation using JavaScript, developed with Test-Driven Development.

## Features

- Classic Tetris gameplay with smooth animations
- Preview of next piece
- Hold piece functionality
- Score tracking and level progression
- Game over detection
- Keyboard controls with customizable key bindings
- **Mobile-friendly responsive design with touch controls**
- Audio support (music and sound effects)
- Line clear animations

## Project Structure

```
tetris-game/
├── src/                  # Source files
│   ├── main.js          # Game initialization
│   ├── board.js         # Game board logic
│   ├── tetromino.js     # Tetromino behavior
│   └── preview-board.js # Next piece preview
├── cypress/             # Acceptance tests
├── tests/              # Unit tests
├── styles.css         # Game styling
└── index.html         # Main HTML
```

## Development

1. **Setup:**

    ```bash
    git clone <repository-url>
    cd tetris-game
    npm install
    ```

2. **Run locally:**

    ```bash
    npm run dev
    ```

    Access at `http://localhost:5173`

3. **Run tests:**

    ```bash
    # Run all tests with parallel e2e (fastest complete suite ~17s)
    npm run test:parallel

    # Run all tests sequentially (standard ~27s)
    npm test

    # Run only unit tests (super fast ~0.9s)
    npm run test:unit

    # Run in watch mode for development
    npm run test:watch

    # Run only end-to-end tests (optimized ~13s)
    npm run test:e2e

    # Run e2e tests with maximum optimizations
    npm run test:e2e:fast

    # Run e2e tests in parallel groups (local ~14s)
    npm run test:e2e:groups

    # Run e2e tests with CI parallel execution
    npm run test:e2e:ci
    ```

## Deployment

The game automatically deploys to GitHub Pages when pushing to main:

1. All tests must pass
2. Changes are merged to main
3. GitHub Actions builds and deploys
4. Access at `[https://peregrintooc.github.io/tetris-game/](https://peregrintooc.github.io/tetris/)`

## Controls

### Desktop (Keyboard)

- **←/→**: Move piece left/right
- **↓**: Soft drop (move down one row)
- **↑**: Rotate piece clockwise
- **Space**: Hard drop (instant drop to bottom)
- **H**: Hold current piece
- **P/Esc**: Pause game
- **Customize**: Click "Customize" button to rebind keys

### Mobile (Touch)

- On-screen touch controls automatically appear on mobile devices
- Touch buttons for move, rotate, drop, hold, and pause
- Responsive layout optimized for phones and tablets
- See [docs/MOBILE.md](docs/MOBILE.md) for detailed mobile documentation

## License

MIT License
