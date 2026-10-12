import { useRef } from 'react'
import './Campaign.css'

const CAMPAIGNS = [
  { img: '/campaign/treasure-hunt.jpg', title: 'Rumbleverse Treasure Hunt', subtitle: 'Claim your daily streak by joining the search on the Somnia network...' },
  { img: '/campaign/30days-rewards.jpg', title: '30 Days of Rumbling', subtitle: '30 days of heavy metal gaming, 250 BERA locked in prize pool' },
  { img: '/campaign/weekly-activities.jpg', title: '7-Day Sprint', subtitle: 'Join us for Discord game nights, minigame rushes and much more as we round up a 7 day event' },
  { img: '/campaign/weekly-sprint.jpg', title: 'Weekly Sprint', subtitle: 'Zealy x PlayRumble, Gameplay XP + NFT Whitelist' },
  { img: '/campaign/30days-intract.jpg', title: '30 Days Of Rumbling x Intract', subtitle: 'Week 1, complete steps and claim Rumble points' },
  { img: '/campaign/rumble-lands.png', title: 'Rumble Lands', subtitle: 'Craft your favourite weapons from scarce resources in the Rumbleverse' },
  { img: '/campaign/play-chill.jpg', title: 'Play & Chill', subtitle: 'Join the weekend Beras Happy Hour' },
  { img: '/campaign/season-one.jpg', title: 'Season ONE', subtitle: 'Play Claws and Cannons Season 1, complete missions and get rewarded with prizes' },
  { img: '/campaign/warzone-warriors.jpg', title: 'Warzone Warriors x Zealy', subtitle: '1500 SOMI, Community quests from December 11–21.' },
  { img: '/campaign/genesis-collection.jpg', title: 'Rumble Genesis Collection', subtitle: 'On the vibrant planet of Bearia, a community of joyful bears thrived, nurturing their young and enjoying the unique honey that powered their simple technologies.' },
]

export default function Campaign() {
  const trackRef = useRef(null)

  function scrollByCard(dir) {
    const track = trackRef.current
    const card = track.querySelector('.campaign-card')
    const gap = parseFloat(getComputedStyle(track).columnGap || 24)
    const amount = (card?.offsetWidth || 320) + gap
    track.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  return (
    <section id="campaign" className="campaign">
      <div className="campaign__container">
        <p className="section-tag">Ongoing Events</p>
        <h2 className="section-title">Campaigns</h2>

        <div className="campaign__carousel">
          <button className="campaign__arrow campaign__arrow--prev" onClick={() => scrollByCard(-1)} aria-label="Previous">&#8249;</button>

          <div className="campaign__track" ref={trackRef}>
            {CAMPAIGNS.map((c) => (
              <div className="campaign-card" key={c.title}>
                <div className="campaign-card__image-wrap">
                  <img src={c.img} alt={c.title} className="campaign-card__image" />
                  <div className="campaign-card__ended">
                    <span>Ended</span>
                  </div>
                </div>
                <div className="campaign-card__body">
                  <h3 className="campaign-card__title">{c.title}</h3>
                  <p className="campaign-card__subtitle">{c.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="campaign__arrow campaign__arrow--next" onClick={() => scrollByCard(1)} aria-label="Next">&#8250;</button>
        </div>
      </div>
    </section>
  )
}
