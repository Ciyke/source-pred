import { useCallback, useEffect, useState } from 'react'
import { predictionsClient } from '../client/index.js'
import TeamRoster from './TeamRoster.jsx'
import BetForm from './BetForm.jsx'
import ClaimPanel from './ClaimPanel.jsx'

export default function RoomDetail({ roomId, onBack, wallet }) {
  const { address } = wallet
  const [room, setRoom] = useState(null)
  const [myStatus, setMyStatus] = useState({ team: null, bet: null })
  const [error, setError] = useState(null)
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState(null)

  const refresh = useCallback(() => {
    predictionsClient.getRoom(roomId).then(setRoom).catch((err) => setError(err.message))
    if (address) {
      predictionsClient.getMyStatus(roomId, address).then(setMyStatus)
    } else {
      setMyStatus({ team: null, bet: null })
    }
  }, [roomId, address])

  useEffect(() => { refresh() }, [refresh])

  async function handleJoin(team) {
    if (!address) { setJoinError('Connect your wallet first'); return }
    setJoining(true)
    setJoinError(null)
    try {
      await predictionsClient.joinTeam(roomId, team, address)
      refresh()
    } catch (err) {
      setJoinError(err.message)
    } finally {
      setJoining(false)
    }
  }

  if (error) return <div className="empty-state">Failed to load room: {error}</div>
  if (!room) return <div className="empty-state">Loading room…</div>

  return (
    <div>
      <button className="btn btn-outline room-detail__back" onClick={onBack}>← Back to matchrooms</button>
      <h2 className="predictions-title" style={{ fontSize: '1.4rem' }}>Room #{room.id}</h2>
      <p className="predictions-subtitle">
        <span className={`state-badge state-badge--${room.state}`}>{room.state}</span>
        {' · '}Pool A: {room.poolTeam0} USDC · Pool B: {room.poolTeam1} USDC
      </p>
      {joinError && <p className="bet-form__error" style={{ marginBottom: 12 }}>{joinError}</p>}

      <div className="room-detail__grid">
        <TeamRoster room={room} myTeam={myStatus.team} address={address} onJoin={handleJoin} joining={joining} />
        <BetForm room={room} address={address} myTeam={myStatus.team} myBet={myStatus.bet} onPlaced={refresh} />
      </div>

      <ClaimPanel room={room} address={address} myBet={myStatus.bet} onClaimed={refresh} />
    </div>
  )
}
