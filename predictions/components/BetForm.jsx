import { useState } from 'react'
import { predictionsClient } from '../client/index.js'

export default function BetForm({ room, address, myTeam, myBet, onPlaced }) {
  const [team, setTeam] = useState(myBet?.team ?? null)
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const blockedByIntegrityRule = myTeam != null
  const disabled = room.state !== 'open' || !address || blockedByIntegrityRule

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const amt = Number(amount)
    if (team == null) { setError('Pick a team first'); return }
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return }
    setBusy(true)
    try {
      await predictionsClient.placeBet(room.id, team, amt, address)
      setSuccess(`Bet placed: ${amt} USDC on Team ${team === 0 ? 'A' : 'B'}`)
      setAmount('')
      onPlaced?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (blockedByIntegrityRule) {
    return (
      <div className="panel">
        <h3>Place a Prediction</h3>
        <p className="bet-form__note">Players in this matchroom can't bet on it (integrity rule).</p>
      </div>
    )
  }

  return (
    <div className="panel">
      <h3>Place a Prediction</h3>
      <form className="bet-form" onSubmit={submit}>
        <div className="bet-form__teams">
          <button type="button"
            className={`bet-form__team-btn bet-form__team-btn--red ${team === 0 ? 'bet-form__team-btn--selected' : ''}`}
            onClick={() => setTeam(0)} disabled={disabled}>
            Team A
          </button>
          <button type="button"
            className={`bet-form__team-btn bet-form__team-btn--green ${team === 1 ? 'bet-form__team-btn--selected' : ''}`}
            onClick={() => setTeam(1)} disabled={disabled}>
            Team B
          </button>
        </div>
        <input
          type="number" min="0" step="0.01" placeholder={`Amount (USDC, min ${room.minBet})`}
          value={amount} onChange={(e) => setAmount(e.target.value)} disabled={disabled}
        />
        <button type="submit" className="btn btn-primary" disabled={disabled || busy}>
          {busy ? 'Placing…' : 'Place Prediction'}
        </button>
        {!address && <p className="bet-form__note">Connect your wallet to place a prediction.</p>}
        {room.state !== 'open' && <p className="bet-form__note">Betting is closed for this room.</p>}
        {error && <p className="bet-form__error">{error}</p>}
        {success && <p className="bet-form__success">{success}</p>}
      </form>
    </div>
  )
}
