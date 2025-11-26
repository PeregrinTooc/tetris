// Global Audio/AudioContext mocks for all tests
class MockAudio {
	constructor() {
		this.volume = 1;
		this.currentTime = 0;
		// Properties like loop/preload can be assigned dynamically by code under test
	}
}
// Define methods on the prototype so jest.spyOn(Audio.prototype, 'play'|'pause') works
MockAudio.prototype.play = function () {
	return Promise.resolve();
};
MockAudio.prototype.pause = function () {
	/* no-op */
};
class MockGainNode {
	constructor() {
		this.gain = { value: 1.0 };
	}
	connect = jest.fn();
}

class MockMediaElementAudioSourceNode {
	connect = jest.fn();
}

class MockAudioContext {
	constructor() {
		this.state = "running";
		this.destination = {};
	}
	resume = jest.fn();
	createGain = jest.fn(() => new MockGainNode());
	createMediaElementSource = jest.fn(() => new MockMediaElementAudioSourceNode());
}
global.Audio = MockAudio;
global.window = Object.assign(global.window || {}, {
	Audio: MockAudio,
	AudioContext: MockAudioContext,
	webkitAudioContext: MockAudioContext,
});
