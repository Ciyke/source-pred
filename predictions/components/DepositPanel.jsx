import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { predictionsClient } from '../client/index.js'
import { ESCROW_ABI, contractFor } from '../client/metroEscrow.js'

const TOKEN_OPTIONS = [
  { id: 'avax',       label: '$AVAX',              chain: 'avalanche' },
  { id: 'mon',        label: '$MON',               chain: 'monad' },
  { id: 'usdc-monad', label: 'USDC on Monad',      chain: 'monad' },
  { id: 'sol',        label: '$SOL',               chain: null },
  { id: 'usdc-sol',   label: 'USDC on Sol',        chain: null },
]

export default function DepositPanel({ address, wallet }) {
  const [balance, setBalance] = useState(0)
  const [token, setToken] = useState(TOKEN_OPTIONS[0].id)
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const chainId = wallet?.chainId
  const target = contractFor(chainId)
  const selected = TOKEN_OPTIONS.find((t) => t.id === token)

  async function refreshBalance() {
    if (!address) { setBalance(0); return }
    // On-chain balance when connected to a supported chain, mock otherwise
    if (target) {
      try {
        const provider = wallet.getProvider()
        const escrow = new ethers.Contract(target.escrow, ESCROW_ABI, provider)
        const bal = await escrow.balanceOf(address)
        setBalance(Number(ethers.formatEther(bal)))
        return
      } catch (e) {
        console.warn('balance read failed, falling back to mock:', e.message)
      }
    }
    predictionsClient.getBalance(address).then(setBalance)
  }

  useEffect(() => {
    refreshBalance()
  }, [address, success, chainId])

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const amt = Number(amount)
    if (!address) { setError('Connect your wallet first'); return }
    if (!token) { setError('Pick a token'); return }
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return }
    setBusy(true)
    try {
      const label = selected?.label ?? token

      // On-chain deposit when the token maps to the connected chain
      if (target && selected?.chain === target.chainName.toLowerCase().replace('avalanche', 'avalanche')) {
        const signer = wallet.getSigner()
        const escrow = new ethers.Contract(target.escrow, ESCROW_ABI, signer)
        const tx = await escrow.deposit({ value: ethers.parseEther(String(amt)) })
        await tx.wait()
        setSuccess(`Deposited ${amt} ${label} on ${target.chainName}`)
      } else {
        await predictionsClient.deposit(token, amt, address)
        setSuccess(`Deposited ${amt} ${label}`)
      }
      setAmount('')
    } catch (err) {
      setError(err.shortMessage ?? err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel deposit-panel--xenrena">
      <h3>Deposit</h3>
      {address && (
        <div className="deposit-panel__balance">
          Balance: {balance}
          {target && <span className="deposit-panel__chain-tag"> · {target.chainName}</span>}
        </div>
      )}
      <form className="bet-form" onSubmit={submit}>
        <label className="deposit-panel__token-label" htmlFor="deposit-token">Token</label>
        <div className="deposit-panel__select-wrap">
          <select
            id="deposit-token"
            className="deposit-panel__select"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          >
            {TOKEN_OPTIONS.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          <span className="deposit-panel__chevron" aria-hidden="true">▾</span>
        </div>
        <input
          type="number" min="0" step="0.01" placeholder="Amount"
          value={amount} onChange={(e) => setAmount(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Depositing…' : 'Deposit'}
        </button>
        {error && <p className="bet-form__error">{error}</p>}
        {success && <p className="bet-form__success">{success}</p>}
      </form>
    </div>
  )
}
