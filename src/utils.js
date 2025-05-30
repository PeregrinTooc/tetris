function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function createMatrix(width, height) {
    const matrix = [];
    while (height--) {
        matrix.push(new Array(width).fill(0));
    }
    return matrix;
}

function drawMatrix(matrix, context, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = value;
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function collide(area, player) {
    for (let y = 0; y < player.matrix.length; ++y) {
        for (let x = 0; x < player.matrix[y].length; ++x) {
            if (player.matrix[y][x] !== 0 && 
                (area[y + player.position.y] && 
                area[y + player.position.y][x + player.position.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

export { randomInt, createMatrix, drawMatrix, collide };