import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Topography from './Topography'
import { LOOK, PRESETS } from './topography-preset'
import css from './topography.css?inline'

const STYLE_ID = 'biyu-topography-style'
const TOPO_ATTR = 'data-topography'

const injectStyle = () => {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = css
  document.head.appendChild(style)
}

const topographyProps = {
  ...LOOK,
  ...PRESETS.sonar,
  lineCount: 16,
  lineWidth: 1,
  glow: 0.45,
  depthOfField: 0.3,
  fog: 0.3,
  morph: 0.1,
  speed: 0.18,
  detail: 0.3,
  glitch: 0.1,
  mouseInteraction: true,
  mouseRadius: 0.8,
  mouseStrength: 0.45,
  trail: 0.2,
  parallax: 0.35,
  intro: true,
  dpr: 0.75
}

const TopographyHost = ({ host, ...props }) => {
  const [travelX, setTravelX] = useState(0)
  useEffect(() => {
    let raf = 0
    let last = NaN
    const tick = () => {
      const hero = host.closest('.hero')
      const raw = hero ? parseFloat(getComputedStyle(hero).getPropertyValue('--bgp')) : 0
      const next = Number.isFinite(raw) ? raw : 0
      if (next !== last) {
        last = next
        setTravelX(next * 0.35)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [host])
  return <Topography {...props} travelX={travelX} />
}

const mount = host => {
  if (!host || host.dataset.biyuTopo === '1') return
  host.dataset.biyuTopo = '1'
  const root = createRoot(host)
  root.render(<TopographyHost host={host} {...topographyProps} />)
}

const mountAll = () => {
  document.querySelectorAll(`[${TOPO_ATTR}]`).forEach(host => {
    if (host.dataset.biyuTopo !== '1') mount(host)
  })
}

const boot = () => {
  injectStyle()
  mountAll()
  const observer = new MutationObserver(mountAll)
  observer.observe(document.body, { childList: true, subtree: true })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot)
} else {
  boot()
}
