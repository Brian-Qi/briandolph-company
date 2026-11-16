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

onMounted(() => {
  if (!host.value) return
  // 窄屏 / 触屏：桌面那套 0.8 的碎片在 390px 宽里太小，几乎看不见。
  // 把碎片放大、辉光加强、密度按屏宽收一点——视觉上"敢看"，负载也更低。
  const narrow =
    window.innerWidth < 900 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)

  root = createRoot(host.value)
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
