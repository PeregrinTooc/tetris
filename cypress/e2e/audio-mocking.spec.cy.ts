describe("Audio Mocking", () => {
	it("should mock Audio constructor", () => {
		cy.window().then((win) => {
			const audio = new win.Audio();
			expect(audio.play).to.be.a("function");

			// We just verify that calling play doesn't throw an error
			expect(() => audio.play()).not.to.throw();
		});
	});

	it("should mock AudioContext", () => {
		cy.window().then((win) => {
			const audioContext = new win.AudioContext();
			expect(audioContext.resume).to.be.a("function");

			// We just verify that calling resume doesn't throw an error
			expect(() => audioContext.resume()).not.to.throw();
		});
	});

	it("should show music and sfx volume sliders with min/max buttons", () => {
		cy.visit("/");

		cy.viewport(1024, 768);
		cy.get("#music-volume").should("be.visible");
		cy.get("#music-min").should("be.visible");
		cy.get("#music-max").should("be.visible");
		cy.get("#sfx-volume").should("be.visible");
		cy.get("#sfx-min").should("be.visible");
		cy.get("#sfx-max").should("be.visible");
	});

	it("should hide desktop audio panel on mobile viewport", () => {
		cy.visit("/");
		cy.viewport(375, 667);

		cy.get(".audio-panel").should("not.be.visible");
	});
});
