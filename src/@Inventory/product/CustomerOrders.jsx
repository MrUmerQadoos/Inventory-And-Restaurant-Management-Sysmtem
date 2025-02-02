'use client'
import { useState } from 'react'
import { Box, TextField, Button, Typography, List, ListItem, Paper, CircularProgress } from '@mui/material'

const CustomerOrders = () => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [customerOrders, setCustomerOrders] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    setLoading(true)
    setError('')
    try {
      const queryParams = new URLSearchParams()
      if (name) queryParams.append('name', name)
      if (phone) queryParams.append('phone', phone)

      const response = await fetch(`/api/customers?${queryParams.toString()}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to fetch data')

      setCustomerOrders(data)
    } catch (err) {
      setError(err.message)
      setCustomerOrders(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 4 }}>
      <Typography variant='h5' sx={{ textAlign: 'center', marginBottom: 3 }}>
        Search Customer Orders
      </Typography>

      <TextField
        label='Customer Name (Optional)'
        fullWidth
        variant='outlined'
        value={name}
        onChange={e => setName(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      <TextField
        label='Phone Number (Optional)'
        fullWidth
        variant='outlined'
        value={phone}
        onChange={e => setPhone(e.target.value)}
        sx={{ marginBottom: 2 }}
      />

      <Button variant='contained' color='primary' fullWidth onClick={handleSearch} disabled={loading}>
        {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Search'}
      </Button>

      {error && (
        <Typography color='error' sx={{ marginTop: 2 }}>
          {error}
        </Typography>
      )}

      {customerOrders && (
        <Paper sx={{ padding: 3, marginTop: 3 }}>
          <Typography variant='h6'>Customer Details</Typography>
          <Typography>
            <strong>Name:</strong> {customerOrders.customer?.name || 'N/A'}
          </Typography>
          <Typography>
            <strong>Phone:</strong> {customerOrders.customer?.phone || 'N/A'}
          </Typography>
          <Typography>
            <strong>Address:</strong> {customerOrders.customer?.address || 'N/A'}
          </Typography>
          <Typography sx={{ marginTop: 2 }}>
            <strong>Total Orders:</strong> {customerOrders.orders.length}
          </Typography>

          <List sx={{ marginTop: 2 }}>
            {customerOrders.orders.map(order => (
              <ListItem key={order.id} divider>
                <Typography>
                  <strong>Invoice #:</strong> {order.invoiceNumber} |<strong> Order Type:</strong> {order.orderType} |
                  <strong> Total:</strong> {order.finalTotal} PKR
                </Typography>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  )
}

export default CustomerOrders
