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

    savePreset(name, soundStates) {
        const presetId = `custom-${Date.now()}`;

        const preset = {
            name,
            sounds: {},
        };

        for (const [soundId, volume] of Object.entries(soundStates)) {
            if (volume > 0) {
                preset.sounds[soundId] = volume;
            }
        }

        this.customPresets[presetId] = preset;
        this.saveCustomPresets();

        return presetId;
    }


}