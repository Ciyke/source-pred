import { useRef } from 'react'
import './Features.css'

const FEATURES = [
  {
    icon: '🏆',
    title: 'Predict & Play',
    desc: 'Every match is a market. Play the game. Predict the winner. Win twice.',
    color: 'green',
    stats: [{ label: 'in prizes distributed', value: '$10,000 USDC' }],
    video: '/PlayRumble_Trailer_compressed.mp4',
    cta: { text: 'Predictions & Odds', href: 'https://bets.playrumble.xyz/bet' },
  },
  {
    icon: '◈',
    title: 'True Ownership',
    desc: 'Every character, weapon, and item is a verifiable NFT on-chain. Climb global leaderboards, enter weekly tournaments with massive prize pools, and earn exclusive legendary NFTs available only to top players.',
    color: 'purple',
    stats: [{ label: 'Onchain Assets Burnt', value: '20K' }],
    video: '/Mrket_compressed.mp4',
    cta: { text: 'Join the Treasure Hunt', href: 'https://master.play-rumble-hunt.pages.dev/hunt' },
  },
  {
    icon: '⚔',
    title: 'Battle & Earn',
    desc: 'Complete missions, customize your own character, collect upgraded power-ups, ammo and go exploring with friends online across a toggled variety of enchanting landscapes.',
    color: 'cyan',
    stats: [{ label: 'Beat the record score', value: '2,400+' }],
    video: '/PlayRumble_compressed.mp4',
  },
]

function FeatureCard({ f, index }) {
  const ref = useRef(null)

  function onMouseMove(e) {
    const card = ref.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rotateX = ((y - rect.height / 2) / rect.height) * -16
    const rotateY = ((x - rect.width / 2) / rect.width) * 16
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`
  }

  function onMouseLeave() {
    ref.current.style.transform = ''
  }

  return (
    <div
      ref={ref}
      className={`glass-card feature-card feature-card--${f.color}`}
      style={{ animationDelay: `${index * 0.5}s` }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {f.video && (
        <div className="feature-card__video-wrap">
          <video src={f.video} autoPlay muted loop playsInline className="feature-card__video" />
          <div className="feature-card__video-overlay" />
        </div>
      )}
      {f.image && (
        <div className="feature-card__video-wrap">
          <img src={f.image} alt={f.title} className="feature-card__video" />
          <div className="feature-card__video-overlay" />
        </div>
      )}

      <div className="feature-card__body">
        <div className={`feature-card__icon feature-card__icon--${f.color}`}>
          {f.icon}
        </div>
        <h3 className="feature-card__title">{f.title}</h3>
        <p className="feature-card__desc">{f.desc}</p>
        <div className="feature-card__stats">
          {f.stats.map((s) => (
            <div key={s.label} className="feature-card__stat">
              <span className={`feature-card__stat-val feature-card__stat-val--${f.color}`}>{s.value}</span>
              <span className="feature-card__stat-label">{s.label}</span>
            </div>
          ))}
        </div>
        {f.cta && (
          <a href={f.cta.href} target="_blank" rel="noopener noreferrer" className={`feature-card__cta feature-card__cta--${f.color}`}>
            {f.cta.text} →
          </a>
        )}
      </div>
    </div>
  )
}

export default function Features() {
  return (
    <section id="features" className="features">
      <div className="features__container">
        <p className="section-tag">Why PlayRumble</p>
        <h2 className="section-title">Agentic Predictions and Multiplayer Gaming</h2>
        <p className="section-subtitle">
          PlayRumble combines competitive gaming with AI-resolving markets.
          Fight for supremacy and earn real value from every match played in the Rumbleverse.
        </p>

        <div className="features__grid">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} f={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
