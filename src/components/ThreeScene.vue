<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { SceneManager } from '../webgl/SceneManager'

const canvasRef = ref<HTMLCanvasElement>()
let sceneManager: SceneManager | null = null

const handleResize = () => {
  if (sceneManager) {
    sceneManager.resize(window.innerWidth, window.innerHeight)
  }
}

const handleWheel = (event: WheelEvent) => {
  if (sceneManager) {
    sceneManager.handleWheel(event.deltaY)
  }
}

onMounted(() => {
  if (canvasRef.value) {
    sceneManager = new SceneManager(canvasRef.value)

    sceneManager.animate()
  }

  window.addEventListener('resize', handleResize)
  window.addEventListener('wheel', handleWheel)
})

onUnmounted(() => {
  if (sceneManager) {
    sceneManager.dispose()
  }

  window.removeEventListener('resize', handleResize)
  window.removeEventListener('wheel', handleWheel)
})
</script>

<template>
  <canvas ref="canvasRef" class="three-canvas" />
</template>

<style scoped lang="scss">
.three-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: -1;
  pointer-events: auto;
}
</style>
