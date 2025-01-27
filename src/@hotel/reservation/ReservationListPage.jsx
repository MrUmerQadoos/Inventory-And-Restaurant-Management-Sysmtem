'use client'

import { useEffect, useState } from 'react'
import {
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import { useRouter } from 'next/navigation'

export default function ReservationListPage() {
  const [reservations, setReservations] = useState([])
  const router = useRouter()

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('/api/reservations')
        const data = await response.json()
        setReservations(data)
      } catch (error) {
        console.error('Error fetching reservations:', error)
      }
    }

    fetchReservations()
  }, [])

  const handleDelete = async id => {
    const confirmed = confirm('Are you sure you want to delete this reservation?')
    if (!confirmed) return

    const response = await fetch(`/api/reservations/${id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      setReservations(prevReservations => prevReservations.filter(res => res.id !== id))
      alert('Reservation deleted successfully')
    } else {
      alert('Error deleting reservation')
    }
  }

  const handleEdit = id => {
    router.push(`/reservation/${id}`)
  }

  if (!Array.isArray(reservations)) {
    return <Typography variant='h6'>No reservations found.</Typography>
  }

  return (
    <Box p={4} maxWidth='800px' mx='auto'>
      <Typography variant='h4' gutterBottom>
        All Reservations
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label='reservation table'>
          <TableHead>
            <TableRow>
              <TableCell>Guest Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map(res => (
              <TableRow key={res.id}>
                <TableCell>{res.guestName}</TableCell>
                <TableCell>{res.guestContact}</TableCell>
                {/* Access room data inside reservationRooms */}
                <TableCell>
                  {res.reservationRooms.map(room => (
                    <span key={room.room.id}>{room.room.roomName}</span>
                  ))}
                </TableCell>
                <TableCell>{res.status}</TableCell>
                <TableCell>
                  <Button variant='contained' color='primary' onClick={() => handleEdit(res.id)}>
                    Edit
                  </Button>
                  <Button
                    variant='outlined'
                    color='secondary'
                    onClick={() => handleDelete(res.id)}
                    style={{ marginLeft: 10 }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
