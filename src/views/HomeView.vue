<template>
  <HeroCarousel />

  <section class="blk blk-fill" v-reveal>
    <div class="wrap">
      <div class="blk-head">
        <div>
          <h2 class="blk-title">我们能做什么</h2>
          <p class="lead">四条交付线，跨越游戏、软件、AI 与技术服务。</p>
        </div>
        <RouterLink class="btn ghost" to="/services">查看业务详情 →</RouterLink>
      </div>
      <div class="bento">
        <div v-for="g in co.scopeGroups" :key="g.key" class="tile">
          <h3>{{ g.title }}</h3>
          <p>{{ g.desc }}</p>
          <ul class="tile-items"><li v-for="it in g.items" :key="it">{{ it }}</li></ul>
        </div>
      </div>
    </div>
  </section>

  <section class="blk blk-fill" v-reveal>
    <div class="wrap">
      <div class="blk-head">
        <div>
          <h2 class="blk-title">近期作品</h2>
          <p class="lead">已上线，点开就能体验。</p>
        </div>
        <RouterLink class="btn ghost" to="/works">查看全部案例 →</RouterLink>
      </div>
      <div class="work-strip">
        <RouterLink v-for="w in co.works" :key="w.id" class="wcard" to="/works">
          <img :src="w.cover" :alt="w.name" width="1600" height="1000" decoding="async">
          <div class="bd">
            <h3>{{ w.name }}</h3>
            <p>{{ w.subtitle }}</p>
            <div class="tags"><span v-for="t in w.tags" :key="t" class="tag">{{ t }}</span></div>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>

  <div class="cta-band" v-reveal>
    <div class="wrap">
      <div><h2>有项目要谈？</h2><p>聊聊你的目标，我们给出可落地的方案与报价。</p></div>
      <RouterLink class="btn ghost" to="/contact">联系我们 →</RouterLink>
    </div>
  </div>
</template>

<script setup>
import co from '../data/company'
import HeroCarousel from '../components/HeroCarousel.vue'
</script>
