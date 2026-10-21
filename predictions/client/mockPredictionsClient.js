import { assertClientShape } from './predictionsClient.js'

const MIN_BET = 5
const RAKE_BPS = 200 // 2%, taken from the winning side's profit only
const BPS_DENOM = 10000
const MAX_TEAM_SIZE = 5
const RESOLVE_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000

const now = () => Date.now()
const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms))
const short = (addr) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr)

function randomAddress() {
  let hex = ''
  for (let i = 0; i < 40; i++) hex += Math.floor(Math.random() * 16).toString(16)
  return `0x${hex}`
}

function randomRoster(count) {
  return Array.from({ length: count }, randomAddress)
}

// Freshly "opened" rooms for the live feed — staggered deadlines/pools so the
// list doesn't look like it was seeded all at once.
function seedFeedRoom(id, minutesAgoOpened) {
  const teamSize = 2 + Math.floor(Math.random() * 4) // 2-5
  const team0Count = 1 + Math.floor(Math.random() * teamSize)
  const team1Count = 1 + Math.floor(Math.random() * teamSize)
  return [id, {
    id, state: 'open', teamSize, winningTeam: null,
    betDeadline: now() + (60 - minutesAgoOpened) * 60 * 1000, resolvedAt: null,
    minBet: MIN_BET, rakeBps: RAKE_BPS,
    team0: randomRoster(team0Count),
    team1: randomRoster(team1Count),
    poolTeam0: Math.floor(Math.random() * 80),
    poolTeam1: Math.floor(Math.random() * 80),
  }]
}

let nextRoomId = 14
const rooms = new Map([
  [1, {
    id: 1, state: 'open', teamSize: 3, winningTeam: null,
    betDeadline: now() + 1000 * 60 * 45, resolvedAt: null,
    minBet: MIN_BET, rakeBps: RAKE_BPS,
    team0: ['0xA11cE00000000000000000000000000000000A', '0xB0b00000000000000000000000000000000B0B'],
    team1: ['0xCafe000000000000000000000000000000CAFE'],
    poolTeam0: 42, poolTeam1: 18,
  }],
  [2, {
    id: 2, state: 'locked', teamSize: 5, winningTeam: null,
    betDeadline: now() - 1000 * 60 * 2, resolvedAt: null,
    minBet: MIN_BET, rakeBps: RAKE_BPS,
    team0: ['0xD00d000000000000000000000000000000D00D', '0xFace000000000000000000000000000000FACE', '0xBeef000000000000000000000000000000BEEF'],
    team1: ['0xFeed000000000000000000000000000000FEED', '0x1234000000000000000000000000000000ABCD', '0x5678000000000000000000000000000000EF01', '0x9999000000000000000000000000000000AAAA'],
    poolTeam0: 130, poolTeam1: 95,
  }],
  [3, {
    id: 3, state: 'resolved', teamSize: 2, winningTeam: 1,
    betDeadline: now() - 1000 * 60 * 60 * 6, resolvedAt: now() - 1000 * 60 * 60 * 5,
    minBet: MIN_BET, rakeBps: RAKE_BPS,
    team0: ['0x1111000000000000000000000000000000AAAA'],
    team1: ['0x2222000000000000000000000000000000BBBB'],
    poolTeam0: 60, poolTeam1: 20,
  }],
  ...Array.from({ length: 10 }, (_, i) => seedFeedRoom(4 + i, i)),
])

// Simulates a live feed: a brand-new open matchroom appears about once a
// minute. Browser-only — guarded so this module stays safe to import in any
// non-browser test/build context.
if (typeof window !== 'undefined') {
  setInterval(() => {
    const id = nextRoomId++
    rooms.set(id, seedFeedRoom(id, 0)[1])
  }, 60 * 1000)
}

// roomId -> address -> Bet
const bets = new Map()
// roomId -> address -> team (0|1), for the integrity rule (joined players can't bet)
const playerTeam = new Map()
// address -> USDC balance (credited via deposit())
const balances = new Map()

function betsFor(roomId) {
  if (!bets.has(roomId)) bets.set(roomId, new Map())
  return bets.get(roomId)
}
function playersFor(roomId) {
  if (!playerTeam.has(roomId)) playerTeam.set(roomId, new Map())
  return playerTeam.get(roomId)
}

function syncLockState(room) {
  if (room.state === 'open' && now() >= room.betDeadline) room.state = 'locked'
  if ((room.state === 'open' || room.state === 'locked') && room.resolvedAt == null
    && now() > room.betDeadline + RESOLVE_TIMEOUT_MS) {
    room.state = 'cancelled'
  }
  return room
}

function requireRoom(roomId) {
  const room = rooms.get(Number(roomId))
  if (!room) throw new Error(`Room ${roomId} does not exist`)
  return syncLockState(room)
}

function toPublicRoom(room) {
  // Defensive copy — components must never mutate the store directly.
  return { ...room, team0: [...room.team0], team1: [...room.team1] }
}

function computePayout(room, bet) {
  if (room.state === 'cancelled') return bet.amount
  if (room.state !== 'resolved') return 0
  const winningPool = room.winningTeam === 0 ? room.poolTeam0 : room.poolTeam1
  const losingPool = room.winningTeam === 0 ? room.poolTeam1 : room.poolTeam0
  if (winningPool === 0) return bet.amount // nobody backed the winner — refund everyone, no rake
  if (bet.team !== room.winningTeam) return 0
  const rake = (losingPool * room.rakeBps) / BPS_DENOM
  const netLosingPool = losingPool - rake
  return bet.amount + (netLosingPool * bet.amount) / winningPool
}

export const mockPredictionsClient = assertClientShape({
  async listRooms() {
    await delay()
    return [...rooms.values()].map(syncLockState).map(toPublicRoom).sort((a, b) => b.id - a.id)
  },

  async getRoom(roomId) {
    await delay(120)
    return toPublicRoom(requireRoom(roomId))
  },

  async getMyStatus(roomId, address) {
    await delay(120)
    const room = requireRoom(roomId)
    const team = playersFor(room.id).get(address) ?? null
    const bet = betsFor(room.id).get(address) ?? null
    return { team, bet: bet ? { ...bet } : null }
  },

  async joinTeam(roomId, team, address) {
    await delay()
    const room = requireRoom(roomId)
    if (room.state !== 'open') throw new Error('Room is no longer accepting players')
    if (team !== 0 && team !== 1) throw new Error('Invalid team')
    if (playersFor(room.id).has(address)) throw new Error('Already joined this room')
    const roster = team === 0 ? room.team0 : room.team1
    if (roster.length >= MAX_TEAM_SIZE) throw new Error('Team is full')
    roster.push(address)
    playersFor(room.id).set(address, team)
    return { ok: true }
  },

  async placeBet(roomId, team, amountUsdc, address) {
    await delay()
    const room = requireRoom(roomId)
    if (room.state !== 'open') throw new Error('Betting is closed for this room')
    if (team !== 0 && team !== 1) throw new Error('Invalid team')
    const existing = betsFor(room.id).get(address)
    if (existing && existing.team !== team) throw new Error('Already backing the other team in this room')
    if (!existing && amountUsdc < room.minBet) throw new Error(`Minimum bet is ${room.minBet} USDC`)
    const balance = balances.get(address) ?? 0
    if (balance < amountUsdc) throw new Error('Insufficient USDC balance — deposit first')
    balances.set(address, balance - amountUsdc)

    if (existing) {
      existing.amount += amountUsdc
    } else {
      betsFor(room.id).set(address, { team, amount: amountUsdc, claimed: false })
    }
    if (team === 0) room.poolTeam0 += amountUsdc
    else room.poolTeam1 += amountUsdc
    return { ok: true }
  },

  async previewPayout(roomId, address) {
    await delay(120)
    const room = requireRoom(roomId)
    const bet = betsFor(room.id).get(address)
    if (!bet || bet.claimed) return 0
    return computePayout(room, bet)
  },

  async claim(roomId, address) {
    await delay()
    const room = requireRoom(roomId)
    if (room.state !== 'resolved' && room.state !== 'cancelled') {
      throw new Error('Room is not resolved or cancelled yet')
    }
    const bet = betsFor(room.id).get(address)
    if (!bet) throw new Error('No bet found for this address in this room')
    if (bet.claimed) throw new Error('Already claimed')
    const payout = computePayout(room, bet)
    bet.claimed = true
    balances.set(address, (balances.get(address) ?? 0) + payout)
    return { ok: true, amount: payout }
  },

  async getSupportedDepositChains() {
    await delay(100)
    return [
      { chainId: 'sol',        name: '$SOL',            enabled: true, kind: 'native' },
      { chainId: 'avax',       name: '$AVAX',           enabled: true, kind: 'native' },
      { chainId: 'mon',        name: '$MON',            enabled: true, kind: 'native' },
      { chainId: 'usdc-sol',   name: 'USDC on Sol',     enabled: true, kind: 'token'  },
      { chainId: 'usdc-monad', name: 'USDC on Monad',   enabled: true, kind: 'token'  },
    ]
  },

  async getBalance(address) {
    await delay(100)
    return balances.get(address) ?? 0
  },

  async deposit(chainId, amountUsdc, address) {
    await delay(400) // mock CCTP attestation latency
    if (amountUsdc <= 0) throw new Error('Deposit amount must be positive')
    balances.set(address, (balances.get(address) ?? 0) + amountUsdc)
    return { ok: true }
  },

  // Mock-only helper (not part of the shared interface) so the UI can create
  // rooms for local testing without an admin panel.
  async _devCreateRoom({ teamSize = 3, minutesUntilLock = 30 } = {}) {
    await delay()
    const id = nextRoomId++
    rooms.set(id, {
      id, state: 'open', teamSize, winningTeam: null,
      betDeadline: now() + minutesUntilLock * 60 * 1000, resolvedAt: null,
      minBet: MIN_BET, rakeBps: RAKE_BPS,
      team0: [], team1: [], poolTeam0: 0, poolTeam1: 0,
    })
    return toPublicRoom(rooms.get(id))
  },
})

export { short }
