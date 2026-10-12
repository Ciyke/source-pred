import { useEffect, useState } from 'react'
import { ARC_TESTNET_CHAIN, AVALANCHE_FUJI_CHAIN } from '../../shared/useWallet.js'
import { formatUsdc } from '../../shared/format.js'
import { getAllowance, approveUsdc, depositForBurn, pollAttestation, receiveOnArc, getFujiUsdcBalance } from '../client/cctp.js'

const ARC_CHAIN_ID = parseInt(ARC_TESTNET_CHAIN.chainIdHex, 16)
const FUJI_CHAIN_ID = parseInt(AVALANCHE_FUJI_CHAIN.chainIdHex, 16)

const STEP_LABEL = {
  approving: 'Approving USDC on Avalanche Fuji…',
  burning: 'Burning USDC on Avalanche Fuji…',
  'awaiting-attestation': 'Waiting for Circle attestation…',
  minting: 'Minting on Arc Testnet…',
}

/** Real CCTP V2 bridge: burns testnet USDC on Avalanche Fuji, waits for Circle's
 * attestation, then mints native USDC to the connected address on Arc Testnet.
 * Takes the single shared wallet instance (accepting both Arc and Fuji — see
 * useWallet's acceptableChains) rather than a separate per-chain hook, so the
 * navbar/rest of the app don't fight this panel over which network is "correct"
 * while a bridge is in progress. */
export default function CctpBridgePanel({ wallet, onBridged }) {
  const { address, chainId, connect, switchNetwork, getSigner, getProvider } = wallet
  const [amount, setAmount] = useState('')
  const [fujiBalance, setFujiBalance] = useState(null)
  const [step, setStep] = useState('idle') // idle | approving | burning | awaiting-attestation | ready-to-mint | minting | done
  const [elapsedMs, setElapsedMs] = useState(0)
  const [pendingMint, setPendingMint] = useState(null)
  const [error, setError] = useState(null)

  const onFuji = chainId === FUJI_CHAIN_ID
  const onArc = chainId === ARC_CHAIN_ID
  const busy = ['approving', 'burning', 'awaiting-attestation', 'minting'].includes(step)

  useEffect(() => {
    if (!address || !onFuji) return
    let cancelled = false
    getFujiUsdcBalance(getProvider(), address)
      .then((bal) => { if (!cancelled) setFujiBalance(bal) })
      .catch(() => {})
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, onFuji])

  async function handleBridge(e) {
    e.preventDefault()
    setError(null)
    const amt = Number(amount)
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return }
    try {
      const signer = getSigner()
      const allowance = await getAllowance(getProvider(), address)
      if (allowance < amt) {
        setStep('approving')
        await approveUsdc(signer, amt)
      }
      setStep('burning')
      const txHash = await depositForBurn(signer, amt, address)
      setStep('awaiting-attestation')
      setElapsedMs(0)
      const attestation = await pollAttestation(txHash, { onTick: (_status, elapsed) => setElapsedMs(elapsed) })
      setPendingMint(attestation)
      setStep('ready-to-mint')
    } catch (err) {
      setError(err.shortMessage ?? err.message)
      setStep('idle')
    }
  }

  async function handleComplete() {
    setError(null)
    if (!onArc) {
      await switchNetwork(ARC_TESTNET_CHAIN)
      return
    }
    try {
      setStep('minting')
      await receiveOnArc(getSigner(), pendingMint.message, pendingMint.attestation)
      setStep('done')
      onBridged?.()
    } catch (err) {
      setError(err.shortMessage ?? err.message)
      setStep('ready-to-mint')
    }
  }

  function reset() {
    setStep('idle')
    setAmount('')
    setPendingMint(null)
    setError(null)
  }

  return (
    <div className="panel" style={{ marginBottom: 20 }}>
      <h3>Bridge from Avalanche (CCTP)</h3>
      <p className="bet-form__note">
        Burns USDC on Avalanche Fuji and mints it natively on Arc.
        Get testnet USDC from{' '}
        <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-cyan)' }}>
          faucet.circle.com
        </a> (select Avalanche Fuji).
      </p>

      {!address ? (
        <button className="btn btn-outline" onClick={() => connect()}>
          Connect Wallet
        </button>
      ) : step === 'done' ? (
        <>
          <p className="bet-form__success">Bridge complete — native USDC minted on Arc.</p>
          <button className="btn btn-outline" onClick={reset}>Bridge more</button>
        </>
      ) : step === 'ready-to-mint' ? (
        <>
          <p className="bet-form__note">Attestation ready.</p>
          <button className="btn btn-primary" onClick={handleComplete} disabled={busy}>
            {onArc ? 'Complete Bridge on Arc' : 'Switch to Arc Testnet'}
          </button>
        </>
      ) : !onFuji ? (
        <button className="btn btn-outline" onClick={() => switchNetwork(AVALANCHE_FUJI_CHAIN)} disabled={busy}>
          Switch to Avalanche Fuji
        </button>
      ) : (
        <form className="bet-form" onSubmit={handleBridge}>
          <p className="deposit-panel__balance">Fuji balance: {formatUsdc(fujiBalance)} USDC</p>
          <input
            type="number" min="0" step="0.01" placeholder="Amount (USDC)"
            value={amount} onChange={(e) => setAmount(e.target.value)} disabled={busy}
          />
          <button className="btn btn-primary" disabled={busy}>
            {busy ? STEP_LABEL[step] : 'Bridge to Arc'}
          </button>
          {step === 'awaiting-attestation' && (
            <p className="bet-form__note">{Math.floor(elapsedMs / 1000)}s elapsed — testnet attestations usually land within a couple minutes.</p>
          )}
        </form>
      )}

      {error && <p className="bet-form__error">{error}</p>}
    </div>
  )
}
