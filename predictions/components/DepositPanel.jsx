import { useEffect, useState } from 'react'
import { predictionsClient } from '../client/index.js'

export default function DepositPanel({ address }) {
  const [chains, setChains] = useState([])
  const [balance, setBalance] = useState(0)
  const [chainId, setChainId] = useState(null)
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    predictionsClient.getSupportedDepositChains().then((list) => {
      setChains(list)
      setChainId(list.find((c) => c.enabled)?.chainId ?? null)
    })
  }, [])

  useEffect(() => {
    if (!address) { setBalance(0); return }
    predictionsClient.getBalance(address).then(setBalance)
  }, [address, success])

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const amt = Number(amount)
    if (!address) { setError('Connect your wallet first'); return }
    if (!chainId) { setError('Pick a deposit chain'); return }
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return }
    setBusy(true)
    try {
      await predictionsClient.deposit(chainId, amt, address)
      setSuccess(`Deposited ${amt} USDC via ${chains.find((c) => c.chainId === chainId)?.name}`)
      setAmount('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel">
      <h3>Deposit USDC</h3>
      {address && <div className="deposit-panel__balance">Balance: {balance} USDC</div>}
      <div className="deposit-panel__chains">
        {chains.map((c) => (
          <label key={c.chainId} className={`deposit-panel__chain ${!c.enabled ? 'deposit-panel__chain--disabled' : ''}`}>
            <span>
              <input
                type="radio" name="deposit-chain" disabled={!c.enabled}
                checked={chainId === c.chainId}
                onChange={() => setChainId(c.chainId)}
                style={{ marginRight: 8 }}
              />
              {c.name}
            </span>
            <span className="deposit-panel__chain-tag">{c.enabled ? 'via CCTP' : 'coming soon'}</span>
          </label>
        ))}
      </div>
      <form className="bet-form" onSubmit={submit}>
        <input
          type="number" min="0" step="0.01" placeholder="Amount (USDC)"
          value={amount} onChange={(e) => setAmount(e.target.value)}
        />
        <button type="submit" className="btn btn-outline" disabled={busy}>
          {busy ? 'Depositing…' : 'Deposit'}
        </button>
        {error && <p className="bet-form__error">{error}</p>}
        {success && <p className="bet-form__success">{success}</p>}
      </form>
    </div>
  )
}
