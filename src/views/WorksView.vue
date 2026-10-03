<template>
  <div class="page-head">
    <div class="wrap">
      <div class="k">Works</div>
      <h1>代表案例</h1>
      <p class="sub">已上线的真实项目，欢迎体验。</p>
    </div>
  </div>

  <section class="blk">
    <div class="wrap">
      <article v-for="w in co.works" :key="w.id" class="case">
        <div class="main">
          <img class="case-cover" :src="w.cover" :alt="w.name" loading="lazy" decoding="async">
          <div class="case-head">
            <div>
              <h3>{{ w.name }}</h3>
              <p class="sub">{{ w.subtitle }}</p>
            </div>
            <a class="btn primary" :href="w.url" target="_blank" rel="noopener">前往体验 ↗</a>
          </div>
          <p>{{ w.desc }}</p>
          <div class="shots" v-if="w.shots && w.shots.length">
            <img v-for="s in w.shots" :key="s" :src="s" alt="" loading="eager" decoding="async">
          </div>
          <div class="tags"><span v-for="t in w.tags" :key="t" class="tag">{{ t }}</span></div>
        </div>
        <div class="side">
          <div class="row"><span>年份</span>{{ w.year }}</div>
          <div class="row"><span>角色</span>{{ w.role }}</div>
          <div class="row"><span>状态</span>已上线</div>
          <div class="row">
            <span>要点</span>
            <ul class="points">
              <li v-for="h in w.highlights" :key="h">{{ h }}</li>
            </ul>
          </div>
        </div>
      </article>
    </div>
  </section>

  <section class="blk">
    <div class="wrap">
      <div class="blk-head">
        <div>
          <h2 class="blk-title">在研 / 更多</h2>
          <p class="lead">更多项目在研。想了解方向或直接合作，欢迎联系我们。</p>
        </div>
        <RouterLink class="btn ghost" to="/contact">联系我们</RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import co from '../data/company'
</script>
