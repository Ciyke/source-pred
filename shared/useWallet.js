import { useCallback, useEffect, useRef, useState } from 'react'
import { ethers } from 'ethers'

// Settlement chain is still an open decision for Phase B (Somnia vs Arc — see
// the predictions plan). Somnia is the placeholder default since it's what
// the rest of this repo's contracts already target.
export const SOMNIA_CHAIN = {
  chainIdHex: '0x139F', // 5031
  chainName: 'Somnia Mainnet',
  rpcUrls: ['https://api.infra.mainnet.somnia.network/'],
  nativeCurrency: { name: 'Somnia', symbol: 'SOMI', decimals: 18 },
}

// Arc Testnet (Circle) — USDC is the native gas token here. Confirmed via
// Arc's own wallet_addEthereumChain config: represented at 18 decimals at
// the protocol/wallet level (standard EVM native-balance convention), even
// though USDC as an ERC-20 elsewhere uses 6 — do not conflate the two.
export const ARC_TESTNET_CHAIN = {
  chainIdHex: '0x4CEF52', // 5042002
  chainName: 'Arc Testnet',
  rpcUrls: ['https://rpc.testnet.arc.network'],
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
}

// Avalanche Fuji testnet — the CCTP bridge source chain. USDC here is a
// normal ERC-20 (6 decimals); the chain's native gas token is AVAX, not USDC.
export const AVALANCHE_FUJI_CHAIN = {
  chainIdHex: '0xA869', // 43113
  chainName: 'Avalanche Fuji Testnet',
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
}

/**
 * @param {typeof SOMNIA_CHAIN} primaryChain the network switchNetwork() targets by default,
 *   and what "wrong network" is measured against when no acceptableChains are given
 * @param {Array<typeof SOMNIA_CHAIN>} [acceptableChains] other networks that also count as
 *   "connected" rather than "wrong-network" — e.g. a page that legitimately needs the wallet
 *   on a second chain mid-flow (a cross-chain bridge step) without the rest of the app
 *   treating that as an error state
 */
export function useWallet(primaryChain = SOMNIA_CHAIN, acceptableChains = []) {
  const [address, setAddress] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [status, setStatus] = useState('disconnected') // disconnected | connecting | connected | wrong-network
  const [error, setError] = useState(null)
  // The specific EIP-1193 provider actually in use — may be a particular
  // wallet's own provider from EIP-6963 discovery, not necessarily
  // window.ethereum (ambiguous when multiple extensions are installed).
  const [rawProvider, setRawProvider] = useState(null)
  const providerRef = useRef(null)
  const signerRef = useRef(null)
  const acceptableChainIds = [primaryChain, ...acceptableChains].map((c) => parseInt(c.chainIdHex, 16))
  const isAcceptable = useCallback((id) => acceptableChainIds.includes(id), [acceptableChainIds])

  const refreshNetwork = useCallback(async (provider) => {
    const network = await provider.getNetwork()
    const id = Number(network.chainId)
    setChainId(id)
    return id
  }, [])

  /** @param {object} [injected] a specific EIP-1193 provider (e.g. from EIP-6963); falls back to window.ethereum */
  const connect = useCallback(async (injected) => {
    const target = injected ?? window.ethereum
    if (!target) {
      setError('No wallet detected — install MetaMask, Rabby, or another wallet extension.')
      return
    }
    setStatus('connecting')
    setError(null)
    try {
      const provider = new ethers.BrowserProvider(target)
      const accounts = await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      providerRef.current = provider
      signerRef.current = signer
      setRawProvider(target)
      setAddress(accounts[0])
      const id = await refreshNetwork(provider)
      setStatus(isAcceptable(id) ? 'connected' : 'wrong-network')
    } catch (err) {
      setError(err?.message ?? 'Failed to connect wallet')
      setStatus('disconnected')
    }
  }, [refreshNetwork, isAcceptable])

  /** @param {typeof SOMNIA_CHAIN} [targetChain] defaults to primaryChain */
  const switchNetwork = useCallback(async (targetChain = primaryChain) => {
    const target = rawProvider ?? window.ethereum
    if (!target) return
    try {
      await target.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChain.chainIdHex }],
      })
    } catch (switchErr) {
      // 4902 = chain not added to the wallet yet
      if (switchErr?.code === 4902) {
        await target.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: targetChain.chainIdHex,
            chainName: targetChain.chainName,
            rpcUrls: targetChain.rpcUrls,
            nativeCurrency: targetChain.nativeCurrency,
          }],
        })
      } else {
        setError(switchErr?.message ?? 'Failed to switch network')
      }
    }
  }, [rawProvider, primaryChain])

  const disconnect = useCallback(() => {
    // No injected wallet has a programmatic disconnect — this only clears local state.
    providerRef.current = null
    signerRef.current = null
    setRawProvider(null)
    setAddress(null)
    setChainId(null)
    setStatus('disconnected')
  }, [])

  // Silent reconnect on load (no popup) — only attempted when window.ethereum
  // is unambiguous (a single extension installed). With multiple wallets
  // present, which one the user previously chose can't be inferred safely,
  // so we skip auto-reconnect and let them pick explicitly via the wallet
  // picker instead of silently landing them on the wrong one.
  useEffect(() => {
    if (!window.ethereum || (window.ethereum.providers?.length ?? 0) > 1) return
    let cancelled = false
    ;(async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send('eth_accounts', [])
        if (cancelled || accounts.length === 0) return
        const signer = await provider.getSigner()
        providerRef.current = provider
        signerRef.current = signer
        setRawProvider(window.ethereum)
        setAddress(accounts[0])
        const id = await refreshNetwork(provider)
        setStatus(isAcceptable(id) ? 'connected' : 'wrong-network')
      } catch {
        // Silent by design — user just hasn't connected yet.
      }
    })()
    return () => { cancelled = true }
  }, [refreshNetwork, isAcceptable])

  // React to account/network changes made outside the app, on whichever
  // provider is actually connected (not necessarily window.ethereum).
  useEffect(() => {
    if (!rawProvider) return
    const onAccountsChanged = (accounts) => {
      if (accounts.length === 0) disconnect()
      else setAddress(accounts[0])
    }
    const onChainChanged = (hexChainId) => {
      const id = parseInt(hexChainId, 16)
      setChainId(id)
      setStatus(isAcceptable(id) ? 'connected' : 'wrong-network')
    }
    rawProvider.on?.('accountsChanged', onAccountsChanged)
    rawProvider.on?.('chainChanged', onChainChanged)
    return () => {
      rawProvider.removeListener?.('accountsChanged', onAccountsChanged)
      rawProvider.removeListener?.('chainChanged', onChainChanged)
    }
  }, [rawProvider, disconnect, isAcceptable])

  return {
    address,
    chainId,
    status,
    error,
    connect,
    disconnect,
    switchNetwork,
    isWrongNetwork: status === 'wrong-network',
    getSigner: () => signerRef.current,
    getProvider: () => providerRef.current,
  }
}
