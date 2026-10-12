import { useState, useEffect } from 'react'
import './WhitelistModal.css'

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxaq7xGHjVWbi8XzSPsIVXyCce1UUh1csYVA_n021u6hg53LdBvMRqEnV7vplQyhjMurQ/exec'
const GAME_URL = 'https://playrumble.itch.io/bera-rumble'
const LS_KEY = 'playrumble_wl_submitted'

function openGame() {
  window.open(GAME_URL, '_blank', 'noopener,noreferrer')
}

export default function WhitelistModal({ onClose }) {
  const [discord, setDiscord] = useState('')
  const [wallet, setWallet] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [walletError, setWalletError] = useState('')
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(LS_KEY)) setAlreadySubmitted(true)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!wallet.startsWith('0x') || wallet.length !== 42) {
      setWalletError('Please enter a valid EVM address (starts with 0x, 42 characters)')
      return
    }
    setWalletError('')
    setSubmitting(true)

    const fd = new FormData()
    fd.append('discord', discord)
    fd.append('wallet', wallet)
    await fetch(SHEETS_URL, { method: 'POST', mode: 'no-cors', body: fd }).catch(() => {})

    localStorage.setItem(LS_KEY, wallet)
    openGame()
    onClose()
  }

  if (alreadySubmitted) {
    return (
      <div className="wl-overlay" onClick={onClose}>
        <div className="wl-modal wl-modal--done glass-card" onClick={e => e.stopPropagation()}>
          <button className="wl-modal__close" onClick={onClose} aria-label="Close">×</button>
          <div className="wl-modal__check">✓</div>
          <p className="wl-modal__tag">Lands of Bearia</p>
          <h2 className="wl-modal__title">Already Submitted!</h2>
          <p className="wl-modal__sub">
            You're already on the list. You can play the game as many times as you want — good luck!
          </p>
          <button className="btn btn-primary wl-modal__play-btn" onClick={openGame}>
            Play Game
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="wl-overlay" onClick={onClose}>
      <div className="wl-modal glass-card" onClick={e => e.stopPropagation()}>
        <button className="wl-modal__close" onClick={onClose} aria-label="Close">×</button>

        <p className="wl-modal__tag">Lands of Bearia</p>
        <h2 className="wl-modal__title">Get Whitelisted</h2>
        <p className="wl-modal__sub">Enter your details to secure your spot, then jump into the game.</p>

        <form className="wl-modal__form" onSubmit={handleSubmit}>
          <div className="wl-modal__field">
            <label className="wl-modal__label">Discord Name @</label>
            <input
              className="wl-modal__input"
              type="text"
              placeholder="username"
              value={discord}
              onChange={e => setDiscord(e.target.value)}
              required
            />
          </div>

          <div className="wl-modal__field">
            <label className="wl-modal__label">EVM Wallet Address</label>
            <input
              className={`wl-modal__input ${walletError ? 'wl-modal__input--error' : ''}`}
              type="text"
              placeholder="0x..."
              value={wallet}
              onChange={e => { setWallet(e.target.value); setWalletError('') }}
              required
            />
            {walletError && <span className="wl-modal__error">{walletError}</span>}
          </div>

          <div className="wl-modal__actions">
            <a
              href="https://x.com/i/status/2053872946867814626"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline wl-modal__learn"
            >
              Learn More
            </a>
            <button type="submit" disabled={submitting} className="btn btn-primary wl-modal__submit">
              {submitting ? 'Submitting...' : 'Submit / Play Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
