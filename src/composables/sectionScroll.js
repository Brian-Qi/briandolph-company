import { onMounted, onBeforeUnmount } from 'vue'

const HEADER = 72
const LOCK_MS = 700
const MIN_DELTA = 24
const PAGE_RATIO = 0.9
const MAX_JUMP_RATIO = 1.1

export function useSectionScroll(isEnabled = () => true) {
  let locked = false
  let timer = null

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // 分区锚点（文档坐标，含页首 0）；不含 hero / page-head
  function anchors() {
    const y = window.scrollY
    const tops = [...document.querySelectorAll('.blk, .cta-band')]
      .map((el) => el.getBoundingClientRect().top + y - HEADER)
      .filter((t) => t > 0)
      .sort((a, b) => a - b)
    return [0, ...tops]
  }

  function glide(top) {
    locked = true
    window.scrollTo({ top, behavior: 'smooth' })
    clearTimeout(timer)
    timer = setTimeout(() => { locked = false }, LOCK_MS)
  }

  function step(dir) {
    const vh = window.innerHeight
    const y = window.scrollY
    const max = Math.max(0, document.documentElement.scrollHeight - vh)
    if (dir > 0 && y >= max - 1) return false
    if (dir < 0 && y <= 1) return false

    const list = anchors()
    let target = null
    if (dir > 0) target = list.find((a) => a > y + 4) ?? null
    else {
      const prev = list.filter((a) => a < y - 4)
      target = prev.length ? prev[prev.length - 1] : null
    }

    // 到下一锚点若超过一屏（当前分区比屏幕还高）→ 翻一页，绝不跳过内容
    let dest
    if (target == null || Math.abs(target - y) > vh * MAX_JUMP_RATIO) {
      dest = y + dir * Math.round(vh * PAGE_RATIO)
    } else {
      dest = target
    }
    dest = Math.max(0, Math.min(dest, max))
    if (Math.abs(dest - y) < 2) return false
    glide(dest)
    return true
  }

  function onWheel(e) {
    if (!isEnabled()) { locked = false; return }
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (reduced()) return
    if (Math.abs(e.deltaY) < MIN_DELTA) return
    if (locked) { e.preventDefault(); return }
    if (step(e.deltaY > 0 ? 1 : -1)) e.preventDefault()
  }

  onMounted(() => window.addEventListener('wheel', onWheel, { passive: false }))
  onBeforeUnmount(() => {
    window.removeEventListener('wheel', onWheel)
    clearTimeout(timer)
  })
}
