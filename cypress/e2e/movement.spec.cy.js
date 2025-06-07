describe("Tetris Game Movement", () => {
    beforeEach(() => {
        cy.visit("/index.html");
        cy.window().then((win) => {
            win.setTetrominoDropTime(100);
        });
    });

    it("should make the tetromino fall automatically", () => {
        cy.get("#start-button").click();
        cy.wait(10);
        cy.get(".tetromino").should("have.css", "top").and("not.equal", "0px");
        cy.wait(30);
        validateTetrominoDrop();
    });

    it("should allow the player to move the tetromino to the right", () => {
        cy.get("#start-button").click();
        cy.get(".tetromino").then(($el) => {
            const initialLeft = parseInt($el.css("left"), 10);
            cy.get("body").type("{rightarrow}");
            cy.get(".tetromino").should(($el2) => {
                const newLeft = parseInt($el2.css("left"), 10);
                expect(newLeft).to.be.greaterThan(initialLeft);
            });
        });
    });

    it("should allow the player to move the tetromino to the left", () => {
        cy.get("#start-button").click();
        cy.get(".tetromino").then(($el) => {
            const initialRight = parseInt($el.css("right"), 10);
            cy.get("body").type("{leftarrow}");
            cy.get(".tetromino").should(($el2) => {
                const newRight = parseInt($el2.css("right"), 10);
                expect(newRight).to.be.greaterThan(initialRight);
            });
        });
    });

    it("should allow the player to drop the tetromino immediately", () => {
        cy.window().then((win) => {
            win.setTetrominoDropTime(2147483647);
        });
        cy.get("#start-button").click();
        cy.get(".tetromino").then(($el) => {
            const initialTop = parseInt($el.css("top"), 10);
            cy.get("body").type("{downarrow}");
            cy.get(".tetromino").should(($el2) => {
                const newTop = parseInt($el2.css("top"), 10);
                expect(newTop).to.equal(480);
            });
        });
    });

    it("should prevent the tetromino from crossing left borders", () => {
        cy.get("#start-button").click();
        moveTetrominoToLeftEdge();
        cy.get("body").type("{leftarrow}");
        cy.get(".tetromino").then(($el) => {
            const leftPosition = parseInt($el.css("left"), 10);
            expect(leftPosition).to.equal(0);
        });
    });

    it("should prevent the tetromino from crossing right borders", () => {
        cy.get("#start-button").click();
        moveTetrominoToRightEdge();
        cy.get("body").type("{rightarrow}");
        cy.get(".tetromino").then(($el) => {
            const rightPosition = parseInt($el.css("right"), 10);
            expect(rightPosition).to.equal(0);
        });
    });

    it("should make the tetromino immobile when it reaches the bottom", () => {
        cy.window().then((win) => {
            win.setTetrominoDropTime(10);
        });
        cy.get("#start-button").click();
        cy.wait(500);
        let rightPosition;
        cy.get(".tetromino").then(($el) => {
            rightPosition = parseInt($el.css("right"), 10);
        });
        cy.get("body").type("{rightarrow}");
        cy.get(".tetromino").then(($el) => {
            const newPosition = parseInt($el.css("right"), 10);
            expect(newPosition).to.equal(rightPosition);
        });
    });

    it("should make the tetromino stop when it sits on another tetromino", () => {
        cy.window().then((win) => {
            win.setTetrominoDropTime(10);
        });
        cy.get("#start-button").click();
        cy.wait(500);
        cy.get("#start-button").click();
        cy.wait(500);
        cy.get("[data-tetromino-id=\"1\"]").then(($el) => {
            const topPositionFirstTetromino = parseInt($el.css("top"), 10);
            cy.get("[data-tetromino-id=\"2\"]").then(($el2) => {
                const newTopPosition = parseInt($el2.css("top"), 10);
                expect(topPositionFirstTetromino).to.be.greaterThan(newTopPosition);
            });
        });
    });
});

function validateTetrominoDrop() {
    cy.get(".tetromino").then(($el) => {
        const topAfterFirstMove = parseInt($el.css("top"), 10);
        cy.wait(30);
        cy.get(".tetromino").should(($el2) => {
            const topAfterSecondMove = parseInt($el2.css("top"), 10);
            expect(topAfterSecondMove).to.be.greaterThan(topAfterFirstMove);
        });
    });
}

function moveTetrominoToLeftEdge() {
    cy.get(".tetromino").then(($el) => {
        const moveLeft = () => {
            cy.get(".tetromino").then(($tetromino) => {
                const left = parseInt($tetromino.css("left"), 10);
                if (left > 0) {
                    cy.get("body").type("{leftarrow}");
                    moveLeft();
                }
            });
        };
        moveLeft();
    });
}

function moveTetrominoToRightEdge() {
    cy.get(".tetromino").then(($el) => {
        const moveRight = () => {
            cy.get(".tetromino").then(($tetromino) => {
                const right = parseInt($tetromino.css("right"), 10);
                if (right > 0) {
                    cy.get("body").type("{rightarrow}");
                    moveRight();
                }
            });
        };
        moveRight();
    });
}