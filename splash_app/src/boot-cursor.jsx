import { createRoot } from 'react-dom/client'
import TargetCursor from './TargetCursor'
import css from './cursor.css?inline'

const CURSOR_ID = 'biyu-cursor'
const STYLE_ID = 'biyu-cursor-style'
const TOPO_SRC = '/splash/topography.js'
const CURSOR_WAIT_CLASS = 'biyu-splash-cursor-none'

const injectStyle = () => {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = css
  document.head.appendChild(style)
}

let topographyRequested = false
const loadTopography = () => {
  if (topographyRequested) return
  topographyRequested = true
  const script = document.createElement('script')
  script.src = TOPO_SRC
  script.async = true
  document.head.appendChild(script)
}

const requestTopography = () => {
  if (document.querySelector('[data-topography]')) {
    loadTopography()
    return
  }
  const observer = new MutationObserver(() => {
    if (document.querySelector('[data-topography]')) {
      observer.disconnect()
      loadTopography()
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

const splashPlanned = () => {
  if (document.getElementById('biyu-splash')) return true
  try {
    if (new URLSearchParams(location.search).has('splash')) return true
    return sessionStorage.getItem('biyu_splash_seen') !== '1'
  } catch {
    return true
  }
}

const scheduleTopography = () => {
  const run = () => requestTopography()
  if (splashPlanned()) {
    window.addEventListener('biyu-splash-done', run, { once: true })
    window.setTimeout(run, 12000)
  } else if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 2500 })
  } else {
    window.setTimeout(run, 1200)
  }
}

const mountCursor = () => {
  if (document.getElementById(CURSOR_ID)) return
  const host = document.createElement('div')
  host.id = CURSOR_ID
  document.body.appendChild(host)
  const root = createRoot(host)
  root.render(
    <TargetCursor
      targetSelector="a, button, [role='button'], .cursor-target"
      spinDuration={4.2}
      hoverDuration={0.1}
      size={30}
      cornerSize={8}
      thickness={2}
      padding={5}
      dotSize={4}
      cursorColor="#ffffff"
      cursorColorOnTarget="#55ff78"
      blendMode="exclusion"
      parallaxOn
      matchRadius
      showLabel
      clickEffect
      hideDefaultCursor
    />
  )
}

const revealCursor = () => {
  document.documentElement.classList.remove(CURSOR_WAIT_CLASS)
  mountCursor()
}

const waitForSplash = () => {
  if (!splashPlanned()) {
    mountCursor()
    return
  }
  document.documentElement.classList.add(CURSOR_WAIT_CLASS)
  window.addEventListener('biyu-splash-done', revealCursor, { once: true })
  window.setTimeout(revealCursor, 12000)
}

const mount = () => {
  injectStyle()
  waitForSplash()
  scheduleTopography()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}
