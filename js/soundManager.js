export class SoundManager {
  constructor() {
    this.audioElements = new Map();
    this.isPlaying = false;
  }
  loadSound(soundId, filePath) {
        return new Promise((resolve, reject) =>{
                try {
                const audio = new Audio();
                audio.src = filePath;
                audio.loop = true;
                audio.preload = 'metadata';

                // Add sound to audio elements map
                //this.audioElements.set(soundId, audio);
                // Handle async loading events
                audio.addEventListener('canplaythrough', () => {
                        this.audioElements.set(soundId, audio);
                        resolve(true);
                });

                audio.addEventListener('error', (e) => {
                        console.error(`Failed to load sound ${soundId}:`, e);
                        reject(false);
                });

                // Preload the audio
                audio.load();
                return true;
       } catch (error) {
        console.error(`Failed to load sound ${soundId}`);
        return false;
        }
        })
        
  }

  async playSound(soundId) {
    const audio = this.audioElements.get(soundId);

    if (audio) {
      try {
        await audio.play();
        return true;
      } catch (error) {
        console.error(`Failed to play ${soundId}`, error);
        return false;
      }
    }
  }

  pauseSound(soundId) {
    const audio = this.audioElements.get(soundId);

    if (audio && !audio.paused) {
      audio.pause();
    }
  }

  setVolume(soundId, volume) {
    const audio = this.audioElements.get(soundId);

    if (!audio) {
      console.error(`Sound ${soundId} not found`);
      return false;
    }

    // Convert 0-100. to 0-1
    audio.volume = volume / 100;
    return true;
  }

  playAll() {
    for (const [soundId, audio] of this.audioElements) {
      if (audio.paused) {
        audio.play();
      }
    }
    this.isPlaying = true;
  }

  pauseAll() {
    for (const [soundId, audio] of this.audioElements) {
      if (!audio.paused) {
        audio.pause();
      }
    }
    this.isPlaying = false;
  }

  stopAll() {
    for (const [soundId, audio] of this.audioElements) {
      if (!audio.paused) {
        audio.pause();
      }
      audio.currentTime = 0; // Reset to beginning
    }
    this.isPlaying = false;
  }
  
}