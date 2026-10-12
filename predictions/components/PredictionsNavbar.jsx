import WalletButton from '../../shared/WalletButton.jsx'
import { useTheme } from '../../shared/useTheme.js'

export default function PredictionsNavbar({ wallet }) {
  const { theme, toggle } = useTheme()
  return (
    <nav className="predictions-navbar">
      <a href="/" className="predictions-navbar__logo">PlayRumble <span>Predictions</span></a>
      <div className="predictions-navbar__actions">
        <button
          className="theme-toggle"
          onClick={toggle}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <WalletButton wallet={wallet} />
      </div>
    </nav>
  )
}
