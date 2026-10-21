import GamingLivestreams from './GamingLivestreams.jsx'

export default function StreamLiveMatchesDrawer({ open, onClose, onCreateMarket }) {
  return (
    <>
      <div className={`stream-drawer ${open ? 'stream-drawer--open' : ''}`} aria-hidden={!open}>
        <div className="stream-drawer__header">
          <h3>Stream Live Matches</h3>
          <button type="button" className="stream-drawer__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="stream-drawer__body">
          <GamingLivestreams onCreateMarket={onCreateMarket} />
        </div>
      </div>
      {open && <button type="button" className="stream-drawer__backdrop" onClick={onClose} aria-label="Close" />}
    </>
  )
}
