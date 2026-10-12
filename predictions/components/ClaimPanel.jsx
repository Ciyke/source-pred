import { useEffect, useState } from 'react'
import { predictionsClient } from '../client/index.js'

export default function ClaimPanel({ room, address, myBet, onClaimed }) {
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [claimedAmount, setClaimedAmount] = useState(null)

  const claimable = room.state === 'resolved' || room.state === 'cancelled'

  useEffect(() => {
    if (!claimable || !address || !myBet || myBet.claimed) return
    predictionsClient.previewPayout(room.id, address).then(setPreview)
  }, [claimable, address, myBet, room.id])

  if (!claimable || !myBet) return null

  async function claim() {
    setBusy(true)
    setError(null)
    try {
      const { amount } = await predictionsClient.claim(room.id, address)
      setClaimedAmount(amount)
      onClaimed?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel">
      <h3>{room.state === 'cancelled' ? 'Refund' : 'Your Payout'}</h3>
      {myBet.claimed || claimedAmount != null ? (
        <p className="bet-form__success">Claimed {claimedAmount ?? myBet.amount} USDC.</p>
      ) : (
        <>
          <div className="claim-panel__amount">{preview ?? '…'} USDC</div>
          <button className="btn btn-primary" onClick={claim} disabled={busy}>
            {busy ? 'Claiming…' : room.state === 'cancelled' ? 'Claim Refund' : 'Claim Payout'}
          </button>
          {error && <p className="bet-form__error">{error}</p>}
        </>
      )}
    </div>
  )
}
