import { useEffect, useState } from 'react'
import GlowCursorConverge from './GlowCursorConverge'
import ElectricLogo from './ElectricLogo'
import logo from './assets/biyu-avatar.svg'
import nameImg from './assets/biyu-name.png'

const Splash = ({ onDone }) => {
  const [merged, setMerged] = useState(false)

  useEffect(() => {
    if (!merged) return undefined
    const timer = window.setTimeout(() => onDone?.(), 3000)
    return () => window.clearTimeout(timer)
  }, [merged, onDone])

  useEffect(() => {
    const onKey = event => {
      if (event.key === 'Escape') onDone?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDone])

  return (
    <div className="biyu-splash">
      <GlowCursorConverge
        color="#7e0000"
        secondaryColor="#7e0000"
        intensity={1.5}
        trailWidth={4}
        linger={1.8}
        glow={1.4}
        hotspot={0.9}
        quality="high"
        theme="dark"
        pathAxis="horizontal"
        duration={2.4}
        hold={1}
        curve={0.5}
        burstOnMerge={false}
        loop={false}
        electric
        revealAt={1}
        absorbDuration={0.9}
        onReveal={() => setMerged(true)}
      />

      {merged && (
        <div className="biyu-stage">
          <div className="biyu-stack">
            <div className="biyu-ele">
              <ElectricLogo
                src={logo}
                color="#ff5c5c"
                glowColor="#8f0000"
                scale={0.66}
                intensity={1.3}
                glow={1.3}
                thickness={1.6}
                strands={3}
                bend={0.6}
                crackle={1.4}
                arcs={0}
                flicker={0.5}
                speed={2.2}
                theme="dark"
              />
            </div>
            <div className="biyu-name">
              <ElectricLogo
                src={nameImg}
                color="#ffd6d6"
                glowColor="#8f0000"
                scale={0.7}
                intensity={1.4}
                glow={0.15}
                thickness={1.3}
                strands={3}
                bend={0.5}
                crackle={1.1}
                arcs={0}
                flicker={0.35}
                speed={2}
                theme="dark"
              />
            </div>
          </div>
        </div>
      )}

      <button type="button" className="biyu-skip" onClick={() => onDone?.()}>
        跳过
      </button>
    </div>
  )
}

export default Splash
