import { PreviewBoardImpl } from "./preview-board";
import { Board } from "./board";
import { ScoreBoard } from "./score-board";
import { HoldBoard } from "./hold-board";
import { AudioManager } from "./audio";
import { TetrominoSeedQueueImpl } from "./TetrominoSeedQueue";
import { KeyBindingManager } from "./key-binding-manager";
import { TouchControlsManager } from "./touch-controls";
import { SizingConfig } from "./sizing-config";

const BASE_DROP_TIME = 750;
const TICK_EVENT_NAME = "tick";

let keyBindingManager: KeyBindingManager;
let activeRebindButton: HTMLButtonElement | null = null;

declare global {
	interface Window {
		setTetrominoDropTime: (ms: number) => void;
		pushTetrominoSeed: (seed: number) => void;
		logBoard?: () => void;
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
		board: null as Board,
		tickIntervalId: null as ReturnType<typeof setInterval> | null,
		tetrominoSeedQueue: new TetrominoSeedQueueImpl(),
		currentScore: 0,
		scoreBoard: null as ScoreBoard,
	};
	audioManager.initializeControls();
	audioManager.playMainMenuMusic();
	initializeTouchControls();
	registerGlobalTetrominoFunctions();
	initializePauseToggle();
	initializeGameOverHandler();
	initializeStartButton();
	initializeKeyBindingUI();

	function initializeTouchControls() {
		const touchControlsContainer = document.getElementById("touch-controls");
		if (!touchControlsContainer) return;

		const touchControls = new TouchControlsManager(touchControlsContainer);

		if (TouchControlsManager.isTouchDevice()) {
			touchControls.show();
		} else {
			touchControls.hide();
		}
	}

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
		rebindButtons.forEach((button) => {
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
		bindings.forEach((binding) => {
			const displayElement = document.querySelector(`[data-current-${binding.action}-bind]`);
			if (displayElement) {
				displayElement.textContent = binding.key;
			}
		});
	}

	function initializeStartButton() {
		const startButtonDesktop = document.getElementById("start-button-desktop");
		const startButtonMobile = document.getElementById("start-button");

		const handleDesktopStartClick = () => {
			if (state.gameRunning) {
				resetGame();
				return;
			}
			startGame();
		};

		const handleMobileStartClick = () => {
			if (!state.gameRunning) {
				startGame();
				return;
			}
			togglePause();
		};

		if (startButtonDesktop) {
			startButtonDesktop.addEventListener("click", handleDesktopStartClick);
		}
		if (startButtonMobile) {
			startButtonMobile.addEventListener("click", handleMobileStartClick);
		}

		const resetButtonOverlay = document.getElementById("reset-button-overlay");
		if (resetButtonOverlay) {
			resetButtonOverlay.addEventListener("click", () => {
				resetGame();
			});
		}
	}

	function registerGlobalTetrominoFunctions() {
		window.setTetrominoDropTime = function (ms: number): void {
			_setTetrominoDropTime(ms);
		};

		window.pushTetrominoSeed = function (...items: number[]): void {
			state.tetrominoSeedQueue.enqueue(...items);
		};

		window.logBoard = function (): void {
			if (state.board && typeof (state.board as any).log === "function") {
				(state.board as any).log();
			} else {
				console.log("No board available to log.");
			}
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
				audioManager.stopMusic(); // Stop all music on game over
				const gameOverElement = document.createElement("div");
				gameOverElement.id = "game-over";
				gameOverElement.className = "game-over";
				const boardEl = document.getElementById("game-board");
				if (boardEl) boardEl.appendChild(gameOverElement);
			});
		}
	}

	function _setTetrominoDropTime(ms: number): void {
		state.tetrominoDropTime = ms;
		startTicking();
	}

	function startGame(): void {
		state.gameRunning = true;
		state.currentScore = 0;
		// Start game music for level 1
		audioManager.playGameMusic(1);

		configureGameElements();
		switchStartButtonToReset();
		spawnNewTetromino();
		startTicking();

		function switchStartButtonToReset() {
			const startBtnMobile = document.getElementById("start-button");
			const startBtnDesktop = document.getElementById("start-button-desktop");
			if (startBtnMobile) {
				const label = startBtnMobile.querySelector(".touch-label");
				if (label) {
					label.textContent = "Pause";
				}
				startBtnMobile.blur();
			}
			if (startBtnDesktop) {
				startBtnDesktop.textContent = "Reset Game";
				startBtnDesktop.blur();
			}
		}

		function configureGameElements() {
			const previewBoard = createPreviewBoard();
			initializeGameBoard();
			initializeScoreBoard();

			function initializeScoreBoard() {
				state.scoreBoard = new ScoreBoard(
					document.getElementById("score-board") as HTMLElement,
					document.getElementById("level-board") as HTMLElement,
					_setTetrominoDropTime,
					BASE_DROP_TIME
				);
				state.scoreBoard.setScore(state.currentScore);
				state.scoreBoard.addEventListener("levelChange", (event: Event) => {
					const customEvent = event as CustomEvent;
					const { newLevel } = customEvent.detail;
					audioManager.playSoundEffect("levelUp");
					audioManager.handleLevelChange(newLevel); // Switch music if needed
				});
			}

			function initializeGameBoard() {
				const holdContainer = document.querySelector(
					"#hold-board .hold-container"
				) as HTMLElement;
				const holdBoard = new HoldBoard(holdContainer);

				state.board = new Board(
					20,
					11,
					document.getElementById("game-board") as HTMLElement,
					previewBoard,
					state.tetrominoSeedQueue,
					holdBoard,
					keyBindingManager,
					audioManager,
					SizingConfig.BLOCK_SIZE
				);

				state.board.registerEventListener("linesCompleted", handleCompleteLinesEvent);
				state.board.registerEventListener("scoreEvent", handleScoreEvent);

				function handleCompleteLinesEvent(event: Event) {
					const customEvent = event as CustomEvent;
					const linesCompleted = customEvent.detail.linesCompleted;
					state.currentScore += linesCompleted * (linesCompleted + 1) * 50;

					if (linesCompleted >= 4) {
						audioManager.playSoundEffect("tetrisClear");
					} else {
						audioManager.playSoundEffect("lineComplete");
					}
					state.scoreBoard.setScore(state.currentScore);
				}

				function handleScoreEvent(event: Event) {
					const customEvent = event as CustomEvent;
					const { points } = customEvent.detail;
					state.currentScore += points;
					state.scoreBoard.setScore(state.currentScore);
				}
			}
		}

		function createPreviewBoard() {
			const previewBoard = new PreviewBoardImpl(
				document.getElementById("next-board") as HTMLElement
			);
			return previewBoard;
		}
	}

	function togglePause() {
		if (!state.gameRunning) return;

		if (state.board && (state.board as any).isAnimating) {
			return;
		}

		state.isPaused = !state.isPaused;
		if (state.board) {
			state.board.pauseGame();
		}

		const pauseOverlay = document.getElementById("pause-overlay");
		if (pauseOverlay) {
			pauseOverlay.style.display = state.isPaused ? "block" : "none";
		}

		const startBtnMobile = document.getElementById("start-button");
		if (startBtnMobile) {
			const label = startBtnMobile.querySelector(".touch-label");
			if (label) {
				label.textContent = state.isPaused ? "Resume" : "Pause";
			}
		}
	}

	function resetGame(): void {
		// Stop game systems
		stopTicking();
		state.gameRunning = false;
		state.isPaused = false;
		state.currentScore = 0;
		state.tetrominoDropTime = BASE_DROP_TIME;

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
		const startBtnMobile = document.getElementById("start-button");
		const startBtnDesktop = document.getElementById("start-button-desktop");
		if (startBtnMobile) {
			const label = startBtnMobile.querySelector(".touch-label");
			if (label) {
				label.textContent = "Start";
			}
		}
		if (startBtnDesktop) {
			startBtnDesktop.textContent = "Start Game";
		}

		// Reset score display
		if (state.scoreBoard) {
			state.scoreBoard.setScore(0);
		}

		// Reset game board and canHoldPiece flag
		if (state.board) {
			state.board.reset();
			state.board.canHoldPiece = true;
		}

		// Clear preview
		const previewContainer = document.querySelector("#preview-container");
		if (previewContainer) {
			previewContainer.innerHTML = "";
		}

		// Hold Board
		const holdContainer = document.querySelector("#hold-board .hold-container");
		if (holdContainer) {
			holdContainer.innerHTML = "";
		}

		audioManager.playMainMenuMusic(); // Play main menu music on reset
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
		state.board.spawnTetromino();
	}
}
