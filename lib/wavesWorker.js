import { createNoise2D } from 'simplex-noise'
import { getPreset } from './wavePresets.js'

class WavesWorker {
  constructor() {
    this.noise = createNoise2D()
    this.lines = []
    this.axis = 'vertical'
    this.direction = 'forward'
    this.directionMultiplier = -1 // forward = -1, backward = 1
    this.mouse = {
      sx: 0,
      sy: 0,
      vs: 0,
      a: 0,
    }

    // Apply default preset
    this.applyPreset(getPreset('style1'))
  }

  /**
   * Apply a wave animation preset
   * @param {string} preset
   */
  applyPreset(preset) {
    // Apply all preset values
    Object.assign(this, preset)
  }

  initLines(linesData, axis = 'vertical', direction = 'forward') {
    this.axis = axis
    this.updateDirection(direction)
    this.lines = linesData.map((points) =>
      points.map((point) => ({
        ...point,
        wave: { x: 0, y: 0 },
        cursor: { x: 0, y: 0, vx: 0, vy: 0 },
      }))
    )
  }

  updateDirection(direction) {
    this.direction = direction
    this.directionMultiplier = direction === 'forward' ? -1 : 1
  }

  updateMouse(mouseData) {
    // Map new property names to worker expectations
    const mappedData = {
      sx: mouseData.smoothX,
      sy: mouseData.smoothY,
      vs: mouseData.smoothVelocity,
      a: mouseData.angle,
    }
    this.mouse = { ...this.mouse, ...mappedData }
  }

  movePoints(time) {
    this.lines.forEach((points) => {
      points.forEach((p) => {
        // Wave movement with direction multiplier
        const move =
          this.noise(
            (p.x + time * this.waveTimeMultiplierX * this.directionMultiplier) * this.waveFrequencyX,
            (p.y + time * this.waveTimeMultiplierY * this.directionMultiplier) * this.waveFrequencyY
          ) * this.waveNoiseAmplitude

        p.wave.x = Math.cos(move) * this.waveHorizontalAmplitude
        p.wave.y = Math.sin(move) * this.waveVerticalAmplitude

        // Mouse effect
        const dx = p.x - this.mouse.sx
        const dy = p.y - this.mouse.sy
        const distance = Math.hypot(dx, dy)
        const influenceRadius = Math.max(this.mouseInfluenceRadiusBase, this.mouse.vs)

        if (distance < influenceRadius) {
          const influenceStrength = 1 - distance / influenceRadius
          const waveFactor = Math.cos(distance * this.mouseWaveFrequency) * influenceStrength

          p.cursor.vx +=
            Math.cos(this.mouse.a) * waveFactor * influenceRadius * this.mouse.vs * this.mouseInfluenceStrength
          p.cursor.vy +=
            Math.sin(this.mouse.a) * waveFactor * influenceRadius * this.mouse.vs * this.mouseInfluenceStrength
        }

        // Cursor physics
        p.cursor.vx += (0 - p.cursor.x) * this.cursorRestorationForce
        p.cursor.vy += (0 - p.cursor.y) * this.cursorRestorationForce

        p.cursor.vx *= this.cursorDamping
        p.cursor.vy *= this.cursorDamping

        p.cursor.x += p.cursor.vx
        p.cursor.y += p.cursor.vy

        p.cursor.x = Math.min(this.cursorPositionLimit, Math.max(-this.cursorPositionLimit, p.cursor.x))
        p.cursor.y = Math.min(this.cursorPositionLimit, Math.max(-this.cursorPositionLimit, p.cursor.y))
      })
    })
  }

  calculatePaths() {
    return this.lines.map((points) => {
      if (points.length < 2) return ''

      // First point (without cursor force)
      const firstPoint = {
        x: points[0].x + points[0].wave.x,
        y: points[0].y + points[0].wave.y,
      }
      let d = `M ${firstPoint.x} ${firstPoint.y}`

      // Connect points with lines (with cursor force)
      for (let i = 1; i < points.length; i++) {
        const current = {
          x: points[i].x + points[i].wave.x + points[i].cursor.x,
          y: points[i].y + points[i].wave.y + points[i].cursor.y,
        }
        d += `L ${current.x} ${current.y}`
      }

      return d
    })
  }

  processFrame(data) {
    const { time, mouseData } = data

    // Update mouse data
    this.updateMouse(mouseData)

    // Calculate point movements
    this.movePoints(time)

    // Calculate path data
    const pathData = this.calculatePaths()

    return {
      type: 'frame-result',
      pathData,
    }
  }
}

// Worker instance
const wavesWorker = new WavesWorker()

// Message handler
self.addEventListener('message', (event) => {
  const { type, data } = event.data

  try {
    switch (type) {
      case 'init':
        wavesWorker.initLines(data.lines, data.axis, data.direction)
        self.postMessage({ type: 'init-complete' })
        break

      case 'process-frame':
        const result = wavesWorker.processFrame(data)
        self.postMessage(result)
        break

      case 'apply-preset':
        wavesWorker.applyPreset(data.preset)
        self.postMessage({ type: 'preset-applied', preset: data.preset })
        break

      case 'update-direction':
        wavesWorker.updateDirection(data.direction)
        self.postMessage({ type: 'direction-updated', direction: data.direction })
        break

      default:
        console.warn('Unknown message type:', type)
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
    })
  }
})
