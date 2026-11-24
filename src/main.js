import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/main.css'

const app = createApp(App)

const canReveal =
  typeof window !== 'undefined' &&
  'IntersectionObserver' in window &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

let io = null
if (canReveal) {
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      }
    },
    // 原来底部收缩 12%：元素要滚进视口约 108px 才开始显现，那一段就是肉眼看到的「空白缝」。
    // 改成底部外扩 8%：元素还在视口外就已显现，滚到时已经就位，衔接无缝。
    { threshold: 0, rootMargin: '0px 0px 8% 0px' }
  )
}

app.directive('reveal', {
  mounted(el, binding) {
    if (!io) return
    el.classList.add('reveal')
    const d = Number(binding.value) || 0
    if (d) el.style.transitionDelay = d + 'ms'
    io.observe(el)
  },
  unmounted(el) {
    if (io) io.unobserve(el)
  }
})

app.use(router).mount('#app')
