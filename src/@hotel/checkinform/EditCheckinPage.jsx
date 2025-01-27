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
  Paper,
  TableFooter,
  CircularProgress,
  Modal
} from '@mui/material'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
  maxHeight: '90vh', // Set the maximum height for the modal (90% of the viewport height)
  overflowY: 'auto' // Enable vertical scrolling if content exceeds the height
}

const EditCheckIn = ({ reservationId }) => {
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
  const [restaurantBills, setRestaurantBills] = useState([])

  const [openCheckoutModal, setOpenCheckoutModal] = useState(false)
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false)

  const [newPayment, setNewPayment] = useState(0) // State to manage new payment input

  const [minibarItems, setMinibarItems] = useState([])
  const [minibarTotal, setMinibarTotal] = useState(0)
  const [minibarItemName, setMinibarItemName] = useState('') // For the name of the minibar item
  const [minibarItemPrice, setMinibarItemPrice] = useState(0) // For the price of the minibar item

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
    country: '',
    company: ''
  })

  const [totalCost, setTotalCost] = useState(0)

  // Retrieve user details from cookies
  const authUser = {
    name: Cookies.get('userName') || '',
    id: Cookies.get('UserId') || ''
  }

  // Fetch the existing check-in data when component mounts

  useEffect(() => {
    const fetchRestaurantBills = async () => {
      try {
        const response = await fetch(`/api/checkin/roompay/${reservationId}`)
        if (response.ok) {
          const data = await response.json()
          setRestaurantBills(data)
        }
      } catch (error) {
        console.error('Error fetching restaurant bills:', error)
      }
    }

    if (reservationId) {
      fetchRestaurantBills()
    }
  }, [reservationId])

  // useEffect(() => {
  //   const fetchCheckInDetails = async () => {
  //     try {
  //       const response = await fetch(`/api/checkin/${reservationId}`) // Fetch the existing check-in data
  //       const data = await response.json()

  //       // Pre-fill selected rooms data
  //       setSelectedRooms(
  //         data.reservationRooms.map(room => ({
  //           roomId: room.room.id,
  //           roomName: room.room.roomName,
  //           roomType: room.room.roomType,
  //           roomView: room.room.roomView,
  //           roomPrice: room.room.roomPrice,
  //           checkInDate: new Date(room.checkInDate),
  //           checkOutDate: new Date(room.checkOutDate),
  //           nights: room.nights,
  //           roomCost: room.cost
  //         }))
  //       )

  //       setAmountPaid(data.amountPaid || 0) // Initialize amountPaid from the database
  //       setTotalCost(calculateTotalCost()) // Initialize total cost

  //       if (data.minibarItems) {
  //         setMinibarItems(data.minibarItems)
  //         setMinibarTotal(data.minibarItems.reduce((sum, item) => sum + item.price, 0))
  //       }
  //     } catch (error) {
  //       console.error('Error fetching check-in details:', error)
  //     }
  //   }

  //   if (reservationId) fetchCheckInDetails()
  // }, [reservationId])

  useEffect(() => {
    const fetchCheckInDetails = async () => {
      try {
        const response = await fetch(`/api/checkin/${reservationId}`)
        const data = await response.json()

        // Set form data...
        // Set form data with the retrieved check-in details
        setFormData({
          guestName: data.guestName,
          guestContact: data.guestContact,
          email: data.email,
          cnic: data.cnic,
          paymentMethod: data.paymentMethod,
          children: data.children,
          guests: data.guests,
          address: data.address,
          city: data.city,
          country: data.country,
          company: data.company
        })

        // Set selected rooms data
        setSelectedRooms(
          data.reservationRooms.map(room => ({
            roomId: room.room.id,
            roomName: room.room.roomName,
            roomType: room.room.roomType,
            roomView: room.room.roomView,
            roomPrice: room.room.roomPrice,
            checkInDate: new Date(room.checkInDate),
            checkOutDate: new Date(room.checkOutDate),
            nights: room.nights,
            roomCost: room.cost
          }))
        )

        // Set minibar items
        if (data.minibarItems) {
          setMinibarItems(data.minibarItems)
          const minibarSum = data.minibarItems.reduce((sum, item) => sum + item.price, 0)
          setMinibarTotal(minibarSum)
        }

        setAmountPaid(data.amountPaid || 0)
        // Don't set totalCost here - let it be calculated from the pieces
      } catch (error) {
        console.error('Error fetching check-in details:', error)
      }
    }

    if (reservationId) fetchCheckInDetails()
  }, [reservationId])

  const calculateTotalCost = () => {
    const roomsTotal = selectedRooms.reduce((sum, room) => sum + room.roomCost, 0)
    const restaurantTotal = restaurantBills.reduce((sum, bill) => sum + bill.netAmount, 0)
    const minibarSum = minibarItems.reduce((sum, item) => sum + item.price, 0)

    return roomsTotal + restaurantTotal + minibarSum
  }

  const calculateRestaurantTotal = () => {
    return restaurantBills.reduce((sum, bill) => sum + bill.netAmount, 0)
  }

  const calculatePendingAmount = () => {
    return calculateTotalCost() - amountPaid
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
      setAvailableRooms([])
    }
  }

  const addMinibarItem = (itemName, itemPrice) => {
    const newItem = { name: itemName, price: itemPrice }
    setMinibarItems([...minibarItems, newItem])
    const updatedMinibarTotal = minibarTotal + itemPrice
    setMinibarTotal(updatedMinibarTotal)
    setTotalCost(calculateTotalCost() + itemPrice)
  }

  const handlePrintCheckoutBill = checkoutData => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.error('Window or document is not available')
      return
    }

    if (!checkoutData || !checkoutData.reservationRooms) {
      console.error('checkoutData is undefined or missing expected properties')
      return
    }

    const logoUrl = 'https://pub-2f5b50a81b7a40358799d6e7c3b2f968.r2.dev/3m1saj2fe.png'
    const printContent = `
        <html>
        <head>
            <title>Guest Folio</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; font-size: 14px; }
                .section { margin-bottom: 15px; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
                th, td { border: 1px solid #000; padding: 5px; text-align: left; }
                .totals { font-weight: bold; }
                .signatures { margin-top: 30px; display: flex; justify-content: space-between; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">
                    <img src="${logoUrl}" alt="Company Logo" style="width: 80px; height: auto; display: block; margin: 0 auto;" />
                </div>
                <h2>SunSet Heights Resort And Residencia</h2>
                <p>Main PirSohawa Road, Islamabad <br>Tel:  +92-304-1110428</p>
                <h3>Guest Folio</h3>
            </div>

            <!-- Guest Details Section -->
            <table>
                <tr><th>Guest Name</th><td>${checkoutData.guestName || 'N/A'}</td></tr>
                <tr><th>Contact Number</th><td>${checkoutData.guestContact || 'N/A'}</td></tr>
                <tr><th>CNIC/Passport</th><td>${checkoutData.cnic || 'N/A'}</td></tr>
                <tr><th>Email</th><td>${checkoutData.email || 'N/A'}</td></tr>
                <tr><th>Company</th><td>${checkoutData.company || 'N/A'}</td></tr>
                <tr><th>Address</th><td>${checkoutData.address}, ${checkoutData.city}, ${checkoutData.country}</td></tr>
            </table>

            <!-- Room Details Section -->
            <h4>Room Details</h4>
            <table>
                <tr><th>Date</th><th>Room</th><th>Description</th><th>Amount</th></tr>
                ${checkoutData.reservationRooms
                  .map(
                    room => `
                        <tr>
                            <td>${new Date(room.checkInDate).toLocaleDateString() || 'N/A'}</td>
                            <td>${room.room.roomName || 'N/A'}</td>
                            <td>Room Charge - ${room.room.roomType || 'N/A'}</td>
                            <td>${room.cost || 'N/A'}</td>
                        </tr>
                    `
                  )
                  .join('')}
            </table>

            <!-- Other Expenses Section (Minibar and Restaurant) -->
            <h4>Other Expenses</h4>
            <table>
                <tr><th>Date</th><th>Type</th><th>Description</th><th>Amount</th></tr>
                ${checkoutData.minibarItems
                  .map(
                    item => `
                        <tr>
                            <td>${new Date(item.createdAt).toLocaleDateString() || 'N/A'}</td>
                            <td>Minibar</td>
                            <td>${item.name}</td>
                            <td>${item.price || 'N/A'}</td>
                        </tr>
                    `
                  )
                  .join('')}
                ${checkoutData.restaurantBills
                  .map(
                    bill => `
                        <tr>
                            <td>${new Date(bill.createdAt).toLocaleDateString() || 'N/A'}</td>
                            <td>Restaurant</td>
                            <td>Bill ${bill.kotId || 'N/A'}</td>
                            <td>${bill.netAmount || 'N/A'}</td>
                        </tr>
                    `
                  )
                  .join('')}
                <tr class="totals">
                    <td colspan="3">Total</td>
                    <td>${checkoutData.totalCost || 'N/A'}</td>
                </tr>
            </table>

            <div class="signatures">
                <div>_________________________<br>Guest</div>
                <div>_________________________<br>Cashier</div>
            </div>


        </body>
        </html>
    `

    const printWindow = window.open('', '', 'width=800,height=1000')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    } else {
      console.error('Unable to open print window')
    }
  }

  const removeMinibarItem = index => {
    const itemToRemove = minibarItems[index]
    const updatedMinibarItems = minibarItems.filter((_, i) => i !== index)
    const updatedMinibarTotal = minibarTotal - itemToRemove.price
    setMinibarItems(updatedMinibarItems)
    setMinibarTotal(updatedMinibarTotal)
    setTotalCost(calculateTotalCost() - itemToRemove.price)
  }

  const handleDateChange = (date, field) => {
    setCurrentRoom(prev => ({
      ...prev,
      [field]: date
    }))
  }

  const handleCheckout = async () => {
    try {
      setIsProcessingCheckout(true)

      const response = await fetch(`/api/checkin/checkout/${reservationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'COMPLETED',
          pendingAmount: calculatePendingAmount(),
          amountPaid,
          totalCost: calculateTotalCost(),
          checkoutDetails: {
            rooms: selectedRooms,
            restaurantBills, // Add restaurantBills here if available
            minibarItems,
            finalAmount: amountPaid,
            checkoutDate: new Date()
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to checkout')
      }

      const result = await response.json()
      setOpenCheckoutModal(false)

      // Debugging log for checkoutData
      console.log('Checkout Data:', result)

      // Print checkout bill
      handlePrintCheckoutBill({ ...result, restaurantBills }) // Pass restaurantBills explicitly here

      alert('Checkout completed successfully!')
    } catch (error) {
      console.error('Error during checkout:', error)
      alert('Failed to complete checkout')
    } finally {
      setIsProcessingCheckout(false)
    }
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

    setSelectedRooms(prevRooms => [
      ...prevRooms,
      {
        ...selectedRoom,
        ...currentRoom,
        roomPrice: selectedRoom.roomPrice,
        nights,
        roomCost
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

  const removeRoom = async index => {
    const roomToRemove = selectedRooms[index]

    // Remove the room from the UI
    setSelectedRooms(prevRooms => {
      const updatedRooms = prevRooms.filter((_, i) => i !== index)
      setTotalCost(updatedRooms.reduce((sum, room) => sum + room.roomCost, 0)) // Update total cost
      return updatedRooms
    })

    // Make an API call to remove the room from the reservation in the database
    try {
      const response = await fetch(`/api/checkin/${reservationId}/remove-room`, {
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

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      const roomsData = selectedRooms.map(room => ({
        roomId: room.roomId,
        checkInDate: room.checkInDate,
        checkOutDate: room.checkOutDate,
        nights: room.nights,
        cost: room.roomCost
      }))

      const minibarItemsData = minibarItems.map(item => ({
        name: item.name,
        price: item.price
      }))

      const currentTotalCost = calculateTotalCost() // Calculate total here

      const dataToSubmit = {
        ...formData,
        rooms: roomsData,
        minibarItems: minibarItemsData,
        userId: authUser.id,
        amountPaid,
        pendingAmount: currentTotalCost - amountPaid,
        totalCost: currentTotalCost, // Use calculated total
        roomPrice: roomsData.reduce((sum, room) => sum + room.cost, 0)
      }

      const response = await fetch(`/api/checkin/${reservationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit)
      })

      const result = await response.json()

      if (response.ok) {
        console.log('Check-In Updated Successfully:', result)
        // Update local state with returned data
        setMinibarItems(result.minibarItems || [])
        setTotalCost(result.totalCost)
        alert('Check-In Updated Successfully!')
      } else {
        console.error('Check-In Update Error:', result.error)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }
  const handleCheckInTypeChange = event => setCheckInType(event.target.value)

  const handleChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        Edit Check-In
      </Typography>

      <Grid item xs={12}>
        <Button
          variant='contained'
          color='secondary'
          fullWidth
          onClick={() => setOpenCheckoutModal(true)}
          sx={{ mt: 2 }}
        >
          Proceed to Checkout
        </Button>
      </Grid>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Check-In Type */}

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
                      <TableCell>{new Date(room.checkInDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(room.checkOutDate).toLocaleDateString()}</TableCell>
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
                border: '1px solid #ccc',
                padding: '10px',
                borderRadius: '8px'
              }}
            >
              <Typography variant='h6'>
                Total Cost: PKR {calculateTotalCost()}
                (Room: {selectedRooms.reduce((sum, room) => sum + room.roomCost, 0)} + Res: {calculateRestaurantTotal()}{' '}
                + Min: {minibarTotal})
              </Typography>
              <Typography variant='h6'>Amount Paid: PKR {amountPaid}</Typography>
              <Typography
                variant='h6'
                style={{
                  color: calculatePendingAmount() > 0 ? 'red' : 'green'
                }}
              >
                Pending Amount: PKR {Math.abs(calculatePendingAmount())}
              </Typography>
            </Box>
          </Grid>

          {/* Payment Method */}
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
              placeholder='Enter amount to add or subtract'
              value={newPayment} // Controlled input value
              onChange={e => {
                const newPaymentValue = Number(e.target.value)

                // Adjust `amountPaid` based on the difference
                setAmountPaid(prevAmountPaid => prevAmountPaid - newPayment + newPaymentValue)

                // Update `newPayment` to reflect the input value
                setNewPayment(newPaymentValue)
              }}
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

          <Grid item xs={12}>
            {/* Minibar Section Header */}
            <Box sx={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <Typography variant='h6' gutterBottom>
                Minibar
              </Typography>

              {/* Minibar Item Input Fields */}
              <Grid container spacing={12} alignItems='center'>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label='Minibar Item Name'
                    value={minibarItemName}
                    onChange={e => setMinibarItemName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label='Price'
                    type='number'
                    value={minibarItemPrice}
                    onChange={e => setMinibarItemPrice(Number(e.target.value))}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant='contained'
                    color='primary'
                    fullWidth
                    onClick={() => addMinibarItem(minibarItemName, minibarItemPrice)}
                  >
                    Add Item
                  </Button>
                </Grid>
              </Grid>

              {/* List of Minibar Items */}
              <Box mt={3}>
                <Typography variant='subtitle1' gutterBottom>
                  Minibar Items
                </Typography>
                <TableContainer component={Paper} style={{ maxHeight: 200, overflow: 'auto' }}>
                  <Table size='small' aria-label='minibar items'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Price (PKR)</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {minibarItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.price}</TableCell>
                          <TableCell>
                            <Button color='secondary' onClick={() => removeMinibarItem(index)}>
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Minibar Total */}
              <Box mt={2}>
                <Typography variant='h6'>Minibar Total: {minibarTotal} PKR</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <Typography variant='h6' gutterBottom>
                Restaurant Bills
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bill No.</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell>Subtotal</TableCell>
                      <TableCell>GST</TableCell>
                      <TableCell>Service Tax</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {restaurantBills.map(bill => (
                      <TableRow key={bill.id}>
                        <TableCell>{bill.kotId}</TableCell>
                        <TableCell>{new Date(bill.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {bill.order?.items.map(item => (
                            <div key={item.id}>
                              {item.name} x {item.quantity}
                            </div>
                          ))}
                        </TableCell>
                        <TableCell>PKR {bill.totalAmount}</TableCell>
                        <TableCell>PKR {bill.gst}</TableCell>
                        <TableCell>PKR {bill.serviceTax}</TableCell>
                        <TableCell>PKR {bill.netAmount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={6} align='right'>
                        <strong>Total Restaurant Bills:</strong>
                      </TableCell>
                      <TableCell>
                        <strong>PKR {restaurantBills.reduce((sum, bill) => sum + bill.netAmount, 0)}</strong>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </Box>
          </Grid>

          <Modal
            open={openCheckoutModal}
            onClose={() => setOpenCheckoutModal(false)}
            aria-labelledby='checkout-modal-title'
          >
            <Box sx={modalStyle}>
              <Typography id='checkout-modal-title' variant='h6' gutterBottom>
                Checkout Details
              </Typography>

              <Box mb={3} sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                <Typography variant='h6' gutterBottom>
                  Total Amount: PKR {calculateTotalCost()}
                </Typography>
                <Typography variant='h6' gutterBottom>
                  Amount Paid: PKR {amountPaid}
                </Typography>
                <Typography
                  variant='h6'
                  style={{
                    color: calculatePendingAmount() > 0 ? 'error.main' : 'success.main',
                    fontWeight: 'bold'
                  }}
                >
                  {calculatePendingAmount() > 0 ? 'Amount Due:' : 'Refund Amount:'}
                  PKR {Math.abs(calculatePendingAmount())}
                </Typography>
              </Box>

              <Box mb={3}>
                <TextField
                  fullWidth
                  label={calculatePendingAmount() > 0 ? 'Add Payment' : 'Refund Amount'}
                  type='number'
                  value={newPayment}
                  onChange={e => {
                    const value = Number(e.target.value)
                    setNewPayment(value)
                    // If pending amount is positive (due), add to paid amount
                    // If pending amount is negative (refund), subtract from paid amount
                    setAmountPaid(prevAmount =>
                      calculatePendingAmount() > 0 ? prevAmount + value : prevAmount - value
                    )
                  }}
                />
                <Button
                  variant='outlined'
                  color='secondary'
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={() => {
                    setNewPayment(0)
                    setAmountPaid(prevAmount => prevAmount) // Reset to previous amount
                  }}
                >
                  Clear
                </Button>
              </Box>

              <Button
                variant='contained'
                color='primary'
                fullWidth
                disabled={calculatePendingAmount() !== 0 || isProcessingCheckout}
                onClick={() => {
                  handleCheckout()
                  handlePrintCheckoutBill()
                }}
              >
                {isProcessingCheckout ? (
                  <CircularProgress size={24} />
                ) : calculatePendingAmount() !== 0 ? (
                  'Settlement Required'
                ) : (
                  'Complete Checkout'
                )}
              </Button>
            </Box>
          </Modal>
          {/* Submit Button */}
          <Grid item xs={12}>
            <Button type='submit' variant='contained' color='primary' fullWidth>
              Update Check-In
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default EditCheckIn
