import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'stats-gl'
import { Pane } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import { BackgroundPlane } from './components/BackgroundPlane'
import { DNAStack } from './components/DNAStack'
import { PostFX } from './postprocessing/PostFX'
import { TextureGenerator } from './utils/TextureGenerator'
import { params } from './Config'

import nx from '../assets/images/environement/nx.webp'
import ny from '../assets/images/environement/ny.webp'
import nz from '../assets/images/environement/nz.webp'
import px from '../assets/images/environement/px.webp'
import py from '../assets/images/environement/py.webp'
import pz from '../assets/images/environement/pz.webp'

export class SceneManager {
  private canvas: HTMLCanvasElement
  private scene!: THREE.Scene
  private dnaScene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private controls!: OrbitControls
  private stats!: Stats
  private pane!: Pane
  private animationId: number = 0
  private startTime: number

  private backgroundPlane!: BackgroundPlane
  private dnaStack!: DNAStack
  private postFX!: PostFX
  private textureGenerator!: TextureGenerator

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.startTime = Date.now()

    this.initThree()
    this.initScene()
    this.initDebug()

    this.resize(window.innerWidth, window.innerHeight)
  }

  private initThree() {
    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xffffff)

    const environementMap = new THREE.CubeTextureLoader().load([px, nx, py, ny, pz, nz])
    this.scene.environment = environementMap

    this.dnaScene = new THREE.Scene()
    this.dnaScene.background = null
    this.dnaScene.environment = environementMap

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.set(0, 0, 1)
    this.camera.lookAt(0, 0, 0)

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.enableZoom = false
    this.controls.enableRotate = false
    this.controls.enablePan = false
    this.controls.maxDistance = 50
    this.controls.minDistance = 1
    this.controls.target.set(0, 0, 0)

    // Stats
    this.stats = new Stats({
      trackFPS: true,
      trackGPU: false,
      trackHz: false,
      trackCPT: false,
      logsPerSecond: 4,
      graphsPerSecond: 30,
      samplesLog: 40,
      samplesGraph: 10,
      precision: 2,
      horizontal: true,
      minimal: false,
      mode: 0,
    })
    document.body.appendChild(this.stats.dom)
  }

  private initScene() {
    this.backgroundPlane = new BackgroundPlane(this.scene)

    this.dnaStack = new DNAStack(this.dnaScene)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)
    this.dnaScene.add(ambientLight.clone())

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    this.scene.add(directionalLight)
    this.dnaScene.add(directionalLight.clone())

    // Post Processing
    this.textureGenerator = new TextureGenerator()
    this.postFX = new PostFX(this.renderer, this.scene, this.camera, this.textureGenerator)
  }

  private initDebug() {
    this.pane = new Pane({
      title: 'Background Shader Controls',
      expanded: false,
    })

    this.pane.registerPlugin(EssentialsPlugin)

    const isDev = import.meta.env.MODE === 'development'
    if (isDev) {
      import('../plugin/local-storage-plugin').then((LocalStoragePlugin) => {
        this.pane.registerPlugin(LocalStoragePlugin)
        this.pane.addBlade({
          view: 'local-storage',
          parentPane: this.pane,
          projectName: 'interactive-posters',
          title: 'Presets',
          expanded: false,
          type: 'three',
        })
      })
    }

    this.createDebugControls()
  }

  private createDebugControls() {
    const bgUniforms = this.backgroundPlane.getUniforms()

    const offsetFolder = this.pane.addFolder({ title: 'Offset', expanded: true })
    offsetFolder
      .addBinding(params, 'offsetX', { min: -2, max: 2, step: 0.01 })
      .on('change', (ev) => {
        bgUniforms.uOffsetX.value = ev.value
      })
    offsetFolder
      .addBinding(params, 'offsetY', { min: -2, max: 2, step: 0.01 })
      .on('change', (ev) => {
        bgUniforms.uOffsetY.value = ev.value
      })

    const perlinFolder = this.pane.addFolder({ title: 'Perlin Noise' })
    perlinFolder
      .addBinding(params, 'sizePerlinValue', { min: 0.1, max: 100, step: 0.1, label: 'Size' })
      .on('change', (ev) => {
        bgUniforms.uSizePerlinValue.value = ev.value
      })
    perlinFolder.addBinding(params, 'blur', { min: 0, max: 1, step: 0.01 }).on('change', (ev) => {
      bgUniforms.uBlur.value = ev.value
    })

    const colorFolder = this.pane.addFolder({ title: 'Colors' })
    colorFolder.addBinding(params, 'color1', { label: 'Color 1' }).on('change', (ev) => {
      bgUniforms.uColor1.value.set(ev.value.r / 255, ev.value.g / 255, ev.value.b / 255)
    })
    colorFolder.addBinding(params, 'color2', { label: 'Color 2' }).on('change', (ev) => {
      bgUniforms.uColor2.value.set(ev.value.r / 255, ev.value.g / 255, ev.value.b / 255)
    })

    const thresholdFolder = this.pane.addFolder({ title: 'Threshold' })
    thresholdFolder
      .addBinding(params, 'thresholdSpeed', { min: 0, max: 5, step: 0.1, label: 'Speed' })
      .on('change', (ev) => {
        bgUniforms.uThresholdSpeed.value = ev.value
      })
    thresholdFolder
      .addBinding(params, 'thresholdValue', { min: 0, max: 1, step: 0.01, label: 'Value' })
      .on('change', (ev) => {
        bgUniforms.uThresholdValue.value = ev.value
      })

    const scrollFolder = this.pane.addFolder({ title: 'Scroll' })
    scrollFolder
      .addBinding(params, 'scrollSpeed', { min: 0, max: 5, step: 0.1, label: 'Speed' })
      .on('change', (ev) => {
        bgUniforms.uScrollSpeed.value = ev.value
      })

    const fbmFolder = this.pane.addFolder({ title: 'FBM' })
    fbmFolder
      .addBinding(params, 'fbmOctaves', { min: 1, max: 8, step: 1, label: 'Octaves' })
      .on('change', (ev) => {
        bgUniforms.uFbmOctaves.value = ev.value
      })
    fbmFolder
      .addBinding(params, 'fbmGain', { min: 0.1, max: 1, step: 0.01, label: 'Gain' })
      .on('change', (ev) => {
        bgUniforms.uFbmGain.value = ev.value
      })
    fbmFolder
      .addBinding(params, 'fbmLacunarity', { min: 1, max: 3, step: 0.01, label: 'Lacunarity' })
      .on('change', (ev) => {
        bgUniforms.uFbmLacunarity.value = ev.value
      })

    fbmFolder
      .addBinding(params, 'speed', { min: 0, max: 5, step: 0.01, label: 'Speed' })
      .on('change', (ev) => {
        bgUniforms.uSpeed.value = ev.value
      })
    const postUniforms = this.postFX.getUniforms()
    const postProcFolder = this.pane.addFolder({ title: 'Post Processing' })
    postProcFolder.addBinding(params, 'asciiColor', { label: 'Text Color' }).on('change', (ev) => {
      postUniforms.uColor.value.set(ev.value.r / 255, ev.value.g / 255, ev.value.b / 255)
    })
    postProcFolder
      .addBinding(params, 'asciiBgColor', { label: 'Background Color' })
      .on('change', (ev) => {
        postUniforms.uBackgroundColor.value.set(
          ev.value.r / 255,
          ev.value.g / 255,
          ev.value.b / 255,
        )
      })
  }

  public resize(width: number, height: number) {
    this.renderer.setSize(width, height)
    this.postFX.resize(width, height)

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    const dpr = Math.min(window.devicePixelRatio, 2)
    this.backgroundPlane.resize(width, height, dpr)

    const dist = this.camera.position.z
    const vFOV = THREE.MathUtils.degToRad(this.camera.fov)
    const heightWorld = 2 * Math.tan(vFOV / 2) * dist
    const widthWorld = heightWorld * this.camera.aspect

    this.backgroundPlane.mesh.scale.set(widthWorld / 2, heightWorld / 2, 1)
  }

  // public onMouseMove(x: number, y: number) {
  // }

  // Scroll state
  public scroll = {
    current: 0,
    target: 0,
    ease: 0.02, // inertia
    last: 0,
  }
  public scrollProgress: number = 0

  public handleWheel(deltaY: number) {
    this.scroll.target += deltaY
  }

  public animate = () => {
    this.stats.begin()
    this.animationId = requestAnimationFrame(this.animate)

    this.controls.update()

    // Time
    const currentTime = Date.now()
    const elapsed = currentTime - this.startTime

    this.scroll.current = THREE.MathUtils.lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease,
    )

    const scrollDelta = this.scroll.current - this.scroll.last
    this.scroll.last = this.scroll.current
    this.scrollProgress = this.scroll.current / 5000

    this.backgroundPlane.updateTime(elapsed, performance.now())
    this.backgroundPlane.updateScroll(this.scroll.current, scrollDelta)
    this.postFX.updateTime(elapsed)
    this.dnaStack.update(elapsed, this.scrollProgress, scrollDelta)

    // Render
    this.renderer.autoClear = false
    this.postFX.composer.render()
    this.renderer.clearDepth()
    this.renderer.render(this.dnaScene, this.camera)
    this.renderer.autoClear = true

    this.stats.end()
    this.stats.update()
  }

  public dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    this.controls.dispose()
    this.pane.dispose()
    this.renderer.dispose()

    document.body.removeChild(this.stats.dom)
  }
}
