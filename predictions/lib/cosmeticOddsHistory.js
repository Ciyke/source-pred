// Fully static, non-realtime chart data — traced by hand against the
// gridlines of a Polymarket screenshot to reproduce its exact rhythm
// (the shared spike bursts, the two big humps, the late convergence near
// the end) rather than being derived from room/pool state. This is pure
// decoration, computed once at module load; it never changes at runtime.

const POINTS = 110

// [t (0-1 across the chart), value in %] — major inflections read off the
// reference screenshot's blue line.
const KEYFRAMES_A = [
  [0.00, 26], [0.02, 33], [0.07, 33], [0.14, 36], [0.20, 39], [0.24, 40],
  [0.26, 30], [0.27, 68], [0.28, 32], [0.29, 63], [0.30, 40],
  [0.34, 70], [0.40, 65], [0.44, 63], [0.50, 57],
  [0.55, 53], [0.58, 45], [0.60, 55],
  [0.63, 52], [0.70, 50], [0.75, 48],
  [0.78, 41], [0.80, 34], [0.805, 63], [0.815, 50],
  [0.83, 50], [0.86, 50],
  [0.90, 55], [0.94, 64], [0.97, 58], [0.985, 48], [0.99, 52], [1.00, 48],
]

// Second, cooler-toned line — read off the same screenshot; it shares the
// spike bursts with line A and crosses it repeatedly rather than mirroring
// it exactly, matching the source image.
const KEYFRAMES_B = [
  [0.00, 68], [0.03, 60], [0.07, 59], [0.14, 58], [0.20, 56], [0.24, 55],
  [0.26, 40], [0.27, 72], [0.28, 38], [0.29, 66], [0.30, 45],
  [0.34, 30], [0.40, 33], [0.44, 36], [0.50, 40],
  [0.55, 44], [0.58, 46], [0.60, 41],
  [0.63, 45], [0.70, 47], [0.75, 49],
  [0.78, 55], [0.80, 63], [0.805, 34], [0.815, 47],
  [0.83, 47], [0.86, 46],
  [0.90, 41], [0.94, 37], [0.97, 44], [0.985, 51], [0.99, 49], [1.00, 51],
]

const JITTER_PCT = 2.5

// Deterministic PRNG (mulberry32) so the jitter texture is fixed across
// reloads instead of reshuffling — this is decoration, not live data.
function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function interpolate(keyframes, t) {
  for (let i = 0; i < keyframes.length - 1; i++) {
    const [t0, v0] = keyframes[i]
    const [t1, v1] = keyframes[i + 1]
    if (t >= t0 && t <= t1) {
      const localT = t1 === t0 ? 0 : (t - t0) / (t1 - t0)
      return v0 + (v1 - v0) * localT
    }
  }
  return keyframes[keyframes.length - 1][1]
}

function buildSeries(keyframes, seed) {
  const rand = mulberry32(seed)
  return Array.from({ length: POINTS }, (_, i) => {
    const t = i / (POINTS - 1)
    const base = interpolate(keyframes, t)
    const jittered = base + (rand() - 0.5) * JITTER_PCT
    return Math.min(100, Math.max(0, jittered)) / 100
  })
}

export const COSMETIC_HISTORY_A = buildSeries(KEYFRAMES_A, 1)
export const COSMETIC_HISTORY_B = buildSeries(KEYFRAMES_B, 2)
