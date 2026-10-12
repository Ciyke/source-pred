import { useEffect, useState } from 'react'
import * as testMarket from '../../predictions-test/testMarketClient.js'
import { formatUsdc } from '../../shared/format.js'
import { ARC_TESTNET_CHAIN } from '../../shared/useWallet.js'
import CctpBridgePanel from './CctpBridgePanel.jsx'

const ARC_CHAIN_ID = parseInt(ARC_TESTNET_CHAIN.chainIdHex, 16)

/** The real (Arc Testnet) deposit/predict/withdraw panel — shared by the merged
 * /predictions/ page and the standalone /predictions-test/ page so both stay in
 * sync with the same fetch/optimistic-update logic. */
export default function ArcTestnetPanel({ wallet }) {
  const { address, chainId, getSigner, getProvider, status } = wallet
  const [balance, setBalance] = useState(null)
  const [myPrediction, setMyPrediction] = useState(null)
  const [depositAmt, setDepositAmt] = useState('')
  const [withdrawAmt, setWithdrawAmt] = useState('')
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState(null)
  const [log, setLog] = useState([])

  // status can also read 'connected' while on Avalanche Fuji (the CCTP bridge's
  // source chain — see useWallet's acceptableChains) — the deposit/predict/
  // withdraw grid below is Arc-only, so it needs the stricter check.
  const connected = status === 'connected' && address && chainId === ARC_CHAIN_ID

  function pushLog(msg) {
    setLog((l) => [msg, ...l].slice(0, 8))
  }

  // Balance and prediction are fetched independently — previously a single
  // Promise.all held the balance display back until BOTH calls resolved, so a
  // slow predictedTeam() lookup delayed the number everyone actually cares about.
  async function refreshBalance() {
    if (!connected) return
    try {
      setBalance(await testMarket.getBalance(getProvider(), address))
    } catch {
      // keep the last known value rather than reverting to a blank/loading state
    }
  }

  async function refreshPrediction() {
    if (!connected) return
    try {
      setMyPrediction(await testMarket.getMyPrediction(getProvider(), address))
    } catch {
      // non-critical — leave the previous value in place
    }
  }

  useEffect(() => {
    if (!connected) { setBalance(null); setMyPrediction(null); return }
    refreshBalance()
    refreshPrediction()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, address])

  async function handleDeposit(e) {
    e.preventDefault()
    setError(null)
    const amt = Number(depositAmt)
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return }
    setBusy('deposit')
    setBalance((b) => (b ?? 0) + amt) // optimistic — reconciled once the tx mines
    try {
      await testMarket.deposit(getSigner(), amt)
      pushLog(`Deposited ${amt} USDC`)
      setDepositAmt('')
    } catch (err) {
      setBalance((b) => (b ?? 0) - amt) // revert the optimistic bump
      setError(err.shortMessage ?? err.message)
    } finally {
      setBusy(null)
      refreshBalance()
    }
  }

  async function handlePredict(team) {
    setError(null)
    setBusy('predict')
    setMyPrediction(team) // optimistic
    try {
      await testMarket.predict(getSigner(), team)
      pushLog(`Predicted Team ${team === 0 ? 'A' : 'B'}`)
    } catch (err) {
      setError(err.shortMessage ?? err.message)
      refreshPrediction()
    } finally {
      setBusy(null)
    }
  }

  async function handleWithdraw(e) {
    e.preventDefault()
    setError(null)
    const amt = Number(withdrawAmt)
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return }
    if ((balance ?? 0) < amt) { setError('Amount exceeds your balance'); return }
    setBusy('withdraw')
    setBalance((b) => (b ?? 0) - amt) // optimistic
    try {
      await testMarket.withdraw(getSigner(), amt)
      pushLog(`Withdrew ${amt} USDC`)
      setWithdrawAmt('')
    } catch (err) {
      setBalance((b) => (b ?? 0) + amt) // revert
      setError(err.shortMessage ?? err.message)
    } finally {
      setBusy(null)
      refreshBalance()
    }
  }

  return (
    <div className="arc-panel">
      {!testMarket.isConfigured() && (
        <div className="panel" style={{ marginBottom: 20, borderColor: 'var(--neon-pink)' }}>
          <p className="bet-form__error">
            VITE_TEST_MARKET_ADDRESS is not set. Deploy the contract first (`npm run deploy:test-market`) and add the address to frontend/.env.
          </p>
        </div>
      )}

      {/* Always mounted — the panel renders its own Connect Wallet prompt when
        * disconnected, and gating it on `address` here hid the bridge entirely
        * from anyone who hadn't connected yet. */}
      <CctpBridgePanel wallet={wallet} onBridged={refreshBalance} />

      {!connected ? (
        <p className="bet-form__note">Connect your wallet (switch to Arc Testnet) to continue.</p>
      ) : (
        <div className="arc-panel__grid">
          <div className="panel">
            <h3>Your Balance</h3>
            <div className="claim-panel__amount">{formatUsdc(balance)} USDC</div>
            {myPrediction != null && (
              <p className="bet-form__note">Current prediction: Team <span style={{ color: myPrediction === 0 ? 'var(--neon-red)' : 'var(--neon-green)', fontWeight: 700 }}>{myPrediction === 0 ? 'A' : 'B'}</span> (funds not locked)</p>
            )}
          </div>

          <div className="panel">
            <h3>Deposit</h3>
            <p className="deposit-panel__balance">Balance: {formatUsdc(balance)} USDC</p>
            <form className="bet-form" onSubmit={handleDeposit}>
              <input type="number" min="0" step="0.01" placeholder="Amount (USDC)"
                value={depositAmt} onChange={(e) => setDepositAmt(e.target.value)} />
              <button className="btn btn-primary" disabled={busy === 'deposit'}>
                {busy === 'deposit' ? 'Depositing…' : 'Deposit'}
              </button>
            </form>
          </div>

          <div className="panel">
            <h3>Predict</h3>
            <p className="deposit-panel__balance">Balance: {formatUsdc(balance)} USDC</p>
            <div className="bet-form__teams">
              <button className="bet-form__team-btn bet-form__team-btn--red" disabled={busy === 'predict'} onClick={() => handlePredict(0)}>Team A</button>
              <button className="bet-form__team-btn bet-form__team-btn--green" disabled={busy === 'predict'} onClick={() => handlePredict(1)}>Team B</button>
            </div>
          </div>

          <div className="panel">
            <h3>Withdraw</h3>
            <p className="deposit-panel__balance">Balance: {formatUsdc(balance)} USDC</p>
            <form className="bet-form" onSubmit={handleWithdraw}>
              <input type="number" min="0" step="0.01" placeholder="Amount (USDC)"
                value={withdrawAmt} onChange={(e) => setWithdrawAmt(e.target.value)} />
              <button className="btn btn-outline" disabled={busy === 'withdraw'}>
                {busy === 'withdraw' ? 'Withdrawing…' : 'Withdraw'}
              </button>
            </form>
          </div>
        </div>
      )}

      {error && <p className="bet-form__error">{error}</p>}
      {log.length > 0 && (
        <div className="panel" style={{ marginTop: 20 }}>
          <h3>Activity</h3>
          <ul className="team-roster__list">
            {log.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}
