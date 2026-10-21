import { useState } from 'react'
import WalletButton from '../../shared/WalletButton.jsx'
import { useTheme } from '../../shared/useTheme.js'

export default function PredictionsNavbar({ wallet }) {
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="predictions-navbar predictions-navbar--xenrena">
      <a href="/" className="predictions-navbar__logo">
        <img src="/rumble-logo.jpg" alt="" className="predictions-navbar__logo-img" />
        <span className="predictions-navbar__logo-text">METRO</span>
      </a>
      <div className="predictions-navbar__search-wrap">
        <span className="predictions-navbar__search-icon" aria-hidden="true">⌕</span>
        <input className="predictions-navbar__search" type="search" placeholder="Search" aria-label="Search" />
      </div>
      <div className="predictions-navbar__actions predictions-navbar__actions--desktop">
        <button
          className="theme-toggle"
          onClick={toggle}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <WalletButton wallet={wallet} />
        <span className="predictions-navbar__avatar" aria-hidden="true">◉</span>
      </div>
      <div className="predictions-navbar__mobile-menu">
        <button
          type="button"
          className="predictions-navbar__hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          ☰
        </button>
        {menuOpen && (
          <div className="predictions-navbar__dropdown">
            <div className="predictions-navbar__dropdown-item">
              <WalletButton wallet={wallet} />
            </div>
            <button type="button" className="predictions-navbar__dropdown-item predictions-navbar__dropdown-btn" onClick={toggle}>
              {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
