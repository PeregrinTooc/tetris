import { PreviewBoard } from "./preview-board.js";
import { Board } from "./board.js";
import { Queue } from "./queue.js";

let tetrominoDropTime = 750;
let tetromino;
let gameRunning = false;
let board;
let tickIntervalId;
const TICK_EVENT_NAME = "tick";
let tetrominoSeedQueue = new Queue();

// Allow tests or game logic to set the drop time
window.setTetrominoDropTime = function (ms) {
  tetrominoDropTime = ms;
};

window.pushTetrominoSeed = function (seed) {
  tetrominoSeedQueue.enqueue(Number(seed));
};

document.getElementById("game-board").addEventListener("gameover", () => {
  const gameOverElement = document.createElement("div");
  gameOverElement.id = "game-over";
  gameOverElement.className = "game-over";
  document.getElementById("game-board").appendChild(gameOverElement);
});

document.getElementById("start-button").addEventListener("click", () => {
  if (gameRunning) {
    resetGame();
  } else {
    startGame();
  }
});

function startGame() {
  gameRunning = true;
  const previewBoard = new PreviewBoard(document.getElementById("next-board"));
  board = new Board(
    20,
    11,
    document.getElementById("game-board"),
    previewBoard,
    tetrominoSeedQueue
  );
  document.getElementById("start-button").textContent = "Reset Game";
  spawnNewTetromino();
  document.onkeydown = function (e) {
    if (e.key === "ArrowLeft") {
      tetromino.move("left");
    }
    if (e.key === "ArrowRight") {
      tetromino.move("right");
    }
    if (e.key === "ArrowDown") {
      tetromino.drop();
    }
  };
  startTicking();
}

function resetGame() {
  const gameOverElement = document.getElementById("game-over");
  if (gameOverElement) {
    gameOverElement.remove();
  }
  if (board) {
    board.reset();
  }
  const previewContainer = document.querySelector("#preview-container");
  if (previewContainer) {
    previewContainer.innerHTML = "";
  }
  document.getElementById("start-button").textContent = "Start Game";
  document.onkeydown = null;
  gameRunning = false;
  tetromino = null;
  stopTicking();
}

function startTicking() {
  stopTicking();
  tickIntervalId = setInterval(() => {
    document.dispatchEvent(new Event(TICK_EVENT_NAME));
  }, tetrominoDropTime);
}

function stopTicking() {
  if (tickIntervalId) {
    clearInterval(tickIntervalId);
    tickIntervalId = null;
  }
}

function spawnNewTetromino() {
  tetromino = board.spawnTetromino(document);
  tetromino.element.addEventListener("locked", () => {
    spawnNewTetromino();
  });
}
