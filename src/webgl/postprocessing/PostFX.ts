import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import postVertexShader from '../../shaders/postprocessing/vertex.glsl'
import postFragmentShader from '../../shaders/postprocessing/fragment.glsl'
import { params } from '../Config'
import { TextureGenerator } from '../utils/TextureGenerator'

interface PostFXUniforms {
  tDiffuse: THREE.IUniform
  uTime: THREE.IUniform
  uResolution: THREE.IUniform
  uCellSize: THREE.IUniform
  uCharactersCount: THREE.IUniform
  uCharacters: THREE.IUniform
  uColor: THREE.IUniform
  uBackgroundColor: THREE.IUniform
  [key: string]: THREE.IUniform
}

export class PostFX {
  public composer: EffectComposer
  private postProcessPass: ShaderPass

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    textureGenerator: TextureGenerator,
  ) {
    this.composer = new EffectComposer(renderer)

    const renderPass = new RenderPass(scene, camera)
    this.composer.addPass(renderPass)

    const postProcessMaterial = {
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uCellSize: { value: textureGenerator.cellSize },
        uCharactersCount: { value: textureGenerator.charactersCount },
        uCharacters: { value: null as THREE.Texture | null },
        uColor: {
          value: new THREE.Vector3(
            params.asciiColor.r / 255,
            params.asciiColor.g / 255,
            params.asciiColor.b / 255,
          ),
        },
        uBackgroundColor: {
          value: new THREE.Vector3(
            params.asciiBgColor.r / 255,
            params.asciiBgColor.g / 255,
            params.asciiBgColor.b / 255,
          ),
        },
      },
      vertexShader: postVertexShader,
      fragmentShader: postFragmentShader,
    }

    this.postProcessPass = new ShaderPass(postProcessMaterial)
    if (this.postProcessPass.uniforms.uCharacters) {
      this.postProcessPass.uniforms.uCharacters.value = textureGenerator.createTexture()
    }
    this.composer.addPass(this.postProcessPass)
  }

  public updateTime(elapsed: number) {
    if (this.postProcessPass.uniforms.uTime) {
      this.postProcessPass.uniforms.uTime.value = elapsed * 0.001
    }
  }

  public resize(width: number, height: number) {
    this.composer.setSize(width, height)
    if (this.postProcessPass.uniforms.uResolution) {
      this.postProcessPass.uniforms.uResolution.value.set(width, height)
    }
  }

  public getUniforms() {
    return this.postProcessPass.uniforms as PostFXUniforms
  }
}
