<template>
  <section class="page-hero" :style="{ '--hero-p': heroProgress }">
    <div class="page-hero__bg" aria-hidden="true">
      <component :is="activeMount" v-if="isDark && !scrolledAway && activeMount" />
      <div v-else-if="isDark" class="page-hero__dark"></div>
      <div class="page-hero__light"></div>
      <img v-if="lightImage && !isDark" class="page-hero__image" :src="lightImage" alt="" />
      <div v-if="lightImage && !isDark" class="page-hero__image-scrim"></div>
    </div>

    <div class="wrap page-hero__inner">
      <div class="page-hero__copy">
        <p v-if="eyebrow" class="page-hero__eyebrow">
          <span class="page-hero__rule"></span>{{ eyebrow }}
        </p>
        <h1>{{ title }}</h1>
        <p class="sub">{{ subtitle }}</p>
        <slot />
      </div>
    </div>
    <ScrollHint class="page-hero__hint" label="SCROLL" />
  </section>
</template>

<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import ScrollHint from './ScrollHint.vue'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  effect: { type: String, default: 'none' },
  lightImage: { type: String, default: '' },
  eyebrow: { type: String, default: '' }
})

// 四个特效各自异步成 chunk：每个内页只下载自己那一个，
// 避免把四个特效 + React 运行时一起塞进公共 chunk（曾达 458 KB）。
const effectMounts = {
  aero: defineAsyncComponent(() => import('./AeroShardsMount.vue')),
  ghost: defineAsyncComponent(() => import('./GhostFibersMount.vue')),
  'web-threads': defineAsyncComponent(() => import('./WebThreadsMount.vue')),
  particles: defineAsyncComponent(() => import('./ParticlesMount.vue'))
}

const activeMount = computed(() => effectMounts[props.effect] || null)

const HEADER = 60
const SNAP_LOCK_MS = 650
const MIN_DELTA = 24

const isDark = ref(true)
const scrolledAway = ref(false)
const heroProgress = ref(0)
let observer = null
let snapLocked = false
let snapDir = 1
let snapTarget = null
let snapTimer = null

function readTheme() {
  isDark.value = document.documentElement.getAttribute('data-theme') !== 'light'
}

function readScroll() {
  const travel = Math.max(1, window.innerHeight - HEADER)
  heroProgress.value = Math.min(1, Math.max(0, window.scrollY / travel))
  scrolledAway.value = window.scrollY >= travel - 2
}

function contentBoundary() {
  const el = document.querySelector('.route-page > .page-hero + .blk')
  if (!el) return null
  return el.getBoundingClientRect().top + window.scrollY - HEADER
}

function unlockSnap() {
  snapLocked = false
  snapTarget = null
  clearTimeout(snapTimer)
  snapTimer = null
}

function glideSnap(target, dir) {
  snapLocked = true
  snapDir = dir
  snapTarget = Math.max(0, target)
  window.scrollTo({ top: snapTarget, behavior: 'smooth' })
  clearTimeout(snapTimer)
  snapTimer = setTimeout(() => {
    if (snapTarget != null && Math.abs(window.scrollY - snapTarget) > 2) {
      window.scrollTo(0, snapTarget)
    }
    unlockSnap()
  }, SNAP_LOCK_MS)
}

function onWheel(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return
  if (Math.abs(event.deltaY) < MIN_DELTA) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const dir = event.deltaY > 0 ? 1 : -1
  if (snapLocked) {
    if (dir !== snapDir) {
      unlockSnap()
    } else {
      event.preventDefault()
      return
    }
  }

  const y = window.scrollY
  const boundary = contentBoundary()
  if (boundary == null) return

  if (dir > 0 && y < 24 && boundary > y + 8) {
    event.preventDefault()
    glideSnap(boundary, dir)
  } else if (dir < 0 && y > boundary - 8 && y < boundary + 48) {
    event.preventDefault()
    glideSnap(0, dir)
  }
}

onMounted(() => {
  readTheme()
  readScroll()
  observer = new MutationObserver(readTheme)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  window.addEventListener('scroll', readScroll, { passive: true })
  window.addEventListener('wheel', onWheel, { passive: false })
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  window.removeEventListener('scroll', readScroll)
  window.removeEventListener('wheel', onWheel)
  clearTimeout(snapTimer)
})
</script>

<style scoped>
.page-hero {
  position: sticky;
  top: var(--head-h);
  z-index: 0;
  min-height: calc(100dvh - var(--head-h));
  opacity: calc(1 - var(--hero-p, 0) * 0.55);
  transform: scale(calc(1 + var(--hero-p, 0) * 0.02));
  transform-origin: 50% 35%;
  will-change: opacity, transform;
  overflow: hidden;
  background:
    radial-gradient(65% 60% at 22% 18%, rgba(14, 143, 163, 0.16), transparent 66%),
    radial-gradient(55% 55% at 78% 74%, rgba(85, 255, 120, 0.06), transparent 64%),
    linear-gradient(135deg, #060a0c 0%, #0a1215 55%, #060a0c 100%);
  border-bottom: 1px solid var(--divider);
}

.page-hero__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.page-hero__dark {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(65% 60% at 22% 18%, rgba(14, 143, 163, 0.16), transparent 66%),
    radial-gradient(55% 55% at 78% 74%, rgba(85, 255, 120, 0.06), transparent 64%),
    linear-gradient(135deg, #060a0c 0%, #0a1215 55%, #060a0c 100%);
}

.page-hero__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 72% center;
  z-index: 0;
}

.page-hero__image-scrim {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(0deg, #fbfbfc 0%, rgba(251, 251, 252, 0.94) 16%, rgba(251, 251, 252, 0.58) 38%, rgba(251, 251, 252, 0) 72%);
}

.page-hero__light {
  display: none;
  position: absolute;
  inset: 0;
  background:
    radial-gradient(50% 55% at 82% 72%, rgba(85, 255, 120, 0.07), transparent 65%),
    linear-gradient(0deg, #f7fbfc 0%, #eef4f7 46%, #fbfbfc 100%);
}

.page-hero__hint {
  position: absolute;
  left: 50%;
  bottom: 18px;
  z-index: 2;
  transform: translateX(-50%);
}

.page-hero__inner {
  position: relative;
  z-index: 1;
  min-height: calc(100dvh - var(--head-h));
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  column-gap: clamp(28px, 6vw, 120px);
  padding-top: clamp(110px, 18vh, 220px);
  padding-bottom: clamp(52px, 9vh, 120px);
}

.page-hero__copy {
  align-self: end;
  max-width: min(48rem, 62vw);
}

.page-hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 18px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.page-hero__rule {
  display: block;
  width: 34px;
  height: 1px;
  background: currentColor;
  opacity: 0.7;
}

.page-hero h1 {
  margin: 0;
  max-inline-size: 12ch;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: clamp(38px, 4.8vw, 68px);
  line-height: 1.04;
  font-weight: 800;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.page-hero .sub {
  margin: 22px 0 0;
  max-width: 34em;
  color: var(--ink2);
  font-size: clamp(15px, 1.2vw, 18px);
  line-height: 1.8;
}

:global(html[data-theme="light"]) .page-hero {
  background: #f7fbfc;
}

:global(html[data-theme="light"]) .page-hero__light {
  display: block;
}

@media (max-width: 900px) {
  .page-hero__inner {
    display: block;
    padding-top: clamp(100px, 16vh, 180px);
    padding-bottom: clamp(48px, 8vh, 92px);
  }

  .page-hero__copy {
    max-width: none;
  }
}
</style>
