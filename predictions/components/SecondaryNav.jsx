export default function SecondaryNav() {
  const items = [
    { label: 'Dashboard', icon: '⌂' },
    { label: 'Profile', icon: '◐' },
    { label: 'Recent Activities', icon: '◷' },
    { label: 'Withdrawals', icon: '⬇' },
    { label: 'Live event', icon: '◎' },
  ]
  return (
    <div className="predictions-secondary-nav">
      {items.map((it) => (
        <span key={it.label} className="predictions-secondary-nav__pill">
          <span className="predictions-secondary-nav__icon">{it.icon}</span>
          {it.label}
        </span>
      ))}
    </div>
  )
}
