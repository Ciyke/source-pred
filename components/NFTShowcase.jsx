import { useState, useEffect } from 'react'
import './NFTShowcase.css'
import WhitelistModal from './WhitelistModal'

const SLIDES = [
  '/lnds/11 (1).png',
  '/lnds/13.png',
  '/lnds/5.png',
  '/lnds/6 (1).png',
  '/lnds/7 (2).png',
  '/lnds/8 (1).png',
]

export default function NFTShowcase() {
  const [current, setCurrent] = useState(0)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  function prev() { setCurrent(i => (i - 1 + SLIDES.length) % SLIDES.length) }
  function next() { setCurrent(i => (i + 1) % SLIDES.length) }

  return (
    <section id="nfts" className="nfts">
      <div className="nfts__container">
        <p className="nfts__intro">Introducing</p>
        <h2 className="nfts__title">The Lands of Bearia Collection</h2>
        <p className="nfts__subtitle">
          The Lands-of-Bearia NFT (L.O.B) is an ERC-1155 Ethereum collection by{' '}
          <span className="nfts__handle">@PlayRumble_</span> highlighting the story of how the
          animal inhabitants of a once prosperous planet, defended their planet against the Alien Invaders.
        </p>

        <div className="nfts__slideshow">
          <div className="nfts__slides">
            {SLIDES.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`Land ${i + 1}`}
                className={`nfts__slide ${i === current ? 'nfts__slide--active' : ''}`}
              />
            ))}
          </div>

          <button className="nfts__arrow nfts__arrow--prev" onClick={prev} aria-label="Previous">&#8249;</button>
          <button className="nfts__arrow nfts__arrow--next" onClick={next} aria-label="Next">&#8250;</button>

          <div className="nfts__dots">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`nfts__dot ${i === current ? 'nfts__dot--active' : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="nfts__footer">
          <button className="btn btn-primary nfts__wl-btn" onClick={() => setShowModal(true)}>
            How to Get the Whitelist for L.O.B
          </button>
        </div>
      </div>

      {showModal && <WhitelistModal onClose={() => setShowModal(false)} />}
    </section>
  )
}
