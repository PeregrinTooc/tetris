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

Object.values(soundEffects).forEach((sound) => {
	sound.preload = "auto";
});

const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
const audioContext = new AudioContext();

const musicGainNode = audioContext.createGain();
const sfxGainNode = audioContext.createGain();
musicGainNode.connect(audioContext.destination);
sfxGainNode.connect(audioContext.destination);

musicGainNode.gain.value = 1.0;
sfxGainNode.gain.value = 1.0;

const musicSources = new Map<HTMLAudioElement, MediaElementAudioSourceNode>();
const sfxSources = new Map<HTMLAudioElement, MediaElementAudioSourceNode>();

function connectMusicToGainNode(audio: HTMLAudioElement) {
	if (!musicSources.has(audio)) {
		const source = audioContext.createMediaElementSource(audio);
		source.connect(musicGainNode);
		musicSources.set(audio, source);
	}
}

function connectSfxToGainNode(audio: HTMLAudioElement) {
	if (!sfxSources.has(audio)) {
		const source = audioContext.createMediaElementSource(audio);
		source.connect(sfxGainNode);
		sfxSources.set(audio, source);
	}
}

connectMusicToGainNode(mainMenuMusic);
connectMusicToGainNode(bgMusicLevel1);
connectMusicToGainNode(bgMusicLevel8);
connectMusicToGainNode(bgMusicLevel15);

Object.values(soundEffects).forEach((sound) => {
	connectSfxToGainNode(sound);
});

let musicVolume = 1.0;
let sfxVolume = 1.0;

const MUTE_STORAGE_KEY = "tetris-muted";

function loadMuteState(): boolean {
	const stored = localStorage.getItem(MUTE_STORAGE_KEY);
	if (stored === null) {
		return true;
	}
	return stored === "true";
}

function saveMuteState(muted: boolean): void {
	localStorage.setItem(MUTE_STORAGE_KEY, String(muted));
}

export class AudioManager {
	private currentMusic: HTMLAudioElement | null = null;
	private currentLevel: number = 1;
	private muted: boolean;
	private savedMusicVolume: number = 1.0;
	private savedSfxVolume: number = 1.0;

	constructor() {
		this.muted = loadMuteState();
		if (this.muted) {
			musicGainNode.gain.value = 0;
			sfxGainNode.gain.value = 0;
		} else {
			this.savedMusicVolume = musicVolume;
			this.savedSfxVolume = sfxVolume;
		}
	}

	public isMuted(): boolean {
		return this.muted;
	}

	public toggleMute(): void {
		this.muted = !this.muted;
		saveMuteState(this.muted);

		if (this.muted) {
			musicGainNode.gain.value = 0;
			sfxGainNode.gain.value = 0;
		} else {
			musicGainNode.gain.value = musicVolume;
			sfxGainNode.gain.value = sfxVolume;
		}
	}

	public setMuted(muted: boolean): void {
		if (this.muted !== muted) {
			this.toggleMute();
		}
	}

	public playMainMenuMusic() {
		this._switchMusic(mainMenuMusic);
	}

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

	public handleLevelChange(newLevel: number) {
		if (
			(this.currentLevel < 8 && newLevel >= 8) ||
			(this.currentLevel < 15 && newLevel >= 15)
		) {
			this.playGameMusic(newLevel);
		}
		this.currentLevel = newLevel;
	}

	public stopMusic() {
		if (this.currentMusic) {
			this.currentMusic.pause();
			this.currentMusic.currentTime = 0;
		}
		this.currentMusic = null;
	}

	private _switchMusic(music: HTMLAudioElement) {
		if (this.currentMusic && this.currentMusic !== music) {
			this.currentMusic.pause();
			this.currentMusic.currentTime = 0;
		}
		this.currentMusic = music;
		if (!this.muted && musicVolume > 0) {
			this.startMusic();
			music.play().catch((error) => {
				console.log("Error playing music:", error);
			});
		}
	}

	public playSoundEffect(effect: keyof typeof soundEffects) {
		const sound = soundEffects[effect];
		if (!this.muted && sfxVolume > 0) {
			sound.currentTime = 0;
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
		const musicVolumeSlider = document.getElementById("music-volume") as HTMLInputElement;
		const sfxVolumeSlider = document.getElementById("sfx-volume") as HTMLInputElement;
		const musicMinBtn = document.getElementById("music-min") as HTMLButtonElement;
		const musicMaxBtn = document.getElementById("music-max") as HTMLButtonElement;
		const sfxMinBtn = document.getElementById("sfx-min") as HTMLButtonElement;
		const sfxMaxBtn = document.getElementById("sfx-max") as HTMLButtonElement;

		if (musicVolumeSlider) {
			musicVolumeSlider.addEventListener("input", () => {
				const newVolume = parseInt(musicVolumeSlider.value, 10) / 100;
				const wasZero = musicVolume === 0;
				musicVolume = newVolume;
				musicGainNode.gain.value = musicVolume;
				if (this.currentMusic) {
					if (wasZero && musicVolume > 0 && this.currentMusic.paused) {
						this.currentMusic.play().catch((err) => console.log("Play failed:", err));
					} else if (musicVolume === 0 && !this.currentMusic.paused) {
						this.currentMusic.pause();
					}
				}
			});
		}

		if (sfxVolumeSlider) {
			sfxVolumeSlider.addEventListener("input", () => {
				sfxVolume = parseInt(sfxVolumeSlider.value, 10) / 100;
				sfxGainNode.gain.value = sfxVolume;
			});
		}

		if (musicMinBtn && musicVolumeSlider) {
			musicMinBtn.addEventListener("click", () => {
				musicVolumeSlider.value = "0";
				musicVolumeSlider.dispatchEvent(new Event("input", { bubbles: true }));
			});
		}

		if (musicMaxBtn && musicVolumeSlider) {
			musicMaxBtn.addEventListener("click", () => {
				musicVolumeSlider.value = "100";
				musicVolumeSlider.dispatchEvent(new Event("input", { bubbles: true }));
			});
		}

		if (sfxMinBtn && sfxVolumeSlider) {
			sfxMinBtn.addEventListener("click", () => {
				sfxVolumeSlider.value = "0";
				sfxVolumeSlider.dispatchEvent(new Event("input", { bubbles: true }));
			});
		}

		if (sfxMaxBtn && sfxVolumeSlider) {
			sfxMaxBtn.addEventListener("click", () => {
				sfxVolumeSlider.value = "100";
				sfxVolumeSlider.dispatchEvent(new Event("input", { bubbles: true }));
			});
		}
	}
}
