<template>
  <div ref="host" class="particles-mount"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createRoot } from 'react-dom/client'
import React from 'react'
import Particles from './particles/Particles.jsx'

const host = ref(null)
let root = null

onMounted(() => {
  if (!host.value) return
  root = createRoot(host.value)
  root.render(
    React.createElement(Particles, {
      particleColors: ['#00d9ff', '#6dff5d', '#5dbdff'],
      particleCount: 3530,
      particleSpread: 5,
      particleBaseSize: 45,
      sizeRandomness: 1.45,
      speed: 0,
      shape: 'sparkle',
      glow: 1.25,
      twinkle: 0.2,
      depthOfField: 0.45,
      connections: true,
      connectionDistance: 110,
      particleHoverFactor: 1,
      hoverRadius: 140,
      hoverEffect: 'parallax',
      cameraDistance: 20,
      alphaParticles: false,
      disableRotation: false,
      drift: 'forward',
      driftSpeed: 1.2,
      variation: 0,
      moveParticlesOnHover: true,
      clickBurst: false,
      intro: true,
      opacity: 1,
      pixelRatio: 1.25,
      lightMode: false
    })
  )
})

onBeforeUnmount(() => {
  root?.unmount()
  root = null
})
</script>

<style scoped>
.particles-mount {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
