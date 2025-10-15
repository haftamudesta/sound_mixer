import { sounds,defaultPresets } from "./soundData.js";
import { SoundManager } from "./soundManager.js";
import {UI} from "./ui.js"

class AmbientMixer {
  constructor() {
    this.soundManager = new SoundManager();
    this.ui = new UI();
    this.presetManager = null;
    this.timer = null;
    this.currentSoundState = {};
    this.isInitialized = false;
  }
  async init() {
    this.ui.init();
    this.ui.renderSoundCards(sounds)
    this.setupEventListeners()
    try {
      this.loadAllSounds();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize app: ', error);
    }
  }
  async loadAllSounds() {
    sounds.forEach(async(sound) => {
      const audioUrl = `audio/${sound.file}`;
      const success =await this.soundManager.loadSound(sound.id, audioUrl);
      if (!success) {
        console.warn(`Could not load sound: ${sound.name} from ${audioUrl}`);
      }
    });
  }

  setupEventListeners() {
    document.addEventListener('click', async (e) => {
      if (e.target.closest('.play-btn')) {
        const soundId = e.target.closest('.play-btn').dataset.sound;
        await this.toggleSound(soundId);
      }
    })
}


async toggleSound(soundId) {
    const audio = this.soundManager.audioElements.get(soundId);

    if (!audio) {
      console.error(`Sound ${soundId} not found`);
      return false;
    }

    if (audio.paused) {
      
      const card = document.querySelector(`[data-sound="${soundId}"]`);
      const slider = card.querySelector('.volume-slider');
      let volume = parseInt(slider.value);

      if (volume === 0) {
        volume = 50;
        this.ui.updateVolumeDisplay(soundId, volume);
      }

      this.currentSoundState[soundId] = volume;

      this.soundManager.setVolume(soundId, volume);
      await this.soundManager.playSound(soundId);
      this.ui.updateSoundPlayButton(soundId, true);
    } else {
      this.soundManager.pauseSound(soundId);
      this.currentSoundState[soundId] = 0;
      this.ui.updateSoundPlayButton(soundId, false);

      this.currentSoundState[soundId] = 0;
    }

    this.updateMainPlayButtonState();
  }

}

document.addEventListener("DOMContentLoaded",()=>{
        const app=new AmbientMixer;
        app.init()
})