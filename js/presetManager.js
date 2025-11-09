export class PresetManager {
    constructor() {
        this.customPresets = this.loadCustomPresets();
    }
    loadCustomPresets() {
        const stored = localStorage.getItem('ambientMixerPresets');
        return stored ? JSON.parse(stored) : {};
    }
    loadPreset(presetId) {
        return this.customPresets[presetId] || null;
    }
}