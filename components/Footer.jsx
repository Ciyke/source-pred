import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__glow" />
      <div className="footer__container">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__logo">
              <img src="/Bera - Logo-7.png" alt="PlayRumble" className="footer__logo-img" />
              <span className="footer__logo-text">PlayRumble</span>
            </div>
            <p className="footer__tagline">
              Positioned at the intersection of Agentic Multiplayer Gaming and AI resolving Prediction/asset markets.
            </p>
            <div className="footer__socials">
              <a href="https://discord.gg/VQrsJJZvXw" target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="Discord">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.014.043.03.056a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
              </a>
              <a href="https://x.com/PlayRumble_" target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="Twitter/X">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer__links">
            <div className="footer__col">
              <h4>Game</h4>
              <a href="https://playrumble.itch.io/bera-rumble" target="_blank" rel="noopener noreferrer">Play Now</a>
              <a href="https://master.play-rumble-hunt.pages.dev/hunt" target="_blank" rel="noopener noreferrer">Treasure Hunt</a>
              <a href="https://bets.playrumble.xyz/bet" target="_blank" rel="noopener noreferrer">Predictions</a>
              <a href="#features">Tournaments</a>
              <div className="footer__marketplace-wrap">
                <a href="https://play-rumble.vercel.app/" target="_blank" rel="noopener noreferrer">Marketplace</a>
                <span className="footer__beta-badge">Currently in Beta</span>
              </div>
            </div>
            <div className="footer__col">
              <h4>NFTs</h4>
              <a href="#">Mint</a>
              <a href="https://opensea.io/collection/rumble-genesis-1" target="_blank" rel="noopener noreferrer">Genesis Collection</a>
            </div>
            <div className="footer__col">
              <h4>Community</h4>
              <a href="https://discord.gg/VQrsJJZvXw" target="_blank" rel="noopener noreferrer">Discord</a>
              <a href="https://x.com/PlayRumble_" target="_blank" rel="noopener noreferrer">Twitter / X</a>
              <a href="https://playrumble.gitbook.io/playrumble" target="_blank" rel="noopener noreferrer">Whitepaper</a>
              <a href="https://discord.gg/n4rBWmFcQ" target="_blank" rel="noopener noreferrer">Help Center</a>
            </div>
            <div className="footer__col">
              <h4>Legal</h4>
              <a href="/terms-and-conditions/">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__divider" />
          <div className="footer__bottom-inner">
            <span>© 2026 PlayRumble. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
