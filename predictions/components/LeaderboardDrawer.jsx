import { useState } from 'react'

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Zayden Wolfe', player: '0xA11c…000A', earnings: '4,820.00', wins: 28 },
  { rank: 2, name: 'Mira Quinn', player: '0xCafe…CAFE', earnings: '4,150.50', wins: 24 },
  { rank: 3, name: 'Jax Hollow', player: '0xB0b0…B0B0', earnings: '3,810.00', wins: 21 },
  { rank: 4, name: 'Sora Blake', player: '0xD00d…D00D', earnings: '3,220.25', wins: 19 },
  { rank: 5, name: 'Kairo Vex', player: '0xBeef…BEEF', earnings: '2,940.00', wins: 17 },
  { rank: 6, name: 'Luna Cross', player: '0xFace…FACE', earnings: '2,540.75', wins: 15 },
  { rank: 7, name: 'Dax Wilder', player: '0x1234…ABCD', earnings: '2,180.00', wins: 13 },
  { rank: 8, name: 'Nova Reed', player: '0x5678…EF01', earnings: '1,890.30', wins: 11 },
  { rank: 9, name: 'Rook Hayes', player: '0x9999…AAAA', earnings: '1,640.00', wins: 10 },
  { rank: 10, name: 'Aria Stone', player: '0x2222…BBBB', earnings: '1,410.50', wins: 9 },
  { rank: 11, name: 'Finn Mercer', player: '0x3333…CCCC', earnings: '1,280.00', wins: 8 },
  { rank: 12, name: 'Zara Nyx', player: '0x4444…DDDD', earnings: '1,050.25', wins: 7 },
  { rank: 13, name: 'Cole Vance', player: '0x5555…EEEE', earnings: '920.00', wins: 6 },
  { rank: 14, name: 'Iris Dawn', player: '0x6666…FFFF', earnings: '810.40', wins: 6 },
  { rank: 15, name: 'Theo Grant', player: '0x7777…1111', earnings: '740.00', wins: 5 },
  { rank: 16, name: 'Maya Frost', player: '0x8888…2222', earnings: '680.00', wins: 5 },
  { rank: 17, name: 'Ezra Kane', player: '0x9990…3333', earnings: '610.50', wins: 4 },
  { rank: 18, name: 'Jade Rivers', player: '0xAA00…4444', earnings: '540.00', wins: 4 },
  { rank: 19, name: 'Levi Nash', player: '0xBB00…5555', earnings: '480.25', wins: 3 },
  { rank: 20, name: 'Skye Rowan', player: '0xCC00…6666', earnings: '420.00', wins: 3 },
]

export default function LeaderboardDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className={`leaderboard-drawer__handle ${open ? 'leaderboard-drawer__handle--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close leaderboard' : 'Open earning leaderboard'}
        aria-expanded={open}
      >
        <span className="leaderboard-drawer__arrow" aria-hidden="true">{open ? '›' : '‹'}</span>
      </button>
      <aside className={`leaderboard-drawer ${open ? 'leaderboard-drawer--open' : ''}`} aria-hidden={!open}>
        <div className="leaderboard-drawer__header">
          <h3>Earning Leaderboard</h3>
          <button type="button" className="leaderboard-drawer__close" onClick={() => setOpen(false)} aria-label="Close">×</button>
        </div>
        <div className="leaderboard-drawer__table-wrap">
          <table className="leaderboard-drawer__table">
            <thead>
              <tr><th>#</th><th>Player</th><th>Earnings</th><th>Wins</th></tr>
            </thead>
            <tbody>
              {MOCK_LEADERBOARD.map((r) => (
                <tr key={r.rank}>
                  <td>{r.rank}</td>
                  <td>
                    <span className="leaderboard-drawer__name">{r.name}</span>
                    <span className="leaderboard-drawer__addr mono">{r.player}</span>
                  </td>
                  <td>${r.earnings}</td>
                  <td>{r.wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="leaderboard-drawer__note">Mock data — connect to on-chain earnings when ready.</p>
      </aside>
      {open && <button type="button" className="leaderboard-drawer__backdrop" onClick={() => setOpen(false)} aria-label="Close leaderboard" />}
    </>
  )
}
