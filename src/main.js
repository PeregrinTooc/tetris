const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

canvas.width = 240;
canvas.height = 400;

let dropInterval = 1000;
let lastTime = 0;
let playerReset = true;

const colors = [
    null,
    'red',
    'blue',
    'green',
    'purple',
    'orange',
    'yellow',
    'cyan'
];

let board = Array.from({ length: 20 }, () => Array(10).fill(0));
let player = {
    position: { x: 0, y: 0 },
    matrix: null,
};

const nextCanvas = document.getElementById('next-piece');
const nextContext = nextCanvas.getContext('2d');

let nextMatrix = null;

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawMatrix(player.matrix, player.position);
}

function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = colors[value];
                context.fillRect(x * 24, y * 24, 24, 24);
            }
        });
    });
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = colors[value];
                context.fillRect((offset.x + x) * 24, (offset.y + y) * 24, 24, 24);
            }
        });
    });
}

function drawNextPiece() {
    nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (!nextMatrix) return;
    nextMatrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                nextContext.fillStyle = colors[value];
                nextContext.fillRect(x * 24, y * 24, 24, 24);
            }
        });
    });
}

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    if (deltaTime > dropInterval) {
        player.position.y++;
        if (collision()) {
            player.position.y--;
            merge();
            resetPlayer();
            if (collision()) {
                alert('Game Over');
                resetGame();
            }
        }
    }

    draw();
    requestAnimationFrame(update);
}

function collision() {
    // Collision detection logic
}

function merge() {
    // Merge player piece into the board
}

function createPiece() {
    // Example: T-shaped piece
    return [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ];
}

function resetPlayer() {
    player.matrix = nextMatrix || createPiece();
    player.position.y = 0;
    player.position.x = (board[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    nextMatrix = createPiece();
    drawNextPiece();
}

function resetGame() {
    // Reset the game state
}

document.addEventListener('keydown', (event) => {
    // Handle user input
});

resetPlayer();
update();