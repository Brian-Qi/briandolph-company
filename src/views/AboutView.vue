<template>
  <PageHero effect="aero" light-image="/hero/page-about-light.webp" title="关于我们" :subtitle="co.en + ' · 一家专注游戏、数字内容与软件的交付型技术工作室'" />

  <section class="blk">
    <div class="wrap">
      <h2 class="blk-title">公司简介</h2>
      <p class="lead">{{ co.name }}成立于 {{ co.founded }}，是一家以{{ co.form }}形式登记的{{ co.type }}，<span class="br-desktop"></span>聚焦游戏开发、软件与数据服务、AI 应用、技术服务四大方向。</p>
      <p class="lead">团队「小而完整」：从需求、设计、开发到上线独立走完全流程，不外包、不转包，交付快、质量稳、长期可维护。</p>
    </div>
  </section>

  <section class="blk">
    <div class="wrap">
      <h2 class="blk-title">团队</h2>
      <div class="cards">
        <div class="card">
          <h3>{{ co.operator }}</h3>
          <p>工作室经营者 · 开发者</p>
          <div class="tags">
            <span class="tag">游戏开发</span><span class="tag">前端 / 交互</span><span class="tag">数字内容</span>
          </div>
        </div>
        <div class="card">
          <h3>工作方式</h3>
          <p>先定义清楚目标与验收标准，再进入实现；以可运行的原型推进，每一步都可验证、可交付。</p>
        </div>
      </div>
    </div>
  </section>

</template>

<script setup>
import PageHero from '../components/PageHero.vue'
import co from '../data/company'
</script>
