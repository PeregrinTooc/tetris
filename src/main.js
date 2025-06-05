let tetrominoDropTime = 1000; // Default drop time in ms

// Allow tests or game logic to set the drop time
window.setTetrominoDropTime = function (ms) {
    tetrominoDropTime = ms;
};

document.getElementById('start-button').addEventListener('click', () => {
    const tetromino = document.createElement('div');
    tetromino.className = 'tetromino';
    tetromino.style.width = '24px';
    tetromino.style.height = '24px';
    tetromino.style.position = 'absolute';
    tetromino.style.left = '96px';
    tetromino.style.top = '0px';
    document.getElementById('game-board').appendChild(tetromino);

    // Animate the tetromino falling by incrementing the top property repeatedly
    let top = 0;
    function fall() {
        top += 24;
        tetromino.style.top = `${top}px`;
        // Continue falling as long as inside the board
        if (top + 24 < 400) {
            setTimeout(fall, tetrominoDropTime);
        }
    }
    setTimeout(fall, tetrominoDropTime);
});