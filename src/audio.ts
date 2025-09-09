// (Testing helpers are only inside AudioManager class below)
// Audio management
const bgMusicLevel1 = new Audio("resources/music/fromLevel1.mp3");
const bgMusicLevel8 = new Audio("resources/music/fromLevel8.mp3");
const bgMusicLevel15 = new Audio("resources/music/fromLevel15.mp3");

bgMusicLevel1.loop = true;
bgMusicLevel1.preload = "auto";

export const soundEffects = {
    hardDrop: new Audio("resources/effects/hardDrop.mp3"),
    levelUp: new Audio("resources/effects/levelUp.mp3"),
    lineComplete: new Audio("resources/effects/lineCompletion.mp3"),
    tetrisClear: new Audio("resources/effects/tetrisClear.mp3"),
    gameOver: new Audio("resources/effects/gameOver.mp3"),
    locked: new Audio("resources/effects/locked.mp3")
};
// Preload all sound effects
Object.values(soundEffects).forEach(sound => {
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
    // For testing: allow direct setting of volume
    public setMusicVolume(vol: number) {
        musicVolume = vol;
        bgMusicLevel1.volume = vol;
    }
    public setSfxVolume(vol: number) {
        sfxVolume = vol;
        Object.values(soundEffects).forEach(s => s.volume = vol);
    }

    public updateMusic(gameRunning: boolean, isPaused: boolean) {
        if (musicVolume > 0 && gameRunning && !isPaused) {
            this.startMusic();
            bgMusicLevel1.volume = musicVolume;
            bgMusicLevel1.play().catch(error => {
                console.log('Error playing music:', error);
            });
        } else {
            bgMusicLevel1.pause();
        }
    }



    public playSoundEffect(effect: keyof typeof soundEffects) {
        const sound = soundEffects[effect];
        if (sfxVolume > 0 && sound !== bgMusicLevel1) {
            sound.currentTime = 0;
            sound.volume = sfxVolume;
            this.startMusic();
            sound.play().catch(error => {
                console.log('Error playing sound:', error);
            });
        }
    }

    public startMusic() {
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }
    }

    public pauseMusic() {
        bgMusicLevel1.pause();
    }

    public resetMusic() {
        bgMusicLevel1.currentTime = 0;
        this.pauseMusic();
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
                Object.values(soundEffects).forEach(s => s.volume = 0);
            });
        }
        if (sfxMaxBtn && sfxVolumeSlider) {
            sfxMaxBtn.addEventListener("click", () => {
                sfxVolume = 1;
                sfxVolumeSlider.value = "100";
                Object.values(soundEffects).forEach(s => s.volume = 1);
            });
        }
    }


}