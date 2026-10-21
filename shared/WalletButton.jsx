import { useState } from 'react'
import { useDiscoveredWallets } from './useDiscoveredWallets.js'
import './WalletButton.css'

function short(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : ''
}

/** @param {ReturnType<typeof import('./useWallet.js').useWallet>} wallet a single
 * shared useWallet() instance, lifted by the page — every component reading wallet
 * state must consume the same instance, or connecting in one place won't be seen
 * by another (each useWallet() call holds its own provider/signer refs). */
export default function WalletButton({ wallet }) {
  const { address, status, error, connect, switchNetwork, isWrongNetwork } = wallet
  const wallets = useDiscoveredWallets()
  const [pickerOpen, setPickerOpen] = useState(false)

  if (isWrongNetwork) {
    return (
      <button className="wallet-btn wallet-btn--wrong-network" onClick={() => switchNetwork()}>
        <span>⚠</span> Wrong Network — Switch
      </button>
    )
  }

  if (address) {
    return (
      <button className="wallet-btn wallet-btn--connected" disabled title={address}>
        <span className="wallet-btn__dot" />
        {short(address)}
      </button>
    )
  }

  function handleConnectClick() {
    if (wallets.length <= 1) {
      connect(wallets[0]?.provider)
    } else {
      setPickerOpen((v) => !v)
    }
  }

  function pick(w) {
    setPickerOpen(false)
    connect(w.provider)
  }

  return (
    <div className="wallet-btn-wrap">
      <button className="wallet-btn wallet-btn--connect wallet-btn--icon-only" onClick={handleConnectClick} disabled={status === 'connecting'} aria-label="Connect wallet" title="Connect wallet">
        <svg className="wallet-btn__purse-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7Z" />
          <path d="M2 10h20" />
          <path d="M16 10a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h2Z" />
          <circle cx="16" cy="12.5" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      </button>
      {pickerOpen && (
        <div className="wallet-picker">
          {wallets.map((w) => (
            <button key={w.info.uuid} className="wallet-picker__item" onClick={() => pick(w)}>
              {w.info.icon && <img src={w.info.icon} alt="" width="18" height="18" />}
              {w.info.name}
            </button>
          ))}
        </div>
      )}
      {error && <span className="wallet-btn__error">{error}</span>}
    </div>
  )
}
