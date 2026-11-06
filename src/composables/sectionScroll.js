import { onMounted, onBeforeUnmount } from 'vue'

const HEADER = 72
const LOCK_MS = 480
const MIN_DELTA = 24
const PAGE_RATIO = 0.9
const MAX_JUMP_RATIO = 1.1
const NEAR_ANCHOR = 0.2

export function useSectionScroll(isEnabled = () => true) {
  let locked = false
  let lastDir = 1
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

  function unlock() {
    locked = false
    clearTimeout(timer)
    timer = null
  }

  function glide(top, dir) {
    locked = true
    lastDir = dir
    window.scrollTo({ top, behavior: 'smooth' })
    clearTimeout(timer)
    timer = setTimeout(unlock, LOCK_MS)
  }

  function step(dir) {
    const vh = window.innerHeight
    const y = window.scrollY
    const max = Math.max(0, document.documentElement.scrollHeight - vh)
    if (dir > 0 && y >= max - 1) return false
    if (dir < 0 && y <= 1) return false

    const list = anchors()
    let target = null
    if (dir > 0) {
      target = list.find((a) => a > y + 4) ?? null
    } else {
      const prev = list.filter((a) => a < y - 4)
      // 向上时若最近的锚点只是当前分区顶部（离当前位置很近），跳过它去上一个分区，
      // 否则会先回弹几十像素、锁住，再滚几下才动。
      const skipCurrent = prev.length > 1 && y - prev[prev.length - 1] < vh * NEAR_ANCHOR
      target = skipCurrent
        ? prev[prev.length - 2]
        : prev.length
          ? prev[prev.length - 1]
          : null
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
    glide(dest, dir)
    return true
  }

  function onWheel(e) {
    if (!isEnabled()) { unlock(); return }
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (reduced()) return
    if (Math.abs(e.deltaY) < MIN_DELTA) return

    const dir = e.deltaY > 0 ? 1 : -1

    if (locked) {
      // 关键修复：方向反转时立刻取消当前锁定。
      // 原来从底部往上滚时，向下滑动留下的 700ms 锁定会把向上的滚轮全部 preventDefault 吃掉。
      if (dir !== lastDir) {
        unlock()
      } else {
        e.preventDefault()
        return
      }
    }

    if (step(dir)) e.preventDefault()
  }

  onMounted(() => window.addEventListener('wheel', onWheel, { passive: false }))
  onBeforeUnmount(() => {
    window.removeEventListener('wheel', onWheel)
    clearTimeout(timer)
  })
}
