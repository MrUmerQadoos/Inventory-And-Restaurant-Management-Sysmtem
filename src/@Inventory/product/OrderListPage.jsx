'use client'

import { useState, useEffect } from 'react'
import { Typography, TextField, Button, Paper, List, ListItem, CircularProgress } from '@mui/material'

const OrderListPage = () => {
  const [orderLimit, setOrderLimit] = useState(10) // Default to 10 orders
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/orderlist?limit=${orderLimit}`)
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      setOrders(data.orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
    setLoading(false)
  }

  // Fetch orders whenever the orderLimit changes
  useEffect(() => {
    fetchOrders()
  }, [orderLimit])

  // Handle order deletion
  const handleDeleteOrder = async orderId => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/orderlist/${orderId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete order')
      }

      alert('Order deleted successfully!')
      setOrders(orders.filter(order => order.id !== orderId)) // Remove deleted order from UI
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('Failed to delete order.')
    }
    setDeleting(false)
  }

  return (
    <div className='shadow-lg px-6 py-6 rounded-md'>
      <Typography variant='h4' sx={{ textAlign: 'center', marginBottom: 4 }}>
        Order Management
      </Typography>

      {/* Input for Order Limit */}
      <TextField
        type='number'
        label='Number of Latest Orders'
        variant='outlined'
        fullWidth
        value={orderLimit}
        onChange={e => setOrderLimit(e.target.value)}
        sx={{ marginBottom: 3 }}
      />

      <Button variant='contained' fullWidth sx={{ marginBottom: 3 }} onClick={fetchOrders} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Fetch Orders'}
      </Button>

      {/* Order List */}
      <Paper sx={{ padding: 3, borderRadius: 2 }}>
        <Typography variant='h6' gutterBottom>
          Latest Orders
        </Typography>

        {orders.length === 0 ? (
          <Typography>No orders found.</Typography>
        ) : (
          <List>
            {orders.map(order => (
              <ListItem
                key={order.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #e0e0e0',
                  paddingBottom: 2,
                  marginBottom: 2
                }}
              >
                <Typography>
                  <strong>Invoice #:</strong> {order.invoiceNumber}
                </Typography>
                <Typography>
                  <strong>Total:</strong> {order.finalTotal} PKR
                </Typography>
                <Button
                  variant='contained'
                  color='error'
                  onClick={() => handleDeleteOrder(order.id)}
                  disabled={deleting}
                >
                  {deleting ? <CircularProgress size={18} color='inherit' /> : 'Delete'}
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </div>
  )
}

export default OrderListPage
