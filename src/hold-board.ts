import { Tetromino } from "./tetromino-base";

export class HoldBoard {
    private element: HTMLElement;
    private currentTetromino: Tetromino | null = null;

    constructor(element: HTMLElement) {
        this.element = element;
    }

    showHeldTetromino(tetromino: Tetromino) {
        this.clearBoard();

        // Store the tetromino instance
        this.currentTetromino = tetromino;

        // Remove tetromino from its current parent if it has one
        if (tetromino.element.parentNode) {
            tetromino.element.parentNode.removeChild(tetromino.element);
        }

        // Position the tetromino element in hold board
        const blockSize = 30;
        tetromino.element.style.position = 'absolute';
        tetromino.element.style.left = `${(this.element.clientWidth - blockSize * 2) / 2}px`;
        tetromino.element.style.top = `${(this.element.clientHeight - blockSize * 2) / 2}px`;

        // Add the actual tetromino element to preserve its structure and ID
        this.element.appendChild(tetromino.element);
    }

    private clearBoard() {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
    }

    getHeldTetromino(): Tetromino | null {
        return this.currentTetromino;
    }
}
