import { useState, useEffect } from 'react'

export function useFetchReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('/api/reservations')
        const data = await response.json()
        setReservations(data)
      } catch (error) {
        setError('Failed to load reservations')
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [])

  return { reservations, loading, error }
}
