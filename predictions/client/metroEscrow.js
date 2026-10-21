import { ethers } from 'ethers'

// MetroEscrow + MetroVerifier addresses (deployed by scripts/deploy-metro-*.ts)
export const METRO_CONTRACTS = {
  avalanche: {
    chainId: 43114,
    chainName: 'Avalanche',
    escrow: '0x61f0e653F43Bd722A61451B3ecD999e2F39b1629',
    verifier: '0x307eCE8cC1F48404273cE05B006493257e6e38CF',
    explorer: 'https://snowtrace.io/address/',
  },
  monad: {
    chainId: 143,
    chainName: 'Monad',
    escrow: '0xb7e1406f3dF1A5C73d09450cfCa8b4EF4440942b',
    verifier: '0xfbbB96A05Ad494e229E60e70829eB20042eb2a83',
    explorer: 'https://monadscan.com/address/',
  },
}

export const GAME_IDS = {
  'Project Zebra: Covert Ops': 1,
  'Off the Grid': 2,
  'Call of Duty: Mobile': 3,
  'Claws and Cannons': 4,
  'Project Override': 5,
  'PUBG Mobile': 6,
  'Fortnite': 7,
}

export const ESCROW_ABI = [
  'function deposit() payable',
  'function withdraw(uint256 amount)',
  'function balanceOf(address user) view returns (uint256)',
  'function createMarket(string name, uint8 gameId, bytes32 imageHash, bytes32 kickLinkHash, bytes32 oddsHash) returns (uint256)',
  'function placeBet(uint256 marketId, uint8 team, uint256 amount)',
  'function getMarket(uint256 marketId) view returns (tuple(address creator, uint8 gameId, string name, uint8 state, uint64 createdAt, uint256 poolA, uint256 poolB, uint8 winningTeam, bytes32 imageHash, bytes32 kickLinkHash, bytes32 oddsHash))',
  'function getMarketCount() view returns (uint256)',
  'function getBet(uint256 marketId, address user) view returns (tuple(uint256 amountA, uint256 amountB, bool claimed))',
  'function claim(uint256 marketId)',
  'function previewPayout(uint256 marketId, address user) view returns (uint256)',
  'function verifierOf(uint8 gameId) view returns (address)',
  'event MarketCreated(uint256 indexed marketId, address indexed creator, uint8 gameId, string name)',
  'event BetPlaced(uint256 indexed marketId, address indexed user, uint8 team, uint256 amount)',
  'event Resolved(uint256 indexed marketId, uint8 winningTeam)',
  'event Claimed(uint256 indexed marketId, address indexed user, uint256 payout)',
]

export const VERIFIER_ABI = [
  'function verifyImage(uint8 gameId, bytes32 imageHash, uint8 stage, uint256 marketId) returns (bool)',
  'function marketStageHash(uint256 marketId, uint8 stage) view returns (bytes32)',
  'function isImageUsed(bytes32 imageHash) view returns (bool)',
]

/** keccak256 of the image bytes — what gets stored on-chain */
export async function hashFile(file) {
  const buf = await file.arrayBuffer()
  const bytes = new Uint8Array(buf)
  return ethers.keccak256(bytes)
}

/** keccak256 of a string (used for the Kick link) */
export function hashString(str) {
  return ethers.keccak256(ethers.toUtf8Bytes(str))
}

export function contractFor(chainId) {
  return Object.values(METRO_CONTRACTS).find((c) => c.chainId === chainId) || null
}
