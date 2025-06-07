export class PreviewBoard {
    constructor(element) {
        this.element = element;
        this.previewContainer = element.querySelector("#next-piece").parentElement;
        this.size = 24;
    }

    showNextTetromino(tetromino) {
        this.previewContainer.innerHTML = "";
        const previewElement = tetromino.createElement(document);
        this.previewContainer.style.position = "relative";
        previewElement.style.position = "absolute";
        previewElement.style.left = "36px";
        previewElement.style.top = "36px";
        this.previewContainer.appendChild(previewElement);
    }
}