<template>
  <span class="tech-number">
    <span class="tech-number__layout" aria-hidden="true">{{ text }}</span>
    <svg class="tech-number__svg" width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient
          :id="`tech-flow-${uid}`"
          x1="-0.4"
          y1="0"
          x2="1.4"
          y2="0"
          spreadMethod="reflect"
        >
          <stop offset="0" stop-color="#071a16" />
          <stop offset="0.28" stop-color="#10b981" />
          <stop offset="0.5" stop-color="#d9f99d" />
          <stop offset="0.72" stop-color="#10b981" />
          <stop offset="1" stop-color="#071a16" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values="-0.2 0;0.2 0;-0.2 0"
            dur="5.2s"
            repeatCount="indefinite"
          />
        </linearGradient>
        <filter :id="`tech-glow-${uid}`" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter :id="`tech-halo-${uid}`" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <text
        class="tech-number__base"
        x="50%"
        y="52%"
        text-anchor="middle"
        dominant-baseline="middle"
        :stroke="`url(#tech-flow-${uid})`"
      >{{ text }}</text>
      <text
        class="tech-number__trail-halo"
        x="50%"
        y="52%"
        text-anchor="middle"
        dominant-baseline="middle"
        :stroke="`url(#tech-flow-${uid})`"
        :filter="`url(#tech-halo-${uid})`"
        :style="{ animationDelay: `-${Number(uid) * 0.9}s` }"
      >{{ text }}</text>
      <text
        class="tech-number__trail"
        x="50%"
        y="52%"
        text-anchor="middle"
        dominant-baseline="middle"
        :stroke="`url(#tech-flow-${uid})`"
        :filter="`url(#tech-glow-${uid})`"
        :style="{ animationDelay: `-${Number(uid) * 0.9}s` }"
      >{{ text }}</text>
    </svg>
  </span>
</template>

<script setup>
defineProps({
  text: { type: String, default: '01' },
  uid: { type: [String, Number], default: 0 },
  active: { type: Boolean, default: false }
})
</script>

<style scoped>
.tech-number {
  position: relative;
  display: inline-block;
  vertical-align: top;
  line-height: inherit;
}

.tech-number__layout {
  visibility: hidden;
}

.tech-number__svg {
  position: absolute;
  inset: 0;
  display: block;
  overflow: visible;
}

.tech-number__svg text {
  font: inherit;
  letter-spacing: inherit;
  -webkit-text-stroke: 0;
}

.tech-number__base {
  fill: none;
  stroke-width: 6;
  opacity: 0.38;
}

.tech-number__trail-halo,
.tech-number__trail {
  fill: none;
  stroke-width: 6;
  stroke-linecap: butt;
  stroke-linejoin: round;
  stroke-dasharray: 640 80;
  animation: tech-trail 2s linear infinite;
}

.tech-number__trail-halo {
  opacity: 0.22;
  animation-name: tech-trail-halo;
}

.tech-number__trail {
  opacity: 0.92;
}

@keyframes tech-trail {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -720; }
}

@keyframes tech-trail-halo {
  from { stroke-dashoffset: 0; opacity: 0.12; }
  50% { opacity: 0.32; }
  to { stroke-dashoffset: -720; opacity: 0.12; }
}

@media (prefers-reduced-motion: reduce) {
  .tech-number__trail-halo,
  .tech-number__trail {
    animation: none;
  }
}
</style>
