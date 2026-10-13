<template>
  <div class="page-head">
    <div class="wrap">
      <h1>联系我们</h1>
      <p class="sub">无论是新项目立项还是合作洽谈，欢迎直接联系我们，24 小时内响应。</p>
    </div>
  </div>

  <section class="blk">
    <div class="wrap">
      <h2 class="blk-title">联系方式</h2>
      <div class="contact-grid">
        <a class="panel" :href="'mailto:' + co.email">
          <div class="label">邮箱（首选）</div>
          <h3>{{ co.email }}</h3>
          <p>通常 24 小时内回复。</p>
        </a>
        <a class="panel" :href="co.github" target="_blank" rel="noopener">
          <div class="label">GitHub</div>
          <h3>@Brian-Qi</h3>
          <p>查看代码与开源项目。</p>
        </a>
        <div v-if="hasPhone" class="panel">
          <div class="label">电话</div>
          <h3>{{ co.phone }}</h3>
          <p>工作日 10:00 – 18:00。</p>
        </div>
        <div v-if="hasWechat" class="panel">
          <div class="label">微信</div>
          <h3>{{ co.wechat }}</h3>
          <p>添加时请简要说明来意。</p>
        </div>
      </div>
    </div>
  </section>

  <section class="blk">
    <div class="wrap">
      <h2 class="blk-title">地址</h2>
      <p class="lead">{{ co.address }}（工商登记经营场所）</p>
      <div class="btns">
        <a class="btn primary" :href="'mailto:' + co.email">发送邮件</a>
        <RouterLink class="btn ghost" to="/works">先看案例</RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import co from '../data/company'

const hasPhone = computed(() => !!co.phone && !co.phone.includes('待补充'))
const hasWechat = computed(() => !!co.wechat && !co.wechat.includes('待补充'))
</script>
