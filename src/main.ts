import { PreviewBoard } from "./preview-board";
import { Board } from "./board";
import { Tetromino } from "../src/tetromino-base";
import { ScoreBoard } from "./score-board";

class TetrominoSeedQueue {
	items: number[];
	availableSeeds: number[];

	constructor() {
		this.items = [];
		this.availableSeeds = [0, 1, 2, 3, 4, 5, 6];
	}

	enqueue(...items: number[]): void {
		this.items.push(...items);
	}
	dequeue(): number {
		if (this.items.length > 0) {
			return this.items.shift() as number;
		}
		const randomIndex = Math.floor(Math.random() * this.availableSeeds.length);
		return this.availableSeeds[randomIndex];
	}
}

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
const BASE_DROP_TIME = 750;

function togglePause() {
	if (!gameRunning) return;

	isPaused = !isPaused;
	const pauseOverlay = document.getElementById("pause-overlay");
	if (pauseOverlay) {
		pauseOverlay.style.display = isPaused ? "block" : "none";
	}
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
		} else {
			startGame();
		}
	});
}

function startGame(): void {
	gameRunning = true;
	currentScore = 0;

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

function resetGame(): void {
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
	const startBtn = document.getElementById("start-button");
	if (startBtn) startBtn.textContent = "Start Game";
	gameRunning = false;
	tetromino = null;
	currentScore = 0;
	if (scoreBoard) {
		scoreBoard.setScore(currentScore);
	}
	stopTicking();
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
		});
		// Activate keyboard control when tetromino starts falling
		tetromino.activateKeyboardControl();
	}
}
