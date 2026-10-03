<template>
  <div class="page-head">
    <div class="wrap">
      <div class="k">About</div>
      <h1>关于我们</h1>
      <p class="sub">{{ co.en }} · 一家专注游戏、数字内容与软件的交付型技术工作室。</p>
    </div>
  </div>

  <section class="blk">
    <div class="wrap">
      <h2 class="blk-title">公司简介</h2>
      <p class="lead">
        {{ co.name }} 成立于 {{ co.founded }}，是一家以 {{ co.form }} 形式登记的{{ co.type }}，
        聚焦游戏开发、软件与数据服务、AI 应用三大方向。
      </p>
      <p class="lead">
        团队「小而完整」：从需求、设计、开发到上线独立走完全流程，不外包、不转包，
        交付快、质量稳、长期可维护。
      </p>
    </div>
  </section>

  <section class="blk">
    <div class="wrap">
      <h2 class="blk-title">负责人</h2>
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

  <section class="blk">
    <div class="wrap">
      <h2 class="blk-title">工商登记信息</h2>
      <p class="lead">以下信息以市场监督管理部门登记为准。</p>
      <table class="info-table">
        <tbody>
          <tr><th>主体名称</th><td>{{ co.name }}</td></tr>
          <tr><th>类型</th><td>{{ co.type }}（{{ co.form }}）</td></tr>
          <tr><th>经营者</th><td>{{ co.operator }}</td></tr>
          <tr><th>统一社会信用代码</th><td class="mono">{{ co.creditCode }}</td></tr>
          <tr><th>注册号</th><td class="mono">{{ co.regNo }}</td></tr>
          <tr><th>成立日期</th><td>{{ co.founded }}</td></tr>
          <tr><th>登记机关</th><td>{{ co.authority }}</td></tr>
          <tr><th>登记状态</th><td class="status">{{ co.status }}</td></tr>
          <tr><th>经营场所</th><td>{{ co.address }}</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import co from '../data/company'
</script>
