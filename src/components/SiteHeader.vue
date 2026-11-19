<template>
  <header class="site-head">
    <div class="wrap nav">
      <RouterLink class="brand" to="/" aria-label="彼岸时墟 · 首页" @click="open = false">
        <img class="mark" src="/logo.svg" alt="" width="28" height="28" />
        <span class="brand-name" aria-hidden="true"></span>
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

      <!-- 账号区：登录后显示首字母头像 -->
      <div ref="avatarWrap" class="avatar-wrap">
        <button
          class="avatar-btn"
          :class="{ 'is-user': !!accUser }"
          type="button"
          aria-haspopup="menu"
          :aria-expanded="String(menuOpen)"
          :aria-label="accUser ? '账号：' + accUser.username : '账号'"
          @click.stop="menuOpen = !menuOpen"
        >
          <span v-if="accUser" class="avatar-initial">{{ initial }}</span>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="8.5" r="3.6" />
            <path d="M4.5 20c1.4-3.4 4-5.1 7.5-5.1s6.1 1.7 7.5 5.1" />
          </svg>
        </button>

        <div v-if="menuOpen" class="avatar-menu" role="menu">
          <template v-if="accUser">
            <div class="avatar-who">
              <b>{{ accUser.username }}</b>
              <i v-if="accUser.publicNo">编号 {{ accUser.publicNo }}</i>
            </div>
            <a role="menuitem" :href="accountHome">账户中心</a>
            <button class="avatar-logout" type="button" role="menuitem" @click="doLogout">退出登录</button>
          </template>
          <template v-else>
            <a role="menuitem" :href="loginUrl">登录</a>
            <a role="menuitem" :href="registerUrl">注册</a>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const ACCOUNT = '/account'

const route = useRoute()
const open = ref(false)
const isLight = ref(false)
let systemMedia = null

// ---- 账号态（跨子域，靠 .briandolph.xyz 的会话 cookie） ----
const menuOpen = ref(false)
const avatarWrap = ref(null)
const accUser = ref(null)

const initial = computed(() => {
  const n = accUser.value?.username || ''
  return n ? n.slice(0, 1).toUpperCase() : ''
})

const backTo = () =>
  typeof window === 'undefined' ? 'https://www.briandolph.xyz/' : window.location.href

const loginUrl = computed(() => `${ACCOUNT}/login?next=` + encodeURIComponent(backTo()))
const registerUrl = computed(() => `${ACCOUNT}/register?next=` + encodeURIComponent(backTo()))
const accountHome = `${ACCOUNT}/`

async function loadAccount() {
  try {
    const r = await fetch('/api/auth/me', { credentials: 'include' })
    if (r.ok) {
      const d = await r.json()
      accUser.value = d.user || null
    } else {
      accUser.value = null
    }
  } catch {
    accUser.value = null
  }
}

async function doLogout() {
  menuOpen.value = false
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
    })
  } catch { /* 网络失败也把本地态清掉 */ }
  accUser.value = null
}

function onDocPointerDown(e) {
  if (!menuOpen.value) return
  if (avatarWrap.value && !avatarWrap.value.contains(e.target)) menuOpen.value = false
}
function onKeyDown(e) {
  if (e.key === 'Escape') menuOpen.value = false
}

function followSystem() {
  if (!systemMedia) return
  try {
    if (localStorage.getItem('theme')) return
  } catch (e) {}
  isLight.value = systemMedia.matches
  if (systemMedia.matches) document.documentElement.setAttribute('data-theme', 'light')
  else document.documentElement.removeAttribute('data-theme')
}

onMounted(() => {
  isLight.value = document.documentElement.getAttribute('data-theme') === 'light'
  systemMedia = window.matchMedia('(prefers-color-scheme: light)')
  if (systemMedia.addEventListener) systemMedia.addEventListener('change', followSystem)
  else systemMedia.addListener?.(followSystem)

  document.addEventListener('pointerdown', onDocPointerDown)
  document.addEventListener('keydown', onKeyDown)
  loadAccount()
})

onBeforeUnmount(() => {
  if (systemMedia) {
    if (systemMedia.removeEventListener) systemMedia.removeEventListener('change', followSystem)
    else systemMedia.removeListener?.(followSystem)
  }
  document.removeEventListener('pointerdown', onDocPointerDown)
  document.removeEventListener('keydown', onKeyDown)
})

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
watch(() => route.fullPath, () => { open.value = false; menuOpen.value = false })
</script>
