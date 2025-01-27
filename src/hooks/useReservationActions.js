import { useState } from 'react'

export function useReservationActions() {
  const [reservation, setReservation] = useState(null)

  const createReservation = async data => {
    await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  }

  const updateReservation = async (id, data) => {
    const response = await fetch(`/api/reservations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const updatedReservation = await response.json()
    setReservation(updatedReservation)
  }

  const deleteReservation = async id => {
    await fetch(`/api/reservations/${id}`, { method: 'DELETE' })
  }

  return { createReservation, updateReservation, deleteReservation, reservation }
}
