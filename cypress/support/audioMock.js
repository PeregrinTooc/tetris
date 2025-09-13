// Block audio playback at the lowest possible level
window.AudioContext = class MockAudioContext {
	constructor() {
		return {
			state: "running",
			resume: () => Promise.resolve(),
			suspend: () => Promise.resolve(),
			close: () => Promise.resolve(),
			createMediaElementSource: () => ({}),
			createMediaStreamDestination: () => ({}),
			createBuffer: () => ({}),
			createBufferSource: () => ({}),
			createGain: () => ({}),
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
