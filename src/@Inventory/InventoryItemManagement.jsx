'use client'

import { useEffect, useState } from 'react'
import {
  Button,
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material'

const InventoryItemManagement = () => {
  const [items, setItems] = useState([]) // List of inventory items
  const [itemName, setItemName] = useState('') // Item name
  const [itemAmount, setItemAmount] = useState('') // Item amount
  const [itemPrice, setItemPrice] = useState('') // Item price
  const [editingItem, setEditingItem] = useState(null) // Item being edited
  const [loading, setLoading] = useState(false) // Loading state

  useEffect(() => {
    // Fetch inventory items on component mount
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/inventory-records') // API endpoint
        const data = await response.json()
        setItems(data)
      } catch (error) {
        console.error('Error fetching inventory items:', error)
      }
    }

    fetchItems()
  }, [])

  const handleAddOrUpdateItem = async event => {
    event.preventDefault()
    setLoading(true)

    const itemData = {
      name: itemName,
      amount: parseFloat(itemAmount),
      price: parseFloat(itemPrice)
    }

    try {
      let response
      if (editingItem) {
        // Update an existing item
        response = await fetch(`/api/inventory-records/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        })
      } else {
        // Add a new item
        response = await fetch('/api/inventory-records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        })
      }

      if (response.ok) {
        const updatedOrNewItem = await response.json()
        if (editingItem) {
          setItems(prev => prev.map(item => (item.id === editingItem.id ? updatedOrNewItem : item)))
        } else {
          setItems([...items, updatedOrNewItem])
        }
        clearForm()
      }
    } catch (error) {
      console.error('Error saving inventory item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditItem = item => {
    setEditingItem(item)
    setItemName(item.name)
    setItemAmount(item.amount.toString())
    setItemPrice(item.price.toString())
  }

  const handleDeleteItem = async id => {
    setLoading(true)
    try {
      const response = await fetch(`/api/inventory-records/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearForm = () => {
    setEditingItem(null)
    setItemName('')
    setItemAmount('')
    setItemPrice('')
  }

  return (
    <div className='shadow-lg px-6 py-6 rounded-md'>
      <Typography variant='h4' gutterBottom>
        Inventory Items Record
      </Typography>
      <form onSubmit={handleAddOrUpdateItem}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              label='Item Name'
              variant='outlined'
              fullWidth
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label='Amount'
              type='number'
              variant='outlined'
              fullWidth
              value={itemAmount}
              onChange={e => setItemAmount(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label='Price'
              type='number'
              variant='outlined'
              fullWidth
              value={itemPrice}
              onChange={e => setItemPrice(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant='contained' color='primary' type='submit' disabled={loading}>
              {loading ? <CircularProgress size={24} color='inherit' /> : editingItem ? 'Update Item' : 'Add Item'}
            </Button>
            {editingItem && (
              <Button variant='outlined' onClick={clearForm} style={{ marginLeft: '10px' }}>
                Cancel
              </Button>
            )}
          </Grid>
        </Grid>
      </form>

      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Price</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.amount}</TableCell>
                <TableCell>{item.price}</TableCell>
                <TableCell align='right'>
                  <Button variant='outlined' onClick={() => handleEditItem(item)}>
                    Edit
                  </Button>
                  <Button
                    variant='outlined'
                    color='error'
                    onClick={() => handleDeleteItem(item.id)}
                    style={{ marginLeft: '10px' }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default InventoryItemManagement
