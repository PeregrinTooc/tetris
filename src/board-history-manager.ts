import { BoardSnapshot } from "./board-snapshot";
import { Board } from "./board";

export class BoardHistoryManager {
	private snapshots: BoardSnapshot[] = [];
	private maxSize: number;
	private currentIndex: number = 0;

	constructor(maxSize: number = 50) {
		this.maxSize = maxSize;
	}

	addSnapshot(snapshot: BoardSnapshot): void {
		if (this.snapshots.length < this.maxSize) {
			this.snapshots.push(snapshot);
			this.currentIndex = this.snapshots.length - 1;
		} else {
			this.snapshots.shift();
			this.snapshots.push(snapshot);
			this.currentIndex = this.snapshots.length - 1;
		}
	}

	takeSnapshot(board: Board): void {
		const snapshot = BoardSnapshot.fromBoard(board);
		this.addSnapshot(snapshot);
	}

	getSnapshot(index: number): BoardSnapshot | null {
		if (index < 0 || index >= this.snapshots.length) {
			return null;
		}
		return this.snapshots[index];
	}

	getLatestSnapshot(): BoardSnapshot | null {
		if (this.snapshots.length === 0) return null;
		return this.snapshots[this.snapshots.length - 1];
	}

	getSnapshotCount(): number {
		return this.snapshots.length;
	}

	getAllSnapshots(): BoardSnapshot[] {
		return [...this.snapshots];
	}

	clear(): void {
		this.snapshots = [];
		this.currentIndex = 0;
	}

	exportHistory(): string {
		return JSON.stringify(
			this.snapshots.map((s) => s.toJSON()),
			null,
			2
		);
	}
}
