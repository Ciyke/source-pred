import { useRef, useState } from 'react'
import { COSMETIC_HISTORY_A, COSMETIC_HISTORY_B } from '../lib/cosmeticOddsHistory.js'

/**
 * Purely decorative win-probability line chart, styled to match a
 * Polymarket market chart: solid dark panel, dotted gridlines at round 20%
 * steps, plain right-side percentage axis, thin stepped lines, and a soft
 * glowing dot at the current price. The data is a fixed, hand-traced
 * dataset (see lib/cosmeticOddsHistory.js) — not derived from room/pool
 * state and not updated over time. Team color is fixed by side: red for
 * Team A, green for Team B.
 */

const W = 360
const H = 150
const MARGIN = { top: 12, right: 38, bottom: 14, left: 4 }
const PLOT_W = W - MARGIN.left - MARGIN.right
const PLOT_H = H - MARGIN.top - MARGIN.bottom
const GRID_STEPS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
const AXIS_X = MARGIN.left + PLOT_W + 8
const N = COSMETIC_HISTORY_A.length

function xAt(i, n) {
  return MARGIN.left + (n <= 1 ? 0 : (i / (n - 1)) * PLOT_W)
}

function yAt(prob) {
  return MARGIN.top + (1 - prob) * PLOT_H
}

// Step-after path (flat, then a vertical jump to the next value) rather than
// a diagonal line between points — gives the chart a Polymarket-style
// jagged staircase look instead of a smoothed trend line.
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

export default function OddsChart({ teamAName = 'Team A', teamBName = 'Team B' }) {
  const svgRef = useRef(null)
  const [hoverIndex, setHoverIndex] = useState(null)

  const lastA = COSMETIC_HISTORY_A[N - 1]
  const lastB = COSMETIC_HISTORY_B[N - 1]
  const endYA = yAt(lastA)
  const endYB = yAt(lastB)
  const endX = xAt(N - 1, N)

  function handleMove(e) {
    const rect = svgRef.current.getBoundingClientRect()
    const scale = W / rect.width
    const vbX = (e.clientX - rect.left) * scale
    const ratio = (vbX - MARGIN.left) / PLOT_W
    const idx = Math.round(ratio * (N - 1))
    setHoverIndex(Math.min(N - 1, Math.max(0, idx)))
  }

  const hoverX = hoverIndex != null ? xAt(hoverIndex, N) : null

  return (
    <div className="odds-chart">
      <div className="odds-chart__headline">
        <HeadlineStat colorVar="--neon-red" name={teamAName} prob={lastA} />
        <HeadlineStat colorVar="--neon-green" name={teamBName} prob={lastB} />
      </div>

      <div className="odds-chart__wrap">
        <svg
          ref={svgRef}
          className="odds-chart__svg"
          viewBox={`0 0 ${W} ${H}`}
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {GRID_STEPS.map((g) => (
            <g key={g}>
              <line
                className="odds-chart__grid"
                x1={MARGIN.left}
                x2={MARGIN.left + PLOT_W}
                y1={yAt(g)}
                y2={yAt(g)}
                vectorEffect="non-scaling-stroke"
              />
              <text className="odds-chart__tick" x={AXIS_X} y={yAt(g) + 3}>
                {Math.round(g * 100)}%
              </text>
            </g>
          ))}

          {hoverX != null && (
            <line
              className="odds-chart__crosshair"
              x1={hoverX}
              x2={hoverX}
              y1={MARGIN.top}
              y2={MARGIN.top + PLOT_H}
              vectorEffect="non-scaling-stroke"
            />
          )}

          <path className="odds-chart__line" style={{ stroke: 'var(--neon-red)' }} d={pathFor(COSMETIC_HISTORY_A)} vectorEffect="non-scaling-stroke" />
          <path className="odds-chart__line" style={{ stroke: 'var(--neon-green)' }} d={pathFor(COSMETIC_HISTORY_B)} vectorEffect="non-scaling-stroke" />

          {hoverIndex != null && (
            <>
              <circle className="odds-chart__hover-dot" cx={hoverX} cy={yAt(COSMETIC_HISTORY_A[hoverIndex])} r={3.5} style={{ fill: 'var(--neon-red)' }} vectorEffect="non-scaling-stroke" />
              <circle className="odds-chart__hover-dot" cx={hoverX} cy={yAt(COSMETIC_HISTORY_B[hoverIndex])} r={3.5} style={{ fill: 'var(--neon-green)' }} vectorEffect="non-scaling-stroke" />
            </>
          )}

          <circle className="odds-chart__end-ping" cx={endX} cy={endYA} r={4} style={{ fill: 'var(--neon-red)' }} />
          <circle className="odds-chart__end-ping" cx={endX} cy={endYB} r={4} style={{ fill: 'var(--neon-green)' }} />
          <circle className="odds-chart__end-dot" cx={endX} cy={endYA} r={4} style={{ fill: 'var(--neon-red)', filter: 'drop-shadow(0 0 4px var(--neon-red))' }} vectorEffect="non-scaling-stroke" />
          <circle className="odds-chart__end-dot" cx={endX} cy={endYB} r={4} style={{ fill: 'var(--neon-green)', filter: 'drop-shadow(0 0 4px var(--neon-green))' }} vectorEffect="non-scaling-stroke" />
        </svg>

        {hoverIndex != null && (
          <div
            className="odds-chart__tooltip"
            style={{ left: `${(hoverX / W) * 100}%`, top: `${(MARGIN.top / H) * 100}%` }}
          >
            <TooltipRow colorVar="--neon-red" name={teamAName} prob={COSMETIC_HISTORY_A[hoverIndex]} />
            <TooltipRow colorVar="--neon-green" name={teamBName} prob={COSMETIC_HISTORY_B[hoverIndex]} />
          </div>
        )}
      </div>
    </div>
  )
}

function HeadlineStat({ colorVar, name, prob }) {
  return (
    <div className="odds-chart__headline-stat">
      <span className="odds-chart__legend-dot" style={{ background: `var(${colorVar})` }} />
      <span className="odds-chart__headline-name">{name}</span>
      <span className="odds-chart__headline-value">{Math.round(prob * 100)}%</span>
    </div>
  )
}

function TooltipRow({ colorVar, name, prob }) {
  return (
    <div className="odds-chart__tooltip-row">
      <span className="odds-chart__tooltip-key" style={{ background: `var(${colorVar})` }} />
      <span className="odds-chart__tooltip-name">{name}</span>
      <span className="odds-chart__tooltip-value">{Math.round(prob * 100)}%</span>
    </div>
  )
}
