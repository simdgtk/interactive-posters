import * as THREE from 'three'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import dnaVertexShader from '../../shaders/dna/dna.vert'
import mockPoster1 from '../../assets/images/mockPoster1.webp'

export class DNAStack {
  public mesh: THREE.Mesh
  public material: CustomShaderMaterial
  public geometry: THREE.PlaneGeometry
  public texture: THREE.Texture

  private currentPixelFactor = 1080

  constructor(scene: THREE.Scene) {
    this.texture = new THREE.TextureLoader().load(mockPoster1)
    this.texture.minFilter = THREE.NearestFilter
    this.texture.magFilter = THREE.NearestFilter

    this.material = new CustomShaderMaterial({
      baseMaterial: THREE.MeshStandardMaterial,
      vertexShader: dnaVertexShader,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uPixelFactor;

        varying vec2 vUv;

        void main() {
          vec2 grid = vec2(uPixelFactor, uPixelFactor * 1.41);
          vec2 pixelatedUV = floor(vUv * grid) / grid;

          vec4 color = texture2D(uTexture, pixelatedUV);

          csm_DiffuseColor = color;
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uScrollProgress: { value: 0 },
        uScrollDelta: { value: 0 },
        uTexture: { value: this.texture },
        uPixelFactor: { value: this.currentPixelFactor },
      },
      map: this.texture,

      side: THREE.DoubleSide,
      roughness: 0.0,
      metalness: 0.0,
    })

    this.geometry = new THREE.PlaneGeometry(1, Math.sqrt(2), 60, 60)
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.scale.set(0.4, 0.4, 0.4)
    scene.add(this.mesh)
  }

  public update(time: number, scrollProgress: number, scrollDelta: number) {
    if (this.material.uniforms.uTime) this.material.uniforms.uTime.value = time
    if (this.material.uniforms.uScrollProgress)
      this.material.uniforms.uScrollProgress.value = scrollProgress
    if (this.material.uniforms.uScrollDelta) this.material.uniforms.uScrollDelta.value = scrollDelta


    const maxDelta = 15
    const normalizedDelta = Math.min(Math.abs(scrollDelta * 0.2) / maxDelta, 1)

    const mixFactor = Math.pow(normalizedDelta, 0.3)
    const targetPixelFactor = THREE.MathUtils.lerp(1080.0, 20.0, mixFactor)

    this.currentPixelFactor += (targetPixelFactor - this.currentPixelFactor) * 0.05
    if (this.material.uniforms.uPixelFactor) {
      this.material.uniforms.uPixelFactor.value = this.currentPixelFactor
    }
  }
}
