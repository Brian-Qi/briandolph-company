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
  // 桌面横着流、手机竖着垂：两套参数各配各的，
  // 窄屏那套配合 CSS 里的 90° 旋转（见底部 @media）。
  const narrow = window.innerWidth < 900

  root = createRoot(host.value)
  root.render(
    React.createElement(WebThreads, {
      colors: ['#22d3ee', '#6366f1'],
      coreColor: '#ffffff',
      backgroundColor: 'transparent',
      lightMode: false,
      threadCount: narrow ? 12 : 10,
      speed: 0.2,
      frequency: narrow ? 4.6 : 7.2,
      spread: narrow ? 0.42 : 0.3,
      taper: narrow ? 0.25 : 0.2,
      position: narrow ? 0.42 : 0.5,
      pinch: 0.5,
      nodes: 1,
      angle: 0,
      glow: narrow ? 0.028 : 0.022,
      falloff: 0.54,
      thickness: narrow ? 0.95 : 0.9,
      brightness: narrow ? 0.62 : 0.6,
      opacity: 1,
      depth: 1,
      pulses: 1,
      mirror: narrow ? false : true,
      shimmer: true,
      fade: 0,
      grain: 0,
      intro: true,
      // 触屏没有鼠标：关掉指针交互
      mouseInteraction: !narrow,
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

/* 只有窄屏竖过来：把画布整体转 90°，横向流动就变成从上往下垂。
   宽高先互换（100vh × 100vw）再旋转，避免旋转后被容器裁掉。
   桌面端（>900px）保持原来的横向，不受影响。 */
@media (max-width: 900px) {
  .webthreads-mount {
    inset: auto;
    top: 50%;
    left: 50%;
    width: 100vh;
    height: 100vw;
    transform: translate(-50%, -50%) rotate(90deg);
  }
}
</style>
