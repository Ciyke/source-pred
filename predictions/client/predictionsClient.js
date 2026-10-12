// Shape every predictions data client must implement — first the in-memory
// mock (Phase A), later a real ethers.js client talking to PredictionArena
// (Phase B). Components only ever call through this shape, never a specific
// implementation directly, so swapping mock -> real is a one-line config
// change instead of a rewrite.
//
// Room  = { id, state: 'open'|'locked'|'resolved'|'cancelled', teamSize,
//           team0: string[], team1: string[], winningTeam: 0|1|null,
//           betDeadline: number (ms epoch), minBet: number (USDC),
//           rakeBps: number, poolTeam0: number, poolTeam1: number }
// Bet   = { team: 0|1, amount: number (USDC), claimed: boolean }
// Chain = { chainId: number|string, name: string, enabled: boolean }

const REQUIRED_METHODS = [
  'listRooms',
  'getRoom',
  'getMyStatus',
  'joinTeam',
  'placeBet',
  'claim',
  'previewPayout',
  'getSupportedDepositChains',
  'getBalance',
  'deposit',
]

/** Throws if `client` is missing any method the UI depends on — catches a
 * half-finished client implementation (e.g. web3PredictionsClient during
 * Phase B) at import time instead of as a runtime crash deep in a component. */
export function assertClientShape(client) {
  const missing = REQUIRED_METHODS.filter((m) => typeof client[m] !== 'function')
  if (missing.length > 0) {
    throw new Error(`predictionsClient is missing required method(s): ${missing.join(', ')}`)
  }
  return client
}
