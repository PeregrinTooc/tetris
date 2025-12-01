/**
 * @jest-environment jsdom
 */

import { expect, jest } from "@jest/globals";
import { AudioManager, soundEffects } from "../src/audio";

describe("AudioManager", () => {
	let audioManager: AudioManager;
	// @ts-expect-error
	let playSpy;
	// @ts-expect-error
	let pauseSpy;

	beforeEach(() => {
		localStorage.clear();
		playSpy = jest.spyOn(Audio.prototype, "play").mockImplementation(() => Promise.resolve());
		pauseSpy = jest.spyOn(Audio.prototype, "pause").mockImplementation(() => {});
		audioManager = new AudioManager();
		audioManager.toggleMute();
	});

	test("plays main menu music", () => {
		audioManager.playMainMenuMusic();
		// @ts-expect-error
		expect(playSpy).toHaveBeenCalled();
	});

	test("plays level 1 music on game start", () => {
		audioManager.playGameMusic(1);
		// @ts-expect-error
		expect(playSpy).toHaveBeenCalled();
	});

	test("switches to level 8 music at level 8", () => {
		audioManager.playGameMusic(8);
		// @ts-expect-error
		expect(playSpy).toHaveBeenCalled();
	});

	test("switches to level 15 music at level 15", () => {
		audioManager.playGameMusic(15);
		// @ts-expect-error
		expect(playSpy).toHaveBeenCalled();
	});

	test("stops music", () => {
		audioManager.playGameMusic(1);
		audioManager.stopMusic();
		// @ts-expect-error
		expect(pauseSpy).toHaveBeenCalled();
	});

	test("plays sound effect", () => {
		const effect = Object.keys(soundEffects)[0] as keyof typeof soundEffects;
		audioManager.playSoundEffect(effect);
		// @ts-expect-error
		expect(playSpy).toHaveBeenCalled();
	});

	afterEach(() => {
		localStorage.clear();
	});

	test("handleLevelChange switches music at thresholds", () => {
		audioManager.playGameMusic(1);
		audioManager.handleLevelChange(8);
		audioManager.handleLevelChange(15);
		// @ts-expect-error
		expect(playSpy).toHaveBeenCalled();
	});
});
