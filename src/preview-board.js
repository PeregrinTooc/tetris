export class PreviewBoard {
    constructor(element) {
        this.element = element;
        this.size = 24;
    }

    showNextTetromino(tetromino) {
        this.element.innerHTML = "";
        const previewElement = tetromino.createElement(document);
        previewElement.style.left = "36px";
        previewElement.style.top = "36px";
        this.element.appendChild(previewElement);
    }
}