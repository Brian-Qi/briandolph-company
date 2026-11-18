<template>
  <footer class="site-foot">
    <div class="wrap">
      <div class="foot-grid">
        <div>
          <h4 class="foot-brand"><img src="/logo.svg" alt="" class="foot-logo" width="30" height="30" />彼岸时墟游戏工作室</h4>
          <p class="foot-desc">游戏开发 · 数字内容 · 软件与数据<br />杭州市拱墅区</p>
        </div>
        <div>
          <h4>联系方式</h4>
          <div class="foot-line"><span>邮箱</span><b>{{ co.email }}</b></div>
          <div class="foot-line"><span>GitHub</span><b>@Brian-Qi</b></div>
          <div class="foot-line"><span>地址</span><b>{{ co.address }}</b></div>
        </div>
      </div>
      <div class="foot-copy">
        <span>© 2026 杭州市拱墅区彼岸时墟游戏工作室</span>
        <span>彼岸时墟 · Lycoris Null</span>
      </div>
      <div class="foot-beian">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">浙ICP备2026048634号</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
import co from '../data/company'
</script>
