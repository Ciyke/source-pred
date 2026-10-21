import OddsSparkline from './OddsSparkline.jsx'

function timeLeftLabel(room) {
  if (room.state !== 'open') return null
  const ms = room.betDeadline - Date.now()
  if (ms <= 0) return 'Locking…'
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `Locks in ${mins}m`
  return `Locks in ${Math.floor(mins / 60)}h ${mins % 60}m`
}

function displayOdds(poolA, poolB) {
  const total = poolA + poolB
  if (total === 0) return { a: '—', b: '—' }
  // Parimutuel implied odds: inversely proportional to pool share
  const aProb = poolA / total
  const bProb = poolB / total
  const a = aProb > 0 ? (1 / aProb).toFixed(2) : '—'
  const b = bProb > 0 ? (1 / bProb).toFixed(2) : '—'
  return { a, b }
}

export default function RoomCard({ room, onSelect }) {
  const label = timeLeftLabel(room)
  const odds = displayOdds(room.poolTeam0, room.poolTeam1)

  return (
    <div className="room-card room-card--xenrena">
      <div className="room-card__main" onClick={() => onSelect(room.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onSelect(room.id) }}>
        <div className="room-card__game">
          <span className="room-card__game-icon" aria-hidden="true">⚔</span>
          <span className="room-card__game-name">Room #{room.id}</span>
          <span className={`state-badge state-badge--${room.state}`}>{room.state}</span>
        </div>
        <div className="room-card__odds-row">
          <span className="room-card__odd-box">A {odds.a}</span>
          <span className="room-card__vs">vs</span>
          <span className="room-card__odd-box"> {odds.b} B</span>
          <OddsSparkline roomId={room.id} team={0} />
          <OddsSparkline roomId={room.id} team={1} />
        </div>
        <div className="room-card__teams">{room.team0.length}v{room.team1.length} · up to {room.teamSize} per side</div>
        <div className="room-card__pools">
          <span className="room-card__pool--a">Team A: {room.poolTeam0}</span>
          <span className="room-card__pool--b">Team B: {room.poolTeam1}</span>
        </div>
        {label && <div className="room-card__deadline">{label}</div>}
        {room.state === 'resolved' && (
          <div className="room-card__deadline">
            Winner: Team <span style={{ color: room.winningTeam === 0 ? 'var(--neon-red)' : 'var(--neon-green)', fontWeight: 700 }}>{room.winningTeam === 0 ? 'A' : 'B'}</span>
          </div>
        )}
      </div>
      <div className="room-card__actions">
        {room.state === 'open' && <span className="room-card__live-badge">In progress</span>}
        <button
          type="button"
          className="btn btn-primary room-card__stake"
          onClick={() => onSelect(room.id)}
        >
          Stake
        </button>
        <span className="room-card__video-icon" aria-hidden="true">◫</span>
      </div>
    </div>
  )
}
