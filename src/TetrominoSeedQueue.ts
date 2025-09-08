export class TetrominoSeedQueueImpl {
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
export interface TetrominoSeedQueue {
    dequeue: () => number;
}

