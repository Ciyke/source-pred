import './Community.css'
import CommunityGallery from './CommunityGallery'

export default function Community() {
  return (
    <section id="community" className="community">
      <div className="community__orb community__orb--left" />
      <div className="community__orb community__orb--right" />

      <div className="community__container">
        <h2 className="section-title">Join The Community</h2>
        <p className="section-subtitle">
          Join the community in multiple gaming quests, leaderboard-based campaigns and incentivised challenges as we continue to pioneer gaming in the ecosystem.
        </p>

        <div className="community__counters">
          <div className="glass-card community__counter">
            <span className="community__counter-num community__counter-num--cyan">28,500</span>
            <span className="community__counter-label">Boxes Opened/Closed</span>
          </div>
          <div className="glass-card community__counter">
            <span className="community__counter-num community__counter-num--purple">570</span>
            <span className="community__counter-label">Potions Minted</span>
          </div>
          <div className="glass-card community__counter">
            <span className="community__counter-num community__counter-num--green">28K</span>
            <span className="community__counter-label">Transactions Onchain</span>
          </div>
          <div className="glass-card community__counter">
            <span className="community__counter-num community__counter-num--pink">532</span>
            <span className="community__counter-label">Total Participations</span>
          </div>
        </div>

        <CommunityGallery />

        <div className="community__ctas">
          <a href="https://discord.gg/VQrsJJZvXw" target="_blank" rel="noopener noreferrer" className="btn btn-discord community__btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.014.043.03.056a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Join Discord
          </a>
          <a href="https://x.com/PlayRumble_" target="_blank" rel="noopener noreferrer" className="btn btn-twitter community__btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Follow Us On X
          </a>
          <a href="#" className="btn btn-outline community__btn">
            <span>◈</span> Mint Now
          </a>
        </div>
      </div>
    </section>
  )
}
