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

export default function CheckinList() {
  const [checkIns, setCheckIns] = useState([])
  const router = useRouter()

  useEffect(() => {
    const fetchCheckIns = async () => {
      try {
        const response = await fetch('/api/checkin') // Adjust API endpoint to fetch check-ins
        const data = await response.json()
        setCheckIns(data)
      } catch (error) {
        console.error('Error fetching check-ins:', error)
      }
    }

    fetchCheckIns()
  }, [])

  const handleDelete = async id => {
    const confirmed = confirm('Are you sure you want to delete this check-in?')
    if (!confirmed) return

    const response = await fetch(`/api/checkin/${id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      setCheckIns(prevCheckIns => prevCheckIns.filter(checkIn => checkIn.id !== id))
      alert('Check-in deleted successfully')
    } else {
      alert('Error deleting check-in')
    }
  }

  const handleEdit = id => {
    router.push(`/checkinform/${id}`)
  }

  if (!Array.isArray(checkIns)) {
    return <Typography variant='h6'>No check-ins found.</Typography>
  }

  return (
    <Box p={4} maxWidth='800px' mx='auto'>
      <Typography variant='h4' gutterBottom>
        All Check-Ins
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label='check-in table'>
          <TableHead>
            <TableRow>
              <TableCell>Guest Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Room(s)</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {checkIns.map(checkIn => (
              <TableRow key={checkIn.id}>
                <TableCell>{checkIn.guestName}</TableCell>
                <TableCell>{checkIn.guestContact}</TableCell>
                <TableCell>
                  {/* Display room names separated by commas */}
                  {checkIn.reservationRooms.map(room => room.room.roomName).join(', ')}
                </TableCell>
                <TableCell>{checkIn.paymentMethod}</TableCell>
                <TableCell>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={() => handleEdit(checkIn.id)}
                    style={{ marginRight: 10 }}
                  >
                    Edit
                  </Button>
                  <Button variant='outlined' color='secondary' onClick={() => handleDelete(checkIn.id)}>
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
