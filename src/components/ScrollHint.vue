<template>
  <div class="scroll-hint" aria-hidden="true">
    <span class="scroll-hint__text">{{ label }}</span>
    <span class="scroll-hint__arrow" aria-hidden="true" v-html="arrowDown"></span>
  </div>
</template>

<script setup>
import arrowDown from '../assets/icons/lucide/arrow-down.svg?raw'

defineProps({
  label: { type: String, default: 'SCROLL' }
})
</script>

<style scoped>
.scroll-hint {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  border: 0;
  background: transparent;
  color: var(--muted);
  pointer-events: none;
  font: 600 9px/1 var(--font-body);
  letter-spacing: 0.3em;
  text-indent: 0.3em;
}

.scroll-hint__text {
  opacity: 0.65;
}

.scroll-hint__arrow {
  display: block;
  color: var(--ink2);
  animation: hint-float 1.9s ease-in-out infinite;
}

.scroll-hint__arrow :deep(svg) {
  width: 15px;
  height: 15px;
}

@keyframes hint-float {
  0%, 100% { transform: translateY(0); opacity: 0.65; }
  50% { transform: translateY(4px); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-hint__arrow { animation: none; }
}
</style>
