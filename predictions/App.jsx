import { useState } from 'react'
import { useWallet } from '../shared/useWallet.js'
import PredictionsNavbar from './components/PredictionsNavbar.jsx'
import HeroBanner from './components/HeroBanner.jsx'
import GamingLivestreams from './components/GamingLivestreams.jsx'
import StreamLiveMatchesDrawer from './components/StreamLiveMatchesDrawer.jsx'
import LeaderboardDrawer from './components/LeaderboardDrawer.jsx'
import MobileBottomNav from './components/MobileBottomNav.jsx'
import CreateMarketPanel from './components/CreateMarketPanel.jsx'
import DepositPanel from './components/DepositPanel.jsx'
import RoomList from './components/RoomList.jsx'
import RoomDetail from './components/RoomDetail.jsx'
import OddsChart from './components/OddsChart.jsx'

const CATEGORIES = ['Gaming', 'Tokenized stocks', 'Agents', 'Trade-Options']

const CATEGORY_COPY = {
  'Tokenized stocks': {
    box: 'Tokenized stocks are not live yet',
    body: 'Tokenized stock markets appear here once the first markets open. Creators cannot put their markets in this category.',
  },
  'Agents': {
    box: 'Agents are not live yet',
    body: 'Customized Agents appear here once the first markets open. Creators cannot put their markets in this category.',
  },
  'Trade-Options': {
    box: 'Trade-Options are not live yet',
    body: 'Trade-Options markets appear here once the first markets open. Creators cannot put their markets in this category.',
  },
}

function CategoryPlaceholder({ category }) {
  const copy = CATEGORY_COPY[category]
  if (!copy) return null
  return (
    <div className="category-placeholder">
      <div className="category-placeholder__box">{copy.box}</div>
      <p className="category-placeholder__body">{copy.body}</p>
    </div>
  )
}

export default function App() {
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [showCreateMarket, setShowCreateMarket] = useState(false)
  const [streamDrawerOpen, setStreamDrawerOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Gaming')
  const [selectedGame, setSelectedGame] = useState('Project Zebra: Covert Ops')
  const wallet = useWallet()

  function openCreateMarket(game) {
    if (game?.title) setSelectedGame(game.title)
    setShowCreateMarket(true)
  }

  return (
    <div className="predictions-page">
      <PredictionsNavbar wallet={wallet} />

      <div className="predictions-layout">
        <div className="predictions-layout__desktop-streams">
          <GamingLivestreams onCreateMarket={openCreateMarket} />
        </div>

        <main className="predictions-main">
          {selectedRoomId != null ? (
            <RoomDetail roomId={selectedRoomId} onBack={() => setSelectedRoomId(null)} wallet={wallet} />
          ) : showCreateMarket ? (
            <>
              <button type="button" className="btn btn-outline" onClick={() => setShowCreateMarket(false)} style={{ marginBottom: 16 }}>← Back to markets</button>
              <CreateMarketPanel onCreated={() => setShowCreateMarket(false)} wallet={wallet} selectedGame={selectedGame} />
            </>
          ) : (
            <>
              <button type="button" className="btn btn-primary predictions-main__mobile-create-btn" onClick={() => setStreamDrawerOpen(true)}>Create markets</button>
              <HeroBanner />

              <div className="predictions-layout__mobile-streams">
                <GamingLivestreams onCreateMarket={openCreateMarket} />
              </div>

              <div className="predictions-category-pills">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`predictions-category-pill ${activeCategory === cat ? 'predictions-category-pill--active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {activeCategory === 'Gaming' ? (
                <>
                  <h1 className="predictions-title">Matchroom Predictions</h1>
                  <div className="predictions-top-row">
                    <DepositPanel address={wallet.address} wallet={wallet} />
                    <div className="predictions-chart-slot">
                      <OddsChart />
                    </div>
                  </div>
                  <RoomList onSelect={setSelectedRoomId} />
                </>
              ) : (
                <CategoryPlaceholder category={activeCategory} />
              )}
            </>
          )}
        </main>

        <LeaderboardDrawer />
        <StreamLiveMatchesDrawer
          open={streamDrawerOpen}
          onClose={() => setStreamDrawerOpen(false)}
          onCreateMarket={(g) => { setStreamDrawerOpen(false); openCreateMarket(g) }}
        />
      </div>

      <MobileBottomNav
        onNavigate={(id) => {
          if (id === 'create') setShowCreateMarket(true)
          if (id === 'leaderboard') document.querySelector('.leaderboard-drawer__handle')?.click()
          if (id === 'stream') setStreamDrawerOpen((v) => !v)
          if (id === 'search') document.querySelector('.predictions-navbar__search')?.focus()
        }}
      />
    </div>
  )
}
