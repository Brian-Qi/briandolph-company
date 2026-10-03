<template>
  <section
    class="hero"
    :class="{ 'is-paused': paused }"
    aria-roledescription="轮播"
    aria-label="工作室简介"
    @mouseenter="hoverPaused = true"
    @mouseleave="hoverPaused = false"
    @focusin="hoverPaused = true"
    @focusout="hoverPaused = false"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div class="viewport">
      <div class="track" :style="{ transform: 'translateX(-' + index * 100 + '%)' }">
        <article
          v-for="(s, i) in slides"
          :key="s.img"
          class="slide"
          :aria-hidden="i !== index"
          :inert="i !== index"
        >
          <img
            :src="s.img"
            :alt="s.alt"
            :loading="i === 0 ? 'eager' : 'lazy'"
            :fetchpriority="i === 0 ? 'high' : 'auto'"
            decoding="async"
            :class="{ on: i === index }"
          />
          <span class="tint" aria-hidden="true"></span>
          <span class="scrim" aria-hidden="true"></span>

          <div class="copy">
            <div class="wrap">
              <div class="lead">
                <p class="eyebrow">{{ s.eyebrow }}</p>
                <component :is="i === index ? 'h1' : 'p'" class="title">{{ s.title }}</component>
                <p class="sub">{{ s.sub }}</p>
                <div class="btns">
                  <RouterLink class="btn primary" :to="s.to">{{ s.cta }}</RouterLink>
                  <RouterLink class="btn ghost" :to="s.to2">{{ s.cta2 }}</RouterLink>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <button class="side prev" aria-label="上一张" @click="go(index - 1)">←</button>
    <button class="side next" aria-label="下一张" @click="go(index + 1)">→</button>

    <div class="dots">
      <button
        v-for="(s, i) in slides"
        :key="s.tab"
        class="dot"
        :class="{ on: i === index }"
        :aria-label="'第 ' + (i + 1) + ' 张：' + s.tab"
        :aria-current="i === index ? 'true' : 'false'"
        @click="go(i)"
      ></button>
    </div>

    <button
      class="pause"
      :aria-label="userPaused ? '继续自动播放' : '暂停自动播放'"
      :aria-pressed="userPaused"
      @click="userPaused = !userPaused"
    >
      <span v-if="userPaused" aria-hidden="true">▶</span>
      <span v-else aria-hidden="true">❚❚</span>
    </button>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const slides = [
  {
    eyebrow: '独立数字内容工作室',
    title: '把想法，做成能上线的产品。',
    sub: '杭州的独立数字内容工作室——策划、设计、开发、上线，一支团队全程自研。',
    cta: '查看代表案例', to: '/works',
    cta2: '联系我们', to2: '/contact',
    img: '/hero/slide-1.webp',
    alt: '游戏与数字内容开发',
    tab: '关于我们'
  },
  {
    eyebrow: '我们的坚持',
    title: '小而完整，全程负责。',
    sub: '一支团队从需求走到上线，不外包、不转包，交付可用、可维护。',
    cta: '了解合作流程', to: '/services',
    cta2: '联系我们', to2: '/contact',
    img: '/hero/slide-2.webp',
    alt: '交付与协作',
    tab: '我们的坚持'
  },
  {
    eyebrow: '前沿方向',
    title: '把现实搬进可交互的数字孪生。',
    sub: '面向游戏、展示与仿真场景的 VR 与数字孪生内容制作。',
    cta: '了解能力', to: '/services',
    cta2: '联系我们', to2: '/contact',
    img: '/hero/slide-3.webp',
    alt: 'VR 与数字孪生',
    tab: '前沿方向'
  }
]

const index = ref(0)
const hoverPaused = ref(false)
const userPaused = ref(false)
const paused = computed(() => hoverPaused.value || userPaused.value)
let timer = null

function go(i) {
  index.value = (i + slides.length) % slides.length
}

function onKey(e) {
  if (e.key === 'ArrowLeft') go(index.value - 1)
  else if (e.key === 'ArrowRight') go(index.value + 1)
}

let sx = 0
function onTouchStart(e) { sx = e.changedTouches[0].clientX }
function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - sx
  if (Math.abs(dx) > 45) go(index.value + (dx < 0 ? 1 : -1))
}

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduce) timer = setInterval(() => { if (!paused.value) go(index.value + 1) }, 7000)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.hero {
  position: relative;
  height: clamp(620px, 86vh, 900px);
  overflow: hidden;
  background: #0a0f17;
  border-bottom: 1px solid var(--line);
}

.viewport { position: absolute; inset: 0; overflow: hidden; }
.track {
  display: flex;
  height: 100%;
  transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.slide {
  position: relative;
  flex: 0 0 100%;
  min-width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
}
.slide img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transform: scale(1.04);
}
.slide img.on { animation: ken 9s ease-out both; }
.hero.is-paused .slide img.on { animation-play-state: paused; }
@keyframes ken { from { transform: scale(1.04); } to { transform: scale(1.1); } }

/* 极光着色：左上紫、右下青，screen 叠加让冷调回温 */
.tint {
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: 0.5;
  background:
    radial-gradient(58% 80% at 14% 20%, rgba(159, 130, 253, 0.55), transparent 60%),
    radial-gradient(66% 86% at 86% 80%, rgba(89, 211, 180, 0.45), transparent 62%);
}

.scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(8, 10, 22, 0.94) 0%, rgba(8, 10, 22, 0.7) 32%, rgba(8, 10, 22, 0.16) 64%, rgba(8, 10, 22, 0) 100%),
    linear-gradient(0deg, rgba(8, 10, 22, 0.92) 0%, rgba(8, 10, 22, 0.34) 28%, rgba(8, 10, 22, 0) 56%);
}

.copy {
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  align-items: center;
  padding-bottom: 60px;
}
.copy .wrap { width: 100%; }
.lead { max-width: 940px; }
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 18px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.24em;
}
.eyebrow::before {
  content: "";
  width: 30px;
  height: 2px;
  background: linear-gradient(90deg, #9f82fd, #59d3b4);
}
.title {
  margin: 0;
  color: #fff;
  font-size: clamp(34px, 4.4vw, 62px);
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-shadow: 0 3px 40px rgba(0, 0, 0, 0.55);
}
.sub {
  margin: 22px 0 0;
  color: #d3d9e6;
  font-size: 18px;
  line-height: 1.75;
  max-width: 30em;
  text-shadow: 0 1px 18px rgba(0, 0, 0, 0.6);
}
.btns { display: flex; gap: 14px; margin-top: 38px; flex-wrap: wrap; }

/* 左右两侧箭头 */
.side {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 4;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 20px;
  color: #fff;
  background: rgba(11, 14, 24, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: background 0.22s ease, border-color 0.22s ease, color 0.22s ease;
}
.side:hover { background: var(--grad); color: var(--on-accent); border-color: transparent; }
.side.prev { left: 30px; }
.side.next { right: 30px; }

/* 居中圆点（热区 ≥ 24px） */
.dots {
  position: absolute;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  align-items: center;
}
.dot {
  position: relative;
  width: 26px;
  height: 24px;
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
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.4);
  transition: width 0.3s ease, background 0.3s ease;
}
.dot:hover::after { background: rgba(255, 255, 255, 0.72); }
.dot.on::after { width: 24px; background: var(--grad); }

/* 暂停 / 播放 */
.pause {
  position: absolute;
  right: 30px;
  bottom: 20px;
  z-index: 4;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 13px;
  color: #fff;
  background: rgba(11, 14, 24, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: background 0.22s ease, border-color 0.22s ease, color 0.22s ease;
}
.pause:hover { background: var(--grad); color: var(--on-accent); border-color: transparent; }

@media (prefers-reduced-motion: reduce) {
  .track { transition: none; }
  .slide img.on { animation: none; }
}

@media (max-width: 900px) {
  .hero { height: clamp(520px, 82vh, 680px); }
  .slide img { object-position: 68% center; }
  .copy { padding-bottom: 92px; }
  .lead { max-width: none; }
  .title { font-size: clamp(28px, 8vw, 40px); }
  .sub { font-size: 15.5px; margin-top: 16px; }
  .btns { margin-top: 26px; }
  .scrim { background: linear-gradient(0deg, rgba(8,10,22,.95) 0%, rgba(8,10,22,.7) 44%, rgba(8,10,22,.38) 100%); }
  .side { display: none; }
  .pause { right: 20px; bottom: 16px; }
  .dots { bottom: 20px; }
}
</style>
