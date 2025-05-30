const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentPiece;
let gameOver = false;

const pieces = [
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1], [1, 1]], // O
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1, 0], [0, 1, 1]], // Z
    [[1, 0, 0], [1, 1, 1]], // L
    [[0, 0, 1], [1, 1, 1]], // J
];

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = 'blue';
                context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function generatePiece() {
    const randomIndex = Math.floor(Math.random() * pieces.length);
    currentPiece = pieces[randomIndex];
}

function drawPiece() {
    currentPiece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = 'red';
                context.fillRect((x + 4) * BLOCK_SIZE, (y + 0) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeRect((x + 4) * BLOCK_SIZE, (y + 0) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function collision() {
    // Check for collision with the board or other pieces
    for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
            if (currentPiece[y][x] && (board[y][x + 4] || y + 0 >= ROWS)) {
                return true;
            }
        }
    }
    return false;
}

function mergePiece() {
    currentPiece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[y + 0][x + 4] = value;
            }
        });
    });
}

function clearLines() {
    board = board.reduce((acc, row) => {
        if (row.every(value => value)) {
            acc.unshift(Array(COLS).fill(0)); // Add a new empty row at the top
        } else {
            acc.push(row);
        }
        return acc;
    }, []);
}

function update() {
    if (!gameOver) {
        drawBoard();
        drawPiece();
        if (collision()) {
            mergePiece();
            clearLines();
            generatePiece();
            if (collision()) {
                gameOver = true;
                alert('Game Over!');
            }
        }
    }
}

generatePiece();
setInterval(update, 1000);