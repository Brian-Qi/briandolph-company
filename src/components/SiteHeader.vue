<template>
  <header class="site-head">
    <div class="wrap nav">
      <RouterLink class="brand" to="/" @click="open = false">
        <img class="mark" src="/logo.png" alt="" width="28" height="28" /> 彼岸时墟游戏工作室
      </RouterLink>

      <button
        class="burger"
        :aria-expanded="open"
        aria-controls="site-menu"
        aria-label="打开菜单"
        @click="open = !open"
      >
        <span></span><span></span><span></span>
      </button>

      <ul id="site-menu" class="menu" :class="{ show: open }">
        <li v-for="n in nav" :key="n.to">
          <RouterLink :class="{ active: isActive(n.to) }" :to="n.to" @click="open = false">
            {{ n.label }}
          </RouterLink>
        </li>
        <li class="menu-cta">
          <button class="theme-switch" type="button" :class="{ 'is-light': isLight }" :aria-pressed="String(isLight)" :aria-label="isLight ? '切换到深色' : '切换到浅色'" @click="applyTheme(isLight ? 'dark' : 'light', $event)">
            <span class="tt-track">
              <span class="knob">
                <svg v-if="isLight" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
              </span>
            </span>
          </button>
        </li>
      </ul>

      <button class="theme-switch top-cta" type="button" :class="{ 'is-light': isLight }" :aria-pressed="String(isLight)" :aria-label="isLight ? '切换到深色' : '切换到浅色'" @click="applyTheme(isLight ? 'dark' : 'light', $event)">
        <span class="tt-track">
          <span class="knob">
            <svg v-if="isLight" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
          </span>
        </span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const open = ref(false)
const isLight = ref(false)
onMounted(() => { isLight.value = document.documentElement.getAttribute('data-theme') === 'light' })
function applyTheme(t, e) {
  if ((t === 'light') === isLight.value) return
  const el = e && e.currentTarget ? e.currentTarget : null
  const rect = el ? el.getBoundingClientRect() : null
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 40
  const y = rect ? rect.top + rect.height / 2 : 40
  const commit = () => {
    isLight.value = t === 'light'
    if (t === 'light') document.documentElement.setAttribute('data-theme', 'light')
    else document.documentElement.removeAttribute('data-theme')
    try { localStorage.setItem('theme', t) } catch (err) {}
  }
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const root = document.documentElement
  if (!reduce && typeof document.startViewTransition === 'function') {
    root.style.setProperty('--tx', x + 'px')
    root.style.setProperty('--ty', y + 'px')
    root.classList.add('vt-theme')
    const vt = document.startViewTransition(async () => { commit(); await nextTick() })
    vt.finished.finally(() => root.classList.remove('vt-theme'))
  } else {
    commit()
  }
}
const nav = [
  { to: '/', label: '首页' },
  { to: '/about', label: '关于我们' },
  { to: '/services', label: '核心业务' },
  { to: '/works', label: '代表案例' },
  { to: '/contact', label: '联系我们' }
]
const isActive = (p) => (p === '/' ? route.path === '/' : route.path.startsWith(p))
watch(() => route.fullPath, () => { open.value = false })
</script>
