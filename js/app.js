import { sounds, defaultPresets } from "./soundData.js";
import { SoundManager } from "./soundManager.js";
import { PresetManager } from './presetManager.js';
import { UI } from "./ui.js";
import { Timer } from "./timer.js";

class AmbientMixer {
  constructor() {
    this.soundManager = new SoundManager();
    this.ui = new UI();
    this.presetManager = new PresetManager();
    this.timer = new Timer(
      () => this.onTimerComplete(),
      (minutes, seconds) => this.ui.updateTimerDisplay(minutes, seconds)
    );
    this.currentSoundState = {};
    this.masterVolume = 100;
    this.isInitialized = false;
  }
  async init() {

    try {
      this.ui.init();
      this.ui.renderSoundCards(sounds)
      this.setupEventListeners()

      this.loadCustomPresetsUI(); ``
      this.loadAllSounds();
      sounds.forEach((sound) => {
        this.currentSoundState[sound.id] = 0;
      })
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize app: ', error);
    }


  }


  async loadAllSounds() {
    sounds.forEach(async (sound) => {
      const audioUrl = `audio/${sound.file}`;
      const success = await this.soundManager.loadSound(sound.id, audioUrl);
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

      if (e.target.closest('.delete-preset')) {
        e.stopPropagation();
        const presetId = e.target.closest('.delete-preset').dataset.preset;

        this.deleteCustomPreset(presetId);

        return;
      }

      if (e.target.closest('.preset-btn')) {
        const presetKey = e.target.closest('.preset-btn').dataset.preset;
        await this.loadPreset(presetKey);
      }

      if (e.target.closest('.custom-preset-btn')) {
        const presetKey = e.target.closest('.custom-preset-btn').dataset.preset;
        await this.loadPreset(presetKey, true);
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('volume-slider')) {
        const soundId = e.target.dataset.sound;
        const volume = parseInt(e.target.value);
        console.log(soundId, volume)
        this.setSoundVolume(soundId, volume);
      }
    });

    const masterVolumeSlider = document.getElementById('masterVolume');
    if (masterVolumeSlider) {
      masterVolumeSlider.addEventListener('input', (e) => {
        const volume = parseInt(e.target.value);
        this.setMasterVolume(volume);
      });
    }

    if (this.ui.playPauseButton) {
      this.ui.playPauseButton.addEventListener('click', () => {
        this.toggleAllSounds();
      });
    }

    if (this.ui.resetButton) {
      this.ui.resetButton.addEventListener('click', () => {
        this.resetAll();
      });
    }
    const saveButton = document.getElementById('savePreset');
    if (saveButton) {
      saveButton.addEventListener('click', () => {
        this.showSavePresetModal();
      });
    }

    const confirmSaveButton = document.getElementById('confirmSave');
    if (confirmSaveButton) {
      confirmSaveButton.addEventListener('click', () => {
        this.saveCurrentPreset();
      });
    }

    const cancelSaveButton = document.getElementById('cancelSave');
    if (cancelSaveButton) {
      cancelSaveButton.addEventListener('click', () => {
        this.ui.hideModal();
      });
    }

    if (this.ui.modal) {
      this.ui.modal.addEventListener('click', (e) => {
        if (e.target === this.ui.modal) {
          this.ui.hideModal();
        }
      });
    }


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

  toggleAllSounds() {
    if (this.soundManager.isPlaying) {
      this.soundManager.pauseAll();
      this.ui.updateMainPlayButton(false);
      sounds.forEach((sound) => {
        this.ui.updateSoundPlayButton(sound.id, false);
      });
    } else {
      for (const [soundId, audio] of this.soundManager.audioElements) {
        const card = document.querySelector(`[data-sound=${soundId}]`);
        const slider = card?.querySelector('.volume-slider');

        if (slider) {
          let volume = parseInt(slider.value);

          if (volume === 0) {
            volume = 50;
            slider.value = 50;
            this.ui.updateVolumeDisplay(soundId, 50);
          }

          this.currentSoundState[soundId] = volume;

          const effectiveVolume = (volume * this.masterVolume) / 100;
          audio.volume = effectiveVolume / 100;
          this.ui.updateSoundPlayButton(soundId, true);
        }
      }

      this.soundManager.playAll();

      this.ui.updateMainPlayButton(true);
    }
  }


  setSoundVolume(soundId, volume) {
    this.currentSoundState[soundId] = volume;

    const effectiveVolume = (volume * this.masterVolume) / 100;

    const audio = this.soundManager.audioElements.get(soundId);
    console.log("Volume is:", volume)

    if (audio) {
      console.log("Audio is", audio)
      audio.volume = effectiveVolume / 100;
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

  setMasterVolume(volume) {
    this.masterVolume = volume;


    const masterVolumeValue = document.getElementById('masterVolumeValue');
    if (masterVolumeValue) {
      masterVolumeValue.textContent = `${volume}%`;
    }

    this.applyMasterVolumeToAll();
  }

  applyMasterVolumeToAll() {
    for (const [soundId, audio] of this.soundManager.audioElements) {
      if (!audio.paused) {
        const card = document.querySelector(`[data-sound="${soundId}"]`);
        const slider = card?.querySelector('.volume-slider');

        if (slider) {
          const individualVolume = parseInt(slider.value);
          const effectiveVolume = (individualVolume * this.masterVolume) / 100;

          audio.volume = effectiveVolume / 100;
        }
      }
    }
  }

  resetAll() {
    this.soundManager.stopAll();

    this.masterVolume = 100;

    this.timer.stop();
    if (this.ui.timerSelect) {
      this.ui.timerSelect.value = '0';
    }

    this.ui.setActivePreset(null);

    sounds.forEach((sound) => {
      this.currentSoundState[sound.id] = 0;
    });

    this.ui.resetUI();
  }

  loadPreset(presetKey, custom = false) {
    let preset;

    if (custom) {
      preset = this.presetManager.loadPreset(presetKey);
    } else {
      preset = defaultPresets[presetKey];
    }

    if (!preset) {
      console.error(`Preset ${presetKey} not found`);
      return;
    }

    this.soundManager.stopAll();


    sounds.forEach((sound) => {
      this.currentSoundState[sound.id] = 0;
      this.ui.updateVolumeDisplay(sound.id, 0);
      this.ui.updateSoundPlayButton(sound.id, false);
    });


    for (const [soundId, volume] of Object.entries(preset.sounds)) {

      this.currentSoundState[soundId] = volume;


      this.ui.updateVolumeDisplay(soundId, volume);


      const effectiveVolume = (volume * this.masterVolume) / 100;


      const audio = this.soundManager.audioElements.get(soundId);

      if (audio) {
        audio.volume = effectiveVolume / 100;

        audio.play();
        this.ui.updateSoundPlayButton(soundId, true);
      }
    }

    this.soundManager.isPlaying = true;
    this.ui.updateMainPlayButton(true);

    if (presetKey) {
      this.ui.setActivePreset(presetKey);
    }
  }
  showSavePresetModal() {
    const hasActiveSounds = Object.values(this.currentSoundState).some(
      (v) => v > 0
    );

    if (!hasActiveSounds) {
      alert('No active sounds for preset');
      return;
    }

    this.ui.showModal();
  }

  saveCurrentPreset() {
    const nameInput = document.getElementById('presetName');
    const name = nameInput.value.trim();

    if (!name) {
      alert('Please enter a preset name');
      return;
    }

    if (this.presetManager.presetNameExists(name)) {
      alert(`A preset with the name ${name} already exists`);
      return;
    }

    const presetId = this.presetManager.savePreset(
      name,
      this.currentSoundState
    );
    this.ui.addCustomPreset(name, presetId);

    this.ui.addCustomPreset(name, presetId);

    this.ui.hideModal();

    console.log(`Preset "${name}" saved successfully with ID: ${presetId}`);
  }

  loadCustomPresetsUI() {
    const customPresets = this.presetManager.customPresets;
    for (const [presetId, preset] of Object.entries(customPresets)) {
      this.ui.addCustomPreset(preset.name, presetId);
    }
  }
  deleteCustomPreset(presetId) {
    if (this.presetManager.deletePreset(presetId)) {
      this.ui.removeCustomPreset(presetId);
      console.log(`Preset ${presetId} deleted`);
    }
  }

}

document.addEventListener("DOMContentLoaded", () => {
  const app = new AmbientMixer;
  app.init()
})