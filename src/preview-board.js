export class PreviewBoard {
  constructor(element) {
    this.element = element;
    this.previewContainer = element.querySelector("#preview-container");
    this.size = 24;
  }

  showNextTetromino(tetromino) {
    this.previewContainer.innerHTML = "";
    tetromino.element.style.position = "absolute";
    tetromino.element.style.left = "36px";
    tetromino.element.style.top = "36px";
    this.previewContainer.appendChild(tetromino.element);
  }
}
