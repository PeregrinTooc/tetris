import { PreviewBoard } from "./preview-board";
import { Board } from "./board";
import { Tetromino } from "../src/tetromino-base";
import { ScoreBoard } from "./score-board";
import { AudioManager } from "./audio";
import { TetrominoSeedQueue } from "./TetrominoSeedQueue";

let tetrominoDropTime: number = 750;
let tetromino: Tetromino | null = null;
let gameRunning: boolean = false;
let isPaused: boolean = false;
let board: Board;
let tickIntervalId: ReturnType<typeof setInterval> | null = null;
const TICK_EVENT_NAME = "tick";
let tetrominoSeedQueue = new TetrominoSeedQueue();
let currentScore: number = 0;
let scoreBoard: ScoreBoard;
const audioManager = new AudioManager();
audioManager.initializeControls(gameRunning, isPaused);
const BASE_DROP_TIME = 750;

function startGame(): void {
	gameRunning = true;
	currentScore = 0;
	audioManager.startMusic();
	audioManager.updateMusic(gameRunning, isPaused); // Start background music if enabled

	// Initialize score and level system
	const previewBoard = new PreviewBoard(document.getElementById("next-board") as HTMLElement);
	scoreBoard = new ScoreBoard(
		document.getElementById("score-board") as HTMLElement,
		document.getElementById("level-board") as HTMLElement
	);
	scoreBoard.setScore(currentScore);

	// Connect score board level changes to drop time updates
	scoreBoard.addEventListener("levelChange", (event: Event) => {
		const customEvent = event as CustomEvent;
		const { newLevel } = customEvent.detail;
		// Update drop time based on new level
		tetrominoDropTime = scoreBoard.getDropTimeForLevel(newLevel, BASE_DROP_TIME);
		audioManager.playSoundEffect("levelUp");
	});

	board = new Board(
		20,
		11,
		document.getElementById("game-board") as HTMLElement,
		previewBoard,
		tetrominoSeedQueue
	);

	// Listen for line completion events to update score
	const gameBoardElement = document.getElementById("game-board");
	if (gameBoardElement) {
		gameBoardElement.addEventListener("linesCompleted", (event: Event) => {
			const customEvent = event as CustomEvent;
			const linesCompleted = customEvent.detail.linesCompleted;
			currentScore += (linesCompleted * (linesCompleted + 1) * 50);

			// Play appropriate sound effect based on number of lines completed
			if (linesCompleted >= 4) {
				audioManager.playSoundEffect("tetrisClear");
			} else {
				audioManager.playSoundEffect("lineComplete");
			}
			scoreBoard.setScore(currentScore);
		});

		// Listen for score events from tetrominos
		gameBoardElement.addEventListener("scoreEvent", (event: Event) => {
			const customEvent = event as CustomEvent;
			const { points } = customEvent.detail;
			currentScore += points;
			scoreBoard.setScore(currentScore);
		});
	}

	const startBtn = document.getElementById("start-button");
	if (startBtn) {
		startBtn.textContent = "Reset Game";
		startBtn.blur();
	}
	spawnNewTetromino();
	startTicking();
}

function togglePause() {
	if (!gameRunning) return;

	isPaused = !isPaused;
	const pauseOverlay = document.getElementById("pause-overlay");
	if (pauseOverlay) {
		pauseOverlay.style.display = isPaused ? "block" : "none";
	}
	audioManager.updateMusic(gameRunning, isPaused); // Pause/resume music based on game state
}

document.addEventListener("keydown", (event) => {
	if (event.key.toLowerCase() === "p" || event.key === "Escape") {
		togglePause();
	}
});

declare global {
	interface Window {
		setTetrominoDropTime: (ms: number) => void;
		pushTetrominoSeed: (seed: number) => void;
		isPaused: boolean;
	}
}

window.setTetrominoDropTime = function (ms: number): void {
	tetrominoDropTime = ms;
};

window.pushTetrominoSeed = function (...items: number[]): void {
	tetrominoSeedQueue.enqueue(...items);
};

Object.defineProperty(window, 'isPaused', {
	get: () => isPaused
});

const gameBoardElement = document.getElementById("game-board");
if (gameBoardElement) {
	gameBoardElement.addEventListener("gameover", () => {
		stopTicking();
		audioManager.playSoundEffect("gameOver");
		audioManager.pauseMusic();
		const gameOverElement = document.createElement("div");
		gameOverElement.id = "game-over";
		gameOverElement.className = "game-over";
		const boardEl = document.getElementById("game-board");
		if (boardEl) boardEl.appendChild(gameOverElement);
	});
}

const startButton = document.getElementById("start-button");
if (startButton) {
	startButton.addEventListener("click", () => {
		if (gameRunning) {
			resetGame();
			// After reset, we want to wait for another click to start
			return;
		}
		startGame();
	});
}

function resetGame(): void {
	// Stop game systems
	stopTicking();
	gameRunning = false;
	isPaused = false;
	tetromino = null;
	currentScore = 0;

	// Reset UI elements
	const gameOverElement = document.getElementById("game-over");
	if (gameOverElement) {
		gameOverElement.remove();
	}

	const pauseOverlay = document.getElementById("pause-overlay");
	if (pauseOverlay) {
		pauseOverlay.style.display = "none";
	}

	// Reset button text
	const startBtn = document.getElementById("start-button");
	if (startBtn) {
		startBtn.textContent = "Start Game";
	}

	// Reset score display
	if (scoreBoard) {
		scoreBoard.setScore(0);
	}

	// Reset game board
	if (board) {
		board.reset();
	}

	// Clear preview
	const previewContainer = document.querySelector("#preview-container");
	if (previewContainer) {
		previewContainer.innerHTML = "";
	}

	audioManager.resetMusic();
}

function startTicking(): void {
	stopTicking();
	tickIntervalId = setInterval(() => {
		if (!isPaused) {
			document.dispatchEvent(new Event(TICK_EVENT_NAME));
		}
	}, tetrominoDropTime);
}

function stopTicking(): void {
	if (tickIntervalId) {
		clearInterval(tickIntervalId);
		tickIntervalId = null;
	}
}

function spawnNewTetromino(): void {
	if (tetromino) {
		tetromino.deactivateKeyboardControl();
	}
	tetromino = board.spawnTetromino();
	if (tetromino) {
		tetromino.addEventListener("locked", () => {
			spawnNewTetromino();
			audioManager.playSoundEffect("locked");
		});
		tetromino.addEventListener("hardDrop", () => {
			audioManager.playSoundEffect("hardDrop");
		});
		tetromino.activateKeyboardControl();
	}
}
