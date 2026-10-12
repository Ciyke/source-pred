import { useEffect, useState } from 'react'

// EIP-6963 (Multi Injected Provider Discovery). Without this, when multiple
// wallet extensions are installed (MetaMask + Rabby, etc.) window.ethereum
// is ambiguous — it resolves to whichever extension last overwrote it, not
// necessarily the one the user actually wants. Every EIP-6963-compliant
// wallet (MetaMask and Rabby both are) announces itself as a distinct
// provider object in response to this request, so the user can pick.
export function useDiscoveredWallets() {
  const [wallets, setWallets] = useState([]) // [{ info: {uuid,name,icon,rdns}, provider }]

  useEffect(() => {
    function onAnnounce(event) {
      setWallets((prev) => (
        prev.some((w) => w.info.uuid === event.detail.info.uuid)
          ? prev
          : [...prev, event.detail]
      ))
    }
    window.addEventListener('eip6963:announceProvider', onAnnounce)
    window.dispatchEvent(new Event('eip6963:requestProvider'))
    return () => window.removeEventListener('eip6963:announceProvider', onAnnounce)
  }, [])

  return wallets
}
