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
  root = createRoot(host.value)
  root.render(
    React.createElement(AeroShards, {
      shardColor: '#6cc3d2',
      accentColor: '#55ff78',
      backgroundColor: 'transparent',
      lightMode: false,
      placement: 'full',
      count: 1500,
      shardSize: 0.8,
      spread: 1.29,
      twist: 1.44,
      billow: 2,
      speed: 1.18,
      scale: 1.07,
      depthOfField: 0.5,
      glow: 1.46,
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
