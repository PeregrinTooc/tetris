import { PreviewBoard } from "./preview-board";
import { Board } from "./board";
import { ScoreBoard } from "./score-board";
import { AudioManager } from "./audio";
import { TetrominoSeedQueue } from "./TetrominoSeedQueue";
import { KeyBindingManager } from "./key-binding-manager";

const BASE_DROP_TIME = 750;
const TICK_EVENT_NAME = "tick";

let keyBindingManager: KeyBindingManager;
let activeRebindButton: HTMLButtonElement | null = null;

declare global {
	interface Window {
		setTetrominoDropTime: (ms: number) => void;
		pushTetrominoSeed: (seed: number) => void;
	}
}

main();

function main() {
	keyBindingManager = new KeyBindingManager();

	const audioManager = new AudioManager();
	const state = {
		tetrominoDropTime: 750,
		gameRunning: false,
		isPaused: false,
		board: undefined as Board | undefined,
		tickIntervalId: null as ReturnType<typeof setInterval> | null,
		tetrominoSeedQueue: new TetrominoSeedQueue(),
		currentScore: 0,
		scoreBoard: new ScoreBoard(
			document.getElementById("score-board") as HTMLElement,
			document.getElementById("level-board") as HTMLElement,
			setTetrominoDropTime, BASE_DROP_TIME
		)
	};
	audioManager.initializeControls(state.gameRunning, state.isPaused);
	registerGlobalTetrominoFunctions();
	initializePauseToggle();
	initializeGameOverHandler();
	initializeStartButton();
	initializeKeyBindingUI();

	function initializeKeyBindingUI() {
		const settingsButton = document.querySelector("[data-settings-button]");
		const settingsModal = document.querySelector("[data-key-rebind-menu]");
		const closeButton = document.querySelector("[data-settings-close]");
		const rebindPrompt = document.querySelector("[data-rebind-prompt]") as HTMLElement;

		if (!settingsButton || !settingsModal || !closeButton || !rebindPrompt) return;

		// Show settings modal
		settingsButton.addEventListener("click", () => {
			settingsModal.setAttribute("style", "display: flex");
			updateKeyBindDisplay();
		});

		// Close settings modal
		closeButton.addEventListener("click", () => {
			settingsModal.setAttribute("style", "display: none");
			rebindPrompt.style.display = "none";
			activeRebindButton = null;
		});

		// Handle rebind button clicks
		const rebindButtons = document.querySelectorAll("[data-action]");
		rebindButtons.forEach(button => {
			button.addEventListener("click", (e) => {
				const target = e.currentTarget as HTMLButtonElement;
				if (!target) return;

				activeRebindButton = target;
				const action = target.dataset.action;
				if (!action) return;

				rebindPrompt.textContent = `Press a key to bind ${action.replace(/([A-Z])/g, " $1").toLowerCase()}`;
				rebindPrompt.style.display = "block";

				// Focus the document to ensure we catch the next keypress
				document.body.focus();
			});
		});

		// Handle key presses for rebinding
		document.addEventListener("keydown", handleRebindKeyPress);

		// Initial display update
		updateKeyBindDisplay();
	}

	function handleRebindKeyPress(event: KeyboardEvent) {
		if (!activeRebindButton) return;

		const action = activeRebindButton.dataset.action;
		if (!action) return;

		// Prevent system keys from being bound
		if (event.key === "Tab" || event.key === "Escape") return;

		event.preventDefault();

		// Update the binding
		keyBindingManager.rebindKey(action as any, event.key);

		// Update the display
		updateKeyBindDisplay();

		// Hide the prompt
		const rebindPrompt = document.querySelector("[data-rebind-prompt]") as HTMLElement;
		if (rebindPrompt) {
			rebindPrompt.style.display = "none";
		}

		activeRebindButton = null;
	}

	function updateKeyBindDisplay() {
		const bindings = keyBindingManager.getCurrentBindings();
		bindings.forEach(binding => {
			const displayElement = document.querySelector(`[data-current-${binding.action}-bind]`);
			if (displayElement) {
				displayElement.textContent = binding.key;
			}
		});
	}

	function initializeStartButton() {
		const startButton = document.getElementById("start-button");
		if (startButton) {
			startButton.addEventListener("click", () => {
				if (state.gameRunning) {
					resetGame();
					// After reset, we want to wait for another click to start
					return;
				}
				startGame();
			});
		}
	}

	function registerGlobalTetrominoFunctions() {
		window.setTetrominoDropTime = function (ms: number): void {
			state.tetrominoDropTime = ms;
		};

		window.pushTetrominoSeed = function (...items: number[]): void {
			state.tetrominoSeedQueue.enqueue(...items);
		};
	}

	function initializePauseToggle() {
		document.addEventListener("keydown", (event) => {
			if (event.key.toLowerCase() === "p" || event.key === "Escape") {
				togglePause();
			}
		});
	}

	function initializeGameOverHandler() {
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
	}

	function setTetrominoDropTime(ms: number): void {
		state.tetrominoDropTime = ms;
	}

	function startGame(): void {
		state.gameRunning = true;
		state.currentScore = 0;
		audioManager.startMusic();
		audioManager.updateMusic(state.gameRunning, state.isPaused); // Start background music if enabled

		configureGameElements();
		switchStartButtonToReset();
		spawnNewTetromino();
		startTicking();

		function switchStartButtonToReset() {
			const startBtn = document.getElementById("start-button");
			if (startBtn) {
				startBtn.textContent = "Reset Game";
				startBtn.blur();
			}
		}

		function configureGameElements() {
			const previewBoard = createPreviewBoard();
			initializeGameBoard();
			initializeScoreBoard();

			function initializeScoreBoard() {
				state.scoreBoard.setScore(state.currentScore);
				state.scoreBoard.addEventListener("levelChange", (event: Event) => {
					const customEvent = event as CustomEvent;
					const { newLevel } = customEvent.detail;
					audioManager.playSoundEffect("levelUp");
				});
			}

			function initializeGameBoard() {
				state.board = new Board(
					20,
					11,
					document.getElementById("game-board") as HTMLElement,
					previewBoard,
					state.tetrominoSeedQueue
				);
				state.board.registerEventListener("linesCompleted", handleCompleteLinesEvent)
				state.board.registerEventListener("scoreEvent", handleScoreEvent);

				function handleCompleteLinesEvent(event: Event) {
					const customEvent = event as CustomEvent;
					const linesCompleted = customEvent.detail.linesCompleted;
					state.currentScore += (linesCompleted * (linesCompleted + 1) * 50);

					if (linesCompleted >= 4) {
						audioManager.playSoundEffect("tetrisClear");
					} else {
						audioManager.playSoundEffect("lineComplete");
					}
					state.scoreBoard.setScore(state.currentScore);
				};

				function handleScoreEvent(event: Event) {
					const customEvent = event as CustomEvent;
					const { points } = customEvent.detail;
					state.currentScore += points;
					state.scoreBoard.setScore(state.currentScore);
				}
			}
		}

		function createPreviewBoard() {
			const previewBoard = new PreviewBoard(document.getElementById("next-board") as HTMLElement);
			state.scoreBoard = new ScoreBoard(
				document.getElementById("score-board") as HTMLElement,
				document.getElementById("level-board") as HTMLElement,
				setTetrominoDropTime, BASE_DROP_TIME
			);
			return previewBoard;
		}
	}


	function togglePause() {
		if (!state.gameRunning) return;

		state.isPaused = !state.isPaused;
		if (state.board) {
			state.board.pauseGame();
		}

		const pauseOverlay = document.getElementById("pause-overlay");
		if (pauseOverlay) {
			pauseOverlay.style.display = state.isPaused ? "block" : "none";
		}
		audioManager.updateMusic(state.gameRunning, state.isPaused); // Pause/resume music based on game state
	}

	function resetGame(): void {
		// Stop game systems
		stopTicking();
		state.gameRunning = false;
		state.isPaused = false;
		state.currentScore = 0;

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
		if (state.scoreBoard) {
			state.scoreBoard.setScore(0);
		}

		// Reset game board
		if (state.board) {
			state.board.reset();
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
		state.tickIntervalId = setInterval(() => {
			if (!state.isPaused) {
				document.dispatchEvent(new Event(TICK_EVENT_NAME));
			}
		}, state.tetrominoDropTime);
	}

	function stopTicking(): void {
		if (state.tickIntervalId) {
			clearInterval(state.tickIntervalId);
			state.tickIntervalId = null;
		}
	}

	function spawnNewTetromino(): void {
		if (!state.board) return;
		const tetromino = state.board.spawnTetromino();
		if (tetromino) {
			tetromino.addEventListener("locked", () => {
				spawnNewTetromino();
				audioManager.playSoundEffect("locked");
			});
			tetromino.addEventListener("hardDrop", () => {
				audioManager.playSoundEffect("hardDrop");
			});
			tetromino.activateKeyboardControl(keyBindingManager);
		}
	}

}