<template>
  <section class="blk work-detail">
    <div class="wrap">
      <div class="work-back">
        <RouterLink class="back-link" to="/works">← 返回代表案例</RouterLink>
      </div>

      <article v-if="work" class="case">
        <div class="case-hero">
          <img :src="work.cover" :alt="work.name" loading="eager" decoding="async">
          <span class="case-scrim"></span>
          <div class="case-hero-copy">
            <h1>{{ work.name }}</h1>
            <p class="sub">{{ work.subtitle }}</p>
          </div>
          <a class="btn primary case-cta" :href="work.url" target="_blank" rel="noopener">前往体验 ↗</a>
        </div>
        <div class="case-body">
          <div class="main">
            <p>{{ work.desc }}</p>
            <div class="shots" v-if="work.shots && work.shots.length">
              <img v-for="s in work.shots" :key="s" :src="s" alt="" loading="lazy" decoding="async">
            </div>
            <div class="tags"><span v-for="t in work.tags" :key="t" class="tag">{{ t }}</span></div>
          </div>
          <aside class="side">
            <div class="row"><span>项目类型</span>{{ work.category }}</div>
            <div class="row"><span>运行平台</span>{{ work.platform }}</div>
            <div class="row"><span>交付范围</span>{{ work.role }}</div>
            <div class="row"><span>上线时间</span>{{ work.year }}</div>
          </aside>
        </div>
      </article>

      <div v-else class="work-missing">
        <h1>案例不存在</h1>
        <p>这个案例可能已下线，或链接有误。</p>
        <RouterLink class="btn ghost" to="/works">返回代表案例</RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import co from '../data/company'

const route = useRoute()
const work = computed(() => co.works.find(w => w.id === route.params.id))
</script>
