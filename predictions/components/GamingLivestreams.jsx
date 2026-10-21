import { useRef, useState } from 'react'

const GAMES = [
  { id: 1, title: 'Project Zebra: Covert Ops', thumb: '/thumbnails/project-zebra.webp', video: null },
  { id: 2, title: 'Off the Grid', thumb: '/thumbnails/off-the-grid.webp', video: '/gameplay/off-the-grid.mp4' },
  { id: 3, title: 'Call of Duty: Mobile', thumb: '/thumbnails/cod-mobile.webp', video: null },
  { id: 4, title: 'Claws and Cannons', thumb: '/thumbnails/claws-and-cannons.webp', video: null },
  { id: 5, title: 'Project Override', thumb: '/thumbnails/project-override.webp', video: '/gameplay/project-override.mp4' },
  { id: 6, title: 'PUBG Mobile', thumb: '/thumbnails/pubg-mobile.webp', video: null },
  { id: 7, title: 'Fortnite', thumb: '/thumbnails/fortnite.webp', video: null },
]

export default function GamingLivestreams({ onCreateMarket }) {
  const [playing, setPlaying] = useState(null)
  const listRef = useRef(null)

  function scroll(dir) {
    const el = listRef.current
    if (!el) return
    const amount = el.clientHeight * 0.85
    el.scrollBy({ top: dir === 'up' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <aside className="gaming-livestreams">
      <h3 className="gaming-livestreams__heading">Stream Live Matches</h3>
      <div className="gaming-livestreams__scroll-wrap">
        <button type="button" className="gaming-livestreams__nav gaming-livestreams__nav--up" onClick={() => scroll('up')} aria-label="Scroll up">▲</button>
        <div className="gaming-livestreams__list" ref={listRef}>
          {GAMES.map((g) => (
            <div key={g.id} className="gaming-livestreams__item">
              {playing === g.id ? (
                g.video ? (
                  <video
                    className="gaming-livestreams__video"
                    src={g.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    onClick={() => setPlaying(null)}
                  />
                ) : (
                  <button type="button" className="gaming-livestreams__thumb" onClick={() => setPlaying(null)}>
                    <span className="gaming-livestreams__playing">▶ No gameplay yet — tap to close</span>
                  </button>
                )
              ) : (
                <button
                  type="button"
                  className="gaming-livestreams__thumb"
                  onClick={() => setPlaying(g.id)}
                  aria-label={`Play ${g.title}`}
                >
                  <img
                    className="gaming-livestreams__thumb-img"
                    src={g.thumb}
                    alt=""
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                  <span className="gaming-livestreams__thumb-fallback" aria-hidden="true">▣</span>
                  <span className="gaming-livestreams__play-badge">Tap to play</span>
                </button>
              )}
              <span className="gaming-livestreams__game-name">{g.title}</span>
              <button
                type="button"
                className="gaming-livestreams__create-btn"
                onClick={() => onCreateMarket?.(g)}
              >
                Create markets
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="gaming-livestreams__nav gaming-livestreams__nav--down" onClick={() => scroll('down')} aria-label="Scroll down">▼</button>
      </div>
    </aside>
  )
}
