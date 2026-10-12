import { ethers } from 'ethers'

const ABI = [
  'function deposit() external payable',
  'function predict(uint8 team) external',
  'function withdraw(uint256 amount) external',
  'function balanceOf(address) view returns (uint256)',
  'function predictedTeam(address) view returns (uint8)',
  'function hasPredicted(address) view returns (bool)',
]

const ADDRESS = import.meta.env.VITE_TEST_MARKET_ADDRESS

function contract(signerOrProvider) {
  if (!ADDRESS) {
    throw new Error('VITE_TEST_MARKET_ADDRESS is not set — deploy TestMarket first (npm run deploy:test-market)')
  }
  return new ethers.Contract(ADDRESS, ABI, signerOrProvider)
}

export const isConfigured = () => Boolean(ADDRESS)

// Arc's native USDC is represented at 18 decimals at the protocol/wallet
// level (confirmed via Arc's wallet_addEthereumChain config), NOT the 6
// decimals real USDC uses as an ERC-20 elsewhere — parseEther/formatEther
// (18-decimal helpers) are correct here, despite the "USDC" label.

export async function deposit(signer, amountUsdc) {
  const tx = await contract(signer).deposit({ value: ethers.parseEther(String(amountUsdc)) })
  return tx.wait()
}

export async function predict(signer, team) {
  const tx = await contract(signer).predict(team)
  return tx.wait()
}

export async function withdraw(signer, amountUsdc) {
  const tx = await contract(signer).withdraw(ethers.parseEther(String(amountUsdc)))
  return tx.wait()
}

export async function getBalance(providerOrSigner, address) {
  const bal = await contract(providerOrSigner).balanceOf(address)
  return Number(ethers.formatEther(bal))
}

export async function getMyPrediction(providerOrSigner, address) {
  const c = contract(providerOrSigner)
  const has = await c.hasPredicted(address)
  if (!has) return null
  return Number(await c.predictedTeam(address))
}
