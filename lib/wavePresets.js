/**
 * Wave animation presets with different characteristics
 *
 * Each preset defines a complete set of wave animation parameters
 * to create different visual effects and behaviors.
 */
export const WAVE_PRESETS = {
  style1: {
    waveTimeMultiplierX: 0.005,
    waveTimeMultiplierY: 0.01,
    waveFrequencyX: 0.002,
    waveFrequencyY: 0.002,
    waveNoiseAmplitude: 6,
    waveHorizontalAmplitude: 12,
    waveVerticalAmplitude: 3,
    mouseInfluenceRadiusBase: 150,
    mouseWaveFrequency: 0.001,
    mouseInfluenceStrength: 0.00035,
    cursorRestorationForce: 0.005,
    cursorDamping: 0.95,
    cursorPositionLimit: 100,
    line_gap: 10,
    point_gap: 10,
    axis: 'vertical',
  },
  style2: {
    waveTimeMultiplierX: 0.012,
    waveTimeMultiplierY: 0.004,
    waveFrequencyX: 0.001,
    waveFrequencyY: 0.0008,
    waveNoiseAmplitude: 12,
    waveHorizontalAmplitude: 12,
    waveVerticalAmplitude: 8,
    mouseInfluenceRadiusBase: 150,
    mouseWaveFrequency: 0.0005,
    mouseInfluenceStrength: 0.0007,
    cursorRestorationForce: 0.005,
    cursorDamping: 0.98,
    cursorPositionLimit: 50,
    line_gap: 10,
    point_gap: 15,
    axis: 'vertical',
  },
  style3: {
    waveTimeMultiplierX: 0.09,
    waveTimeMultiplierY: 0.001,
    waveFrequencyX: 0.001,
    waveFrequencyY: 0.002,
    waveNoiseAmplitude: 4,
    waveHorizontalAmplitude: 32,
    waveVerticalAmplitude: 16,
    mouseInfluenceRadiusBase: 100,
    mouseWaveFrequency: 0.0007,
    mouseInfluenceStrength: 0.0007,
    cursorRestorationForce: 0.005,
    cursorDamping: 0.97,
    cursorPositionLimit: 50,
    line_gap: 12,
    point_gap: 10,
    axis: 'vertical',
  },

  style4: {
    waveTimeMultiplierX: 0.01,
    waveTimeMultiplierY: 0.005,
    waveFrequencyX: 0.002,
    waveFrequencyY: 0.002,
    waveNoiseAmplitude: 6,
    waveHorizontalAmplitude: 3,
    waveVerticalAmplitude: 24,
    mouseInfluenceRadiusBase: 150,
    mouseWaveFrequency: 0.001,
    mouseInfluenceStrength: 0.00035,
    cursorRestorationForce: 0.005,
    cursorDamping: 0.95,
    cursorPositionLimit: 100,
    line_gap: 10,
    point_gap: 10,
    axis: 'horizontal',
  },

  style5: {
    waveTimeMultiplierX: 0.004,
    waveTimeMultiplierY: 0.012,
    waveFrequencyX: 0.0008,
    waveFrequencyY: 0.001,
    waveNoiseAmplitude: 12,
    waveHorizontalAmplitude: 8,
    waveVerticalAmplitude: 12,
    mouseInfluenceRadiusBase: 150,
    mouseWaveFrequency: 0.0005,
    mouseInfluenceStrength: 0.0007,
    cursorRestorationForce: 0.005,
    cursorDamping: 0.98,
    cursorPositionLimit: 50,
    line_gap: 10,
    point_gap: 15,
    axis: 'horizontal',
  },

  style6: {
    waveTimeMultiplierX: 0.003,
    waveTimeMultiplierY: 0.05,
    waveFrequencyX: 0.0015,
    waveFrequencyY: 0.002,
    waveNoiseAmplitude: 4,
    waveHorizontalAmplitude: 16,
    waveVerticalAmplitude: 32,
    mouseInfluenceRadiusBase: 100,
    mouseWaveFrequency: 0.0007,
    mouseInfluenceStrength: 0.0007,
    cursorRestorationForce: 0.005,
    cursorDamping: 0.97,
    cursorPositionLimit: 50,
    line_gap: 12,
    point_gap: 10,
    axis: 'horizontal',
  },
  style7: {
    waveTimeMultiplierX: 0.1,
    waveTimeMultiplierY: 0.03,
    waveFrequencyX: 0.001,
    waveFrequencyY: 0.0004,
    waveNoiseAmplitude: 6,
    waveHorizontalAmplitude: 12,
    waveVerticalAmplitude: 8,
    mouseInfluenceRadiusBase: 150,
    mouseWaveFrequency: 0.00002,
    mouseInfluenceStrength: 0.0002,
    cursorRestorationForce: 0.005,
    cursorDamping: 0.95,
    cursorPositionLimit: 50,
    line_gap: 100,
    point_gap: 15,
    axis: 'horizontal',
  },
  style8: {
    waveTimeMultiplierX: 0.2,
    waveTimeMultiplierY: 0.1,
    waveFrequencyX: 0.0001,
    waveFrequencyY: 0.001,
    waveNoiseAmplitude: 6,
    waveHorizontalAmplitude: 1,
    waveVerticalAmplitude: 24,
    mouseInfluenceRadiusBase: 200,
    mouseWaveFrequency: 0.00002,
    mouseInfluenceStrength: 0.0001,
    cursorRestorationForce: 0.007,
    cursorDamping: 0.97,
    cursorPositionLimit: 100,
    line_gap: 100,
    point_gap: 15,
    axis: 'horizontal',
  },
  style9: {
    waveTimeMultiplierX: 0.1,
    waveTimeMultiplierY: 0.1,
    waveFrequencyX: 0.001,
    waveFrequencyY: 0.0005,
    waveNoiseAmplitude: 6,
    waveHorizontalAmplitude: 24,
    waveVerticalAmplitude: 1,
    mouseInfluenceRadiusBase: 150,
    mouseWaveFrequency: 0.00001,
    mouseInfluenceStrength: 0.0002,
    cursorRestorationForce: 0.005,
    cursorDamping: 0.95,
    cursorPositionLimit: 100,
    line_gap: 100,
    point_gap: 15,
    axis: 'vertical',
  },
  style10: {
    waveTimeMultiplierX: 0.1,
    waveTimeMultiplierY: 0.03,
    waveFrequencyX: 0.0005,
    waveFrequencyY: 0.001,
    waveNoiseAmplitude: 6,
    waveHorizontalAmplitude: 1,
    waveVerticalAmplitude: 24,
    mouseInfluenceRadiusBase: 200,
    mouseWaveFrequency: 0.000015,
    mouseInfluenceStrength: 0.0001,
    cursorRestorationForce: 0.007,
    cursorDamping: 0.97,
    cursorPositionLimit: 100,
    line_gap: 100,
    point_gap: 10,
    axis: 'horizontal',
  },
  style11: {
    waveTimeMultiplierX: 0.03,
    waveTimeMultiplierY: 0.1,
    waveFrequencyX: 0.0004,
    waveFrequencyY: 0.001,
    waveNoiseAmplitude: 6,
    waveHorizontalAmplitude: 8,
    waveVerticalAmplitude: 12,
    mouseInfluenceRadiusBase: 150,
    mouseWaveFrequency: 0.00002,
    mouseInfluenceStrength: 0.0001,
    cursorRestorationForce: 0.005,
    cursorDamping: 0.95,
    cursorPositionLimit: 50,
    line_gap: 100,
    point_gap: 15,
    axis: 'vertical',
  },

  style12: {
    waveTimeMultiplierX: 0.1,
    waveTimeMultiplierY: 0.2,
    waveFrequencyX: 0.001,
    waveFrequencyY: 0.0001,
    waveNoiseAmplitude: 6,
    waveHorizontalAmplitude: 24,
    waveVerticalAmplitude: 1,
    mouseInfluenceRadiusBase: 150,
    mouseWaveFrequency: 0.00001,
    mouseInfluenceStrength: 0.0002,
    cursorRestorationForce: 0.005,
    cursorDamping: 0.95,
    cursorPositionLimit: 100,
    line_gap: 100,
    point_gap: 15,
    axis: 'vertical',
  },
}

/**
 * Get available preset names
 * @returns {string[]} Array of available preset names
 */
export function getAvailablePresets() {
  return Object.keys(WAVE_PRESETS)
}

/**
 * Get a specific preset configuration
 * @param {string} presetName - Name of the preset, 'random' for random selection, 'random_complex' for styles 1-6, or 'random_simple' for styles 7-12
 * @param {Object} [bounds] - Optional bounds object with width and height properties for conditional line_gap logic
 * @param {number} [bounds.width] - Container width
 * @param {number} [bounds.height] - Container height
 * @returns {Object} Preset configuration object
 */
export function getPreset(presetName, bounds = null) {
  let selectedPresetName = presetName

  if (presetName === 'random') {
    const availablePresets = Object.keys(WAVE_PRESETS)
    const randomIndex = Math.floor(Math.random() * availablePresets.length)
    selectedPresetName = availablePresets[randomIndex]
  } else if (presetName === 'random_complex') {
    const complexPresets = ['style1', 'style2', 'style3', 'style4', 'style5', 'style6']
    const randomIndex = Math.floor(Math.random() * complexPresets.length)
    selectedPresetName = complexPresets[randomIndex]
  } else if (presetName === 'random_simple') {
    const simplePresets = ['style7', 'style8', 'style9', 'style10', 'style11', 'style12']
    const randomIndex = Math.floor(Math.random() * simplePresets.length)
    selectedPresetName = simplePresets[randomIndex]
  }

  // Get the base preset
  const preset = { ...(WAVE_PRESETS[selectedPresetName] || WAVE_PRESETS.style1) }

  // Apply conditional line_gap logic if bounds are provided
  if (bounds) {
    if (['style7', 'style8', 'style9'].includes(selectedPresetName)) {
      // For style7, style8, style9: line gap based on width
      if (bounds.width < 500) {
        preset.line_gap = 25
      } else if (bounds.width < 1000) {
        preset.line_gap = 50
      }
    } else if (['style10', 'style11', 'style12'].includes(selectedPresetName)) {
      // For style10, style11, style12: line gap based on height
      if (bounds.height < 300) {
        preset.line_gap = 25
      } else if (bounds.height < 500) {
        preset.line_gap = 50
      }
    }
  }

  return preset
}
