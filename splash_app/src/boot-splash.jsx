import { createRoot } from 'react-dom/client'
import Splash from './Splash'
import css from './splash.css?inline'

const SPLASH_ID = 'biyu-splash'
const STYLE_ID = 'biyu-splash-style'
const SEEN_KEY = 'biyu_splash_seen'

const shouldPlaySplash = () => {
  try {
    if (new URLSearchParams(window.location.search).has('splash')) return true
    return sessionStorage.getItem(SEEN_KEY) !== '1'
  } catch {
    return true
  }
}

const CURSOR_WAIT_CLASS = 'biyu-splash-cursor-none'
const removeBoot = () => {
  const boot = document.getElementById('biyu-splash-boot')
  if (boot) boot.remove()
}

const whenSiteReady = cb => {
  if (document.readyState === 'complete') {
    window.setTimeout(cb, 260)
    return
  }
  let done = false
  const go = () => {
    if (done) return
    done = true
    window.setTimeout(cb, 260)
  }
  window.addEventListener('load', go, { once: true })
  window.setTimeout(go, 12000)
}

const injectStyle = () => {
  if (document.getElementById(STYLE_ID)) return document.getElementById(STYLE_ID)
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = css
  document.head.appendChild(style)
  return style
}

const mountSplash = () => {
  if (document.getElementById(SPLASH_ID)) return

  const style = injectStyle()
  const host = document.createElement('div')
  host.id = SPLASH_ID
  host.setAttribute('role', 'presentation')
  document.body.appendChild(host)
  removeBoot()

  const html = document.documentElement
  const body = document.body
  html.classList.add(CURSOR_WAIT_CLASS)
  const prevHtmlOverflow = html.style.overflow
  const prevBodyOverflow = body.style.overflow
  html.style.overflow = 'hidden'
  body.style.overflow = 'hidden'

  const root = createRoot(host)
  let finished = false

  const finish = () => {
    if (finished) return
    finished = true
    try {
      sessionStorage.setItem(SEEN_KEY, '1')
    } catch {}
    whenSiteReady(() => {
      host.style.transition = 'opacity 0.6s ease'
      host.style.opacity = '0'
      window.setTimeout(() => {
        root.unmount()
        host.remove()
        if (style) style.remove()
        html.style.overflow = prevHtmlOverflow
        body.style.overflow = prevBodyOverflow
        html.classList.remove(CURSOR_WAIT_CLASS)
        window.dispatchEvent(new Event('biyu-splash-done'))
      }, 650)
    })
  }

  root.render(<Splash onDone={finish} />)
}

const boot = () => {
  if (!shouldPlaySplash()) return
  mountSplash()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot)
} else {
  boot()
}
