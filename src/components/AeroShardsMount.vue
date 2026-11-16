<template>
  <div ref="host" class="aero-mount"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createRoot } from 'react-dom/client'
import React from 'react'
import AeroShards from './aero/AeroShards.jsx'

const host = ref(null)
let root = null

// AeroShards 用的是 WebGPU（navigator.gpu）。iOS Safari 至今默认不开，
// 部分安卓 WebView 也没有 —— 那种环境下它直接抛错，整块背景空白。
const hasWebGPU = () =>
  typeof navigator !== 'undefined' && 'gpu' in navigator && !!navigator.gpu

onMounted(async () => {
  if (!host.value) return
  // 窄屏 / 触屏：桌面那套 0.8 的碎片在 390px 宽里太小，几乎看不见。
  // 把碎片放大、辉光加强、密度按屏宽收一点——视觉上"敢看"，负载也更低。
  const narrow =
    window.innerWidth < 900 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)

  root = createRoot(host.value)

  // 没有 WebGPU：退化成 GhostFibers（WebGL2），同样做成竖向，不留白屏
  if (!hasWebGPU()) {
    const { default: GhostFibers } = await import('./ghost/GhostFibers.jsx')
    if (!host.value) return
    root.render(
      React.createElement(GhostFibers, {
        glowColor: '#55ff78',
        lineColor: '#ecfdf5',
        secondaryColor: '#6cc3d2',
        gradient: 'across',
        layers: 3,
        waves: 0.55,
        twist: 1.4,
        volume: 1.4,
        spread: 1,
        scale: 0.95,
        rotation: narrow ? 90 : 18,
        fiberStyle: 'dashes',
        threads: narrow ? 84 : 151,
        density: narrow ? 1 : 1.55,
        thickness: narrow ? 1.3 : 1.1,
        tips: 0.8,
        foldGlow: 3.4,
        speed: 0.7,
        flow: 1.4,
        rollSpeed: 0.17,
        depthOfField: 0.9,
        focusDepth: -0.15,
        particles: narrow ? 1 : 1.5,
        sparkle: 0.7,
        glow: narrow ? 0.38 : 0.35,
        brightness: narrow ? 1.6 : 1.7,
        lightMode: false,
        pulseOnClick: false,
        // 触屏没有鼠标：交互一律关掉，省掉每帧的指针计算
        mouseInteraction: !narrow,
        hoverEffect: narrow ? 'none' : 'focus',
        dpr: narrow ? 0.9 : 1.25
      })
    )
    return
  }

  root.render(
    React.createElement(AeroShards, {
      shardColor: '#6cc3d2',
      accentColor: '#55ff78',
      backgroundColor: 'transparent',
      lightMode: false,
      // 手机：placement='right' 把碎片排成竖向丝带（studio 里 glacier 预设就是这个）；
      // 桌面保留原来的 'full' 铺满，不动。
      placement: narrow ? 'right' : 'full',
      // 注：试过窄屏切 chrome 材质，实测可见度没有改善（深色底下它本来就是一粒粒星尘），
      // 所以保持原材质，只放大碎片 + 加强辉光 + 收浅景深。
      count: narrow ? 400 : 1500,
      shardSize: narrow ? 2.2 : 0.8,
      spread: 1.29,
      twist: 1.44,
      billow: 2,
      speed: 1.18,
      scale: 1.07,
      depthOfField: narrow ? 0.15 : 0.5,
      glow: narrow ? 2 : 1.46,
      markers: 'none',
      pulseOnClick: false,
      // 触屏 / 窄屏：没有鼠标就没有指针交互，也别留着顶部视差
      mouseInteraction: !narrow,
      holdToGather: false,
      parallax: narrow ? 0 : 0.5,
      fps: 30,
      dpr: 1
    })
  )
})

onBeforeUnmount(() => {
  root?.unmount()
  root = null
})
</script>

<style scoped>
.aero-mount {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
