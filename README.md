# Tetris Game

This is a simple Tetris-like game implemented in JavaScript that runs in the browser. The game can be hosted on a static webpage, such as GitHub Pages, and is designed to be easily run on localhost for development purposes.

## Project Structure

```
tetris-game
├── public
│   └── index.html        # Main HTML document
├── src
│   ├── main.js          # Main JavaScript file
│   ├── game.js          # Game logic
│   ├── utils.js         # Utility functions
│   └── styles.css       # Styles for the game
├── package.json          # NPM configuration file
└── README.md             # Project documentation
```

## Getting Started

To run the game locally, follow these steps:

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd tetris-game
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the game:**
   ```
   npm start
   ```

   This will start a local server, and you can access the game in your browser at `http://localhost:3000`.

## Deploying to GitHub Pages

To deploy the game to GitHub Pages, follow these steps:

1. **Build the project:**
   ```
   npm run build
   ```

2. **Push the `public` folder to the `gh-pages` branch:**
   ```
   git add public
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

3. **Access your game:**
   Your game will be available at `https://<username>.github.io/<repository-name>/`.

## License

This project is licensed under the MIT License.