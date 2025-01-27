import { useState } from 'react'

export function useCheckAvailability() {
  const [availability, setAvailability] = useState(null)

  const checkAvailability = async (roomId, checkInDate, checkOutDate) => {
    const response = await fetch('/api/rooms/available', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, checkInDate, checkOutDate })
    })
    const data = await response.json()
    setAvailability(data.available)
  }

  return { availability, checkAvailability }
}
