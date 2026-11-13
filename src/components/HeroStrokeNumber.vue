<template>
  <span class="stroke-number" :class="`stroke-number--${variant}`">
    <span class="stroke-number__layout" aria-hidden="true">{{ text }}</span>
    <svg class="stroke-number__svg" width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient
          :id="`stroke-flow-${variant}-${uid}`"
          x1="-0.5"
          y1="0"
          x2="1.5"
          y2="0"
          spreadMethod="reflect"
        >
          <stop
            v-for="stop in gradientStops"
            :key="stop.offset"
            :offset="stop.offset"
            :stop-color="stop.color"
          />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values="-0.25 0;0.25 0;-0.25 0"
            :dur="flowDuration"
            repeatCount="indefinite"
          />
        </linearGradient>
        <filter :id="`stroke-glow-${variant}-${uid}`" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter :id="`stroke-halo-${variant}-${uid}`" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <text
        class="stroke-number__halo"
        x="50%"
        y="52%"
        text-anchor="middle"
        dominant-baseline="middle"
        :stroke="`url(#stroke-flow-${variant}-${uid})`"
        :filter="`url(#stroke-halo-${variant}-${uid})`"
      >{{ text }}</text>
      <text
        class="stroke-number__core"
        x="50%"
        y="52%"
        text-anchor="middle"
        dominant-baseline="middle"
        :stroke="`url(#stroke-flow-${variant}-${uid})`"
        :filter="`url(#stroke-glow-${variant}-${uid})`"
      >{{ text }}</text>
      <text
        v-if="variant === 'dark'"
        class="stroke-number__trail stroke-number__trail--long"
        x="50%"
        y="52%"
        text-anchor="middle"
        dominant-baseline="middle"
        :stroke="`url(#stroke-flow-${variant}-${uid})`"
        :filter="`url(#stroke-glow-${variant}-${uid})`"
      >{{ text }}</text>

    </svg>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, default: '01' },
  uid: { type: [String, Number], default: 0 },
  variant: { type: String, default: 'light' }
})

const palettes = {
  light: [
    { offset: 0, color: '#0a4b56' },
    { offset: 0.34, color: '#0e8fa3' },
    { offset: 0.5, color: '#5fe0ee' },
    { offset: 0.66, color: '#0e8fa3' },
    { offset: 1, color: '#0a4b56' }
  ],
  dark: [
    { offset: 0, color: '#071a16' },
    { offset: 0.18, color: '#10b981' },
    { offset: 0.5, color: '#d9f99d' },
    { offset: 0.82, color: '#10b981' },
    { offset: 1, color: '#071a16' }
  ]
}

const gradientStops = computed(() => palettes[props.variant] || palettes.light)
const flowDuration = computed(() => (props.variant === 'dark' ? '3.6s' : '5.2s'))
</script>

<style scoped>
.stroke-number {
  position: relative;
  display: inline-block;
  vertical-align: top;
  line-height: inherit;
}

.stroke-number__layout {
  visibility: hidden;
}

.stroke-number__svg {
  position: absolute;
  inset: 0;
  display: block;
  overflow: visible;
}

.stroke-number__svg text {
  font: inherit;
  letter-spacing: inherit;
  -webkit-text-stroke: 0;
}

.stroke-number__halo {
  fill: none;
  stroke-width: 6;
  --halo-min: 0.4;
  --halo-max: 0.8;
  opacity: var(--halo-min);
  animation: stroke-halo-breathe 3.2s ease-in-out infinite;
}

.stroke-number__core {
  fill: none;
  stroke-width: 6;
  --core-min: 0.78;
  --core-max: 1;
  opacity: var(--core-min);
  animation: stroke-core-breathe 3.2s ease-in-out infinite;
}

.stroke-number--dark .stroke-number__halo {
  --halo-min: 0.32;
  --halo-max: 0.82;
  animation-duration: 2.6s;
}

.stroke-number--dark .stroke-number__core {
  --core-min: 0.88;
  --core-max: 1;
  animation-duration: 2.6s;
}

.stroke-number__trail {
  fill: none;
  stroke-width: 6;
  stroke-linecap: butt;
  stroke-linejoin: round;
  animation: stroke-trail-run 9s linear infinite;
}

.stroke-number__trail--long {
  --trail-start: 0;
  --trail-end: -2220;
  stroke-dasharray: 420 1800;
  opacity: 0.08;
}

.stroke-number--dark .stroke-number__trail {
  animation-duration: 4.4s;
}

.stroke-number--dark .stroke-number__trail--long { opacity: 0.16; }

@keyframes stroke-trail-run {
  from { stroke-dashoffset: var(--trail-start); }
  to { stroke-dashoffset: var(--trail-end); }
}

@keyframes stroke-halo-breathe {
  0%, 100% { opacity: var(--halo-min); }
  50% { opacity: var(--halo-max); }
}

@keyframes stroke-core-breathe {
  0%, 100% { opacity: var(--core-min); }
  50% { opacity: var(--core-max); }
}

@media (prefers-reduced-motion: reduce) {
  .stroke-number__halo,
  .stroke-number__core,
  .stroke-number__trail {
    animation: none;
  }
}
</style>

