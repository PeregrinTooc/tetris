describe('Audio Mocking', () => {
    it('should mock Audio constructor', () => {
        cy.window().then((win) => {
            const audio = new win.Audio();
            expect(audio.play).to.be.a('function');

            // We just verify that calling play doesn't throw an error
            expect(() => audio.play()).not.to.throw();
        });
    });

    it('should mock AudioContext', () => {
        cy.window().then((win) => {
            const audioContext = new win.AudioContext();
            expect(audioContext.resume).to.be.a('function');

            // We just verify that calling resume doesn't throw an error
            expect(() => audioContext.resume()).not.to.throw();
        });
    });

    it('should show music and sfx volume sliders with min/max buttons', () => {
        cy.visit('/');
        // Music controls
        cy.get('#music-volume').should('exist');
        cy.get('#music-min').should('exist');
        cy.get('#music-max').should('exist');
        // SFX controls
        cy.get('#sfx-volume').should('exist');
        cy.get('#sfx-min').should('exist');
        cy.get('#sfx-max').should('exist');
    });
});
