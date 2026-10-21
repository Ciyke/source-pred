import { useEffect, useState } from 'react'
import { predictionsClient } from '../client/index.js'
import RoomCard from './RoomCard.jsx'

export default function RoomList({ onSelect }) {
  const [rooms, setRooms] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = () => {
      predictionsClient.listRooms()
        .then((r) => { if (!cancelled) setRooms(r) })
        .catch((err) => { if (!cancelled) setError(err.message) })
    }
    load()
    const interval = setInterval(load, 15 * 1000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  if (error) return <div className="empty-state">Failed to load rooms: {error}</div>
  if (!rooms) return <div className="empty-state">Loading matchrooms…</div>
  if (rooms.length === 0) return <div className="empty-state">No matchrooms yet — check back soon.</div>

  return (
    <div className="room-rows">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onSelect={onSelect} />
      ))}
    </div>
  )
}
