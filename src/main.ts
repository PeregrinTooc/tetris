import { PreviewBoard } from "./preview-board";
import { Board } from "./board";
import { Tetromino } from "../src/tetromino-base";
import { ScoreBoard } from "./score-board";

class TetrominoSeedQueue {
	items: number[];
	availableSeeds: number[];

	constructor() {
		this.items = [];
		this.availableSeeds = [0, 1, 2, 3, 4];
	}
	enqueue(item: number): void {
		this.items.push(item);
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
let board: Board;
let tickIntervalId: ReturnType<typeof setInterval> | null = null;
const TICK_EVENT_NAME = "tick";
let tetrominoSeedQueue = new TetrominoSeedQueue();
let currentScore: number = 0;
let scoreBoard: ScoreBoard;

declare global {
	interface Window {
		setTetrominoDropTime: (ms: number) => void;
		pushTetrominoSeed: (seed: number) => void;
	}
}

window.setTetrominoDropTime = function (ms: number): void {
	tetrominoDropTime = ms;
};

window.pushTetrominoSeed = function (seed: number): void {
	tetrominoSeedQueue.enqueue(Number(seed));
};

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
	const previewBoard = new PreviewBoard(document.getElementById("next-board") as HTMLElement);
	scoreBoard = new ScoreBoard(document.getElementById("score-board") as HTMLElement);
	scoreBoard.setScore(currentScore);
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
	}

	const startBtn = document.getElementById("start-button");
	if (startBtn) {
		startBtn.textContent = "Reset Game";
		startBtn.blur();
	}
	spawnNewTetromino();
	document.onkeydown = function (e: KeyboardEvent): void {
		if (!gameRunning || !tetromino) return;
		if (e.key === "ArrowLeft") {
			tetromino.move("left");
		}
		if (e.key === "ArrowRight") {
			tetromino.move("right");
		}
		if (e.key === "ArrowDown") {
			tetromino.move("down");
		}
		if (e.key === " " || e.key === "Space" || e.key === "Spacebar") {
			if (e.preventDefault) e.preventDefault();
			tetromino.drop();
		}
		if (e.key === "ArrowUp") {
			if (tetromino.rotate) {
				tetromino.rotate();
			}
		}
	};
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
	document.onkeydown = null;
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
		document.dispatchEvent(new Event(TICK_EVENT_NAME));
	}, tetrominoDropTime);
}

function stopTicking(): void {
	if (tickIntervalId) {
		clearInterval(tickIntervalId);
		tickIntervalId = null;
	}
}

function spawnNewTetromino(): void {
	tetromino = board.spawnTetromino();
	tetromino.addEventListener("locked", () => {
		spawnNewTetromino();
	});
}
