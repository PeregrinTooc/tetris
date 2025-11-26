// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

Cypress.on("window:before:load", (win) => {
	// Add CSP meta tag to block media
	const meta = win.document.createElement("meta");
	meta.setAttribute("http-equiv", "Content-Security-Policy");
	meta.setAttribute("content", "media-src 'none';");
	win.document.head.appendChild(meta);

	// Mock Audio and AudioContext before any scripts run
	Object.defineProperty(win, "Audio", {
		writable: true,
		value: class MockAudio {
			constructor() {
				return {
					play: () => Promise.resolve(),
					pause: () => {},
					load: () => {},
					addEventListener: () => {},
					removeEventListener: () => {},
					currentTime: 0,
					volume: 1,
					muted: true,
					loop: false,
					autoplay: false,
					src: "",
					preload: "none",
				};
			}
		},
	});

	Object.defineProperty(win, "AudioContext", {
		writable: true,
		value: class MockAudioContext {
			constructor() {
				const destination = {};
				return {
					state: "suspended",
					destination: destination,
					resume: () => Promise.resolve(),
					suspend: () => Promise.resolve(),
					close: () => Promise.resolve(),
					createMediaElementSource: () => ({
						connect: () => {},
					}),
					createMediaStreamDestination: () => ({}),
					createBuffer: () => ({}),
					createBufferSource: () => ({}),
					createGain: () => ({
						connect: () => {},
						gain: { value: 1.0 },
					}),
					createOscillator: () => ({}),
					baseLatency: 0,
					outputLatency: 0,
				};
			}
		},
	});

	// Also mock webkitAudioContext
	Object.defineProperty(win, "webkitAudioContext", {
		writable: true,
		value: win.AudioContext,
	});
});

beforeEach(() => {
	// Block audio file requests completely
	cy.intercept("**/*.mp3", { statusCode: 404 });
	cy.intercept("**/*.wav", { statusCode: 404 });
	cy.intercept("**/*.ogg", { statusCode: 404 });
});
