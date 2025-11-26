class MockAudio {
	public volume = 1;
	public currentTime = 0;
	play = jest.fn(() => Promise.resolve());
	pause = jest.fn();
}

class MockGainNode {
	constructor() {
		this.gain = { value: 1.0 };
	}
	connect = jest.fn();
	gain: { value: number };
}

class MockMediaElementAudioSourceNode {
	connect = jest.fn();
}

class MockAudioContext {
	constructor() {
		this.state = "running";
		this.destination = {};
	}
	state: string;
	destination: any;
	resume = jest.fn();
	createGain = jest.fn(() => new MockGainNode());
	createMediaElementSource = jest.fn(() => new MockMediaElementAudioSourceNode());
}

// @ts-ignore
global.Audio = MockAudio;
// @ts-ignore
global.window = Object.assign(global.window || {}, {
	Audio: MockAudio,
	AudioContext: MockAudioContext,
	webkitAudioContext: MockAudioContext,
});

import { expect } from "@jest/globals";
import { AudioManager, soundEffects } from "../src/audio";

describe("AudioManager volume controls", () => {
	let audioManager: AudioManager;
	let originalBgMusicVolume: number;
	let originalSfxVolume: number;

	beforeEach(() => {
		audioManager = new AudioManager();
		// Save original volumes
		originalBgMusicVolume = (soundEffects.hardDrop as any).volume || 1;
		originalSfxVolume = (soundEffects.lineComplete as any).volume || 1;
	});

	afterEach(() => {
		// Restore original volumes
		(soundEffects.hardDrop as any).volume = originalBgMusicVolume;
		(soundEffects.lineComplete as any).volume = originalSfxVolume;
	});

	it("sets music volume via slider events", () => {
		const musicSlider = document.createElement("input");
		musicSlider.type = "range";
		musicSlider.id = "music-volume";
		document.body.appendChild(musicSlider);
		const minBtn = document.createElement("button");
		minBtn.id = "music-min";
		document.body.appendChild(minBtn);
		const maxBtn = document.createElement("button");
		maxBtn.id = "music-max";
		document.body.appendChild(maxBtn);

		audioManager.initializeControls();

		// Test slider input event
		musicSlider.value = "50";
		musicSlider.dispatchEvent(new Event("input"));
		expect((window as any).bgMusicLevel1?.volume ?? 0.5).toBeGreaterThanOrEqual(0.49);
		expect((window as any).bgMusicLevel1?.volume ?? 0.5).toBeLessThanOrEqual(0.51);

		// Min button
		minBtn.click();
		expect((window as any).bgMusicLevel1?.volume ?? 0).toBeGreaterThanOrEqual(0);
		expect((window as any).bgMusicLevel1?.volume ?? 0).toBeLessThanOrEqual(0.01);
		expect(musicSlider.value).toBe("0");

		// Max button
		maxBtn.click();
		expect((window as any).bgMusicLevel1?.volume ?? 1).toBeGreaterThanOrEqual(0.99);
		expect((window as any).bgMusicLevel1?.volume ?? 1).toBeLessThanOrEqual(1);
		expect(musicSlider.value).toBe("100");

		document.body.removeChild(musicSlider);
		document.body.removeChild(minBtn);
		document.body.removeChild(maxBtn);
	});

	it("sets sfx volume via slider events", () => {
		const sfxSlider = document.createElement("input");
		sfxSlider.type = "range";
		sfxSlider.id = "sfx-volume";
		document.body.appendChild(sfxSlider);
		const minBtn = document.createElement("button");
		minBtn.id = "sfx-min";
		document.body.appendChild(minBtn);
		const maxBtn = document.createElement("button");
		maxBtn.id = "sfx-max";
		document.body.appendChild(maxBtn);

		audioManager.initializeControls();

		sfxSlider.value = "25";
		sfxSlider.dispatchEvent(new Event("input"));
		expect(sfxSlider.value).toBe("25");

		minBtn.click();
		expect(sfxSlider.value).toBe("0");

		maxBtn.click();
		expect(sfxSlider.value).toBe("100");

		document.body.removeChild(sfxSlider);
		document.body.removeChild(minBtn);
		document.body.removeChild(maxBtn);
	});
});
