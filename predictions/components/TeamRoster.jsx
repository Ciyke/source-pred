function short(addr) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export default function TeamRoster({ room, myTeam, address, onJoin, joining }) {
  const canJoin = room.state === 'open' && address && myTeam == null

  const teamBlock = (players, team, label) => (
    <div>
      <h4 style={{ fontFamily: 'Orbitron, monospace', fontSize: '.85rem', color: team === 0 ? 'var(--neon-red)' : 'var(--neon-green)' }}>
        Team {label}
      </h4>
      <div className="team-roster__slots">{players.length} / {room.teamSize} joined</div>
      <ul className="team-roster__list">
        {players.map((p) => <li key={p}>{short(p)}{p === address ? ' (you)' : ''}</li>)}
      </ul>
      {canJoin && players.length < room.teamSize && (
        <button
          className={`btn ${team === 0 ? 'btn-primary' : 'btn-secondary'}`}
          disabled={joining}
          onClick={() => onJoin(team)}
        >
          {joining ? 'Joining…' : `Join Team ${label}`}
        </button>
      )}
    </div>
  )

  return (
    <div className="panel">
      <h3>Matchroom Roster</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {teamBlock(room.team0, 0, 'A')}
        {teamBlock(room.team1, 1, 'B')}
      </div>
    </div>
  )
}
