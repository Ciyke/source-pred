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
      <button className="wallet-btn wallet-btn--connected" disabled>
        <span className="wallet-btn__dot" />
        {short(address)}
      </button>
    )
  }

  function handleConnectClick() {
    // Only one wallet detected (or none via EIP-6963, e.g. an older
    // extension) — connect directly, falling back to window.ethereum.
    if (wallets.length <= 1) {
      connect(wallets[0]?.provider)
    } else {
      setPickerOpen((v) => !v)
    }
  }

  function pick(wallet) {
    setPickerOpen(false)
    connect(wallet.provider)
  }

  return (
    <div className="wallet-btn-wrap">
      <button className="wallet-btn wallet-btn--connect" onClick={handleConnectClick} disabled={status === 'connecting'}>
        <span>⬡</span> {status === 'connecting' ? 'Connecting…' : 'Connect Wallet'}
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
