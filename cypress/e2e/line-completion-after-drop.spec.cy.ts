import { setTetrominoDropTimeInMiliseconds, addTetrominoO, addTetrominoI, addTetrominoT, doTimes, pressRight, pressLeft, pressDown, pressRotate, pressHardDrop, addTetrominoBase } from "../support/testUtils";

describe("Line Completion", () => {
  beforeEach(() => {
    cy.visit("/index.html");
    cy.window().then((win) => {
      setTetrominoDropTimeInMiliseconds(win, 10000);
  doTimes(5,  () => addTetrominoO(win));
  doTimes(2,  () => addTetrominoI(win));
  doTimes(2,  () => addTetrominoT(win));
  doTimes(2,  () => addTetrominoBase(win));
    });
    cy.get("#start-button").click();
  });

  it("blocks drop after line completion if there is a gap under them", () => {
    doTimes(5, pressLeft);
    pressHardDrop();
    doTimes(3, pressLeft);
    pressHardDrop();
    pressLeft();
    pressHardDrop();
    doTimes(2, pressRight);
    pressHardDrop()
    doTimes(4, pressRight);
    pressHardDrop();
    doTimes(5, pressLeft);
    pressHardDrop();
    doTimes(4, pressRight);
    pressHardDrop();
    pressDown();
    doTimes(3, pressRotate);
    pressLeft();
    pressHardDrop();
    pressDown();
    doTimes(3, pressRotate);
    pressRight();
    pressHardDrop();
   cy.get(".block").should("have.length", 5);
  });
});
