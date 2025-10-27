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
    this.masterVolume = 100;
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
    });

    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('volume-slider')) {
        const soundId = e.target.dataset.sound;
        const volume = parseInt(e.target.value);
        console.log(soundId,volume)
        this.setSoundVolume(soundId, volume);
      }
    });

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

  setSoundVolume(soundId, volume) {
    this.currentSoundState[soundId] = volume;

    const effectiveVolume = (volume * this.masterVolume) / 100;

    const audio = this.soundManager.audioElements.get(soundId);
    console.log("Volume is:",volume)

    if (audio) {
    console.log("Audio is",audio)
      audio.volume = effectiveVolume/100;
    }

    this.ui.updateVolumeDisplay(soundId, volume);

    this.updateMainPlayButtonState();
  }

  updateMainPlayButtonState() {
    let anySoundsPlaying = false;
    for (const [soundId, audio] of this.soundManager.audioElements) {
      if (!audio.paused) {
        anySoundsPlaying = true;
        break;
      }
    }

    this.soundManager.isPlaying = anySoundsPlaying;
    this.ui.updateMainPlayButton(anySoundsPlaying);
  }

}

document.addEventListener("DOMContentLoaded",()=>{
        const app=new AmbientMixer;
        app.init()
})