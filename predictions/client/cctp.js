import { ethers } from 'ethers'

// Circle CCTP V2 — TokenMessengerV2 and MessageTransmitterV2 are deployed at
// the same address on every supported EVM chain (CREATE2), confirmed against
// Circle's and Arc's own docs for Ethereum Sepolia / Avalanche Fuji / Arc Testnet.
export const TOKEN_MESSENGER = '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA'
export const MESSAGE_TRANSMITTER = '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275'

export const AVALANCHE_FUJI_DOMAIN = 1
export const ARC_DOMAIN = 26

// Fuji testnet USDC (ERC-20, 6 decimals) — get some from faucet.circle.com.
export const FUJI_USDC = '0x5425890298aed601595a70AB815c96711a31Bc65'

const IRIS_API_BASE = 'https://iris-api-sandbox.circle.com'

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
]

const TOKEN_MESSENGER_ABI = [
  'function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken, bytes32 destinationCaller, uint256 maxFee, uint32 minFinalityThreshold) external returns (uint64)',
]

const MESSAGE_TRANSMITTER_ABI = [
  'function receiveMessage(bytes message, bytes attestation) external returns (bool)',
]

export async function getFujiUsdcBalance(providerOrSigner, address) {
  const usdc = new ethers.Contract(FUJI_USDC, ERC20_ABI, providerOrSigner)
  const bal = await usdc.balanceOf(address)
  return Number(ethers.formatUnits(bal, 6))
}

export async function getAllowance(providerOrSigner, owner) {
  const usdc = new ethers.Contract(FUJI_USDC, ERC20_ABI, providerOrSigner)
  const allowance = await usdc.allowance(owner, TOKEN_MESSENGER)
  return Number(ethers.formatUnits(allowance, 6))
}

export async function approveUsdc(signer, amountUsdc) {
  const usdc = new ethers.Contract(FUJI_USDC, ERC20_ABI, signer)
  const tx = await usdc.approve(TOKEN_MESSENGER, ethers.parseUnits(String(amountUsdc), 6))
  return tx.wait()
}

/** Burns USDC on Fuji via TokenMessengerV2. Standard Transfer (no relayer fee,
 * waits for Fuji's own — fast — hard finality) rather than Fast Transfer, so
 * there's no dynamic fee-quote lookup needed. */
export async function depositForBurn(signer, amountUsdc, mintRecipientAddress) {
  const tokenMessenger = new ethers.Contract(TOKEN_MESSENGER, TOKEN_MESSENGER_ABI, signer)
  const tx = await tokenMessenger.depositForBurn(
    ethers.parseUnits(String(amountUsdc), 6),
    ARC_DOMAIN,
    ethers.zeroPadValue(mintRecipientAddress, 32),
    FUJI_USDC,
    ethers.ZeroHash, // destinationCaller — zero means anyone can call receiveMessage
    0n, // maxFee — 0 for Standard Transfer
    2000, // minFinalityThreshold — >=2000 selects Standard (full finality) Transfer
  )
  const receipt = await tx.wait()
  return receipt.hash
}

/** Polls Circle's sandbox attestation API for a burn tx on Fuji until the
 * attestation is ready. Resolves { message, attestation }. */
export async function pollAttestation(burnTxHash, { intervalMs = 5000, timeoutMs = 20 * 60 * 1000, onTick } = {}) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    const res = await fetch(
      `${IRIS_API_BASE}/v2/messages/${AVALANCHE_FUJI_DOMAIN}?transactionHash=${burnTxHash}`,
    )
    if (res.ok) {
      const data = await res.json()
      const msg = data.messages?.[0]
      onTick?.(msg?.status ?? 'pending', Date.now() - startedAt)
      if (msg?.status === 'complete' && msg.attestation) {
        return { message: msg.message, attestation: msg.attestation }
      }
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  throw new Error('Timed out waiting for Circle attestation')
}

/** Completes the bridge on Arc — mints native USDC to the recipient encoded
 * in the message. `signer` must be connected to Arc Testnet. */
export async function receiveOnArc(signer, message, attestation) {
  const messageTransmitter = new ethers.Contract(MESSAGE_TRANSMITTER, MESSAGE_TRANSMITTER_ABI, signer)
  const tx = await messageTransmitter.receiveMessage(message, attestation)
  return tx.wait()
}
