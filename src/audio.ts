const mainMenuMusic = new Audio("resources/music/mainMenu.mp3");
const bgMusicLevel1 = new Audio("resources/music/fromLevel1.mp3");
const bgMusicLevel8 = new Audio("resources/music/fromLevel8.mp3");
const bgMusicLevel15 = new Audio("resources/music/fromLevel15.mp3");

mainMenuMusic.loop = true;
mainMenuMusic.preload = "auto";
bgMusicLevel1.loop = true;
bgMusicLevel1.preload = "auto";
bgMusicLevel8.loop = true;
bgMusicLevel8.preload = "auto";
bgMusicLevel15.loop = true;
bgMusicLevel15.preload = "auto";

export const soundEffects = {
	hardDrop: new Audio("resources/sfx/hardDrop.mp3"),
	levelUp: new Audio("resources/sfx/levelUp.mp3"),
	lineComplete: new Audio("resources/sfx/lineCompletion.mp3"),
	tetrisClear: new Audio("resources/sfx/tetrisClear.mp3"),
	gameOver: new Audio("resources/sfx/gameOver.mp3"),
	locked: new Audio("resources/sfx/locked.mp3"),
};
// Preload all sound effects
Object.values(soundEffects).forEach((sound) => {
	sound.preload = "auto";
});

// Audio context setup for handling browser autoplay restrictions
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
const audioContext = new AudioContext();
// Function to resume audio context after user interaction

// Setup audio controls
let musicVolume = 1.0; // 0.0 to 1.0
let sfxVolume = 1.0; // 0.0 to 1.0

export class AudioManager {
	private currentMusic: HTMLAudioElement | null = null;
	private currentLevel: number = 1;

	/**
	 * Call this to play main menu music (when not in game)
	 */
	public playMainMenuMusic() {
		this._switchMusic(mainMenuMusic);
	}

	/**
	 * Call this to start game music for a given level (1+)
	 */
	public playGameMusic(level: number) {
		let music: HTMLAudioElement;
		if (level >= 15) {
			music = bgMusicLevel15;
		} else if (level >= 8) {
			music = bgMusicLevel8;
		} else {
			music = bgMusicLevel1;
		}
		this.currentLevel = level;
		this._switchMusic(music);
	}

	/**
	 * Call this when the level changes during the game
	 */
	public handleLevelChange(newLevel: number) {
		// Only switch if the music track should change
		if (
			(this.currentLevel < 8 && newLevel >= 8) ||
			(this.currentLevel < 15 && newLevel >= 15)
		) {
			this.playGameMusic(newLevel);
		}
		this.currentLevel = newLevel;
	}

	/**
	 * Call this to stop all music (e.g. on game over)
	 */
	public stopMusic() {
		if (this.currentMusic) {
			this.currentMusic.pause();
			this.currentMusic.currentTime = 0;
		}
		this.currentMusic = null;
	}

	/**
	 * Internal: switch to a new music track, pausing any previous
	 */
	private _switchMusic(music: HTMLAudioElement) {
		if (this.currentMusic && this.currentMusic !== music) {
			this.currentMusic.pause();
			this.currentMusic.currentTime = 0;
		}
		this.currentMusic = music;
		if (musicVolume > 0) {
			music.volume = musicVolume;
			this.startMusic();
			music.play().catch((error) => {
				console.log("Error playing music:", error);
			});
		}
	}

	public playSoundEffect(effect: keyof typeof soundEffects) {
		const sound = soundEffects[effect];
		if (sfxVolume > 0) {
			sound.currentTime = 0;
			sound.volume = sfxVolume;
			this.startMusic();
			sound.play().catch((error) => {
				console.log("Error playing sound:", error);
			});
		}
	}

	public startMusic() {
		if (audioContext.state === "suspended") {
			audioContext.resume();
		}
	}

	public pauseMusic() {
		if (this.currentMusic) {
			this.currentMusic.pause();
		}
	}

	public resetMusic() {
		if (this.currentMusic) {
			this.currentMusic.currentTime = 0;
			this.currentMusic.pause();
		}
	}

	public initializeControls() {
		// Get audio controls dynamically
		const musicVolumeSlider = document.getElementById("music-volume") as HTMLInputElement;
		const sfxVolumeSlider = document.getElementById("sfx-volume") as HTMLInputElement;
		const musicMinBtn = document.getElementById("music-min") as HTMLButtonElement;
		const musicMaxBtn = document.getElementById("music-max") as HTMLButtonElement;
		const sfxMinBtn = document.getElementById("sfx-min") as HTMLButtonElement;
		const sfxMaxBtn = document.getElementById("sfx-max") as HTMLButtonElement;

		// Music volume slider
		if (musicVolumeSlider) {
			musicVolumeSlider.addEventListener("input", () => {
				musicVolume = parseInt(musicVolumeSlider.value, 10) / 100;
				bgMusicLevel1.volume = musicVolume;
				// Don't call updateMusic() here - just update volume
				// Let main.ts handle play/pause state based on game conditions
			});
		}
		// SFX volume slider
		if (sfxVolumeSlider) {
			sfxVolumeSlider.addEventListener("input", () => {
				sfxVolume = parseInt(sfxVolumeSlider.value, 10) / 100;
			});
		}
		// Min/max buttons for music
		if (musicMinBtn && musicVolumeSlider) {
			musicMinBtn.addEventListener("click", () => {
				musicVolume = 0;
				musicVolumeSlider.value = "0";
				bgMusicLevel1.volume = 0;
				// Don't call updateMusic() - just set volume to 0
			});
		}
		if (musicMaxBtn && musicVolumeSlider) {
			musicMaxBtn.addEventListener("click", () => {
				musicVolume = 1;
				musicVolumeSlider.value = "100";
				bgMusicLevel1.volume = 1;
				// Don't call updateMusic() - just set volume to 1
			});
		}
		// Min/max buttons for SFX
		if (sfxMinBtn && sfxVolumeSlider) {
			sfxMinBtn.addEventListener("click", () => {
				sfxVolume = 0;
				sfxVolumeSlider.value = "0";
				Object.values(soundEffects).forEach((s) => (s.volume = 0));
			});
		}
		if (sfxMaxBtn && sfxVolumeSlider) {
			sfxMaxBtn.addEventListener("click", () => {
				sfxVolume = 1;
				sfxVolumeSlider.value = "100";
				Object.values(soundEffects).forEach((s) => (s.volume = 1));
			});
		}
	}
}
