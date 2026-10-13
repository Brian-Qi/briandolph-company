<template>
  <SiteHeader />
  <main>
    <RouterView v-slot="{ Component, route }">
      <Transition name="page">
        <div :key="route.path" class="route-page">
          <component :is="Component" />
        </div>
      </Transition>
    </RouterView>
  </main>
  <SiteFooter />
</template>

<script setup>
import { useRoute } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import { useSectionScroll } from './composables/sectionScroll'

// 分区步进滚动仅作用于首页
const route = useRoute()
useSectionScroll(() => route.path === '/')
</script>
