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
  // 窄屏 / 触屏：几何密度按屏宽归一，否则 151 根线条挤在 390px 里会掉到 14fps。
  // 只降密度不降观感——亮度与辉光反向补偿，特效本身完整保留。
  const narrow =
    window.innerWidth < 900 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)

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
      threads: narrow ? 84 : 151,
      density: narrow ? 1 : 1.55,
      thickness: narrow ? 1.3 : 1.1,
      tips: 0.8,
      foldGlow: narrow ? 3.4 : 3,
      speed: 0.75,
      flow: 1.5,
      rollSpeed: 0.17,
      depthOfField: 0.9,
      focusDepth: -0.15,
      particles: narrow ? 1 : 1.5,
      sparkle: 0.7,
      glow: narrow ? 0.46 : 0.35,
      brightness: narrow ? 2 : 1.7,
      lightMode: false,
      pulseOnClick: false,
      dpr: narrow ? 0.9 : 1.25
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
