export class PresetManager {
    constructor() {
        this.customPresets = this.loadCustomPresets();
    }
    loadPreset(presetId) {
        return this.customPresets[presetId] || null;
    }
}