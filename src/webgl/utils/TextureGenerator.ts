import * as THREE from 'three'

export class TextureGenerator {
  private characters = `              @#W$9876543210?!abc;:+=-,._kbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^'`
  private fontSize = 54
  private maxPerRow = 16
  private cell = 64

  public readonly cellSize = 10.72
  public get charactersCount() {
    return this.characters.length
  }

  public createTexture(): THREE.Texture {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024

    const context = canvas.getContext('2d')
    if (context) {
      context.clearRect(0, 0, 1024, 1024)
      context.font = `${this.fontSize}px arial`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillStyle = 'blue'

      for (let i = 0; i < this.characters.length; i++) {
        const x = i % this.maxPerRow
        const y = Math.floor(i / this.maxPerRow)
        context.fillText(
          this.characters[i]!,
          x * this.cell + this.cell / 2,
          y * this.cell + this.cell / 2,
        )
      }
    }

    const charactersTexture = new THREE.Texture(canvas)
    charactersTexture.minFilter = THREE.NearestFilter
    charactersTexture.magFilter = THREE.NearestFilter
    charactersTexture.flipY = false
    charactersTexture.needsUpdate = true

    return charactersTexture
  }
}
