import { expect } from "@jest/globals";
import { AudioManager } from "../src/audio";

describe("AudioManager - Mute Toggle", () => {
	let audioManager: AudioManager;

	beforeEach(() => {
		localStorage.clear();
		audioManager = new AudioManager();
	});

	describe("Default State", () => {
		it("should start muted by default", () => {
			expect(audioManager.isMuted()).toBe(true);
		});
	});

	describe("Toggle Mute", () => {
		it("should unmute when toggled from default muted state", () => {
			audioManager.toggleMute();
			expect(audioManager.isMuted()).toBe(false);
		});

		it("should mute when toggled from unmuted state", () => {
			audioManager.toggleMute();
			audioManager.toggleMute();
			expect(audioManager.isMuted()).toBe(true);
		});

		it("should toggle between muted and unmuted states", () => {
			expect(audioManager.isMuted()).toBe(true);
			audioManager.toggleMute();
			expect(audioManager.isMuted()).toBe(false);
			audioManager.toggleMute();
			expect(audioManager.isMuted()).toBe(true);
			audioManager.toggleMute();
			expect(audioManager.isMuted()).toBe(false);
		});
	});

	describe("SetMuted", () => {
		it("should set muted state to true", () => {
			audioManager.toggleMute();
			expect(audioManager.isMuted()).toBe(false);
			audioManager.setMuted(true);
			expect(audioManager.isMuted()).toBe(true);
		});

		it("should set muted state to false", () => {
			expect(audioManager.isMuted()).toBe(true);
			audioManager.setMuted(false);
			expect(audioManager.isMuted()).toBe(false);
		});

		it("should not toggle if already in desired state", () => {
			expect(audioManager.isMuted()).toBe(true);
			audioManager.setMuted(true);
			expect(audioManager.isMuted()).toBe(true);
		});
	});

	describe("LocalStorage Persistence", () => {
		it("should save mute state to localStorage when toggled", () => {
			audioManager.toggleMute();
			expect(localStorage.getItem("tetris-muted")).toBe("false");

			audioManager.toggleMute();
			expect(localStorage.getItem("tetris-muted")).toBe("true");
		});

		it("should load muted state from localStorage on initialization", () => {
			localStorage.setItem("tetris-muted", "false");
			const newAudioManager = new AudioManager();
			expect(newAudioManager.isMuted()).toBe(false);
		});

		it("should default to muted if localStorage has no value", () => {
			localStorage.clear();
			const newAudioManager = new AudioManager();
			expect(newAudioManager.isMuted()).toBe(true);
		});
	});
});
