import { COSMETIC_HISTORY_A, COSMETIC_HISTORY_B } from '../lib/cosmeticOddsHistory.js'

const W = 60
const H = 24
const MARGIN = { top: 2, right: 2, bottom: 2, left: 2 }
const PLOT_W = W - MARGIN.left - MARGIN.right
const PLOT_H = H - MARGIN.top - MARGIN.bottom
const SPARK_POINTS = 24

function xAt(i, n) {
  return MARGIN.left + (n <= 1 ? 0 : (i / (n - 1)) * PLOT_W)
}
function yAt(prob) {
  return MARGIN.top + (1 - prob) * PLOT_H
}
function pathFor(values) {
  return values
    .map((v, i) => {
      const x = xAt(i, values.length).toFixed(1)
      const y = yAt(v).toFixed(1)
      if (i === 0) return `M ${x} ${y}`
      const prevY = yAt(values[i - 1]).toFixed(1)
      return `L ${x} ${prevY} L ${x} ${y}`
    })
    .join(' ')
}

function sliceForRoom(history, roomId) {
  const N = history.length
  const maxOffset = Math.max(0, N - SPARK_POINTS)
  const offset = roomId % (maxOffset + 1)
  return history.slice(offset, offset + SPARK_POINTS)
}

export default function OddsSparkline({ roomId, team = 0 }) {
  const history = team === 0 ? COSMETIC_HISTORY_A : COSMETIC_HISTORY_B
  const values = sliceForRoom(history, roomId ?? 0)
  const color = team === 0 ? 'var(--neon-red)' : 'var(--neon-green)'
  return (
    <span className="room-card__sparkline" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} preserveAspectRatio="none">
        <path d={pathFor(values)} fill="none" stroke={color} strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={0.9} />
      </svg>
    </span>
  )
}
