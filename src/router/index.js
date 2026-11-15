import { createRouter, createWebHistory } from 'vue-router'
import { metaForRoute, SITE, urlForPath } from '../data/seo.js'

const HomeView = () => import('../views/HomeView.vue')
const AboutView = () => import('../views/AboutView.vue')
const ServicesView = () => import('../views/ServicesView.vue')
const WorksView = () => import('../views/WorksView.vue')
const WorkDetailView = () => import('../views/WorkDetailView.vue')
const ContactView = () => import('../views/ContactView.vue')
const NotFound = () => import('../views/NotFound.vue')

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/services', name: 'services', component: ServicesView },
  { path: '/works', name: 'works', component: WorksView },
  { path: '/works/:id', name: 'work', component: WorkDetailView },
  { path: '/contact', name: 'contact', component: ContactView },
  { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  }
})

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function removeMeta(attr, key) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove()
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!href) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setRobots(noindex) {
  if (!noindex) {
    removeMeta('name', 'robots')
    return
  }
  setMeta('name', 'robots', 'noindex')
}

function applyRouteMeta(to) {
  const meta = metaForRoute(to)
  const url = urlForPath(meta.path)
  const image = meta.og ? `${SITE}${meta.og}` : ''

  document.title = meta.title
  setMeta('name', 'description', meta.description)
  setMeta('property', 'og:title', meta.title)
  setMeta('property', 'og:description', meta.description)
  setMeta('name', 'twitter:title', meta.title)
  setMeta('name', 'twitter:description', meta.description)

  if (meta.noindex) {
    setRobots(true)
    setCanonical(null)
    removeMeta('property', 'og:url')
    removeMeta('property', 'og:image')
    removeMeta('property', 'og:image:alt')
    removeMeta('name', 'twitter:image')
    return
  }

  setRobots(false)
  setCanonical(url)
  setMeta('property', 'og:url', url)
  setMeta('property', 'og:image', image)
  setMeta('property', 'og:image:type', 'image/jpeg')
  setMeta('property', 'og:image:width', '1200')
  setMeta('property', 'og:image:height', '630')
  setMeta('property', 'og:image:alt', meta.title)
  setMeta('name', 'twitter:image', image)
}

router.beforeEach((to) => {
  if (to.name !== 'notfound' && to.path !== '/' && !to.path.endsWith('/')) {
    return { path: `${to.path}/`, query: to.query, hash: to.hash, replace: true }
  }
})

router.afterEach((to) => {
  applyRouteMeta(to)
})

export default router
