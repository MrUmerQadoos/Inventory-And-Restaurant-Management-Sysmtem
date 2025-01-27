'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useRouter } from 'next/navigation'

export default function EditReservationPage({ reservationId }) {
  // Retrieve user details from cookies
  const authUser = {
    name: Cookies.get('userName') || '',
    id: Cookies.get('UserId') || ''
  }

  const [guestName, setGuestName] = useState('')
  const [guestContact, setGuestContact] = useState('')
  const [roomFloor, setRoomFloor] = useState('')
  const [availableRooms, setAvailableRooms] = useState([])
  const [selectedRooms, setSelectedRooms] = useState([]) // Holds the rooms with their respective check-in and check-out dates
  const [reservationStatus, setReservationStatus] = useState('PENDING')
  const [reservationNote, setReservationNote] = useState('')
  const router = useRouter()

  const [currentRoom, setCurrentRoom] = useState({
    roomId: '',
    checkInDate: null,
    checkOutDate: null,
    nights: 0,
    roomCost: 0
  })

  // Fetch reservation data when the page loads
  useEffect(() => {
    const fetchReservation = async () => {
      const response = await fetch(`/api/reservations/${reservationId}`)
      const data = await response.json()

      // Populate the form with existing reservation data
      setGuestName(data.guestName)
      setGuestContact(data.guestContact)
      setSelectedRooms(
        data.reservationRooms.map(room => ({
          ...room,
          roomName: room.room.roomName,
          roomType: room.room.roomType,
          roomView: room.room.roomView,
          roomPrice: room.room.roomPrice,

          checkInDate: new Date(room.checkInDate),
          checkOutDate: new Date(room.checkOutDate)
        }))
      )
      setReservationStatus(data.status)
      setReservationNote(data.note)
    }

    fetchReservation()
  }, [reservationId])

  // Search available rooms based on the selected floor
  const searchRooms = async () => {
    if (!currentRoom.checkInDate || !currentRoom.checkOutDate) {
      alert('Please select both check-in and check-out dates.')
      return
    }

    if (currentRoom.checkInDate >= currentRoom.checkOutDate) {
      alert('Check-out date must be after check-in date.')
      return
    }

    try {
      const params = new URLSearchParams({
        floor: roomFloor,
        checkInDate: currentRoom.checkInDate.toISOString(),
        checkOutDate: currentRoom.checkOutDate.toISOString()
      })

      const response = await fetch(`/api/rooms/available?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      setAvailableRooms(data.rooms || [])

      if (data.rooms.length === 0) {
        alert('No rooms available in the selected time slot.')
      }
    } catch (error) {
      console.error('Error fetching available rooms:', error)
      setAvailableRooms([])
    }
  }

  // Add selected room to the list
  const addRoomToList = () => {
    if (!currentRoom.roomId || !currentRoom.checkInDate || !currentRoom.checkOutDate) {
      alert('Please select a room and both check-in and check-out dates')
      return
    }

    const selectedRoom = availableRooms.find(room => room.id === currentRoom.roomId)
    const nights = Math.ceil((currentRoom.checkOutDate - currentRoom.checkInDate) / (1000 * 60 * 60 * 24))
    const roomCost = nights * (selectedRoom.roomPrice || 0) // Ensure roomPrice is used and default to 0 if undefined

    setSelectedRooms(prevRooms => [
      ...prevRooms,
      {
        ...selectedRoom,
        ...currentRoom,
        nights,
        roomCost,
        cost: roomCost // Add this line to ensure 'cost' is set
      }
    ])

    setCurrentRoom({
      roomId: '',
      checkInDate: null,
      checkOutDate: null,
      nights: 0,
      roomCost: 0
    })
  }

  // Handle date changes for the current room
  const handleDateChange = (date, field) => {
    setCurrentRoom(prev => ({
      ...prev,
      [field]: date
    }))
  }

  // Remove room from the selected list
  // Function to remove room from selectedRooms and the database
  const removeRoom = async index => {
    const roomToRemove = selectedRooms[index]

    try {
      // Make an API call to delete the room using roomId
      const response = await fetch(`/api/checkin/${reservationId}/remove-room`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomToRemove.roomId }) // Send the roomId in the payload
      })

      const result = await response.json()

      if (response.ok) {
        // Remove the room from the state only if the API call was successful
        setSelectedRooms(selectedRooms.filter((_, i) => i !== index))
        alert('Room removed successfully')
      } else {
        alert(result.error || 'Error removing room')
      }
    } catch (error) {
      console.error('Error removing room:', error)
      alert('Failed to remove room. Please try again.')
    }
  }

  // Handle reservation update
  const handleUpdate = async () => {
    if (selectedRooms.length === 0) {
      alert('Please select at least one room with dates')
      return
    }

    const updatedRooms = selectedRooms.map(room => ({
      roomId: room.roomId,
      checkInDate: room.checkInDate,
      checkOutDate: room.checkOutDate,
      nights: room.nights,
      cost: room.cost || room.nights * room.roomPrice // Calculate if undefined
    }))

    const response = await fetch(`/api/reservations/${reservationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestName,
        guestContact,
        rooms: updatedRooms,
        status: reservationStatus,
        note: reservationNote
      })
    })

    if (response.ok) {
      alert('Reservation updated successfully')
      router.push('/reservation')
    } else {
      alert('Error updating reservation')
    }
  }

  const calculateTotalCost = () => {
    return selectedRooms.reduce((sum, room) => sum + (room.cost || room.roomCost || 0), 0) // Ensure cost calculation works even if one field is undefined
  }

  return (
    <Box p={4} maxWidth='800px' mx='auto' sx={{ boxShadow: 3, borderRadius: 2, backgroundColor: 'background.paper' }}>
      <Typography variant='h4' gutterBottom>
        Edit Reservation
      </Typography>

      <Grid container spacing={2}>
        {/* Guest Information */}
        <Grid item xs={12} sm={6}>
          <TextField
            label='Guest Name'
            variant='outlined'
            fullWidth
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label='Guest Contact Number'
            variant='outlined'
            fullWidth
            value={guestContact}
            onChange={e => setGuestContact(e.target.value)}
          />
        </Grid>

        {/* Room Floor Selection and Search */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant='outlined'>
            <InputLabel>Room Floor</InputLabel>
            <Select value={roomFloor} onChange={e => setRoomFloor(e.target.value)} label='Room Floor'>
              <MenuItem value='TOP_FLOOR'>Top Floor</MenuItem>
              <MenuItem value='SECOND_FLOOR'>Second Floor</MenuItem>
              <MenuItem value='THIRD_FLOOR'>Third Floor</MenuItem>
              <MenuItem value='FOURTH_FLOOR'>Fourth Floor</MenuItem>
              <MenuItem value='GROUND_FLOOR'>Ground Floor</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Check-in and Check-out Dates */}
        <Grid item xs={12} sm={6}>
          <Typography>Check-In Date</Typography>
          <DatePicker
            selected={currentRoom.checkInDate}
            onChange={date => handleDateChange(date, 'checkInDate')}
            dateFormat='yyyy/MM/dd'
            customInput={<TextField fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>Check-Out Date</Typography>
          <DatePicker
            selected={currentRoom.checkOutDate}
            onChange={date => handleDateChange(date, 'checkOutDate')}
            dateFormat='yyyy/MM/dd'
            customInput={<TextField fullWidth />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Button variant='contained' color='primary' fullWidth onClick={searchRooms} sx={{ height: '100%' }}>
            Search Rooms
          </Button>
        </Grid>

        {/* Select Room after Search */}
        {availableRooms.length > 0 && (
          <Grid item xs={12}>
            <FormControl fullWidth variant='outlined' sx={{ marginTop: 2 }}>
              <InputLabel>Select Room</InputLabel>
              <Select
                value={currentRoom.roomId}
                onChange={e => setCurrentRoom(prev => ({ ...prev, roomId: e.target.value }))}
              >
                {availableRooms.map(room => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.roomName} - {room.roomType}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid item xs={12} sm={6}>
          <Button variant='contained' color='secondary' fullWidth onClick={addRoomToList} sx={{ marginTop: 2 }}>
            Add Room
          </Button>
        </Grid>

        {/* Selected Rooms Table */}
        <Grid item xs={12}>
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Room Name</TableCell>
                  <TableCell>Room Type</TableCell>
                  <TableCell>Room View</TableCell>
                  <TableCell>Room Price</TableCell>
                  <TableCell>Check-In Date</TableCell>
                  <TableCell>Check-Out Date</TableCell>
                  <TableCell>Nights</TableCell>
                  <TableCell>Total Cost</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedRooms.map((room, index) => (
                  <TableRow key={index}>
                    <TableCell>{room.roomName}</TableCell>
                    <TableCell>{room.roomType}</TableCell>
                    <TableCell>{room.roomView}</TableCell>
                    <TableCell>{room.roomPrice}</TableCell>
                    <TableCell>{room.checkInDate?.toLocaleDateString()}</TableCell>
                    <TableCell>{room.checkOutDate?.toLocaleDateString()}</TableCell>
                    <TableCell>{room.nights}</TableCell>
                    <TableCell>{room.cost || room.roomCost}</TableCell> {/* Ensure 'cost' is displayed */}
                    <TableCell>
                      <Button color='secondary' onClick={() => removeRoom(index)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12}>
          <Typography variant='h6'>
            Total Cost: Pkr {calculateTotalCost().toFixed(2)} {/* Ensure it shows up as a formatted number */}
          </Typography>
        </Grid>

        {/* Reservation Status */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant='outlined'>
            <InputLabel>Reservation Status</InputLabel>
            <Select
              value={reservationStatus}
              onChange={e => setReservationStatus(e.target.value)}
              label='Reservation Status'
            >
              <MenuItem value='PENDING'>Pending</MenuItem>
              <MenuItem value='CONFIRMED'>Confirmed</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Reservation Note */}
        <Grid item xs={12}>
          <TextField
            label='Reservation Note'
            variant='outlined'
            fullWidth
            multiline
            rows={3}
            value={reservationNote}
            onChange={e => setReservationNote(e.target.value)}
            sx={{ marginTop: 2 }}
          />
        </Grid>

        {/* Update Button */}
        <Grid item xs={12}>
          <Button variant='contained' color='primary' fullWidth onClick={handleUpdate} sx={{ marginTop: 2 }}>
            Update Reservation
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}
