'use client'
import { useState, useEffect } from 'react'
import {
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Grid,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material'

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

      {/* Order List in Card Style */}
      <Paper sx={{ padding: 3, borderRadius: 2 }}>
        <Typography variant='h6' gutterBottom>
          Latest Orders
        </Typography>

        {orders.length === 0 ? (
          <Typography>No orders found.</Typography>
        ) : (
          <Grid container spacing={2}>
            {orders.map(order => (
              <Grid item xs={12} key={order.id}>
                {/* Each order is a "card" */}
                <Paper elevation={3} sx={{ p: 2 }}>
                  <Typography variant='subtitle1' gutterBottom>
                    <strong>Invoice #:</strong> {order.invoiceNumber}
                  </Typography>
                  <Typography variant='body1'>
                    <strong>Order Type:</strong> {order.orderType}
                  </Typography>
                  <Typography variant='body1' sx={{ mb: 1 }}>
                    <strong>Total (PKR):</strong> {order.finalTotal}
                  </Typography>

                  {/* Customer Info (if available) */}
                  {order.customer && (
                    <Typography variant='body2' sx={{ mb: 1 }}>
                      <strong>Customer:</strong> {order.customer.name}{' '}
                      {order.customer.phone && `| Phone: ${order.customer.phone}`}{' '}
                      {order.customer.address && `| Addr: ${order.customer.address}`}
                    </Typography>
                  )}

                  {/* Payment Details */}
                  <Typography variant='body1'>
                    <strong>Payment Method:</strong> {order.paymentDetails?.method || 'N/A'}
                  </Typography>
                  {order.paymentDetails?.method === 'Cash' && (
                    <>
                      <Typography variant='body2'>Cash Paid: {order.paymentDetails.cashPaid}</Typography>
                      <Typography variant='body2'>Return Cash: {order.paymentDetails.returnCash}</Typography>
                    </>
                  )}
                  {order.paymentDetails?.method === 'Card' && (
                    <Typography variant='body2'>Transaction #: {order.paymentDetails.transactionNumber}</Typography>
                  )}

                  {/* Order Items Table */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant='subtitle2' gutterBottom>
                      Order Items
                    </Typography>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <strong>Product</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Quantity</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Unit Price</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Total Price</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.orderItems.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.sellingPrice}</TableCell>
                            <TableCell>{item.totalPrice}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>

                  {/* Delete Button */}
                  <Button
                    variant='contained'
                    color='error'
                    onClick={() => handleDeleteOrder(order.id)}
                    disabled={deleting}
                    sx={{ mt: 2 }}
                  >
                    {deleting ? <CircularProgress size={18} color='inherit' /> : 'Delete'}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </div>
  )
}

export default OrderListPage
