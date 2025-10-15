import { sounds,defaultPresets } from "./soundData.js";
import { SoundManager } from "./soundManager.js";

class AmbientMixer {
  constructor() {
    this.soundManager = new SoundManager();
    this.ui = null;
    this.presetManager = null;
    this.timer = null;
    this.currentSoundState = {};
    this.isInitialized = false;
  }
  async init() {
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
}

document.addEventListener("DOMContentLoaded",()=>{
        const app=new AmbientMixer;
        app.init()
})