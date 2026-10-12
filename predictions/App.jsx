import { useState } from 'react'
import { useWallet, ARC_TESTNET_CHAIN, AVALANCHE_FUJI_CHAIN } from '../shared/useWallet.js'
import PredictionsNavbar from './components/PredictionsNavbar.jsx'
import RoomList from './components/RoomList.jsx'
import RoomDetail from './components/RoomDetail.jsx'
import DepositPanel from './components/DepositPanel.jsx'
import ArcTestnetPanel from './components/ArcTestnetPanel.jsx'
import OddsChart from './components/OddsChart.jsx'

export default function App() {
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  // Lifted once here and passed down everywhere — Arc is the only chain with
  // a real contract behind it right now, so it doubles as the page's one wallet
  // connection instead of every component holding its own (which let them drift
  // out of sync with each other).
  // Avalanche Fuji is accepted too — it's the source chain for the CCTP bridge
  // panel, so being on Fuji mid-bridge shouldn't read as "wrong network" app-wide.
  const wallet = useWallet(ARC_TESTNET_CHAIN, [AVALANCHE_FUJI_CHAIN])

  return (
    <div className="predictions-page">
      <PredictionsNavbar wallet={wallet} />
      <main className="predictions-main">
        {selectedRoomId == null ? (
          <>
            <span className="state-badge state-badge--testnet predictions-section-badge">
              Testnet · Arc · Real Txns
            </span>
            <ArcTestnetPanel wallet={wallet} />

            <div className="predictions-section-divider" />

            <span className="state-badge state-badge--demo predictions-section-badge">
              Demo · Simulated, Not Real Funds
            </span>
            <h1 className="predictions-title">Matchroom Predictions</h1>
            <p className="predictions-subtitle">
              Back a team's chances, or join a matchroom yourself. Players in a room can't bet on it.
            </p>
            <div className="predictions-hero">
              <DepositPanel address={wallet.address} />
              <OddsChart />
            </div>
            <RoomList onSelect={setSelectedRoomId} />
          </>
        ) : (
          <RoomDetail roomId={selectedRoomId} onBack={() => setSelectedRoomId(null)} wallet={wallet} />
        )}
      </main>
    </div>
  )
}
