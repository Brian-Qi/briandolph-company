import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE = 'https://briandolph.xyz'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')

const routes = [
  {
    path: '/',
    title: '彼岸时墟游戏工作室 · 游戏开发 · 数字内容 · 软件与数据',
    description: '杭州市拱墅区彼岸时墟游戏工作室 —— 游戏开发、数字内容、软件与数据服务，从创意到上线一站式交付。',
    og: '/og/og-home.jpg'
  },
  {
    path: '/about',
    title: '关于我们 · 彼岸时墟',
    description: '专注游戏、数字内容与软件的交付型技术工作室，不外包、不转包。',
    og: '/og/og-about.jpg'
  },
  {
    path: '/services',
    title: '核心业务 · 彼岸时墟',
    description: '游戏与数字内容、软件与数据服务、AI 与前沿技术、技术服务四大交付方向。',
    og: '/og/og-services.jpg'
  },
  {
    path: '/works',
    title: '代表案例 · 彼岸时墟',
    description: '已上线的真实项目，含网页互动解谜《第五张财签》。',
    og: '/og/og-works.jpg'
  },
  {
    path: '/works/arg',
    title: '《第五张财签》· 代表案例 · 彼岸时墟',
    description: '网页互动解谜《第五张财签》，从策划、设计到上线全流程自研。',
    og: '/og/og-arg.jpg'
  },
  {
    path: '/works/personal',
    title: '个人网站 Briandolph Qi · 代表案例 · 彼岸时墟',
    description: '个人品牌站设计与工程实现，主打动效与性能。',
    og: '/og/og-personal.jpg'
  },
  {
    path: '/contact',
    title: '联系我们 · 彼岸时墟',
    description: '无论是新项目立项还是合作洽谈，欢迎联系我们。',
    og: '/og/og-contact.jpg'
  }
]

const escape = value => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

function render(html, route) {
  const url = route.path === '/' ? `${SITE}/` : `${SITE}${route.path}/`
  const image = `${SITE}${route.og}`
  let out = html
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(route.title)}</title>`)
  out = out.replace(/<meta name="description" content="[\s\S]*?"\s*\/?>/, `<meta name="description" content="${escape(route.description)}" />`)
  out = out.replace(/<link rel="canonical" href="[\s\S]*?"\s*\/?>/, `<link rel="canonical" href="${url}" />`)
  out = out.replace(/<meta property="og:title" content="[\s\S]*?"\s*\/?>/, `<meta property="og:title" content="${escape(route.title)}" />`)
  out = out.replace(/<meta property="og:description" content="[\s\S]*?"\s*\/?>/, `<meta property="og:description" content="${escape(route.description)}" />`)
  out = out.replace(/<meta property="og:image" content="[\s\S]*?"\s*\/?>/, `<meta property="og:image" content="${image}" />`)
  out = out.replace(/<meta name="twitter:title" content="[\s\S]*?"\s*\/?>/, `<meta name="twitter:title" content="${escape(route.title)}" />`)
  out = out.replace(/<meta name="twitter:description" content="[\s\S]*?"\s*\/?>/, `<meta name="twitter:description" content="${escape(route.description)}" />`)
  out = out.replace(/\s*<meta property="og:(url|image:type|image:width|image:height|image:alt)"[^>]*>/g, '')
  out = out.replace(/\s*<meta name="twitter:image"[^>]*>/g, '')
  out = out.replace('</head>', [
    `    <meta property="og:url" content="${url}" />`,
    '    <meta property="og:image:type" content="image/jpeg" />',
    '    <meta property="og:image:width" content="1200" />',
    '    <meta property="og:image:height" content="630" />',
    `    <meta property="og:image:alt" content="${escape(route.title)}" />`,
    `    <meta name="twitter:image" content="${image}" />`,
    '  </head>'
  ].join('\n'))
  return out
}

for (const route of routes) {
  const file = route.path === '/'
    ? path.join(DIST, 'index.html')
    : path.join(DIST, route.path, 'index.html')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, render(template, route), 'utf8')
  console.log('seo:', path.relative(DIST, file))
}

const notFoundRoute = {
  path: '/404',
  title: '页面不存在 · 彼岸时墟',
  description: '页面不存在。',
  og: '/og/og-home.jpg'
}
let notFound = render(template, notFoundRoute)
notFound = notFound.replace('</title>', '</title>\n    <meta name="robots" content="noindex" />')
notFound = notFound.replace(/<link rel="canonical" href="[\s\S]*?"\s*\/?>\s*/, '')
fs.writeFileSync(path.join(DIST, '404.html'), notFound, 'utf8')
console.log('seo: 404.html')
