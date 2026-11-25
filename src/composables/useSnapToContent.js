// 首屏 → 内容区的滚轮吸附（照搬内页 PageHero 里那套，抽出来给首页复用）
// 原来只有内页有吸附：滚一下直接送到「内容块顶部贴 header」，所以内页看着是整屏对齐的；
// 首页用的是 HeroCarousel，没有这段，滚到哪算哪，内容自然就偏下。
import { onMounted, onBeforeUnmount } from 'vue'

const MIN_DELTA = 24

export function useSnapToContent(heroSelector = '.hero', contentSelector = '.hero + .blk') {
  let locked = false
  let dir = 1
  let target = null
  let raf = null

  function cancelGlide() {
    if (raf != null) {
      cancelAnimationFrame(raf)
      raf = null
    }
  }

  function unlock() {
    locked = false
    target = null
    cancelGlide()
  }

  // header 实际占位：优先读 CSS 变量（含那条分割线），读不到再退回 61
  function headerH() {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--head-total').trim()
    const n = parseFloat(v)
    return Number.isFinite(n) && n > 0 ? n : 61
  }

  function boundary() {
    const el = document.querySelector(contentSelector)
    if (!el) return null
    return el.getBoundingClientRect().top + window.scrollY - headerH()
  }

  function glide(to, d) {
    locked = true
    dir = d
    target = Math.max(0, to)
    cancelGlide()
    const start = window.scrollY
    const dist = target - start
    if (Math.abs(dist) < 1) {
      unlock()
      return
    }
    const duration = Math.min(560, Math.max(240, Math.abs(dist) * 0.5))
    const t0 = performance.now()
    const ease = (t) => 1 - Math.pow(1 - t, 3)
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      window.scrollTo(0, start + dist * ease(p))
      if (p < 1) {
        raf = requestAnimationFrame(step)
      } else {
        raf = null
        window.scrollTo(0, target)
        unlock()
      }
    }
    raf = requestAnimationFrame(step)
  }

  function onWheel(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (Math.abs(e.deltaY) < MIN_DELTA) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!document.querySelector(heroSelector)) return

    const d = e.deltaY > 0 ? 1 : -1
    if (locked) {
      if (d !== dir) {
        unlock()
        return
      }
      e.preventDefault()
      return
    }

    const y = window.scrollY
    const b = boundary()
    if (b == null || b <= 0) return

    if (d > 0) {
      // 还在 hero 里 → 一次送到内容块顶部，不停在半路
      if (y < b - 8) {
        e.preventDefault()
        glide(b, 1)
      }
    } else {
      // 在内容区顶部附近 → 拉回 hero 顶部
      if (y > 0 && y <= b + 48) {
        e.preventDefault()
        glide(0, -1)
      }
    }
  }

  onMounted(() => window.addEventListener('wheel', onWheel, { passive: false }))
  onBeforeUnmount(() => {
    window.removeEventListener('wheel', onWheel)
    unlock()
  })
}
