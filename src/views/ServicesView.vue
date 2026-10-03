<template>
  <div class="page-head">
    <div class="wrap">
      <div class="k">Services</div>
      <h1>核心业务</h1>
      <p class="sub">从创意到上线，按技术能力划分为四大交付方向。</p>
    </div>
  </div>

  <section class="blk">
    <div class="wrap">
      <div class="cards">
        <div v-for="(g, i) in co.scopeGroups" :key="g.key" class="card">
          <div class="no">{{ String(i + 1).padStart(2, '0') }}</div>
          <h3>{{ g.title }}</h3>
          <p>{{ g.desc }}</p>
          <ul>
            <li v-for="it in g.items" :key="it">{{ it }}</li>
          </ul>
        </div>
      </div>
      <details class="scope-details">
        <summary>查看完整经营范围（工商登记原文）</summary>
        <p>{{ co.scope }}</p>
        <p>{{ co.scopeNote }}</p>
      </details>
    </div>
  </section>

  <section class="blk">
    <div class="wrap">
      <div class="blk-head">
        <div>
          <h2 class="blk-title">合作流程</h2>
          <p class="lead">目标清晰、节点可控，每一步都可验收。</p>
        </div>
        <RouterLink class="btn ghost" to="/contact">洽谈你的项目</RouterLink>
      </div>
      <div class="steps">
        <div class="step"><div class="no">01</div><h3>需求沟通</h3><p>快速对齐目标、范围与验收标准，给出可行性与周期评估，24 小时内响应。</p></div>
        <div class="step"><div class="no">02</div><h3>方案与原型</h3><p>拆成可验证的里程碑，先交付可运行原型，方向确认后再规模化投入。</p></div>
        <div class="step"><div class="no">03</div><h3>开发与交付</h3><p>完整实现、部署上线，交付可维护的代码与使用文档，支持长期迭代。</p></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import co from '../data/company'
</script>
