// Audio management
const bgMusicLevel1 = new Audio("resources/music/fromLevel1.mp3");
const bgMusicLevel8 = new Audio("resources/music/fromLevel8.mp3");
const bgMusicLevel15 = new Audio("resources/music/fromLevel15.mp3");

bgMusicLevel1.loop = true;
bgMusicLevel1.preload = "auto";
bgMusicLevel1.volume = 0.25; // Set a default volume for background music

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
    sound.volume = 0.45; // Set a default volume for sound effects
});
soundEffects.tetrisClear.volume = 1.0; // Louder for tetris clear



// Audio context setup for handling browser autoplay restrictions
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
const audioContext = new AudioContext();
// Function to resume audio context after user interaction
export function startMusic() {
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
}
// Setup audio controls
const musicToggle = document.getElementById("music-toggle") as HTMLInputElement;
const sfxToggle = document.getElementById("sfx-toggle") as HTMLInputElement;
let isMusicEnabled = true;
let isSfxEnabled = true;

function initializeControls(gameRunning: boolean, isPaused: boolean) {
    if (musicToggle && sfxToggle) {
        musicToggle.addEventListener("change", () => {
            isMusicEnabled = musicToggle.checked;
            updateMusic(gameRunning, isPaused);
        });

        sfxToggle.addEventListener("change", () => {
            isSfxEnabled = sfxToggle.checked;
        });
    }
}

export function updateMusic(gameRunning: boolean, isPaused: boolean) {
    if (isMusicEnabled && gameRunning && !isPaused) {
        startMusic();
        bgMusicLevel1.play().catch(error => {
            console.log('Error playing music:', error);
        });
    } else {
        bgMusicLevel1.pause();
    }
}
export function playSound(sound: HTMLAudioElement) {
    if (isSfxEnabled && sound !== bgMusicLevel1) {
        sound.currentTime = 0;
        startMusic();
        sound.play().catch(error => {
            console.log('Error playing sound:', error);
        });
    }
}
export function pauseMusic(): void {
    bgMusicLevel1.pause();
}
export function resetMusic() {
    bgMusicLevel1.currentTime = 0;
    pauseMusic();
}

export class AudioManager {
    public updateMusic(gameRunning: boolean, isPaused: boolean) {
        updateMusic(gameRunning, isPaused);
    }
    public playSoundEffect(effect: keyof typeof soundEffects) {
        playSound(soundEffects[effect]);
    }

    public startMusic() {
        startMusic();
    }

    public pauseMusic() {
        pauseMusic();
    }

    public resetMusic() {
        resetMusic();
    }
    public initializeControls(gameRunning: boolean, isPaused: boolean) {
        initializeControls(gameRunning, isPaused);
    }


}