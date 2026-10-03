<template>
  <HeroCarousel />

  <section class="proof" aria-label="资质与数据">
    <div class="wrap">
      <div class="pf-row">
        <div class="pf">
          <div class="pf-v">2026</div>
          <div class="pf-k">年成立于杭州拱墅</div>
        </div>
        <div class="pf">
          <div class="pf-v">存续</div>
          <div class="pf-k">工商登记状态</div>
        </div>
        <div class="pf">
          <div class="pf-v">{{ co.scopeGroups.length }}<small>类</small></div>
          <div class="pf-k">交付方向</div>
        </div>
        <div class="pf">
          <div class="pf-v">{{ co.works.length }}<small>部</small></div>
          <div class="pf-k">已上线作品</div>
        </div>
      </div>
      <p class="pf-note">
        统一社会信用代码 <span class="mono">{{ co.creditCode }}</span> · 登记机关 {{ co.authority }}
      </p>
    </div>
  </section>

  <section class="blk">
    <div class="wrap">
      <div class="blk-head">
        <div>
          <div class="k">What We Do</div>
          <h2 class="blk-title">我们能做什么</h2>
          <p class="lead">四条交付线，跨越游戏、软件、AI 与技术服务。</p>
        </div>
        <RouterLink class="btn ghost" to="/services">查看业务详情 →</RouterLink>
      </div>
      <div class="cards">
        <div v-for="(c, i) in caps" :key="c.t" class="card">
          <div class="no">{{ String(i + 1).padStart(2, '0') }}</div>
          <h3>{{ c.t }}</h3>
          <p>{{ c.d }}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="blk">
    <div class="wrap">
      <div class="blk-head">
        <div>
          <div class="k">Works</div>
          <h2 class="blk-title">近期作品</h2>
          <p class="lead">已上线，点开就能体验。</p>
        </div>
        <RouterLink class="btn ghost" to="/works">查看全部案例 →</RouterLink>
      </div>
      <div class="work-strip">
        <RouterLink v-for="w in co.works" :key="w.id" class="wcard" to="/works">
          <img :src="w.cover" :alt="w.name" loading="lazy" decoding="async">
          <div class="bd">
            <h3>{{ w.name }}</h3>
            <p>{{ w.subtitle }}</p>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>

  <div class="cta-band">
    <div class="wrap">
      <div><h2>有项目要谈？</h2><p>聊聊你的目标，我们给出可落地的方案与报价。</p></div>
      <RouterLink class="btn ghost" to="/contact">联系我们 →</RouterLink>
    </div>
  </div>
</template>

<script setup>
import co from '../data/company'
import HeroCarousel from '../components/HeroCarousel.vue'

const caps = [
  { t: '游戏与互动内容', d: '从玩法原型到上线成品，策划、程序与数字内容一手包办。' },
  { t: '定制软件', d: 'Web、小程序与管理系统，交付稳定、可长期维护。' },
  { t: 'AI 与前沿技术', d: '把 AI、数字孪生等能力，落进真实可用的产品里。' },
  { t: '技术与协作', d: '咨询、外包与成果交付，按需补上团队的技术短板。' },
]
</script>
