import { PreviewBoard } from "./preview-board";
import { Board } from "./board";
import { Tetromino } from "../src/tetromino-base";
import { ScoreBoard } from "./score-board";

// Audio management
const bgMusicLevel1 = new Audio("resources/music/fromLevel1.mp3");
const bgMusicLevel8 = new Audio("resources/music/fromLevel8.mp3");
const bgMusicLevel15 = new Audio("resources/music/fromLevel15.mp3");
bgMusicLevel1.loop = true;
bgMusicLevel1.preload = "auto";

const soundEffects = {
	hardDrop: new Audio("resources/effects/hardDrop.mp3"),
	levelUp: new Audio("resources/effects/levelUp.mp3"),
	lineComplete: new Audio("resources/effects/lineCompletion.mp3"),
	tetrisClear: new Audio("resources/effects/tetrisClear.mp3"),
	gameOver: new Audio("resources/effects/gameOver.mp3")
};

// Preload all sound effects
Object.values(soundEffects).forEach(sound => {
	sound.preload = "auto";
});

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

let isMusicEnabled = true;
let isSfxEnabled = true;

function playSound(sound: HTMLAudioElement) {
	if (isSfxEnabled && sound !== bgMusicLevel1) {
		sound.currentTime = 0;
		resumeAudio();
		sound.play().catch(error => {
			console.log('Error playing sound:', error);
		});
	}
}

function updateMusic() {
	if (isMusicEnabled && gameRunning && !isPaused) {
		resumeAudio();
		bgMusicLevel1.play().catch(error => {
			console.log('Error playing music:', error);
		});
	} else {
		bgMusicLevel1.pause();
	}
}

function togglePause() {
	if (!gameRunning) return;

	isPaused = !isPaused;
	const pauseOverlay = document.getElementById("pause-overlay");
	if (pauseOverlay) {
		pauseOverlay.style.display = isPaused ? "block" : "none";
	}
	updateMusic(); // Pause/resume music based on game state
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
		playSound(soundEffects.gameOver);
		bgMusicLevel1.pause();
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

// Setup audio controls
const musicToggle = document.getElementById("music-toggle") as HTMLInputElement;
const sfxToggle = document.getElementById("sfx-toggle") as HTMLInputElement;

if (musicToggle && sfxToggle) {
	musicToggle.addEventListener("change", () => {
		isMusicEnabled = musicToggle.checked;
		updateMusic();
	});

	sfxToggle.addEventListener("change", () => {
		isSfxEnabled = sfxToggle.checked;
	});
}

// Audio context setup for handling browser autoplay restrictions
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
const audioContext = new AudioContext();

// Function to resume audio context after user interaction
function resumeAudio() {
	if (audioContext.state === "suspended") {
		audioContext.resume();
	}
}

function startGame(): void {
	gameRunning = true;
	currentScore = 0;
	resumeAudio();
	updateMusic(); // Start background music if enabled

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
		playSound(soundEffects.levelUp);
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
				playSound(soundEffects.tetrisClear);
			} else {
				playSound(soundEffects.lineComplete);
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

	// Reset music
	bgMusicLevel1.currentTime = 0;
	bgMusicLevel1.pause();
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

		tetromino.addEventListener("hardDrop", () => {
			playSound(soundEffects.hardDrop);
		});
		// Activate keyboard control when tetromino starts falling
		tetromino.activateKeyboardControl();
	}
}
