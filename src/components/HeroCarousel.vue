<template>
  <section
    class="hero"
    :style="{ '--bgp': bgPos }"
    aria-roledescription="轮播"
    aria-label="工作室简介"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div class="hero-bg" data-topography aria-hidden="true"></div>
    <div class="viewport">
      <div
        class="track"
        :class="{ 'no-anim': !anim }"
        :style="{ transform: 'translateX(-' + pos * 100 + '%)' }"
      >
        <article
          v-for="(it, i) in loop"
          :key="i"
          class="slide"
          :aria-hidden="i !== pos"
          :inert="i !== pos"
        >
          <div v-if="theme === 'light'" class="slide-media" aria-hidden="true">
            <img
              :src="it.s.imgLight"
              alt=""
              loading="eager"
              :fetchpriority="it.real === 0 ? 'high' : 'auto'"
              decoding="async"
            >
          </div>
          <div class="wrap slide-inner">
            <div class="copy-block">
              <component :is="i === pos ? 'h1' : 'p'" class="title">{{ it.s.title }}</component>
              <p class="sub">{{ it.s.sub }}</p>
              <div class="btns">
                <RouterLink class="btn primary" :to="it.s.to">{{ it.s.cta }}</RouterLink>
              </div>
            </div>
            <div class="index" aria-hidden="true">
              <HeroStrokeNumber
                v-if="theme === 'light'"
                :text="String(it.real + 1).padStart(2, '0')"
                :uid="i"
              />
              <HeroTechNumber
                v-else
                :text="String(it.real + 1).padStart(2, '0')"
                :uid="i"
                :active="i === pos"
              />
            </div>
          </div>
        </article>
      </div>
    </div>

    <button class="side prev" :class="{ visible: nearPrev }" aria-label="上一张" @click="advance(-1)">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M15 5 8 12l7 7" />
      </svg>
    </button>
    <button class="side next" :class="{ visible: nearNext }" aria-label="下一张" @click="advance(1)">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <div class="dots">
      <button
        v-for="(s, i) in slides"
        :key="s.tab"
        class="dot"
        :class="{ on: i === current }"
        :aria-label="'第 ' + (i + 1) + ' 张：' + s.tab"
        :aria-current="i === current ? 'true' : 'false'"
        :data-testid="'hero-dot-' + i"
        @click="goTo(i)"
      ></button>
    </div>

  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import HeroStrokeNumber from './HeroStrokeNumber.vue'
import HeroTechNumber from './HeroTechNumber.vue'

const slides = [
  {
    title: '把想法 做成能上线的产品',
    sub: '杭州的独立数字内容工作室——策划、设计、开发、上线，一支团队全程自研。',
    cta: '查看代表案例', to: '/works',
    tab: '关于我们',
    imgLight: '/hero/light-01-desk.webp',
    imgDark: '/hero/slide-1.webp'
  },
  {
    title: '小而完整 全程负责',
    sub: '从需求到上线由同一支团队完成，不外包、不转包。',
    cta: '了解合作流程', to: '/services',
    tab: '我们的坚持',
    imgLight: '/hero/light-02-archive.webp',
    imgDark: '/hero/slide-2.webp'
  },
  {
    title: '把现实搬进可交互的数字孪生',
    sub: '面向游戏、展示与仿真场景的 VR 与数字孪生内容制作。',
    cta: '了解能力', to: '/services',
    tab: '前沿方向',
    imgLight: '/hero/light-03-vr.webp',
    imgDark: '/hero/slide-3.webp'
  }
]
const n = slides.length

// 首尾各克隆一张 → 循环时同方向无缝
const loop = [
  { s: slides[n - 1], real: n - 1 },
  ...slides.map((s, i) => ({ s, real: i })),
  { s: slides[0], real: 0 }
]
const L = loop.length
const pos = ref(1)            // loop 中的位置
const anim = ref(true)
const bgPos = ref(0)          // 背景单调计数（永不回绕）
const current = computed(() => ((pos.value - 1) % n + n) % n)
const theme = ref(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark')

const nearPrev = ref(false)
const nearNext = ref(false)

let busy = false
let timer = null
let autoStarted = false
let themeObserver = null

function startAuto() {
  if (autoStarted || timer) return
  autoStarted = true
  timer = setInterval(() => advance(1), 7000)
}

function startAfterSplash() {
  let seen = false
  try {
    seen = sessionStorage.getItem('biyu_splash_seen') === '1'
  } catch {}
  const splashOnPage =
    document.getElementById('biyu-splash') || document.getElementById('biyu-splash-boot')
  if (splashOnPage || !seen) {
    window.addEventListener('biyu-splash-done', startAuto, { once: true })
    return
  }
  startAuto()
}

function snapTo(target) {
  anim.value = false
  pos.value = target
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { anim.value = true; busy = false })
  })
}

function advance(dir) {
  if (busy) return
  busy = true
  anim.value = true
  bgPos.value += dir
  pos.value += dir
  const target = pos.value
  setTimeout(() => {
    if (target >= L - 1) snapTo(1)
    else if (target <= 0) snapTo(L - 2)
    else busy = false
  }, 1000)
}

function goTo(i) {
  if (busy || i === current.value) return
  bgPos.value += i - current.value
  anim.value = true
  pos.value = i + 1
}

function onKey(e) {
  if (e.key === 'ArrowLeft') advance(-1)
  else if (e.key === 'ArrowRight') advance(1)
}

let sx = 0
function onTouchStart(e) { sx = e.changedTouches[0].clientX }
function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - sx
  if (Math.abs(dx) > 45) advance(dx < 0 ? 1 : -1)
}

function onPointerMove(e) {
  if (e.pointerType && e.pointerType !== 'mouse') return
  const rect = e.currentTarget.getBoundingClientRect()
  const midY = rect.top + rect.height / 2
  nearPrev.value = Math.hypot(e.clientX - (rect.left + 54), e.clientY - midY) < 150
  nearNext.value = Math.hypot(e.clientX - (rect.right - 54), e.clientY - midY) < 150
}

function onPointerLeave() {
  nearPrev.value = false
  nearNext.value = false
}

onMounted(() => {
  themeObserver = new MutationObserver(() => {
    theme.value = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduce) startAfterSplash()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  themeObserver?.disconnect()
  window.removeEventListener('biyu-splash-done', startAuto)
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.hero {
  position: relative;
  height: calc(100dvh - var(--head-total));
  /* 原来是写死的 560px，窄屏会溢出；改成按视口，最低保证内容可放 */
  min-height: min(560px, calc(100dvh - var(--head-total)));
  overflow: hidden;
  background: var(--bg);
  border-bottom: 1px solid var(--divider);
  user-select: none;
  -webkit-user-select: none;
}
/* 轮播的图和字不参与选中/拖拽 */
.hero img { -webkit-user-drag: none; user-drag: none; }
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.55;
  pointer-events: auto;
}

.viewport { position: absolute; inset: 0; overflow: hidden; z-index: 1; pointer-events: none; }
.viewport a, .viewport button { pointer-events: auto; }

.track {
  display: flex;
  height: 100%;
  transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1);
}
.track.no-anim { transition: none; }

.slide {
  position: relative;
  flex: 0 0 100%;
  min-width: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.slide-media {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
.slide-media::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    #ffffff 0%,
    rgba(255, 255, 255, 0.86) 22%,
    rgba(255, 255, 255, 0.48) 48%,
    rgba(255, 255, 255, 0) 76%
  );
}

.slide-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 72% center;
  display: block;
}
.slide-inner {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  width: 100%;
}
.copy-block { max-width: 760px; }
.index {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(120px, 16vw, 260px);
  line-height: 0.8;
  letter-spacing: -0.04em;
  color: transparent;
  -webkit-text-stroke: 2px var(--hero-index);
  user-select: none;
  flex: none;
}

.title {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: clamp(40px, 5.2vw, 120px);
  line-height: 1.04;
  font-weight: 900;
  letter-spacing: -0.03em;
  text-wrap: balance;
  max-inline-size: 14ch;
}
.sub {
  margin: 26px 0 0;
  color: var(--ink2);
  font-size: 18px;
  line-height: 1.75;
  max-width: 34em;
}
.btns { display: flex; gap: 14px; margin-top: 40px; flex-wrap: wrap; }

/* 两侧箭头 */
.side {
  position: absolute;
  top: 50%;
  transform: translateY(-50%) scale(.96);
  z-index: 4;
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: var(--radius);
  display: grid;
  place-items: center;
  color: var(--ink2);
  background: transparent;
  border: 1px solid var(--divider);
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity .22s var(--ease),
    transform .22s var(--ease),
    background .26s var(--ease),
    border-color .26s var(--ease),
    color .26s var(--ease);
}
.side svg {
  transition: transform .26s var(--ease);
}
.side.visible,
.side:focus-visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(-50%) scale(1);
}
.side:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 9%, transparent);
}
.side.prev:hover svg { transform: translateX(-2px); }
.side.next:hover svg { transform: translateX(2px); }
.side.prev { left: 30px; }
.side.next { right: 30px; }

/* 线段式指示器 */

.dots {
  position: absolute;
  left: 50%;
  bottom: 30px;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 8px;
}
.dot {
  position: relative;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}
.dot::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 2px;
  background: rgba(128, 132, 142, 0.35);
  transition: background 0.3s ease;
}
.dot:hover::after { background: rgba(128, 132, 142, 0.65); }
.dot.on::after { background: var(--accent); }

@media (prefers-reduced-motion: reduce) {
  .track { transition: none; }
}

@media (max-width: 900px) {
  /* 手机上 hero 占满一屏（减掉页头），特效铺满整屏 */
  .hero { height: calc(100svh - var(--head-total)); min-height: min(520px, calc(100svh - var(--head-total))); }
  /* 窄屏地形线更稀，提亮补偿，保证特效仍看得见 */
  .hero-bg { opacity: 0.8; }
  /* 手机不加载 topography（要 256KB 的 vendor），用渐变托底，避免满屏一片纯黑 */
  .hero {
    background:
      radial-gradient(80% 52% at 50% 0%, rgba(14, 143, 163, 0.22), transparent 64%),
      radial-gradient(62% 46% at 84% 96%, rgba(85, 255, 120, 0.07), transparent 62%),
      linear-gradient(180deg, #060a0c 0%, #0a1215 52%, #060a0c 100%);
  }
  .index { display: none; }
  .copy-block { max-width: none; }
  .title { font-size: clamp(30px, 8.4vw, 46px); }
  .sub { font-size: 15.5px; margin-top: 18px; }
  .btns { margin-top: 28px; }
  .side { display: none; }
  .dots { bottom: 22px; }
    .slide-media img { object-position: 66% center; }
}

@media (max-width: 900px) and (max-height: 560px) {
  /* 横屏：优先保证内容可见 */
  .hero { height: auto; min-height: 420px; padding: 32px 0; }
}

/* 浅色主题下窄屏的托底渐变换成浅色雾，别在浅底上糊一块黑 */
@media (max-width: 900px) {
  :global(html[data-theme="light"]) .hero {
    background:
      radial-gradient(70% 50% at 50% 0%, rgba(14, 143, 163, 0.14), transparent 62%),
      linear-gradient(180deg, #f7fbfc 0%, #eef4f6 55%, #f7fbfc 100%);
  }
}
</style>
