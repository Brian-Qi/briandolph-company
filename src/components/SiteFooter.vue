<template>
  <footer class="site-foot">
    <div class="wrap">
      <div class="foot-grid">
        <div>
          <h4 class="foot-brand"><img src="/logo.png" alt="" class="foot-logo" width="30" height="30" />彼岸时墟游戏工作室</h4>
          <p class="foot-desc">游戏开发 · 数字内容 · 软件与数据<br />杭州市拱墅区 · 个体工商户（存续）</p>
          <div class="foot-links">
            <a href="/self/">个人网站 ↗</a>
            <a href="/arg_01/">作品 · 《第五张财签》 ↗</a>
          </div>
        </div>
        <div>
          <h4>登记信息</h4>
          <div class="foot-line"><span>主体名称</span><b>{{ co.name }}</b></div>
          <div class="foot-line"><span>经营者</span><b>{{ co.operator }}</b></div>
          <div class="foot-line"><span>统一社会信用代码</span><b>{{ co.creditCode }}</b></div>
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
    </div>
  </footer>
</template>

<script setup>
import co from '../data/company'
</script>
