<template>
  <PageHero eyebrow="CONTACT" effect="web-threads" light-image="/hero/page-contact-light.webp" title="联系我们" subtitle="无论是新项目立项还是合作洽谈，欢迎联系我们。" />

  <section class="blk">
    <div class="wrap">
      <h2 class="blk-title">联系方式</h2>
      <div class="contact-grid">
        <div v-if="hasWechat" class="panel">
          <div class="label">
            <span class="label-icon" v-html="wechatIcon" aria-hidden="true"></span>
            微信
          </div>
          <h3>{{ co.wechat }}</h3>
          <p>添加时请简要说明来意。</p>
        </div>
        <a class="panel" :href="'mailto:' + co.email">
          <div class="label">
            <span class="label-icon" v-html="mailIcon" aria-hidden="true"></span>
            邮箱
          </div>
          <h3>{{ co.email }}</h3>
          <p>通常 15 个工作日内回复。</p>
        </a>
        <a v-if="hasPhone" class="panel" :href="'tel:' + co.phone">
          <div class="label">
            <span class="label-icon" v-html="phoneIcon" aria-hidden="true"></span>
            电话
          </div>
          <h3>{{ co.phone }}</h3>
          <p>工作日 10:00 – 18:00。</p>
        </a>
        <a class="panel" :href="co.github" target="_blank" rel="noopener">
          <div class="label">
            <span class="label-icon" v-html="githubIcon" aria-hidden="true"></span>
            GitHub
          </div>
          <h3>@Brian-Qi</h3>
          <p>查看代码与开源项目。</p>
        </a>
      </div>
    </div>
  </section>

  <section class="blk">
    <div class="wrap">
      <h2 class="blk-title">地址</h2>
      <p class="lead">{{ co.address }}</p>
      <div class="btns">
        <a class="btn primary" :href="'mailto:' + co.email">发送邮件</a>
        <RouterLink class="btn ghost" to="/works">先看案例</RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import PageHero from '../components/PageHero.vue'
import { computed } from 'vue'
import co from '../data/company'
import wechatIcon from '../assets/icons/simple/wechat.svg?raw'
import githubIcon from '../assets/icons/simple/github.svg?raw'
import mailIcon from '../assets/icons/lucide/mail.svg?raw'
import phoneIcon from '../assets/icons/lucide/phone.svg?raw'

const hasPhone = computed(() => !!co.phone && !co.phone.includes('待补充'))
const hasWechat = computed(() => !!co.wechat && !co.wechat.includes('待补充'))
</script>

<style scoped>
.label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.label-icon {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: var(--accent);
}

.label-icon :deep(svg) {
  display: block;
  width: 14px;
  height: 14px;
}
</style>
