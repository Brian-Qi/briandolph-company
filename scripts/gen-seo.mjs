import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { seoRoutes, notFoundMeta, urlForPath } from '../src/data/seo.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')

const escape = value => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

function render(html, route) {
  const url = urlForPath(route.path)
  const image = route.og ? `${urlForPath('/')}${route.og.replace(/^\//, '')}` : ''
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

for (const route of seoRoutes) {
  const file = route.path === '/'
    ? path.join(DIST, 'index.html')
    : path.join(DIST, route.path, 'index.html')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, render(template, route), 'utf8')
  console.log('seo:', path.relative(DIST, file))
}

let notFound = render(template, notFoundMeta)
notFound = notFound.replace('</title>', '</title>\n    <meta name="robots" content="noindex" />')
notFound = notFound.replace(/<link rel="canonical" href="[\s\S]*?"\s*\/?>\s*/, '')
notFound = notFound.replace(/\s*<meta (?:property="og:[^"]+"|name="twitter:[^"]+")[^>]*>/g, '')
fs.writeFileSync(path.join(DIST, '404.html'), notFound, 'utf8')
console.log('seo: 404.html')

const lastmod = new Date().toISOString().slice(0, 10)
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<!-- 正式域名：www.briandolph.xyz -->',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...seoRoutes.map(route => `  <url><loc>${urlForPath(route.path)}</loc><lastmod>${lastmod}</lastmod><priority>${route.priority}</priority></url>`),
  '</urlset>',
  ''
].join('\n')
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap, 'utf8')
console.log('seo: sitemap.xml')

const notFoundFile = path.join(DIST, '404.html')
if (!fs.readFileSync(notFoundFile, 'utf8').includes('noindex')) {
  throw new Error('404.html missing noindex')
}
