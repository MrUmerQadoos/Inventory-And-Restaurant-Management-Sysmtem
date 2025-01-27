'use client'

import { useState } from 'react'
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
import { useReservationActions } from '@/hooks/useReservationActions'

export default function ReservationPage() {
  // Retrieve user details from cookies
  const authUser = {
    name: Cookies.get('userName') || '',
    id: Cookies.get('UserId') || ''
  }

  const [guestName, setGuestName] = useState('')
  const [guestContact, setGuestContact] = useState('')
  const [roomFloor, setRoomFloor] = useState('')
  const [availableRooms, setAvailableRooms] = useState([])
  const [selectedRooms, setSelectedRooms] = useState([]) // Holds room selection with dates and cost

  const [currentRoom, setCurrentRoom] = useState({
    roomId: '',
    checkInDate: null,
    checkOutDate: null,
    nights: 0,
    roomCost: 0
  })
  const [reservationStatus, setReservationStatus] = useState('PENDING')
  const [reservationNote, setReservationNote] = useState('')
  const { createReservation } = useReservationActions()

  // Function to search available rooms based on the selected floor

  // Modify the searchRooms function to use GET
  const searchRooms = async () => {
    if (!currentRoom.checkInDate || !currentRoom.checkOutDate) {
      alert('Please select both check-in and check-out dates.')
      return
    }

    // Ensure checkOutDate is after checkInDate
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

      // Send a GET request with query parameters
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
      setAvailableRooms([]) // Set to empty if there's an error
    }
  }

  // Add current room with dates to the list of selected rooms and reset fields
  const addRoomToList = () => {
    if (!currentRoom.roomId || !currentRoom.checkInDate || !currentRoom.checkOutDate) {
      alert('Please select a room and both check-in and check-out dates')
      return
    }

    // Calculate the nights and cost for the room
    const selectedRoom = availableRooms.find(room => room.id === currentRoom.roomId)
    const nights = Math.ceil((currentRoom.checkOutDate - currentRoom.checkInDate) / (1000 * 60 * 60 * 24))
    const roomCost = nights * selectedRoom.roomPrice

    setSelectedRooms([...selectedRooms, { ...selectedRoom, ...currentRoom, nights, roomCost }])

    // Reset current room fields for a new selection
    setCurrentRoom({
      roomId: '',
      checkInDate: null,
      checkOutDate: null,
      nights: 0,
      roomCost: 0
    })
  }

  // Handle date change for the current room
  const handleDateChange = (date, field) => {
    setCurrentRoom(prev => ({
      ...prev,
      [field]: date
    }))
  }

  // Remove a room from the selected list
  const removeRoom = index => {
    setSelectedRooms(selectedRooms.filter((_, i) => i !== index))
  }

  // Handle reservation creation with multiple rooms
  const handleReservation = async () => {
    if (selectedRooms.length === 0) {
      alert('Please select at least one room with dates')
      return
    }

    await createReservation({
      userId: authUser.id,
      userName: authUser.name,
      guestName,
      guestContact,
      rooms: selectedRooms.map(room => ({
        roomId: room.id,
        checkInDate: room.checkInDate,
        checkOutDate: room.checkOutDate,
        nights: room.nights,
        cost: room.roomCost
      })),
      status: reservationStatus,
      note: reservationNote
    })

    alert('Reservation created successfully')
    // Reset fields after submission
    setGuestName('')
    setGuestContact('')
    setRoomFloor('')
    setAvailableRooms([])
    setSelectedRooms([])
    setReservationStatus('PENDING')
    setReservationNote('')
  }

  const calculateTotalCost = () => selectedRooms.reduce((sum, room) => sum + room.roomCost, 0)

  return (
    <Box p={4} maxWidth='800px' mx='auto' sx={{ boxShadow: 3, borderRadius: 2, backgroundColor: 'background.paper' }}>
      <Typography variant='h4' gutterBottom>
        Create New Reservation
      </Typography>

      <Grid container spacing={2}>
        {/* User Info from Cookies */}
        <Grid item xs={12} sm={6}>
          <TextField label='User Name' variant='outlined' fullWidth value={authUser.name} disabled />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label='User Contact' variant='outlined' fullWidth value={authUser.id} disabled />
        </Grid>

        {/* Guest Information */}
        <Grid item xs={12} sm={6}>
          <TextField
            label='Guest Name'
            variant='outlined'
            fullWidth
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label='Guest Contact Number'
            variant='outlined'
            fullWidth
            value={guestContact}
            onChange={e => setGuestContact(e.target.value)}
            required
          />
        </Grid>

        {/* Room Floor Selection and Search */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant='outlined'>
            <InputLabel>Room Floor</InputLabel>
            <Select value={roomFloor} onChange={e => setRoomFloor(e.target.value)} label='Room Floor' required>
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
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>Check-Out Date</Typography>
          <DatePicker
            selected={currentRoom.checkOutDate}
            onChange={date => handleDateChange(date, 'checkOutDate')}
            dateFormat='yyyy/MM/dd'
            customInput={<TextField fullWidth />}
            required
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
                    <TableCell>{room.roomCost}</TableCell>
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
          <Typography variant='h6'>Total Cost: Pkr : {calculateTotalCost()}</Typography>
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

        {/* Submit Button */}
        <Grid item xs={12}>
          <Button variant='contained' color='primary' fullWidth onClick={handleReservation} sx={{ marginTop: 2 }}>
            Create Reservation
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}
