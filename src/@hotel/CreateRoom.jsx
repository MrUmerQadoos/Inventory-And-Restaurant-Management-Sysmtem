'use client'

import { useEffect, useState } from 'react'
import {
  Button,
  Grid,
  TextField,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'

const CreateRoom = () => {
  const [rooms, setRooms] = useState([]) // Store created rooms
  const [floor, setFloor] = useState('Top Floor')
  const [roomName, setRoomName] = useState('')
  const [roomType, setRoomType] = useState('')
  const [roomView, setRoomView] = useState('')
  const [roomPrice, setRoomPrice] = useState('')
  const [loading, setLoading] = useState(false) // Loading state for the add operation
  const [deletingId, setDeletingId] = useState(null) // Track which room is being deleted
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch all rooms on component mount
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/createroom')
        const data = await response.json()
        setRooms(data)
      } catch (err) {
        console.error('Error fetching rooms:', err)
        setError('Error fetching rooms')
      }
    }

    fetchRooms()
  }, [])

  const handleSubmit = async event => {
    event.preventDefault()
    setLoading(true) // Start loading

    const newRoom = { floor, roomName, roomType, roomView, roomPrice }

    try {
      const response = await fetch('/api/createroom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRoom)
      })

      const result = await response.json()

      if (response.ok) {
        setRooms([...rooms, result])
        setFloor('Top Floor')
        setRoomName('')
        setRoomType('')
        setRoomView('')
        setRoomPrice('')
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Error creating room.')
      console.error('Error creating room:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async id => {
    setDeletingId(id)

    try {
      const response = await fetch(`/api/rooms/${id}`, { method: 'DELETE' })
      const result = await response.json()

      if (response.ok) {
        setRooms(rooms.filter(room => room.id !== id))
      } else {
        console.error(result.error)
      }
    } catch (error) {
      console.error('Error deleting room:', error)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className='shadow-lg px-6 py-6 rounded-md'>
      <Grid container spacing={6}>
        <Grid item xs={12} md={12}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3} alignItems='center'>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id='floor-label'>Floor</InputLabel>
                  <Select labelId='floor-label' value={floor} label='Floor' onChange={e => setFloor(e.target.value)}>
                    <MenuItem value='Top Floor'>Top Floor</MenuItem>
                    <MenuItem value='Second Floor'>Second Floor</MenuItem>
                    <MenuItem value='Third Floor'>Third Floor</MenuItem>
                    <MenuItem value='Fourth Floor'>Fourth Floor</MenuItem>
                    <MenuItem value='Ground Floor'>Ground Floor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label='Room Name'
                  variant='outlined'
                  fullWidth
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label='Room Type'
                  variant='outlined'
                  fullWidth
                  value={roomType}
                  onChange={e => setRoomType(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label='Room View'
                  variant='outlined'
                  fullWidth
                  value={roomView}
                  onChange={e => setRoomView(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label='Room Price'
                  variant='outlined'
                  type='number'
                  fullWidth
                  value={roomPrice}
                  onChange={e => setRoomPrice(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <Button variant='contained' color='primary' type='submit' disabled={loading}>
                  {loading ? <CircularProgress size={24} color='inherit' /> : 'Create Room'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>

        <Grid item xs={12} md={12}>
          {rooms.length > 0 && (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label='room table'>
                <TableHead>
                  <TableRow>
                    <TableCell>Floor</TableCell>
                    <TableCell>Room Name</TableCell>
                    <TableCell>Room Type</TableCell>
                    <TableCell>Room View</TableCell>
                    <TableCell>Room Price</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rooms.map(room => (
                    <TableRow key={room.id}>
                      <TableCell>{room.floor}</TableCell>
                      <TableCell>{room.roomName}</TableCell>
                      <TableCell>{room.roomType}</TableCell>
                      <TableCell>{room.roomView}</TableCell>
                      <TableCell>${room.roomPrice}</TableCell>
                      <TableCell align='right'>
                        <Button
                          variant='outlined'
                          color='error'
                          onClick={() => handleDelete(room.id)}
                          disabled={deletingId === room.id}
                        >
                          {deletingId === room.id ? <CircularProgress size={24} color='inherit' /> : 'Delete'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>
    </div>
  )
}

export default CreateRoom
