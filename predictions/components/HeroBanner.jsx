import { useEffect, useState } from 'react'

const SLIDES = [
  { src: '/carousel/collage.webp', label: 'METRO — All Games' },
  { src: '/carousel/off-the-grid.webp', label: 'Off the Grid' },
  { src: '/carousel/project-override.webp', label: 'Project Override' },
  { src: '/carousel/pubg-mobile.webp', label: 'PUBG Mobile' },
]

export default function HeroBanner() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const slide = SLIDES[idx]

  return (
    <div className="predictions-hero-banner predictions-hero-banner--carousel">
      <img key={slide.src} src={slide.src} alt={slide.label} className="predictions-hero-banner__img" loading="eager" fetchPriority="high" />
      <div className="predictions-hero-banner__overlay" />
      <button type="button" className="predictions-hero-banner__arrow predictions-hero-banner__arrow--left" aria-label="Previous" onClick={() => setIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length)}>‹</button>
      <button type="button" className="predictions-hero-banner__arrow predictions-hero-banner__arrow--right" aria-label="Next" onClick={() => setIdx((i) => (i + 1) % SLIDES.length)}>›</button>
      <div className="predictions-hero-banner__content">
        <div className="predictions-hero-banner__eyebrow">Featured</div>
        <div className="predictions-hero-banner__title">{slide.label}</div>
      </div>
      <div className="predictions-hero-banner__dots">
        {SLIDES.map((_, i) => (
          <button key={i} type="button" className={`predictions-hero-banner__dot ${i === idx ? 'predictions-hero-banner__dot--active' : ''}`} onClick={() => setIdx(i)} aria-label={`Go to slide ${i + 1}`} />
        ))}
      </div>
    </div>
  )
}
