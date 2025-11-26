// Block audio playback at the lowest possible level
window.AudioContext = class MockAudioContext {
	constructor() {
		const destination = {};
		return {
			state: "running",
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
};

window.webkitAudioContext = window.AudioContext;

window.Audio = class MockAudio {
	constructor() {
		return {
			play: () => Promise.resolve(),
			pause: () => {},
			load: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			currentTime: 0,
			volume: 1,
			muted: false,
			loop: false,
			autoplay: false,
			src: "",
			preload: "auto",
		};
	}
};
