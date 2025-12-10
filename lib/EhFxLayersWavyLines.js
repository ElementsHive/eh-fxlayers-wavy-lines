import { getPreset } from './wavePresets.js'
import wavesWorker from './wavesWorker.js?worker&inline'

const mouse = window.ElementsHiveUtils.mouse
const { isElementInViewport } = window.ElementsHiveUtils
const { getResponsiveControlValue } = window.ElementsHiveUtils.breakdance
const { safeMergeObjects } = window.ElementsHiveUtils.utils

const defaultOptions = {
  parent: null,
  container: null,
  svgEl: null,
  preset: {
    breakpoint_base: 'style1',
  },
  direction: 'forward',
  wave_animation: {
    breakpoint_base: 'enabled',
  },
  mouse_effect: {
    breakpoint_base: 'enabled',
  },
}

/**
 * Interactive 2D Waves effect with Web Worker implementation for optimal performance.
 *
 * This class creates an animated wave effect using SVG paths and offloads
 * computational tasks to a Web Worker to maintain smooth animations.
 *
 * @example
 * ```javascript
 * const waves = new EhFxLayersWavyLines({
 *   containerEl: document.querySelector('#waves-container'),
 *   svgEl: document.querySelector('#waves-svg'),
 *   preset: 'style3', // Includes axis, line_gap, and point_gap
 *   direction: 'forward', // Uses negative values (default)
 * });
 * ```
 */
export class EhFxLayersWavyLines {
  /**
   * Creates a new Interactive 2D Waves instance with Web Worker optimization.
   *
   * @param {Object} options - Configuration options for the waves effect
   * @param {string} options.id - The id of the waves effect layer
   * @param {HTMLElement} options.containerEl - The DOM element to contain the waves effect
   * @param {SVGElement} options.svg - The SVG element to use for the waves effect
   * @param {string} [options.direction='forward'] - Wave direction: 'forward' (negative values) or 'backward' (positive values)
   * @param {string} [options.preset='style1'] - Wave animation preset: 'style1', 'style2', 'style3', 'style4', 'style5', 'style6', 'style7', 'style8', 'style9', 'style10', 'style11', 'style12', or 'random' (includes axis, line_gap and point_gap)
   * @param {string} [options.wave_animation='enabled'] - Controls wave animations: 'enabled' or 'disabled'
   * @param {string} [options.mouse_effect='disabled'] - Controls mouse interaction effects: 'enabled' or 'disabled'
   *
   */
  constructor(options) {
    // Default options
    this.options = safeMergeObjects(defaultOptions, options)

    this.parent = this.options.parent
    this.container = this.options.container
    this.svgEl = this.options.svgEl
    this.direction = this.options.direction
    this.currentPresentName = getResponsiveControlValue(this.options.preset)

    this.mouse = {
      x: 0,
      y: 0,
      velocity: 0,
      smoothVelocity: 0,
      angle: 0,
    }
    this.paths = []
    this.lines = []

    this.workerReady = false
    this.isInitializing = true
    this.staticTime = null

    // // Current preset configuration
    // this.currentPreset = getPreset(this.options.preset)

    // Bind methods
    this.onResizeHandler = this.onResize.bind(this)
    this.tick = this.tick.bind(this)
    this.onWorkerMessage = this.onWorkerMessage.bind(this)
    this.updateMousePositionHandler = this.updateMousePosition.bind(this)
    this.setBoundsHandler = this.setBounds.bind(this)

    // Initialize
    this.init()
  }

  setResponsiveValues() {
    this.currentPreset = getPreset(getResponsiveControlValue(this.options.preset), this.bounds)
    this.wave_animation = getResponsiveControlValue(this.options.wave_animation)
    this.mouse_effect = getResponsiveControlValue(this.options.mouse_effect)
  }

  /**
   * Initializes the waves effect by setting up DOM, worker, and event listeners.
   *
   * @private
   * @throws {Error} When worker initialization fails
   */
  init() {
    // Initialize events
    this.initEvents()

    this.setBounds()
    this.setResponsiveValues()

    // Initialize size and lines
    this.setSize()
    this.setLines()

    // Initialize worker (required)
    this.initWorker()

    // Start animation loop only if wave animation is enabled
    // For mouse effects only, RAF will start when pointer enters container
    if (this.wave_animation === 'enabled') {
      this.rafId = requestAnimationFrame(this.tick.bind(this))
    } else {
      // When wave animation is disabled, process a single frame with random time to show static wave pattern
      this.processStaticFrame()
    }

    // Check if parent is in viewport after init and run onPointerEnter if it is
    if (isElementInViewport(this.parent)) {
      this.onPointerEnter()
    }
  }

  /**
   * Sets the bounds of the container.
   *
   * @private
   */
  setBounds() {
    this.bounds = this.container.getBoundingClientRect()
  }

  /**
   * Sets the size of the SVG element based on container dimensions.
   *
   * @private
   */
  setSize() {
    this.svgEl.style.width = `${this.bounds.width}px`
    this.svgEl.style.height = `${this.bounds.height}px`
  }

  /**
   * Creates the wave lines and points based on container dimensions and axis orientation.
   *
   * @private
   */
  setLines() {
    this.svgEl.innerHTML = ''
    // this.svgEl.innerHTML = ''
    const { width, height } = this.bounds
    this.lines = []

    // Clear existing paths
    // this.paths.forEach((path) => {
    //   path.remove()
    // })
    this.paths = []

    // Use axis from current preset
    const axis = this.currentPreset.axis || 'vertical'
    const isVertical = axis === 'vertical'

    // Use spacing values from current preset
    const lineGap = this.currentPreset.line_gap // Spacing between lines
    const pointGap = this.currentPreset.point_gap // Static spacing between points

    const oWidth = width + 200
    const oHeight = height + 200

    if (!isVertical) {
      // Create horizontal lines (paths drawn from left to right)
      const totalLines = Math.ceil(oHeight / lineGap)
      const totalPoints = Math.ceil(oWidth / pointGap)

      const xStart = (width - pointGap * totalPoints) / 2
      const yStart = (height - lineGap * totalLines) / 2

      for (let i = 0; i < totalLines; i++) {
        const points = []

        for (let j = 0; j < totalPoints; j++) {
          const point = {
            x: xStart + pointGap * j,
            y: yStart + lineGap * i,
            wave: { x: 0, y: 0 },
            cursor: { x: 0, y: 0, vx: 0, vy: 0 },
          }

          points.push(point)
        }

        // Create SVG path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.classList.add('eh-fx-layers__layer-wavy_lines__line')

        this.svgEl.appendChild(path)
        this.paths.push(path)

        // Add points
        this.lines.push(points)
      }
    } else {
      // Create vertical lines (paths drawn from top to bottom)
      const totalLines = Math.ceil(oWidth / lineGap)
      const totalPoints = Math.ceil(oHeight / pointGap)

      const xStart = (width - lineGap * totalLines) / 2
      const yStart = (height - pointGap * totalPoints) / 2

      for (let i = 0; i < totalLines; i++) {
        const points = []

        for (let j = 0; j < totalPoints; j++) {
          const point = {
            x: xStart + lineGap * i,
            y: yStart + pointGap * j,
            wave: { x: 0, y: 0 },
            cursor: { x: 0, y: 0, vx: 0, vy: 0 },
          }

          points.push(point)
        }

        // Create SVG path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.classList.add('eh-fx-layers__layer-wavy_lines__line')

        this.svgEl.appendChild(path)
        this.paths.push(path)

        // Add points
        this.lines.push(points)
      }
    }
  }

  /**
   * Initializes the Web Worker for computational tasks.
   *
   * @private
   * @throws {Error} When worker creation or initialization fails
   */
  initWorker() {
    this.worker = new wavesWorker()

    this.worker.addEventListener('message', this.onWorkerMessage)
    this.worker.addEventListener('error', (error) => {
      throw new Error(`Worker error: ${error.message}`)
    })

    // Initialize worker with line data
    if (this.lines.length > 0) {
      this.sendToWorker('init', {
        lines: this.lines,
        axis: this.currentPreset.axis || 'vertical',
        direction: this.direction,
      })
    }

    // Send initial preset to worker
    this.sendToWorker('apply-preset', { preset: this.currentPreset })
  }

  /**
   * Sends a message to the Web Worker.
   *
   * @param {string} type - The message type
   * @param {Object} data - The data to send to the worker
   * @private
   */
  sendToWorker(type, data) {
    if (this.worker) {
      this.worker.postMessage({ type, data })
    }
  }

  /**
   * Handles messages from the Web Worker.
   *
   * @param {MessageEvent} event - The message event from the worker
   * @private
   * @throws {Error} When worker reports processing errors
   */
  onWorkerMessage(event) {
    const { type, pathData, error } = event.data

    switch (type) {
      case 'init-complete':
        this.workerReady = true
        // Only auto-start animations/static frames during initial setup, not during resize
        if (this.isInitializing) {
          this.isInitializing = false
          // If wave animation is disabled, process a static frame once the worker is ready
          // RAF for mouse effects will start when pointer enters container
          if (this.wave_animation === 'disabled') {
            this.processStaticFrame()
          }
        }
        break

      case 'frame-result':
        if (pathData) {
          this.updatePaths(pathData)
        }
        break

      case 'error':
        throw new Error(`Worker processing error: ${error}`)
    }
  }

  /**
   * Updates SVG path data.
   *
   * @param {string[]} pathData - Array of SVG path data strings
   * @private
   */
  updatePaths(pathData) {
    pathData.forEach((d, index) => {
      if (this.paths[index] && d && this.paths[index].getAttribute('d') !== d) {
        this.paths[index].setAttribute('d', d)
      }
    })
  }

  /**
   * Handles container resize by updating size, recreating lines, and updating the worker.
   *
   * @private
   */
  onResize() {
    // Store old values before updating responsive values
    const oldWaveAnimation = this.wave_animation
    const oldMouseEffect = this.mouse_effect
    const oldPresetName = this.currentPresentName

    this.currentPresentName = getResponsiveControlValue(this.options.preset)

    this.setBounds()

    this.setResponsiveValues()

    // Handle animation and mouse effect state changes
    const animationStateChanged = oldWaveAnimation !== this.wave_animation
    const mouseEffectStateChanged = oldMouseEffect !== this.mouse_effect
    const presetChanged = oldPresetName !== this.currentPresentName

    // Determine if we need animation loop running (only for wave animations, mouse effects start on pointer enter)
    const needsAnimationLoop = this.wave_animation === 'enabled'

    this.setSize()

    // Handle preset changes - regenerate lines if preset changed
    if (presetChanged) {
      // Send new preset to worker (need to get preset name from responsive value)
      if (this.worker) {
        this.sendToWorker('apply-preset', { preset: this.currentPreset })
      }

      // Regenerate lines with new preset configuration
      // this.setLines()
    }
    // else {
    //   // Only regenerate lines if preset didn't change
    //   this.setLines()
    // }

    this.setLines()

    // Reset static time since line layout has changed
    this.staticTime = null

    // Send new line data to worker after resize
    if (this.worker && this.workerReady) {
      this.sendToWorker('init', {
        lines: this.lines,
        axis: this.currentPreset.axis || 'vertical',
        direction: this.direction,
      })
    }

    // Handle mouse effect changes due to breakpoint changes
    if (oldMouseEffect !== this.mouse_effect) {
      if (this.mouse_effect === 'enabled') {
        // Mouse move listener will be set when pointer enters container
      } else {
        this.removeMouseMoveListener()
        // Stop RAF if only mouse effects were running
        if (this.wave_animation === 'disabled' && this.rafId) {
          cancelAnimationFrame(this.rafId)
          this.rafId = null
        }
      }
    }

    if (animationStateChanged || mouseEffectStateChanged) {
      if (needsAnimationLoop && !this.rafId) {
        // Start animation loop if needed and not already running
        this.rafId = requestAnimationFrame(this.tick.bind(this))
      } else if (!needsAnimationLoop && this.rafId) {
        // Stop animation loop if not needed and currently running
        cancelAnimationFrame(this.rafId)
        this.rafId = null
      }
    }

    // If wave animation is disabled, process a static frame after resize
    if (this.wave_animation === 'disabled' && this.workerReady) {
      this.processStaticFrame()
    }
  }

  /**
   * Main animation loop that triggers worker processing.
   *
   * @param {number} time - The current animation timestamp
   * @private
   */
  tick(time) {
    // Send frame data to worker
    if (this.workerReady) {
      // Use static time if animation is disabled but mouse effects are enabled, otherwise use actual time
      const frameTime = this.wave_animation === 'disabled' ? this.staticTime : time
      this.sendFrameToWorker(frameTime)
    }

    this.rafId = requestAnimationFrame(this.tick)
  }

  /**
   * Processes a single static frame with random time when animation is disabled.
   * This creates a static wave pattern that doesn't change over time.
   *
   * @private
   */
  processStaticFrame() {
    if (this.workerReady) {
      // Generate a random time value to create a unique static pattern and store it for reuse
      if (this.staticTime === null) {
        this.staticTime = Date.now() + Math.random() * 10000
      }
      this.sendFrameToWorker(this.staticTime)
    }
  }

  /**
   * Updates mouse position using Elements Hive mouse utility.
   *
   * @private
   */
  updateMousePosition() {
    // Use Elements Hive mouse utility for smooth, interpolated positions
    this.mouse.x = mouse.targetPosition.x - this.bounds.left
    this.mouse.y = mouse.targetPosition.y - this.bounds.top

    // Calculate velocity using Elements Hive mouse utility
    const deltaX = mouse.targetPosition.x - mouse.lastPosition.x
    const deltaY = mouse.targetPosition.y - mouse.lastPosition.y
    const distance = Math.hypot(deltaX, deltaY)

    this.mouse.velocity = distance
    this.mouse.smoothVelocity += (distance - this.mouse.smoothVelocity) * 0.1
    this.mouse.smoothVelocity = Math.min(100, this.mouse.smoothVelocity)

    // Calculate angle
    this.mouse.angle = Math.atan2(deltaY, deltaX)
  }

  /**
   * Sends current frame data to worker.
   *
   * @param {number} time - The current animation time
   * @private
   */
  sendFrameToWorker(time) {
    const frameData = {
      time,
      mouseData:
        this.mouse_effect === 'enabled'
          ? {
              smoothX: this.mouse.x,
              smoothY: this.mouse.y,
              smoothVelocity: this.mouse.smoothVelocity,
              angle: this.mouse.angle,
            }
          : {
              smoothX: 0,
              smoothY: 0,
              smoothVelocity: 0,
              angle: 0,
            },
    }

    this.sendToWorker('process-frame', frameData)
  }

  /**
   * Updates the configuration options for the waves effect.
   *
   * @param {Object} newOptions - New options to merge with existing configuration
   * @param {string} [newOptions.direction] - New wave direction: 'forward' (negative values) or 'backward' (positive values)
   * @param {string} [newOptions.preset] - New wave animation preset: 'style1', 'style2', 'style3', 'style4', 'style5', 'style6', 'style7', 'style8', 'style9', 'style10', 'style11', 'style12', or 'random' (includes axis, line_gap and point_gap configuration)
   * @param {string} [newOptions.wave_animation] - Controls wave animations: 'enabled' or 'disabled'
   * @param {string} [newOptions.mouse_effect] - Controls mouse interaction effects: 'enabled' or 'disabled'
   * @public
   */
  updateOptions(newOptions) {
    const options = safeMergeObjects(this.options, newOptions)
    this.options = options

    // Store old values for comparison
    const oldPreset = this.currentPreset
    const oldDirection = this.direction
    const oldMouseEffect = this.mouse_effect
    const oldWaveAnimation = this.wave_animation

    this.setResponsiveValues()

    // Apply new preset if specified and different from old value
    if (newOptions.hasOwnProperty('preset')) {
      if (this.currentPreset != oldPreset && this.worker) {
        this.sendToWorker('apply-preset', { preset: this.currentPreset })
        // Reset static time to generate new pattern for new preset
        this.staticTime = null
      }
    }

    if (newOptions.hasOwnProperty('direction')) {
      if (newOptions.direction != oldDirection) {
        this.direction = newOptions.direction
        // Reset static time to generate new pattern for new direction
        this.staticTime = null
      }
    }

    // Regenerate lines with new preset
    this.setLines()

    // Reset static time since lines have been regenerated
    this.staticTime = null

    // Send new line data to worker
    if (this.worker) {
      this.sendToWorker('init', {
        lines: this.lines,
        axis: this.currentPreset.axis || 'vertical',
        direction: this.direction,
      })

      // If both animation and mouse effects are disabled, process a static frame after preset change
      if (this.wave_animation === 'disabled' && this.mouse_effect === 'disabled' && this.workerReady) {
        this.processStaticFrame()
      }
    }

    // Handle mouse effect option changes
    if (newOptions.hasOwnProperty('mouse_effect')) {
      if (this.mouse_effect != oldMouseEffect) {
        if (this.mouse_effect === 'enabled') {
          // Mouse move listener will be set when pointer enters container
          // RAF will also start only when pointer enters if wave animation is disabled
        } else {
          this.removeMouseMoveListener()
          // Stop tick if animation is disabled and mouse effects are disabled
          if (this.wave_animation === 'disabled' && this.rafId) {
            cancelAnimationFrame(this.rafId)
            this.rafId = null
            // Process a static frame when switching to non-interactive mode
            this.processStaticFrame()
          }
        }
      }
    }

    // Handle animation option changes
    if (newOptions.hasOwnProperty('wave_animation')) {
      if (this.wave_animation != oldWaveAnimation) {
        if (this.wave_animation === 'enabled' && !this.rafId) {
          // Start animation if it's not running
          this.rafId = requestAnimationFrame(this.tick.bind(this))
        } else if (this.wave_animation === 'disabled' && this.rafId) {
          // Check if we should keep tick running for mouse effects
          if (this.mouse_effect === 'disabled') {
            // Stop animation if it's running and mouse effects are disabled
            cancelAnimationFrame(this.rafId)
            this.rafId = null
            // Process a static frame when switching to non-animated mode
            this.processStaticFrame()
          }
          // If mouse effects enabled, keep tick running but it will use static time
        }
      }
    }
  }

  /**
   * Initializes event listeners including resize observer.
   * Creates a resize observer on the container to reinit the grid when the container size changes.
   */
  initEvents() {
    document.addEventListener('scroll', this.setBoundsHandler)
    window.addEventListener('resize', this.setBoundsHandler)
    this.initPointerEvents()
    this.initIntersectionObserver()

    this.initResizeObserver()
  }

  initPointerEvents() {
    this.onPointerEnter = this.onPointerEnter.bind(this)
    this.onPointerLeave = this.onPointerLeave.bind(this)

    this.parent.addEventListener('pointerenter', this.onPointerEnter)
    this.parent.addEventListener('pointerleave', this.onPointerLeave)
  }

  onPointerEnter() {
    if (this.mouse_effect === 'enabled') {
      clearTimeout(this.pointerLeaveTimeout)
      this.setMouseMoveListener()
      // Start RAF when wave animation is disabled but mouse effects are enabled
      if (this.wave_animation === 'disabled' && !this.rafId) {
        this.rafId = requestAnimationFrame(this.tick.bind(this))
      }
    }
  }

  onPointerLeave() {
    this.pointerLeaveTimeout = setTimeout(() => {
      this.removeMouseMoveListener()
      if (this.wave_animation === 'disabled' && this.mouse_effect === 'enabled' && this.rafId) {
        cancelAnimationFrame(this.rafId)
        this.rafId = null
      }
    }, 2000)
  }

  setMouseMoveListener() {
    if (this.mouse_effect === 'enabled' && !this.mouseRafId) {
      this.mouseRafId = mouse.on('raf', this.updateMousePositionHandler)
    }
  }

  removeMouseMoveListener() {
    if (this.mouseRafId) {
      mouse.removeListener('raf', this.mouseRafId)
      this.mouseRafId = null
    }
  }

  onIntersection(entries) {
    if (entries[0].isIntersecting) {
      if (this.wave_animation === 'enabled') {
        // Start RAF immediately for wave animations
        this.rafId = requestAnimationFrame(this.tick.bind(this))
      } else {
        // Process a static frame when element comes into view and wave animation is disabled
        // RAF for mouse effects will be handled by pointer enter/leave events
        this.processStaticFrame()
      }
    } else {
      this.rafId && cancelAnimationFrame(this.rafId)
      this.rafId = null
      // Remove mouse listener when element goes out of view
      this.removeMouseMoveListener()
    }
  }

  initIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.001,
    }

    this.observer = new IntersectionObserver(this.onIntersection.bind(this), options)
    this.observer.observe(this.container)
  }

  initResizeObserver() {
    // Create resize observer to handle container size changes
    this.resizeObserver = new ResizeObserver(() => {
      this.onResizeHandler()
    })

    // Start observing the container for size changes
    this.resizeObserver.observe(this.container)
  }

  /**
   * Destroys the waves effect instance and cleans up all resources.
   *
   * This method should be called when the component is no longer needed
   * to prevent memory leaks and clean up event listeners.
   *
   * @public
   */
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }

    // Disconnect ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    // Disconnect IntersectionObserver
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }

    // Remove pointer event listeners
    if (this.parent) {
      this.parent.removeEventListener('pointerenter', this.onPointerEnter)
      this.parent.removeEventListener('pointerleave', this.onPointerLeave)
    }

    // Remove scroll and resize listeners
    document.removeEventListener('scroll', this.setBoundsHandler)
    window.removeEventListener('resize', this.setBoundsHandler)

    // remove mouse move listener
    this.removeMouseMoveListener()

    // Terminate worker
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }

    // Clear paths from SVG
    // this.paths.forEach((path) => {
    //   if (path && path.parentNode) {
    //     path.remove()
    //   }
    // })
    this.svgEl.innerHTML = ''

    // Reset references
    this.svgEl = null
    this.container = null
    this.paths = []
    this.lines = []
    this.bounds = null
    this.workerReady = false
  }
}

// Export default for easier usage
export default EhFxLayersWavyLines
