import { useState } from 'react'
import './FAQ.css'

const FAQS = [
  {
    q: 'What Is the Rumbleverse?',
    a: 'The Rumbleverse is the On-chain Economy of the Planet Bearia, consisting of mystical lands, clans, raw materials, twin suns, weapons of war, crafted materials and raw ores, all of them used to sustain the war effort against the invaders.',
  },
  {
    q: 'When is the Mint Date for Lands Of Bearia?',
    a: 'TBA',
  },
  {
    q: 'How can I earn from the Rumbleverse?',
    a: 'Mint the Lands of Bearia to earn super rare resources, Join our monthly campaigns, Treasure Hunts, Leaderboard sprints and secure your share of the prize pools!',
  },
  {
    q: 'Are more Games coming?',
    a: 'TBA',
  },
  {
    q: 'How do I get Production Resources?',
    a: 'Own a Land NFT and earn SRR tokens.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState(null)

  function toggle(i) {
    setOpen(prev => (prev === i ? null : i))
  }

  return (
    <section id="faq" className="faq">
      <div className="faq__container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-subtitle">Everything you need to know before entering the Rumbleverse.</p>

        <div className="faq__list">
          {FAQS.map((item, i) => (
            <div
              key={i}
              className={`faq__item ${open === i ? 'faq__item--open' : ''}`}
              onClick={() => toggle(i)}
            >
              <div className="faq__question">
                <span>{item.q}</span>
                <span className="faq__icon">{open === i ? '−' : '+'}</span>
              </div>
              <div className="faq__answer">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
