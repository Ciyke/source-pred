import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './Navbar.css'

export default function Navbar() {
  const [wallet, setWallet] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function connectWallet() {
    if (!window.ethereum) {
      alert('MetaMask not detected. Please install MetaMask to connect.')
      return
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      setWallet(accounts[0])
    } catch (err) {
      console.error(err)
    }
  }

  function shortAddress(addr) {
    return addr.slice(0, 6) + '...' + addr.slice(-4)
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <a href="#hero" className="navbar__logo">
          <span className="navbar__logo-text">PlayRumble</span>
        </a>

        <button
          className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <li><a href="#features" onClick={() => setMenuOpen(false)}>Earn</a></li>
          <li><a href="#nfts" onClick={() => setMenuOpen(false)}>Mint</a></li>
          <li><a href="#community" onClick={() => setMenuOpen(false)}>Community</a></li>
          <li><a href="https://bets.playrumble.xyz/bet" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>Predictions</a></li>
          <li>
            <a href="https://playrumble.itch.io/bera-rumble" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="navbar__play-link">
              Play
            </a>
          </li>
          <li className="navbar__mobile-wallet">
            <button
              className={`btn ${wallet ? 'navbar__wallet--connected' : 'btn-outline'}`}
              onClick={connectWallet}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {wallet ? (
                <><span className="navbar__wallet-dot" />{shortAddress(wallet)}</>
              ) : (
                <><span>⬡</span> Connect Wallet</>
              )}
            </button>
          </li>
        </ul>

        <button
          className={`btn navbar__wallet ${wallet ? 'navbar__wallet--connected' : 'btn-outline'}`}
          onClick={connectWallet}
        >
          {wallet ? (
            <>
              <span className="navbar__wallet-dot" />
              {shortAddress(wallet)}
            </>
          ) : (
            <>
              <span>⬡</span> Connect Wallet
            </>
          )}
        </button>
      </div>
    </nav>
  )
}
