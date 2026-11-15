import works from './works.js'

export const SITE = 'https://www.briandolph.xyz'

const staticRoutes = [
  {
    path: '/',
    title: '彼岸时墟游戏工作室 · 游戏开发 · 数字内容 · 软件与数据',
    description: '杭州市拱墅区彼岸时墟游戏工作室 —— 游戏开发、数字内容、软件与数据服务，从创意到上线一站式交付。',
    og: '/og/og-home.jpg',
    priority: '1.0'
  },
  {
    path: '/about',
    title: '关于我们 · 彼岸时墟',
    description: '专注游戏、数字内容与软件的交付型技术工作室，不外包、不转包。',
    og: '/og/og-about.jpg',
    priority: '0.6'
  },
  {
    path: '/services',
    title: '核心业务 · 彼岸时墟',
    description: '游戏与数字内容、软件与数据服务、AI 与前沿技术、技术服务四大交付方向。',
    og: '/og/og-services.jpg',
    priority: '0.8'
  },
  {
    path: '/works',
    title: '代表案例 · 彼岸时墟',
    description: '已上线的真实项目，含网页互动解谜《第五张财签》。',
    og: '/og/og-works.jpg',
    priority: '0.9'
  },
  {
    path: '/contact',
    title: '联系我们 · 彼岸时墟',
    description: '无论是新项目立项还是合作洽谈，欢迎联系我们。',
    og: '/og/og-contact.jpg',
    priority: '0.7'
  }
]

export const seoRoutes = [
  ...staticRoutes,
  ...works.map(work => ({
    path: `/works/${work.id}`,
    title: `${work.name} · 代表案例 · 彼岸时墟`,
    description: work.seoDescription || work.subtitle,
    og: work.og || '/og/og-works.jpg',
    priority: '0.7'
  }))
]

export const notFoundMeta = {
  path: '/404',
  title: '页面不存在 · 彼岸时墟',
  description: '页面不存在。',
  noindex: true
}

export function normalizePath(path) {
  if (!path || path === '/') return '/'
  return path.replace(/\/+$/, '') || '/'
}

export function urlForPath(path) {
  return path === '/' ? `${SITE}/` : `${SITE}${path}/`
}

export function metaForRoute(to) {
  if (to.name === 'work') {
    const work = works.find(item => item.id === to.params.id)
    if (work) {
      return {
        path: `/works/${work.id}`,
        title: `${work.name} · 代表案例 · 彼岸时墟`,
        description: work.seoDescription || work.subtitle,
        og: work.og || '/og/og-works.jpg',
        priority: '0.7'
      }
    }
  }

  if (to.name === 'notfound') return notFoundMeta
  const path = normalizePath(to.path)
  return seoRoutes.find(route => route.path === path) || notFoundMeta
}
