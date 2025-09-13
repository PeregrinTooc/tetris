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
class MockAudioContext {
	state = "running";
	resume = jest.fn();
}
global.Audio = MockAudio;
global.window = Object.assign(global.window || {}, {
	Audio: MockAudio,
	AudioContext: MockAudioContext,
	webkitAudioContext: MockAudioContext,
});
