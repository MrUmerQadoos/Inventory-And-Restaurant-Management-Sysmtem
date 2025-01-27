'use client'

import { useEffect, useState } from 'react'
import {
  Button,
  Grid,
  TextField,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'

const ItemForm = () => {
  const [items, setItems] = useState([]) // Store created items
  const [code, setCode] = useState('') // Dish code
  const [name, setName] = useState('') // Item name
  const [price, setPrice] = useState('') // Item price
  const [loading, setLoading] = useState(false) // Loading state for the add operation
  const [deletingId, setDeletingId] = useState(null) // Track which item is being deleted
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch all items on component mount
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/items')
        const data = await response.json()
        setItems(data)
      } catch (err) {
        console.error('Error fetching items:', err)
        setError('Error fetching items')
      }
    }

    fetchItems()
  }, [])

  const handleSubmit = async event => {
    event.preventDefault()
    setLoading(true) // Start loading

    const newItem = { code, name, price: parseFloat(price) }

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      })

      const result = await response.json()

      if (response.ok) {
        setItems([...items, result])
        setCode('')
        setName('')
        setPrice('')
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Error creating item.')
      console.error('Error creating item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async id => {
    setDeletingId(id)

    try {
      const response = await fetch(`/api/items/${id}`, { method: 'DELETE' })
      const result = await response.json()

      if (response.ok) {
        setItems(items.filter(item => item.id !== id))
      } else {
        console.error(result.error)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
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
              <Grid item xs={12} md={4}>
                <TextField
                  label='Dish Code'
                  variant='outlined'
                  fullWidth
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label='Item Name'
                  variant='outlined'
                  fullWidth
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label='Price'
                  variant='outlined'
                  fullWidth
                  type='number'
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <Button variant='contained' color='primary' type='submit' disabled={loading}>
                  {loading ? <CircularProgress size={24} color='inherit' /> : 'Add Item'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>

        <Grid item xs={12} md={12}>
          {items.length > 0 && (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label='item table'>
                <TableHead>
                  <TableRow>
                    <TableCell>Dish Code</TableCell>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell align='right'>
                        <Button
                          variant='outlined'
                          color='error'
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                        >
                          {deletingId === item.id ? <CircularProgress size={24} color='inherit' /> : 'Delete'}
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

export default ItemForm
