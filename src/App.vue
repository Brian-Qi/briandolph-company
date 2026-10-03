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
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>
