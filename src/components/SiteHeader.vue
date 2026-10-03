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
          <RouterLink class="cta" to="/contact" @click="open = false">联系我们</RouterLink>
        </li>
      </ul>

      <RouterLink class="cta top-cta" to="/contact">联系我们</RouterLink>
    </div>
  </header>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const open = ref(false)
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
