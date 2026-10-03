import { createRouter, createWebHistory } from 'vue-router'

const HomeView = () => import('../views/HomeView.vue')
const AboutView = () => import('../views/AboutView.vue')
const ServicesView = () => import('../views/ServicesView.vue')
const WorksView = () => import('../views/WorksView.vue')
const ContactView = () => import('../views/ContactView.vue')
const NotFound = () => import('../views/NotFound.vue')

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: '彼岸时墟游戏工作室 · 游戏开发 · 数字内容', desc: '游戏开发、数字内容、软件与数据服务，从创意到上线一站式交付。' } },
  { path: '/about', name: 'about', component: AboutView, meta: { title: '关于我们 · 彼岸时墟', desc: '专注游戏、数字内容与软件的交付型技术工作室，不外包、不转包。' } },
  { path: '/services', name: 'services', component: ServicesView, meta: { title: '核心业务 · 彼岸时墟', desc: '游戏与数字内容、软件与数据服务、AI 与前沿技术、技术服务四大交付方向。' } },
  { path: '/works', name: 'works', component: WorksView, meta: { title: '代表案例 · 彼岸时墟', desc: '已上线的真实项目，含网页互动解谜《第五张财签》。' } },
  { path: '/contact', name: 'contact', component: ContactView, meta: { title: '联系我们 · 彼岸时墟', desc: '项目合作与技术咨询，24 小时内响应。' } },
  { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFound, meta: { title: '页面不存在 · 彼岸时墟', desc: '页面不存在。' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

const DEFAULT_DESC = '彼岸时墟游戏工作室 —— 游戏开发、数字内容、软件与数据服务，从创意到上线一站式交付。'

function setDescription(content) {
  let el = document.querySelector('meta[name="description"]')
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', 'description')
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

router.afterEach((to) => {
  if (to.meta && to.meta.title) document.title = to.meta.title
  setDescription((to.meta && to.meta.desc) || DEFAULT_DESC)
})

export default router
