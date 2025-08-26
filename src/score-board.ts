export class ScoreBoard {
    private element: HTMLElement;
    constructor(element: HTMLElement) {
        this.element = element;
    }
    setScore(score: number): void {
        this.element.textContent = `Score: ${score}`;
    }
}