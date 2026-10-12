function timeLeftLabel(room) {
  if (room.state !== 'open') return null
  const ms = room.betDeadline - Date.now()
  if (ms <= 0) return 'Locking…'
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `Locks in ${mins}m`
  return `Locks in ${Math.floor(mins / 60)}h ${mins % 60}m`
}

export default function RoomCard({ room, onSelect }) {
  const label = timeLeftLabel(room)
  return (
    <div className="room-card" onClick={() => onSelect(room.id)}>
      <div className="room-card__header">
        <span className="room-card__id">Room #{room.id}</span>
        <span className={`state-badge state-badge--${room.state}`}>{room.state}</span>
      </div>
      <div>{room.team0.length}v{room.team1.length} · up to {room.teamSize} per side</div>
      <div className="room-card__pools">
        <span className="room-card__pool--a">Team A: {room.poolTeam0} USDC</span>
        <span className="room-card__pool--b">Team B: {room.poolTeam1} USDC</span>
      </div>
      {label && <div className="room-card__deadline">{label}</div>}
      {room.state === 'resolved' && (
        <div className="room-card__deadline">
          Winner: Team <span style={{ color: room.winningTeam === 0 ? 'var(--neon-red)' : 'var(--neon-green)', fontWeight: 700 }}>{room.winningTeam === 0 ? 'A' : 'B'}</span>
        </div>
      )}
    </div>
  )
}
