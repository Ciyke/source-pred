import { useWallet, ARC_TESTNET_CHAIN, AVALANCHE_FUJI_CHAIN } from '../shared/useWallet.js'
import WalletButton from '../shared/WalletButton.jsx'
import { useTheme } from '../shared/useTheme.js'
import ArcTestnetPanel from '../predictions/components/ArcTestnetPanel.jsx'

export default function App() {
  const wallet = useWallet(ARC_TESTNET_CHAIN, [AVALANCHE_FUJI_CHAIN])
  const { theme, toggle } = useTheme()

  return (
    <div className="predictions-page">
      <nav className="predictions-navbar">
        <span className="predictions-navbar__logo">PlayRumble <span>Test Market</span></span>
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
      <main className="predictions-main" style={{ maxWidth: 640 }}>
        <span className="state-badge state-badge--testnet predictions-section-badge">
          Test Market — Arc Testnet — Not the Real Predictions App
        </span>
        <h1 className="predictions-title">Deposit / Predict / Withdraw</h1>
        <ArcTestnetPanel wallet={wallet} />
      </main>
    </div>
  )
}
