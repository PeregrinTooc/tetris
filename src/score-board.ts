export class ScoreBoard {
    private element: HTMLElement;
    private levelElement: HTMLElement;
    private currentLevel: number = 1;
    private currentScore: number = 0;
    private static readonly LEVEL_MULTIPLIER = 2000;
    private static readonly SPEED_REDUCTION_FACTOR = 0.8;

    constructor(element: HTMLElement, levelElement: HTMLElement, private setDropTimeCallback: (newDropTime: number) => void, private baseDropTime: number) {
        this.element = element;
        this.levelElement = levelElement;
        // Initialize display
        this.updateLevelDisplay();
    }

    setScore(score: number): void {
        this.currentScore = score;
        this.element.textContent = `Score: ${score}`;

        // Check for level changes
        const newLevel = this.getLevelForScore(score);
        if (newLevel !== this.currentLevel) {
            const oldLevel = this.currentLevel;
            this.currentLevel = newLevel;
            this.updateLevelDisplay();

            // Emit level change event
            const event = new CustomEvent("levelChange", {
                detail: { oldLevel, newLevel },
                bubbles: true
            });
            this.element.dispatchEvent(event);
            // Update drop time based on new level
            const newDropTime = this.getDropTimeForLevel(newLevel, this.baseDropTime);
            this.setDropTimeCallback(newDropTime);
        }
    }

    getCurrentLevel(): number {
        return this.currentLevel;
    }

    getLevelForScore(score: number): number {
        if (score < ScoreBoard.LEVEL_MULTIPLIER) {
            return 1;
        }

        // Find the level using the formula: points needed = n(n+1)/2 * LEVEL_MULTIPLIER
        // We need to solve: score >= n(n+1)/2 * LEVEL_MULTIPLIER for the highest n
        let level = 1;
        while (true) {
            const pointsNeededForNextLevel = (level * (level + 1) / 2) * ScoreBoard.LEVEL_MULTIPLIER;
            if (score < pointsNeededForNextLevel) {
                return level;
            }
            level++;
        }
    }

    getDropTimeForLevel(level: number, baseDropTime: number): number {
        // Each level reduces drop time by 20% (multiply by 0.8)
        // Level 1: baseDropTime
        // Level 2: baseDropTime * 0.8
        // Level 3: baseDropTime * 0.8^2
        // Level n: baseDropTime * 0.8^(n-1)
        return Math.round(baseDropTime * Math.pow(ScoreBoard.SPEED_REDUCTION_FACTOR, level - 1));
    }

    addEventListener(event: string, listener: EventListener): void {
        this.element.addEventListener(event, listener);
    }

    private updateLevelDisplay(): void {
        this.levelElement.textContent = `Level: ${this.currentLevel}`;
    }
}