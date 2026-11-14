<template>
  <button v-show="visible" class="back-top" type="button" aria-label="回到顶部" @click="toTop">
    <span class="back-top__icon" aria-hidden="true" v-html="arrowUp"></span>
  </button>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import arrowUp from '../assets/icons/lucide/arrow-up.svg?raw'

const visible = ref(false)

function readScroll() {
  visible.value = window.scrollY > 520
}

function toTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
}

onMounted(() => {
  readScroll()
  window.addEventListener('scroll', readScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', readScroll)
})
</script>

<style scoped>
.back-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 60;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid var(--divider);
  border-radius: 50%;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  opacity: 0.75;
  transition:
    opacity 0.2s var(--ease),
    color 0.2s var(--ease),
    border-color 0.2s var(--ease),
    transform 0.2s var(--ease);
}

.back-top:hover,
.back-top:focus-visible {
  opacity: 1;
  color: var(--ink);
  border-color: var(--ink2);
  transform: translateY(-2px);
}

.back-top :deep(svg) {
  width: 15px;
  height: 15px;
}

@media (max-width: 900px) {
  .back-top {
    right: 16px;
    bottom: 16px;
    width: 36px;
    height: 36px;
  }
}
</style>
