const ITEMS = [
  { id: 'leaderboard', label: 'Leaderboard', icon: '▭' },
  { id: 'search', label: 'Search', icon: '⌕' },
  { id: 'create', label: 'Create', icon: '+' },
  { id: 'analytics', label: 'Analytics', icon: '▅▇' },
  { id: 'stream', label: 'Stream', icon: '⎆' },
]

export default function MobileBottomNav({ onNavigate, active = 'stream' }) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Primary">
      {ITEMS.map((it) => (
        <button
          key={it.id}
          type="button"
          className={`mobile-bottom-nav__item ${active === it.id ? 'mobile-bottom-nav__item--active' : ''}`}
          onClick={() => onNavigate?.(it.id)}
          aria-label={it.label}
        >
          <span className="mobile-bottom-nav__icon" aria-hidden="true">{it.icon}</span>
          <span className="mobile-bottom-nav__label">{it.label}</span>
        </button>
      ))}
    </nav>
  )
}
