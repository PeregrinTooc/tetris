
import { setTetrominoDropTimeInMiliseconds, addTetrominoT, pressRotate } from "../support/testUtils";

describe("T-shaped Tetromino", () => {
  beforeEach(() => {
    cy.visit("/index.html");
    cy.window().then((win) => {
      setTetrominoDropTimeInMiliseconds(win, 100000);
  addTetrominoT(win);
    });
    cy.get("#start-button").click();
  });

  it("should spawn a T-shaped tetromino and render it on the board", () => {
    cy.get("#game-board .tetromino-t").should("exist");
    cy.get("#game-board .tetromino-t .block").should("have.length", 4);
  });

  it("should rotate the T tetromino clockwise and match expected block positions", () => {
    cy.get("#game-board .tetromino").first().as("tetromino");
    function getBlockOffsets(
      $tetromino: JQuery<HTMLElement>
    ): { left: number; top: number }[] {
      return $tetromino
        .find(".block")
        .map((i: number, el: HTMLElement) => ({
          left: parseInt(el.style.left, 10),
          top: parseInt(el.style.top, 10),
        }))
        .get();
    }
    // Initial (rotation 0)
    cy.get("@tetromino").then(($tetromino) => {
      const blocks = getBlockOffsets($tetromino);
      expect(blocks).to.deep.equal([
        { left: 0, top: 0 },
        { left: -24, top: 0 },
        { left: 24, top: 0 },
        { left: 0, top: 24 },
      ]);
    });
    // Rotate to 1
  pressRotate();
    cy.wait(50);
    cy.get("@tetromino").then(($tetromino) => {
      const blocks = getBlockOffsets($tetromino);
      expect(blocks).to.deep.equal([
        { left: 0, top: 0 },
        { left: -24, top: 0 },
        { left: 24, top: 0 },
        { left: 0, top: 24 },
      ]);
    });
    // Rotate to 2
  pressRotate();
    cy.wait(50);
    cy.get("@tetromino").then(($tetromino) => {
      const blocks = getBlockOffsets($tetromino);
      expect(blocks).to.deep.equal([
        { left: 0, top: 0 },
        { left: -24, top: 0 },
        { left: 24, top: 0 },
        { left: 0, top: 24 },
      ]);
    });
    // Rotate to 3
  pressRotate();
    cy.wait(50);
    cy.get("@tetromino").then(($tetromino) => {
      const blocks = getBlockOffsets($tetromino);
      expect(blocks).to.deep.equal([
        { left: 0, top: 0 },
        { left: -24, top: 0 },
        { left: 24, top: 0 },
        { left: 0, top: 24 },
      ]);
    });
    // Rotate to 0 again
  pressRotate();
    cy.wait(50);
    cy.get("@tetromino").then(($tetromino) => {
      const blocks = getBlockOffsets($tetromino);
      expect(blocks).to.deep.equal([
        { left: 0, top: 0 },
        { left: -24, top: 0 },
        { left: 24, top: 0 },
        { left: 0, top: 24 },
      ]);
    });
  });
});
