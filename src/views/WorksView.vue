<template>
  <PageHero effect="particles" light-image="/hero/page-works-light.webp" title="代表案例" subtitle="已上线的真实项目。" />

  <section class="blk works-page">
    <div class="wrap">
      <div class="work-strip">
        <RouterLink
          v-for="w in co.works"
          :key="w.id"
          class="wcard"
          :to="{ name: 'work', params: { id: w.id } }"
        >
          <img :src="w.cover" :alt="w.name" width="1600" height="1000" loading="lazy" decoding="async">
          <div class="bd">
            <h3>{{ w.name }}</h3>
            <p>{{ w.subtitle }}</p>
            <div class="tags"><span v-for="t in w.tags" :key="t" class="tag">{{ t }}</span></div>
            <span class="wcard-more">查看案例 ↗</span>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>

  <section class="blk">
    <div class="wrap">
      <div class="blk-head">
        <div>
          <h2 class="blk-title">在研 / 更多</h2>
          <p class="lead">更多项目在研。</p>
        </div>
        <RouterLink class="btn ghost" to="/contact">联系我们</RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import PageHero from '../components/PageHero.vue'
import co from '../data/company'
</script>
