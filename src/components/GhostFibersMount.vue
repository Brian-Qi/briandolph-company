<template>
  <div ref="host" class="ghost-mount"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createRoot } from 'react-dom/client'
import React from 'react'
import GhostFibers from './ghost/GhostFibers.jsx'

const host = ref(null)
let root = null

onMounted(() => {
  if (!host.value) return
  root = createRoot(host.value)
  root.render(
    React.createElement(GhostFibers, {
      glowColor: '#34d399',
      lineColor: '#ecfdf5',
      secondaryColor: '#0ea5e9',
      gradient: 'across',
      layers: 3,
      waves: 0.65,
      twist: 1.75,
      volume: 1.5,
      spread: 1.1,
      scale: 0.9,
      rotation: 6,
      fiberStyle: 'dashes',
      threads: 151,
      density: 1.55,
      thickness: 1.1,
      tips: 0.8,
      foldGlow: 3,
      speed: 0.75,
      flow: 1.5,
      rollSpeed: 0.17,
      depthOfField: 0.9,
      focusDepth: -0.15,
      particles: 1.5,
      sparkle: 0.7,
      glow: 0.35,
      brightness: 1.7,
      lightMode: false,
      pulseOnClick: false,
      dpr: 1.25
    })
  )
})

onBeforeUnmount(() => {
  root?.unmount()
  root = null
})
</script>

<style scoped>
.ghost-mount {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
