export class PresetManager {
    constructor() {
        this.customPresets = this.loadCustomPresets();
    }
    loadCustomPresets() {
        const stored = localStorage.getItem('ambientMixerPresets');
        return stored ? JSON.parse(stored) : {};
    }
    saveCustomPresets() {
        localStorage.setItem(
            'ambientMixerPresets',
            JSON.stringify(this.customPresets)
        );
    }
    loadPreset(presetId) {
        return this.customPresets[presetId] || null;
    }
}