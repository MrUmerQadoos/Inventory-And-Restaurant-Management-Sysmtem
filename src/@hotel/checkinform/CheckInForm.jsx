'use client'

import React, { useState, useEffect } from 'react'
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

// import { Table } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const CheckInForm = () => {
  const [isReservation, setIsReservation] = useState(false)
  const [reservationData, setReservationData] = useState(null)
  const [checkInType, setCheckInType] = useState('walkin')
  const [reservations, setReservations] = useState([])
  const [selectedReservationId, setSelectedReservationId] = useState(null)
  const [roomFloor, setRoomFloor] = useState('')
  const [availableRooms, setAvailableRooms] = useState([])
  const [guestName, setGuestName] = useState('')
  const [guestContact, setGuestContact] = useState('')
  const [selectedRooms, setSelectedRooms] = useState([])
  const [amountPaid, setAmountPaid] = useState(0)

  const [currentRoom, setCurrentRoom] = useState({
    roomId: '',
    checkInDate: null,
    checkOutDate: null,
    nights: 0,
    roomCost: 0
  })

  const [formData, setFormData] = useState({
    guestName: '',
    guestContact: '',
    email: '',
    cnic: '',
    paymentMethod: '',
    children: '',
    guests: '',
    address: '',
    city: '',
    notes: `1. Check-in time is at 1400 hrs.
2. Please note Check-out time is at 12:00 noon.
3. Our breakfast is complimentary in Restaurant at 08:30am to 11:30am.
4. Our checkout time is 1200 hrs. 50% of room rent will be charged in case of late checkout
   between 1200 hrs to 1800 hrs. After 1800 hrs, full night will be charged.
5. Guest will be responsible for any damage done in the room.
6. Hotel prohibits all food supplies from outside caterers as well as cooking in Hotel room.
7. The management reserves all rights of admission.
8. Hotel Management holds no responsibility of any loss of valuables & currency left in the
   room.
9. Kindly deposit Room Key at the Front Desk while leaving hotel.
10. A valid CNIC or Passport copy is must upon check-ins for all staying adult guests.
11. Guest with confirmed booking if leave earlier will be charged full length of room booking.`,

    country: '',
    company: ''
  })

  // Retrieve user details from cookies
  const authUser = {
    name: Cookies.get('userName') || '',
    id: Cookies.get('UserId') || ''
  }

  useEffect(() => {
    if (checkInType === 'reservation') {
      const fetchReservations = async () => {
        try {
          const response = await fetch('/api/reservations') // API endpoint to fetch reservations
          const data = await response.json()
          setReservations(data) // Assuming 'data' contains an array of reservations
        } catch (error) {
          console.error('Error fetching reservations:', error)
          setReservations([]) // Handle errors by setting to an empty array
        }
      }
      fetchReservations()
    }
  }, [checkInType])

  const handlePrintRegistrationCard = data => {
    const logoUrl = 'https://pub-2f5b50a81b7a40358799d6e7c3b2f968.r2.dev/3m1saj2fe.png'

    const printWindow = window.open('', '', 'width=800,height=1000')
    printWindow.document.write(`
      <html>
        <head>
          <title>Registration Card</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              margin: 0;
              padding: 0;
            }
            h1 {
              text-align: center;
              font-size: 18px;
              margin: 5px 0;
            }
            .logo {
              text-align: center;
              margin: 10px 0;
            }
            .registration-card {
              width: 95%;
              margin: auto;
              padding: 15px;
              border: 1px solid #000;
              border-radius: 8px;
              box-sizing: border-box;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #000;
              padding: 5px;
              font-size: 12px;
              text-align: left;
              word-wrap: break-word;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .footer-notes {
              font-size: 11px;
              margin-top: 15px;
              text-align: justify;
            }
            .signature-section {
              display: flex;
              justify-content: space-between;
              margin-top: 30px;
            }
            .signature {
              text-align: center;
              width: 30%;
              border-top: 1px solid #000;
              padding-top: 5px;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="registration-card">
            <div class="logo">
              <img src="${logoUrl}" alt="Company Logo" style="width: 80px; height: auto; display: block; margin: 0 auto;" />
            </div>
            <h1>REGISTRATION CARD</h1>
            <table>
              <tr><th>Guest Name</th><td>${data.guestName}</td><th>Confirmation No.</th><td>33248</td></tr>
              <tr><th>Room No</th><td>${data.rooms[0]?.roomId || ''}</td><th>Mobile #</th><td>${data.guestContact}</td></tr>
              <tr><th>Pax</th><td>${data.guests}</td><th>Email</th><td>${data.email}</td></tr>
          <tr><th>Total Cost</th><td> ${data.totalCost}</td><th>Nationality</th><td>${data.country}</td></tr>
              <tr><th>CNIC/Passport</th><td>${data.cnic}</td><th>Date of Birth</th><td></td></tr>
              <tr><th>Company</th><td>${data.company}</td><th>Reservation Remarks</th><td></td></tr>
              <tr><th>Address</th><td>${data.address}</td><th>City</th><td>${data.city}</td></tr>
              <tr><th>Arrival Date</th><td>${new Date(data.rooms[0]?.checkInDate).toLocaleDateString()}</td><th>Next Destination</th><td></td></tr>
              <tr><th>Departure Date</th><td>${new Date(data.rooms[0]?.checkOutDate).toLocaleDateString()}</td></tr>
            </table>
            <div class="footer-notes">
              <p>I / We have checked the condition of the room and acknowledge the following:</p>
              <div style="white-space: pre-line;">${data.notes}</div>
            </div>
            <div class="signature-section">
              <div class="signature">Guest</div>
              <div class="signature">F.D.O</div>
              <div class="signature">Duty Manager</div>
            </div>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
  }

  const calculateTotalCost = () => {
    return selectedRooms.reduce((sum, room) => sum + room.roomCost, 0)
  }

  const searchRooms = async () => {
    if (!currentRoom.checkInDate || !currentRoom.checkOutDate) {
      alert('Please select both check-in and check-out dates.')
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
    } catch (error) {
      console.error('Error fetching available rooms:', error)
      setAvailableRooms([]) // Reset rooms to empty array in case of error
    }
  }

  const handleDateChange = (date, field) => {
    setCurrentRoom(prev => ({
      ...prev,
      [field]: date
    }))
  }

  const calculatePendingAmount = () => {
    const totalCost = calculateTotalCost()
    return amountPaid - totalCost
  }

  const addRoomToList = () => {
    if (!currentRoom.roomId || !currentRoom.checkInDate || !currentRoom.checkOutDate) {
      alert('Please select a room and both check-in and check-out dates.')
      return
    }

    if (currentRoom.checkInDate >= currentRoom.checkOutDate) {
      alert('Check-out date must be after check-in date.')
      return
    }

    const selectedRoom = availableRooms.find(room => room.id === currentRoom.roomId)
    const nights = Math.ceil((currentRoom.checkOutDate - currentRoom.checkInDate) / (1000 * 60 * 60 * 24))
    const roomCost = nights * selectedRoom.roomPrice

    // Ensure roomPrice is added
    setSelectedRooms(prevRooms => [
      ...prevRooms,
      {
        ...selectedRoom,
        ...currentRoom,
        roomPrice: selectedRoom.roomPrice, // Add room price here
        nights,
        roomCost
      }
    ])

    // Reset current room selection
    setCurrentRoom({
      roomId: '',
      checkInDate: null,
      checkOutDate: null,
      nights: 0,
      roomCost: 0
    })
  }

  const removeRoom = async index => {
    const roomToRemove = selectedRooms[index]

    // Remove the room from the UI
    setSelectedRooms(prevRooms => {
      const updatedRooms = prevRooms.filter((_, i) => i !== index)
      return updatedRooms // Just return the filtered rooms
    })

    // Make an API call to remove the room from the reservation in the database
    try {
      const response = await fetch(`/api/checkin/${selectedReservationId}/remove-room`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomToRemove.roomId })
      })

      if (response.ok) {
        console.log('Room removed successfully from the reservation.')
      } else {
        const result = await response.json()
        console.error('Error removing room:', result.error)
        alert('Failed to remove the room from the reservation.')
      }
    } catch (error) {
      console.error('Error removing room:', error)
      alert('An error occurred while removing the room.')
    }
  }

  const handleReservationSelection = async event => {
    const reservationId = event.target.value
    setSelectedReservationId(reservationId)

    // Fetch reservation details and auto-fill the form
    const response = await fetch(`/api/reservations/${reservationId}`)
    const reservation = await response.json()

    // Set reservation details in form fields including guest name and guest contact
    setGuestName(reservation.guestName)
    setGuestContact(reservation.guestContact)

    // Update formData to reflect the selected reservation's guest name and contact
    setFormData(prev => ({
      ...prev,
      guestName: reservation.guestName,
      guestContact: reservation.guestContact
    }))

    // Set the rooms data in the table
    setSelectedRooms(
      reservation.reservationRooms.map(room => ({
        roomId: room.room.id,
        roomName: room.room.roomName,
        roomType: room.room.roomType,
        roomView: room.room.roomView,
        roomPrice: room.room.roomPrice, // Ensure this field is correctly capturing the price
        checkInDate: room.checkInDate.split('T')[0], // Format to 'YYYY-MM-DD'
        checkOutDate: room.checkOutDate.split('T')[0], // Format to 'YYYY-MM-DD'
        nights: room.nights,
        roomCost: room.cost // This is the total cost per room
      }))
    )
  }

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault()

    try {
      // Create the data structure for rooms to send to the API
      const roomsData = selectedRooms.map(room => ({
        roomId: room.roomId,
        checkInDate: room.checkInDate,
        checkOutDate: room.checkOutDate,
        nights: room.nights,
        cost: room.roomCost
      }))

      // Combine form data with room data and payment info
      const dataToSubmit = {
        ...formData,
        rooms: roomsData,
        userId: authUser.id,
        amountPaid: amountPaid,
        pendingAmount: Math.abs(calculatePendingAmount()), // Use absolute value to avoid negative numbers
        totalCost: calculateTotalCost() // Add the total cost for reference
      }

      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit)
      })

      const result = await response.json()

      if (response.ok) {
        // Handle success, e.g., show a success message or navigate to another page
        console.log('Check-In Successful:', result)

        // Reset form fields
        setFormData({
          guestName: '',
          guestContact: '',
          email: '',
          cnic: '',
          paymentMethod: '',
          children: '',
          guests: '',
          address: '',
          city: '',
          country: '',
          company: ''
        })

        setSelectedRooms([])
        setAmountPaid(0) // Reset amount paid
        setCurrentRoom({
          roomId: '',
          checkInDate: null,
          checkOutDate: null,
          nights: 0,
          roomCost: 0
        })
      } else {
        // Handle errors, e.g., show an error message
        console.error('Check-In Error:', result.error)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const handleCheckInTypeChange = event => setCheckInType(event.target.value)

  // Handle change for input fields
  const handleChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Handle reservation selection
  const handleReservationSelect = e => {
    const selectedOption = e.target.value
    setIsReservation(selectedOption === 'reservation')

    if (selectedOption === 'reservation') {
      // Fetch reservation data from API (use dummy data for now)
      const data = {
        guestName: 'John Doe',
        guestContact: '123456789',
        email: 'johndoe@example.com',
        roomId: '101',
        roomType: 'Suite',
        checkInDate: '2024-10-14',
        checkOutDate: '2024-10-15',
        roomPrice: '1000'
      }
      setReservationData(data)
      setFormData({
        ...formData,
        guestName: data.guestName,
        guestContact: data.guestContact,
        email: data.email,
        roomId: data.roomId,
        roomType: data.roomType,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        roomPrice: data.roomPrice
      })
    } else {
      setFormData({
        guestName: '',
        guestContact: '',
        email: '',
        cnic: '',
        roomId: '',
        roomType: '',
        paymentMethod: '',

        checkInDate: '',
        checkOutDate: '',

        children: '',
        guests: '',
        address: '',
        city: '',
        country: '',
        company: ''
      })
    }
  }

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        Check-In Form
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Check-In Type */}

          <Grid item xs={12}>
            <FormControl fullWidth variant='outlined'>
              <InputLabel>Check-In Type</InputLabel>
              <Select value={checkInType} onChange={handleCheckInTypeChange} label='Check-In Type'>
                <MenuItem value='walkin'>Walk-In</MenuItem>
                <MenuItem value='reservation'>Reservation</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {checkInType === 'reservation' && (
            <Grid item xs={12}>
              <FormControl fullWidth variant='outlined' sx={{ marginTop: 2 }}>
                <InputLabel>Select Reservation</InputLabel>
                <Select value={selectedReservationId} onChange={handleReservationSelection} label='Select Reservation'>
                  {reservations.map(reservation => (
                    <MenuItem key={reservation.id} value={reservation.id}>
                      {reservation.guestName} - {reservation.reservationDate}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Guest Information */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Guest Name'
              name='guestName'
              value={formData.guestName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Guest Contact'
              name='guestContact'
              value={formData.guestContact}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Email' name='email' value={formData.email} onChange={handleChange} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='CNIC/Passport'
              name='cnic'
              value={formData.cnic}
              onChange={handleChange}
              required
            />
          </Grid>

          {/* Room Information */}
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

          {/* Room Floor Selection and Search Button */}
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
                      <TableCell>{new Date(room.checkInDate).toLocaleDateString()}</TableCell> {/* Format date */}
                      <TableCell>{new Date(room.checkOutDate).toLocaleDateString()}</TableCell> {/* Format date */}
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
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid #ccc', // Add a border
                padding: '10px',
                borderRadius: '8px'
              }}
            >
              <Typography variant='h6'>Total Cost: Pkr : {calculateTotalCost()}</Typography>

              <Typography variant='h6'>Amount Paid: Pkr : {amountPaid}</Typography>

              <Typography
                variant='h6'
                style={{
                  color: calculatePendingAmount() < 0 ? 'red' : 'green'
                }}
              >
                Pending Amount: Pkr : {Math.abs(calculatePendingAmount())}
              </Typography>
            </Box>
          </Grid>

          {/* Real room  */}

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id='payment-method-label'>Payment Method</InputLabel>
              <Select
                labelId='payment-method-label'
                value={formData.paymentMethod}
                onChange={handleChange}
                name='paymentMethod'
                label='Payment Method'
              >
                <MenuItem value='cash'>Cash</MenuItem>
                <MenuItem value='card'>Card</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Amount Paid'
              type='number'
              value={amountPaid}
              onChange={e => setAmountPaid(Number(e.target.value))}
            />
          </Grid>

          {/* Additional Details */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Guests'
              name='guests'
              type='number'
              value={formData.guests}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Children'
              name='children'
              type='number'
              value={formData.children}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Notes'
              name='notes'
              multiline
              rows={8}
              value={formData.notes}
              onChange={handleChange}
              placeholder='Add check-in policies, breakfast details, etc.'
            />
          </Grid>

          {/* Address Information */}
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Address' name='address' value={formData.address} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='City' name='city' value={formData.city} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Country' name='country' value={formData.country} onChange={handleChange} />
          </Grid>

          {/* Company Information */}
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Company' name='company' value={formData.company} onChange={handleChange} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              variant='contained'
              color='secondary'
              onClick={() =>
                handlePrintRegistrationCard({ ...formData, rooms: selectedRooms, totalCost: calculateTotalCost() })
              }
            >
              Registration Card
            </Button>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button type='submit' variant='contained' color='primary' fullWidth>
              Check In
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default CheckInForm
