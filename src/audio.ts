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
const musicToggle = document.getElementById("music-toggle") as HTMLInputElement;
const sfxToggle = document.getElementById("sfx-toggle") as HTMLInputElement;
let isMusicEnabled = true;
let isSfxEnabled = true;

export class AudioManager {
    public updateMusic(gameRunning: boolean, isPaused: boolean) {
        if (isMusicEnabled && gameRunning && !isPaused) {
            this.startMusic();
            bgMusicLevel1.play().catch(error => {
                console.log('Error playing music:', error);
            });
        } else {
            bgMusicLevel1.pause();
        }
    }


    public playSoundEffect(effect: keyof typeof soundEffects) {
        const sound = soundEffects[effect];
        if (isSfxEnabled && sound !== bgMusicLevel1) {
            sound.currentTime = 0;
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
    public initializeControls(gameRunning: boolean, isPaused: boolean) {
        if (musicToggle && sfxToggle) {
            musicToggle.addEventListener("change", () => {
                isMusicEnabled = musicToggle.checked;
                this.updateMusic(gameRunning, isPaused);
            });

            sfxToggle.addEventListener("change", () => {
                isSfxEnabled = sfxToggle.checked;
            });
        }
    }


}