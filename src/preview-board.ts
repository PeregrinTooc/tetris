export class PreviewBoard {
	element: HTMLElement;
	previewContainer: HTMLElement;
	size: number;

	constructor(element: HTMLElement) {
		this.element = element;
		this.previewContainer = element.querySelector("#preview-container") as HTMLElement;
		this.size = 24;
	}

	showNextTetromino(tetromino: any): void {
		this.previewContainer.innerHTML = "";
		tetromino.element.style.position = "absolute";
		tetromino.element.style.left = "36px";
		tetromino.element.style.top = "36px";
		this.previewContainer.appendChild(tetromino.element);
	}
}
