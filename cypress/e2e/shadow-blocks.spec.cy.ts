import {
	setTetrominoDropTimeInMiliseconds,
	addTetrominoT,
	addTetrominoI,
	addTetrominoO,
	addTetrominoJ,
	addTetrominoL,
	addTetrominoZ,
	addTetrominoS,
	addTetrominoBase,
	pressLeft,
	pressRight,
	pressDown,
	pressRotate,
	pressHardDrop,
	pressPause,
	doTimes,
} from "../support/testUtils";

describe("Shadow Blocks (Ghost Piece)", () => {
	beforeEach(() => {
		cy.visit("/index.html");
		cy.window().then((win) => {
			setTetrominoDropTimeInMiliseconds(win, 999999);
		});
	});

	afterEach(() => {
		cy.get("#start-button").click();
		cy.get("[data-tetromino-id]").should("not.exist");
	});

	describe("Basic Visibility & Shape", () => {
		it("should display shadow blocks at landing position on spawn", () => {
			cy.window().then((win) => {
				addTetrominoT(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).should("have.length", 4);

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).each(($shadow) => {
						expect($shadow.css("border-style")).to.include("dashed");
						const shadowTop = parseInt($shadow.css("top"));
						const activeTop = parseInt($active.css("top"));
						expect(shadowTop).to.be.greaterThan(activeTop);
					});
				});
		});

		it("should match active tetromino T shape", () => {
			cy.window().then((win) => {
				addTetrominoT(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");

					cy.get(`.coordinate-block[data-tetromino-id="${id}"]`).should("have.length", 4);
					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).should("have.length", 4);

					cy.get(`.coordinate-block[data-tetromino-id="${id}"]`).then(($activeBlocks) => {
						cy.get(`.shadow-block[data-tetromino-id="${id}"]`).then(($shadowBlocks) => {
							const activeXPositions = Array.from($activeBlocks).map((el) =>
								parseInt((el as HTMLElement).style.left)
							);
							const shadowXPositions = Array.from($shadowBlocks).map((el) =>
								parseInt((el as HTMLElement).style.left)
							);

							activeXPositions.sort();
							shadowXPositions.sort();
							expect(shadowXPositions).to.deep.equal(activeXPositions);
						});
					});
				});
		});

		it("should match active tetromino I shape", () => {
			cy.window().then((win) => {
				addTetrominoI(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");
					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).should("have.length", 4);
				});
		});

		it("should match active tetromino O shape", () => {
			cy.window().then((win) => {
				addTetrominoO(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");
					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).should("have.length", 4);
				});
		});

		it("should use bordered styling with no fill", () => {
			cy.window().then((win) => {
				addTetrominoT(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).each(($shadow) => {
						expect($shadow.css("background-color")).to.satisfy((bg: string) => {
							return (
								bg === "transparent" ||
								bg === "rgba(0, 0, 0, 0)" ||
								bg === "initial" ||
								bg === "inherit"
							);
						});
						expect($shadow.css("border-style")).to.include("dashed");
					});
				});
		});
	});

	describe("Horizontal Movement Tracking", () => {
		it("should follow piece when moving left", () => {
			cy.window().then((win) => {
				addTetrominoT(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`)
						.first()
						.then(($initialShadow) => {
							const initialLeft = parseInt($initialShadow.css("left"));

							pressLeft();
							cy.wait(50);

							cy.get(`.shadow-block[data-tetromino-id="${id}"]`)
								.first()
								.then(($newShadow) => {
									const newLeft = parseInt($newShadow.css("left"));
									expect(newLeft).to.be.lessThan(initialLeft);
								});
						});
				});
		});

		it("should follow piece when moving right", () => {
			cy.window().then((win) => {
				addTetrominoT(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`)
						.first()
						.then(($initialShadow) => {
							const initialLeft = parseInt($initialShadow.css("left"));

							pressRight();
							cy.wait(50);

							cy.get(`.shadow-block[data-tetromino-id="${id}"]`)
								.first()
								.then(($newShadow) => {
									const newLeft = parseInt($newShadow.css("left"));
									expect(newLeft).to.be.greaterThan(initialLeft);
								});
						});
				});
		});

		it("should maintain correct drop distance after horizontal moves", () => {
			cy.window().then((win) => {
				addTetrominoT(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");

					pressRight();
					pressRight();
					cy.wait(50);

					cy.get(`.coordinate-block[data-tetromino-id="${id}"]`)
						.first()
						.then(($activeBlock) => {
							const activeTop = parseInt($activeBlock.css("top"));

							cy.get(`.shadow-block[data-tetromino-id="${id}"]`)
								.first()
								.then(($shadowBlock) => {
									const shadowTop = parseInt($shadowBlock.css("top"));
									expect(shadowTop).to.be.greaterThan(activeTop);
								});
						});
				});
		});
	});

	describe("Rotation Behavior", () => {
		it("should update shape after clockwise rotation", () => {
			cy.window().then((win) => {
				addTetrominoT(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).should("have.length", 4);

					pressRotate();
					cy.wait(50);

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).should("have.length", 4);

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).each(($shadow) => {
						const shadowTop = parseInt($shadow.css("top"));
						const shadowLeft = parseInt($shadow.css("left"));
						expect(shadowTop).to.be.greaterThan(0);
						expect(shadowLeft).to.be.at.least(0);
					});
				});
		});

		it("should maintain shadow after rotation", () => {
			cy.window().then((win) => {
				addTetrominoI(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");

					pressRotate();
					cy.wait(50);

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).should("have.length", 4);
				});
		});
	});

	describe("Collision & Landing Position", () => {
		it("should position shadow at board bottom when no obstacles", () => {
			cy.window().then((win) => {
				addTetrominoBase(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).then(($shadow) => {
						const shadowTop = parseInt($shadow.css("top"));
						expect(shadowTop).to.equal(456);
					});
				});
		});

		it("should stop shadow above locked piece", () => {
			cy.window().then((win) => {
				addTetrominoBase(win);
				addTetrominoBase(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($first) => {
					const firstId = $first.attr("data-tetromino-id");
					pressHardDrop();
					cy.wait(100);

					cy.get("#game-board [data-tetromino-id]")
						.not(`[data-tetromino-id="${firstId}"]`)
						.first()
						.then(($second) => {
							const secondId = $second.attr("data-tetromino-id");

							cy.get(`.shadow-block[data-tetromino-id="${secondId}"]`).then(
								($shadow) => {
									const shadowTop = parseInt($shadow.css("top"));
									expect(shadowTop).to.equal(432);
								}
							);
						});
				});
		});

		it("should handle stacked pieces correctly", () => {
			cy.window().then((win) => {
				addTetrominoBase(win);
				addTetrominoBase(win);
				addTetrominoBase(win);
			});

			cy.get("#start-button").click();

			pressHardDrop();
			cy.wait(100);
			pressHardDrop();
			cy.wait(100);

			cy.get("#game-board [data-tetromino-id]")
				.last()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).then(($shadow) => {
						const shadowTop = parseInt($shadow.css("top"));
						expect(shadowTop).to.equal(408);
					});
				});
		});
	});

	describe("Hard Drop Validation", () => {
		it("should land exactly at shadow position for T piece", () => {
			cy.window().then((win) => {
				addTetrominoT(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`)
						.first()
						.then(($shadow) => {
							const shadowTop = parseInt($shadow.css("top"));

							pressHardDrop();
							cy.wait(100);

							cy.get(`.coordinate-block[data-tetromino-id="${id}"]`)
								.first()
								.then(($locked) => {
									const lockedTop = parseInt($locked.css("top"));
									expect(lockedTop).to.equal(shadowTop);
								});
						});
				});
		});

		it("should land at shadow position after left movement", () => {
			cy.window().then((win) => {
				addTetrominoBase(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");

					pressLeft();
					pressLeft();
					cy.wait(50);

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).then(($shadow) => {
						const shadowTop = parseInt($shadow.css("top"));
						const shadowLeft = parseInt($shadow.css("left"));

						pressHardDrop();
						cy.wait(100);

						cy.get(`.coordinate-block[data-tetromino-id="${id}"]`).then(($locked) => {
							const lockedTop = parseInt($locked.css("top"));
							const lockedLeft = parseInt($locked.css("left"));
							expect(lockedTop).to.equal(shadowTop);
							expect(lockedLeft).to.equal(shadowLeft);
						});
					});
				});
		});

		it("should land at shadow position after rotation", () => {
			cy.window().then((win) => {
				addTetrominoI(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");

					pressRotate();
					cy.wait(50);

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`)
						.first()
						.then(($shadow) => {
							const shadowTop = parseInt($shadow.css("top"));

							pressHardDrop();
							cy.wait(100);

							cy.get(`.coordinate-block[data-tetromino-id="${id}"]`)
								.first()
								.then(($locked) => {
									const lockedTop = parseInt($locked.css("top"));
									expect(lockedTop).to.equal(shadowTop);
								});
						});
				});
		});
	});

	describe("Soft Drop Behavior", () => {
		it("should update shadow as piece descends via soft drop", () => {
			cy.window().then((win) => {
				addTetrominoBase(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).then(($initialShadow) => {
						const initialShadowTop = parseInt($initialShadow.css("top"));

						doTimes(5, () => pressDown());
						cy.wait(50);

						cy.get(`.coordinate-block[data-tetromino-id="${id}"]`)
							.first()
							.then(($activeBlock) => {
								const activeTop = parseInt($activeBlock.css("top"));

								cy.get(`.shadow-block[data-tetromino-id="${id}"]`).then(
									($newShadow) => {
										const newShadowTop = parseInt($newShadow.css("top"));
										const dropDistance = newShadowTop - activeTop;
										const initialDropDistance = initialShadowTop - 0;
										expect(dropDistance).to.be.lessThan(initialDropDistance);
									}
								);
							});
					});
				});
		});
	});

	describe("Edge Cases", () => {
		it("should show shadow at spawn position with full drop distance", () => {
			cy.window().then((win) => {
				addTetrominoBase(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");

					cy.get(`.coordinate-block[data-tetromino-id="${id}"]`).then(($activeBlock) => {
						const activeTop = parseInt($activeBlock.css("top"));

						cy.get(`.shadow-block[data-tetromino-id="${id}"]`).then(($shadow) => {
							const shadowTop = parseInt($shadow.css("top"));
							expect(shadowTop).to.be.greaterThan(activeTop);
							expect(shadowTop).to.equal(456);
						});
					});
				});
		});

		it("should clear shadow when piece locks", () => {
			cy.window().then((win) => {
				addTetrominoBase(win);
				addTetrominoBase(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($first) => {
					const firstId = $first.attr("data-tetromino-id");

					cy.get(`.shadow-block[data-tetromino-id="${firstId}"]`).should("exist");

					pressHardDrop();
					cy.wait(150);

					cy.get(`.shadow-block[data-tetromino-id="${firstId}"]`).should("not.exist");
				});
		});

		it("should not show shadow when paused", () => {
			cy.window().then((win) => {
				addTetrominoBase(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).should("exist");

					pressPause();
					cy.wait(50);

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).should("not.exist");
				});
		});

		it("should restore shadow when unpaused", () => {
			cy.window().then((win) => {
				addTetrominoBase(win);
			});

			cy.get("#start-button").click();

			cy.get("#game-board [data-tetromino-id]")
				.first()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");

					pressPause();
					cy.wait(50);

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).should("not.exist");

					pressPause();
					cy.wait(50);

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).should("exist");
				});
		});
	});

	describe("Line Clear Impact", () => {
		it("should update shadow after line clear", () => {
			cy.window().then((win) => {
				setTetrominoDropTimeInMiliseconds(win, 80);
				addTetrominoO(win);
				addTetrominoO(win);
				addTetrominoO(win);
				addTetrominoO(win);
				addTetrominoO(win);
				addTetrominoO(win);
			});

			cy.get("#start-button").click();

			doTimes(4, () => pressLeft());
			pressHardDrop();
			cy.wait(150);

			doTimes(2, () => pressLeft());
			pressHardDrop();
			cy.wait(150);

			pressHardDrop();
			cy.wait(150);

			doTimes(2, () => pressRight());
			pressHardDrop();
			cy.wait(150);

			doTimes(4, () => pressRight());
			pressHardDrop();
			cy.wait(150);

			cy.get("#game-board [data-tetromino-id]")
				.last()
				.then(($active) => {
					const id = $active.attr("data-tetromino-id");

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`).should("exist");

					cy.get(`.shadow-block[data-tetromino-id="${id}"]`)
						.first()
						.then(($shadow) => {
							const shadowTop = parseInt($shadow.css("top"));
							expect(shadowTop).to.be.greaterThan(0);
						});
				});
		});
	});
});
