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
        <h1>{{ title }}</h1>
        <p v-if="subtitle" class="sub">{{ subtitle }}</p>
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  effect: { type: String, default: 'none' },
  lightImage: { type: String, default: '' }
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
const MIN_DELTA = 24

const isDark = ref(true)
const scrolledAway = ref(false)
const heroProgress = ref(0)
let observer = null
let snapLocked = false
let snapDir = 1
let snapTarget = null
let snapRaf = null

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
  cancelGlide()
}

function cancelGlide() {
  if (snapRaf != null) {
    cancelAnimationFrame(snapRaf)
    snapRaf = null
  }
}

// 自己驱动滚动动画：可随时取消、结束时精确到位。
// 原来用 scrollTo({behavior:'smooth'}) + 650ms 定时器硬跳，
// 动画没跑完就跳、反向滚动时又取消不掉，会出现卡在半路。
function glideSnap(target, dir) {
  snapLocked = true
  snapDir = dir
  snapTarget = Math.max(0, target)
  cancelGlide()

  const start = window.scrollY
  const dist = snapTarget - start
  if (Math.abs(dist) < 1) {
    unlockSnap()
    return
  }

  const duration = Math.min(560, Math.max(240, Math.abs(dist) * 0.5))
  const t0 = performance.now()
  const ease = t => 1 - Math.pow(1 - t, 3)

  const step = now => {
    const p = Math.min(1, (now - t0) / duration)
    window.scrollTo(0, start + dist * ease(p))
    if (p < 1) {
      snapRaf = requestAnimationFrame(step)
    } else {
      snapRaf = null
      window.scrollTo(0, snapTarget)
      unlockSnap()
    }
  }
  snapRaf = requestAnimationFrame(step)
}

function onWheel(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return
  if (Math.abs(event.deltaY) < MIN_DELTA) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const dir = event.deltaY > 0 ? 1 : -1
  if (snapLocked) {
    if (dir !== snapDir) {
      // 反向滚动：立刻放弃吸附，把控制权交还浏览器
      unlockSnap()
      return
    }
    event.preventDefault()
    return
  }

  const y = window.scrollY
  const boundary = contentBoundary()
  if (boundary == null || boundary <= 0) return

  if (dir > 0) {
    // 还没离开 hero：直接送到内容块顶部，别停在半路
    if (y < boundary - 8) {
      event.preventDefault()
      glideSnap(boundary, dir)
    }
  } else if (y < boundary + 48) {
    // 向上：content 顶部附近要回到 hero 顶部；
    // 已经滑进 hero 中间（上一帧滚过头了）也要拉回顶部，否则就卡在一半
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
  cancelGlide()
})
</script>

<style scoped>
.page-hero {
  position: sticky;
  top: var(--head-total);
  z-index: 0;
  min-height: calc(100dvh - var(--head-total));
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
  user-select: none;
  -webkit-user-select: none;
}
/* Hero 必须是整屏（霸屏）：min-height 只减页头高度。
   曾试过再减 80px 让下一区块首行露出，观感直接垮掉，已回退。 */
/* 内页 hero 的图和字不参与选中/拖拽 */
.page-hero img { -webkit-user-drag: none; user-drag: none; }

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


.page-hero__inner {
  position: relative;
  z-index: 1;
  min-height: calc(100dvh - var(--head-total));
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  column-gap: clamp(28px, 6vw, 120px);
  padding-top: clamp(110px, 18vh, 220px);
  padding-bottom: clamp(52px, 9vh, 120px);
}

.page-hero__copy {
  align-self: end;
  padding-top: 8px;
  max-width: min(48rem, 62vw);
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
  /* 手机上内页 hero 占满一屏（减掉页头），内容居中，特效整个铺满 */
  .page-hero {
    min-height: calc(100svh - var(--head-total));
  }

  .page-hero__inner {
    display: flex;
    align-items: center;
    min-height: calc(100svh - var(--head-total));
    padding-top: clamp(64px, 10vh, 110px);
    padding-bottom: clamp(72px, 12vh, 130px);
  }

  .page-hero__copy {
    max-width: none;
    /* 满屏构图：文案落脚在下方 1/3，上方留给特效 */
    align-self: flex-end;
    margin-bottom: clamp(8px, 2vh, 24px);
  }

  /* 特效亮部会压住文字（服务页最明显），加一层只在文案区的暗角兜住对比度，
     渐变到透明，特效仍然完整可见 */
  .page-hero__copy {
    position: relative;
    isolation: isolate; /* 让 ::before 的 -1 只在文案内部生效，不会沉到特效层后面 */
  }

  .page-hero__copy::before {
    content: "";
    position: absolute;
    inset: -72px -48px -72px -48px;
    z-index: -1;
    pointer-events: none;
    background: radial-gradient(
      ellipse 130% 135% at 16% 55%,
      rgba(6, 8, 12, 0.8) 0%,
      rgba(6, 8, 12, 0.6) 26%,
      rgba(6, 8, 12, 0.28) 52%,
      rgba(6, 8, 12, 0.06) 74%,
      rgba(6, 8, 12, 0) 92%
    );
  }

  .page-hero h1,
  .page-hero .sub {
    text-shadow: 0 1px 12px rgba(0, 0, 0, 0.55);
  }
}

@media (max-width: 900px) and (max-height: 560px) {
  .page-hero__inner { min-height: 420px; padding-top: 64px; }
}

/* 浅色主题下暗角换成浅色雾，别在浅底上糊一块黑 */
@media (max-width: 900px) {
  :global(html[data-theme="light"]) .page-hero__copy::before {
    background: radial-gradient(
      ellipse 130% 135% at 16% 55%,
      rgba(255, 255, 255, 0.84) 0%,
      rgba(255, 255, 255, 0.64) 26%,
      rgba(255, 255, 255, 0.3) 52%,
      rgba(255, 255, 255, 0.06) 74%,
      rgba(255, 255, 255, 0) 92%
    );
  }

  :global(html[data-theme="light"]) .page-hero h1,
  :global(html[data-theme="light"]) .page-hero .sub {
    text-shadow: 0 1px 12px rgba(255, 255, 255, 0.6);
  }
}
</style>
