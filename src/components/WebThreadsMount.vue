<template>
  <div ref="host" class="webthreads-mount"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createRoot } from 'react-dom/client'
import React from 'react'
import WebThreads from './webthreads/WebThreads.jsx'

const host = ref(null)
let root = null

onMounted(() => {
  if (!host.value) return
  root = createRoot(host.value)
  root.render(
    React.createElement(WebThreads, {
      colors: ['#22d3ee', '#6366f1'],
      coreColor: '#ffffff',
      backgroundColor: 'transparent',
      lightMode: false,
      threadCount: 10,
      speed: 0.2,
      frequency: 7.2,
      spread: 0.3,
      taper: 0.2,
      position: 0.5,
      pinch: 0.5,
      nodes: 1,
      angle: 0,
      glow: 0.022,
      falloff: 0.54,
      thickness: 0.9,
      brightness: 0.6,
      opacity: 1,
      depth: 1,
      pulses: 1,
      mirror: true,
      shimmer: true,
      fade: 0,
      grain: 0,
      intro: true,
      mouseInteraction: true,
      mouseStrength: 0.42,
      pulseOnClick: false,
      fps: 30,
      dpr: 0.7
    })
  )
})

onBeforeUnmount(() => {
  root?.unmount()
  root = null
})
</script>

<style scoped>
.webthreads-mount {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
