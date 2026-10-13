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
    { threshold: 0, rootMargin: '0px 0px -12% 0px' }
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
