import { Block, Tetromino } from "./tetromino-base";
import { Board } from "./board";
import { TetrominoFactory } from "./tetrominoFactory";

export interface TetrominoState {
	seed: number;
	left: number;
	top: number;
	rotation: number;
	locked: boolean;
	id: string;
	blocks: { x: number; y: number }[];
}

export interface SnapshotMetadata {
	timestamp: number;
	formattedTime: string;
	occupiedBlockCount: number;
	hasActiveTetromino: boolean;
	hasNextTetromino: boolean;
	hasHoldTetromino: boolean;
	canHoldPiece: boolean;
	isAnimating: boolean;
}

export class BoardSnapshot {
	timestamp: number;
	occupiedPositions: Block[];
	activeTetromino: TetrominoState | null;
	nextTetromino: TetrominoState | null;
	holdTetromino: TetrominoState | null;
	canHoldPiece: boolean;
	isAnimating: boolean;

	constructor(
		timestamp: number,
		occupiedPositions: Block[],
		activeTetromino: TetrominoState | null,
		nextTetromino: TetrominoState | null,
		holdTetromino: TetrominoState | null,
		canHoldPiece: boolean,
		isAnimating: boolean
	) {
		this.timestamp = timestamp;
		this.occupiedPositions = occupiedPositions;
		this.activeTetromino = activeTetromino;
		this.nextTetromino = nextTetromino;
		this.holdTetromino = holdTetromino;
		this.canHoldPiece = canHoldPiece;
		this.isAnimating = isAnimating;
	}

	static fromBoard(board: Board): BoardSnapshot {
		const timestamp = Date.now();
		const occupiedPositions = BoardSnapshot._deepCopyBlocks(board);
		const activeTetromino = BoardSnapshot._serializeTetromino(board.getActiveTetromino());
		const nextTetromino = BoardSnapshot._serializeTetromino((board as any).nextTetromino);
		const holdTetromino = BoardSnapshot._getHoldTetrominoState(board);
		const canHoldPiece = (board as any).canHoldPiece;
		const isAnimating = (board as any).isAnimating || false;

		return new BoardSnapshot(
			timestamp,
			occupiedPositions,
			activeTetromino,
			nextTetromino,
			holdTetromino,
			canHoldPiece,
			isAnimating
		);
	}

	private static _deepCopyBlocks(board: Board): Block[] {
		const occupiedPositions = (board as any).occupiedPositions as Block[];
		const tetrominoMap = new Map<string, Tetromino>();

		return occupiedPositions.map((block) => {
			let parentCopy = tetrominoMap.get(block.parent.id);
			if (!parentCopy) {
				parentCopy = { id: block.parent.id } as Tetromino;
				tetrominoMap.set(block.parent.id, parentCopy);
			}

			return new Block({
				x: block.x,
				y: block.y,
				parent: parentCopy,
			});
		});
	}

	private static _serializeTetromino(tetromino: Tetromino | null): TetrominoState | null {
		if (!tetromino) return null;

		return {
			seed: tetromino.seed ?? 0,
			left: tetromino.left,
			top: tetromino.top,
			rotation: tetromino.rotation,
			locked: tetromino.locked,
			id: tetromino.id,
			blocks: tetromino.getBlocks().map((b) => ({ x: b.x, y: b.y })),
		};
	}

	private static _getHoldTetrominoState(board: Board): TetrominoState | null {
		const holdBoard = (board as any).holdBoard;
		if (!holdBoard) return null;

		const heldTetromino = holdBoard.getHeldTetromino();
		return BoardSnapshot._serializeTetromino(heldTetromino);
	}

	getMetadata(): SnapshotMetadata {
		return {
			timestamp: this.timestamp,
			formattedTime: this._formatTimestamp(),
			occupiedBlockCount: this.occupiedPositions.length,
			hasActiveTetromino: this.activeTetromino !== null,
			hasNextTetromino: this.nextTetromino !== null,
			hasHoldTetromino: this.holdTetromino !== null,
			canHoldPiece: this.canHoldPiece,
			isAnimating: this.isAnimating,
		};
	}

	private _formatTimestamp(): string {
		const date = new Date(this.timestamp);
		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = date.getMinutes().toString().padStart(2, "0");
		const seconds = date.getSeconds().toString().padStart(2, "0");
		const ms = date.getMilliseconds().toString().padStart(3, "0");
		return `${hours}:${minutes}:${seconds}.${ms}`;
	}

	toJSON(): any {
		return {
			timestamp: this.timestamp,
			occupiedPositions: this.occupiedPositions.map((b) => ({
				x: b.x,
				y: b.y,
				parentId: b.parent.id,
			})),
			activeTetromino: this.activeTetromino,
			nextTetromino: this.nextTetromino,
			holdTetromino: this.holdTetromino,
			canHoldPiece: this.canHoldPiece,
			isAnimating: this.isAnimating,
		};
	}

	restoreTetromino(state: TetrominoState, board: Board | null): Tetromino {
		const tetromino = TetrominoFactory.createNew(state.left, board, state.seed);
		tetromino.top = state.top;
		tetromino.rotation = state.rotation;
		tetromino.locked = state.locked;
		(tetromino as any).id = state.id;

		for (let i = 0; i < state.rotation; i++) {
			tetromino.rotate(1);
		}

		tetromino.updatePosition();
		return tetromino;
	}

	getRestoredState(board: Board): {
		occupiedPositions: Block[];
		activeTetromino: Tetromino;
		nextTetromino: Tetromino | null;
		lockedTetrominos: Tetromino[];
		canHoldPiece: boolean;
	} {
		const activeTetromino = this.restoreTetromino(this.activeTetromino!, board);

		const nextTetromino = this.nextTetromino
			? this.restoreTetromino(this.nextTetromino, null)
			: null;

		const tetrominoMap = new Map<string, Tetromino>();
		const lockedTetrominos: Tetromino[] = [];

		for (const block of this.occupiedPositions) {
			const parentId = block.parent.id;
			let tetromino = tetrominoMap.get(parentId);

			if (!tetromino) {
				const lockedState: TetrominoState = {
					seed: 0,
					left: 0,
					top: 0,
					rotation: 0,
					locked: true,
					id: parentId,
					blocks: [],
				};
				tetromino = this.restoreTetromino(lockedState, board);
				tetromino.blocks = [];
				tetrominoMap.set(parentId, tetromino);
				lockedTetrominos.push(tetromino);
			}
		}

		const restoredBlocks = this.occupiedPositions.map((block) => {
			const parentTetromino = tetrominoMap.get(block.parent.id)!;
			const restoredBlock = new Block({
				x: block.x,
				y: block.y,
				parent: parentTetromino,
			});
			parentTetromino.blocks.push(restoredBlock);
			return restoredBlock;
		});

		return {
			occupiedPositions: restoredBlocks,
			activeTetromino,
			nextTetromino,
			lockedTetrominos,
			canHoldPiece: this.canHoldPiece,
		};
	}
}
