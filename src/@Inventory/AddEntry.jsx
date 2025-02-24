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
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'

const AddEntry = () => {
  const [items, setItems] = useState([]) // Store created items
  const [itemId, setItemId] = useState(null) // For update operation
  const [name, setName] = useState('') // Item name
  const [amount, setAmount] = useState('') // Item amount
  const [price, setPrice] = useState('') // Item price
  const [fixedPrice, setFixedPrice] = useState('') // Fixed price
  const [loading, setLoading] = useState(false) // Loading state
  const [open, setOpen] = useState(false) // Dialog state

  useEffect(() => {
    // Fetch all items on component mount
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/inventory')
        const data = await response.json()
        setItems(data)
      } catch (err) {
        console.error('Error fetching inventory:', err)
      }
    }

    fetchItems()
  }, [])

  const handleSubmit = async event => {
    event.preventDefault()
    setLoading(true)

    const newItem = {
      name,
      amount: parseInt(amount, 10),
      price: parseFloat(price),
      fixedPrice: parseFloat(fixedPrice) // Add fixed price
    }

    try {
      let response
      if (itemId) {
        // Update item
        response = await fetch(`/api/inventory/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem)
        })
      } else {
        // Create item
        response = await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem)
        })
      }

      const result = await response.json()

      if (response.ok) {
        if (itemId) {
          // Update item in state
          setItems(prev => prev.map(item => (item.id === itemId ? result : item)))
        } else {
          // Add new item to state
          setItems([...items, result])
        }
        clearForm()
      } else {
        console.error(result.error)
      }
    } catch (error) {
      console.error('Error submitting item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = item => {
    if (item) {
      setItemId(item.id || null) // Ensure id exists
      setName(item.name || '') // Set name
      setAmount(item.amount ? item.amount.toString() : '') // Ensure amount is set as a string
      setPrice(item.price ? item.price.toString() : '') // Ensure price is set as a string
      setFixedPrice(item.fixedPrice ? item.fixedPrice.toString() : '') // Ensure fixedPrice is set as a string
      setOpen(true) // Open dialog
    }
  }

  const handleDelete = async id => {
    try {
      const response = await fetch(`/api/inventory/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setItems(items.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const clearForm = () => {
    setItemId(null)
    setName('')
    setAmount('')
    setPrice('')
    setFixedPrice('') // Clear the fixed price field
    setOpen(false)
  }

  return (
    <div className='shadow-lg px-6 py-6 rounded-md'>
      <Typography variant='h4' gutterBottom>
        Inventory Management
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              label='Item Name'
              variant='outlined'
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label='Quantity'
              variant='outlined'
              fullWidth
              type='number'
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
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
          <Grid item xs={12} sm={4}>
            <TextField
              label='Fixed Price'
              variant='outlined'
              fullWidth
              type='number'
              value={fixedPrice}
              onChange={e => setFixedPrice(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant='contained' color='primary' type='submit' disabled={loading}>
              {loading ? <CircularProgress size={24} color='inherit' /> : itemId ? 'Update Item' : 'Add Item'}
            </Button>
          </Grid>
        </Grid>
      </form>

      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Fixed Price</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.amount}</TableCell>
                <TableCell>{item.price}</TableCell>
                <TableCell>{item.fixedPrice}</TableCell>
                <TableCell align='right'>
                  <IconButton onClick={() => handleEdit(item)}>
                    <Edit />
                  </IconButton>
                  <IconButton color='error' onClick={() => handleDelete(item.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={open} onClose={clearForm}>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <TextField
            label='Item Name'
            variant='outlined'
            fullWidth
            margin='normal'
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <TextField
            label='Quantity'
            variant='outlined'
            fullWidth
            margin='normal'
            type='number'
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
          <TextField
            label='Price'
            variant='outlined'
            fullWidth
            margin='normal'
            type='number'
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
          />
          <TextField
            label='Fixed Price'
            variant='outlined'
            fullWidth
            margin='normal'
            type='number'
            value={fixedPrice}
            onChange={e => setFixedPrice(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={clearForm}>Cancel</Button>
          <Button onClick={handleSubmit} color='primary' variant='contained'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default AddEntry
