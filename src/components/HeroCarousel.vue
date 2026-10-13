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
          :key="s.tab"
          class="slide"
          :aria-hidden="i !== index"
          :inert="i !== index"
        >
          <div class="wrap slide-inner">
            <div class="copy-block">
              <component :is="i === index ? 'h1' : 'p'" class="title">{{ s.title }}</component>
              <p class="sub">{{ s.sub }}</p>
              <div class="btns">
                <RouterLink class="btn primary" :to="s.to">{{ s.cta }}</RouterLink>
                <RouterLink class="btn ghost" :to="s.to2">{{ s.cta2 }}</RouterLink>
              </div>
            </div>
            <div class="index" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</div>
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
    tab: '关于我们'
  },
  {
    eyebrow: '我们的坚持',
    title: '小而完整，全程负责。',
    sub: '一支团队从需求走到上线，不外包、不转包，交付可用、可维护。',
    cta: '了解合作流程', to: '/services',
    cta2: '联系我们', to2: '/contact',
    tab: '我们的坚持'
  },
  {
    eyebrow: '前沿方向',
    title: '把现实搬进可交互的数字孪生。',
    sub: '面向游戏、展示与仿真场景的 VR 与数字孪生内容制作。',
    cta: '了解能力', to: '/services',
    cta2: '联系我们', to2: '/contact',
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
  height: calc(100dvh - 72px);
  min-height: 560px;
  overflow: hidden;
  background: var(--bg);
  border-bottom: 1px solid var(--divider);
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
  display: flex;
  align-items: center;
}
.slide-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  width: 100%;
}
.slide:nth-child(even) .slide-inner { flex-direction: row-reverse; }
.copy-block { max-width: 760px; }
.index {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(120px, 16vw, 260px);
  line-height: 0.8;
  letter-spacing: -0.04em;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(128, 132, 142, 0.38);
  user-select: none;
  flex: none;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 22px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.24em;
}
.eyebrow::before { content: ""; width: 30px; height: 2px; background: var(--accent); }

.title {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: clamp(40px, 5.2vw, 120px);
  line-height: 1.04;
  font-weight: 900;
  letter-spacing: -0.03em;
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
  transform: translateY(-50%);
  z-index: 4;
  width: 48px;
  height: 48px;
  border-radius: var(--radius);
  display: grid;
  place-items: center;
  font-size: 18px;
  color: var(--ink2);
  background: var(--surface-2);
  border: 0;
  cursor: pointer;
  transition: background .26s var(--ease), color .26s var(--ease);
}
.side:hover { color: var(--on-accent); background: var(--accent); }
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
  width: 36px;
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
  width: 32px;
  height: 2px;
  background: rgba(128, 132, 142, 0.35);
  transition: background 0.3s ease;
}
.dot:hover::after { background: rgba(128, 132, 142, 0.65); }
.dot.on::after { background: var(--accent); }

/* 暂停 */
.pause {
  position: absolute;
  right: 30px;
  bottom: 24px;
  z-index: 4;
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  display: grid;
  place-items: center;
  font-size: 12px;
  color: var(--ink2);
  background: var(--surface-2);
  border: 0;
  cursor: pointer;
  transition: background .26s var(--ease), color .26s var(--ease), transform .32s var(--ease);
}
.pause:hover { color: var(--on-accent); background: var(--accent); transform: translateY(-2px); }

@media (prefers-reduced-motion: reduce) {
  .track { transition: none; }
}

@media (max-width: 900px) {
  .hero { height: calc(100dvh - 72px); min-height: 480px; }
  .index { display: none; }
  .copy-block { max-width: none; }
  .title { font-size: clamp(30px, 8.4vw, 46px); }
  .sub { font-size: 15.5px; margin-top: 18px; }
  .btns { margin-top: 28px; }
  .side { display: none; }
  .pause { right: 20px; bottom: 18px; }
  .dots { bottom: 22px; }
}
</style>
