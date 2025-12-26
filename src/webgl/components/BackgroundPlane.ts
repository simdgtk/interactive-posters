import * as THREE from 'three'
import backgroundVertexShader from '../../shaders/base.vert'
import backgroundFragmentShader from '../../shaders/backgroundPlane/background.frag'
import { params } from '../Config'

interface BackgroundPlaneUniforms {
  uTexture: THREE.IUniform
  uOffsetX: THREE.IUniform
  uOffsetY: THREE.IUniform
  uSizePerlinValue: THREE.IUniform
  uBlur: THREE.IUniform
  uColor1: THREE.IUniform
  uColor2: THREE.IUniform
  uThresholdSpeed: THREE.IUniform
  uThresholdValue: THREE.IUniform
  uScrollSpeed: THREE.IUniform
  uFbmOctaves: THREE.IUniform
  uFbmGain: THREE.IUniform
  uFbmLacunarity: THREE.IUniform
  clock: THREE.IUniform
  viewport: THREE.IUniform
  scroll: THREE.IUniform
  uSpeed: THREE.IUniform
  uAspectRatio: THREE.IUniform
  [key: string]: THREE.IUniform
}

export class BackgroundPlane {
  public mesh: THREE.Mesh
  public material: THREE.ShaderMaterial
  private uniforms: BackgroundPlaneUniforms

  constructor(scene: THREE.Scene) {
    const geometry = new THREE.PlaneGeometry(2, 2)

    const textureLoader = new THREE.TextureLoader()
    const perlinTexture = textureLoader.load('/assets/perlin.png')
    perlinTexture.wrapS = THREE.RepeatWrapping
    perlinTexture.wrapT = THREE.RepeatWrapping

    this.uniforms = {
      uTexture: { value: perlinTexture },
      uOffsetX: { value: params.offsetX },
      uOffsetY: { value: params.offsetY },
      uSizePerlinValue: { value: params.sizePerlinValue },
      uBlur: { value: params.blur },
      uColor1: {
        value: new THREE.Vector3(
          params.color1.r / 255,
          params.color1.g / 255,
          params.color1.b / 255,
        ),
      },
      uColor2: {
        value: new THREE.Vector3(
          params.color2.r / 255,
          params.color2.g / 255,
          params.color2.b / 255,
        ),
      },
      uThresholdSpeed: { value: params.thresholdSpeed },
      uThresholdValue: { value: params.thresholdValue },
      uScrollSpeed: { value: params.scrollSpeed },
      uFbmOctaves: { value: params.fbmOctaves },
      uFbmGain: { value: params.fbmGain },
      uFbmLacunarity: { value: params.fbmLacunarity },
      clock: {
        value: {
          elapsed: 0,
          delta: 0,
        },
      },
      viewport: {
        value: {
          size: new THREE.Vector2(window.innerWidth, window.innerHeight),
          dpr: Math.min(window.devicePixelRatio, 2),
          ratio: window.innerWidth / window.innerHeight,
        },
      },
      uAspectRatio: { value: window.innerWidth / window.innerHeight },
      scroll: {
        value: {
          currentScroll: 0,
          delta: 0,
        },
      },
      uSpeed: { value: params.speed },
    }

    this.material = new THREE.ShaderMaterial({
      vertexShader: backgroundVertexShader,
      fragmentShader: backgroundFragmentShader,
      uniforms: this.uniforms,
      wireframe: false,
    })

    this.mesh = new THREE.Mesh(geometry, this.material)
    this.mesh.position.set(0, 0, 0)
    scene.add(this.mesh)
  }

  public updateTime(elapsed: number, delta: number) {
    this.uniforms.clock.value.elapsed = elapsed
    this.uniforms.clock.value.delta = delta
  }

  public updateScroll(currentScroll: number, delta: number) {
    this.uniforms.scroll.value.currentScroll = currentScroll
    this.uniforms.scroll.value.delta = delta
  }

  public resize(width: number, height: number, dpr: number) {
    this.uniforms.viewport.value.size.set(width, height)
    this.uniforms.viewport.value.dpr = dpr
    this.uniforms.viewport.value.ratio = width / height
    this.uniforms.uAspectRatio.value = width / height
  }

  public getUniforms() {
    return this.uniforms
  }
}
