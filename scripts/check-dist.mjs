// 产物检查：打包前确认 dist 里没有会污染线上子站的东西，且 SEO 产物齐全。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const errors = []

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  errors.push('dist/index.html 不存在')
}

// 本地目录名 -> 线上实际子站路径
const SUBSITES = {
  arg_01: '/arg_01/',
  personal: '/self/'
}

for (const [name, live] of Object.entries(SUBSITES)) {
  if (fs.existsSync(path.join(DIST, name))) {
    errors.push(`dist/${name}/ 存在：部署脚本会把它 cp 到线上，覆盖 ${live} 子站`)
  }
}

for (const file of ['404.html', 'sitemap.xml', 'robots.txt']) {
  if (!fs.existsSync(path.join(DIST, file))) errors.push(`dist/${file} 缺失`)
}

for (const route of ['about', 'services', 'works', 'contact']) {
  if (!fs.existsSync(path.join(DIST, route, 'index.html'))) {
    errors.push(`dist/${route}/index.html 缺失（gen-seo 未生成）`)
  }
}

const indexPath = path.join(DIST, 'index.html')
if (fs.existsSync(indexPath)) {
  const html = fs.readFileSync(indexPath, 'utf8')
  if (!/assets\/index-[A-Za-z0-9_-]+\.js/.test(html)) {
    errors.push('dist/index.html 未引用带 hash 的主 JS 资源')
  }
  if (!/<title>[^<]+<\/title>/.test(html)) {
    errors.push('dist/index.html 缺少 <title>')
  }
}

const nf = path.join(DIST, '404.html')
if (fs.existsSync(nf) && !fs.readFileSync(nf, 'utf8').includes('noindex')) {
  errors.push('dist/404.html 缺少 noindex')
}

if (errors.length) {
  console.error('\n[check-dist] 产物检查未通过：')
  for (const e of errors) console.error('  ✗', e)
  console.error('')
  process.exit(1)
}

console.log('[check-dist] 通过：dist 无子站污染，路由页与 sitemap 齐全')
