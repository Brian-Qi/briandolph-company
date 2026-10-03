# 彼岸时墟游戏工作室 · 官网

Vue 3 + Vite 单页应用（SPA）。源码目录 `src/`，静态资源 `public/`。

## 开发 / 构建

```bash
npm install
npm run dev        # 本地开发，默认 http://localhost:5280/
npm run build      # 产出 dist/
npm run preview    # 本地预览 dist/
```

## 部署（重要：SPA 路由 fallback）

本项目使用 `createWebHistory()`，**刷新子路由（如 `/works`）必须回退到 `index.html`**，否则会 404。

- **nginx**
  ```nginx
  location / {
    try_files $uri $uri/ /index.html;
  }
  ```
- **Netlify**：新增 `public/_redirects`，内容 `/* /index.html 200`
- **Vercel**：`vercel.json` 中 `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- **GitHub Pages**：把 `dist/404.html` 复制为 `index.html` 的副本（或使用 spa-github-pages 方案）

## SEO

- `public/robots.txt`、`public/sitemap.xml` 里的 `your-domain.example` 需替换为正式域名。
- `index.html` 的 `canonical` / `og:image` 目前为相对路径，正式域名确定后改为绝对 URL。
- 每个路由的标题与描述在 `src/router/index.js` 的 `meta.title` / `meta.desc` 配置。

## 内容与数据

- 站点文案与工商信息集中在 `src/data/company.js`（电话 / 微信为占位时，联系页会自动隐藏对应面板）。
- 首页轮播图为 AI 插画（`public/hero/slide-*.webp`）；代表案例使用真实项目截图（`public/works/arg-*.webp`）。

## 素材说明

`_hero_gen/` 为首页插画的生成源文件；`_backup_*` 为历史备份，可自行清理。

## License

[CC BY-NC-ND 4.0](LICENSE)：署名 · 非商业性使用 · 禁止演绎。


## 线上站点结构（briandolph.xyz）

公司站为**站点根 `/`**；个人站、ARG 为**子路径**，各自独立构建、独立部署：

| 路径 | 站点 | 源项目 | base |
|------|------|--------|------|
| `/` | 公司站（本仓库） | `briandolph_company` | `/` |
| `/self/` | 个人网站 | `F:\VUE\briandolph_test`（Vue CLI） | `/self/` |
| `/arg_01/` | ARG《第五张财签》 | `F:\ARG_test\test_02`（Vite） | `/arg_01/` |

> 本仓库 `public/arg_01/`、`public/self/` 只是**本地预览用**的构建产物副本；线上各自由独立流程部署，互不覆盖。

### 构建

```powershell
# 公司站（根，base 默认 /）
npm run build

# 子路径部署时用 DEPLOY_BASE 指定 base（如放子目录）
$env:DEPLOY_BASE="/company/"; npm run build
```

### 线上注意（各应用是 history 路由，需各自 fallback）

```nginx
location /arg_01/ { try_files $uri $uri/ /arg_01/index.html; }
location /self/   { try_files $uri $uri/ /self/index.html; }
location /        { try_files $uri $uri/ /index.html; }
```
