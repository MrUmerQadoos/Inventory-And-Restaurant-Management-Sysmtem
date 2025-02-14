'use client'
import React, { useState, useEffect, useRef } from 'react'
import {
  Grid,
  Typography,
  Button,
  Modal,
  Box,
  TextField,
  CircularProgress,
  Autocomplete,
  Paper,
  List,
  ListItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  TableBody
} from '@mui/material'
import { useReactToPrint } from 'react-to-print'
import OrderPrintComponent from './OrderPrintComponent'

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
  maxHeight: '90vh',
  overflowY: 'auto'
}

const OrderManagement = () => {
  const [products, setProducts] = useState([]) // Store all products fetched from API
  const [orders, setOrders] = useState([]) // Store fetched orders

  const [orderItems, setOrderItems] = useState([]) // Store items added to the order
  const [currentProduct, setCurrentProduct] = useState(null) // Currently selected product
  const [quantity, setQuantity] = useState(1) // Quantity input
  const [orderType, setOrderType] = useState('Dine-in') // Selected order type
  const [searchText, setSearchText] = useState('') // Text for filtering products
  const [openModal, setOpenModal] = useState(false) // Modal state for displaying the order preview
  const [openPaymentModal, setOpenPaymentModal] = useState(false) // Payment modal state
  const [paymentMethod, setPaymentMethod] = useState(null) // Payment method (Cash/Card)
  const [cashPaid, setCashPaid] = useState('') // For cash payments
  const [transactionNumber, setTransactionNumber] = useState('') // For card payments
  const [finalizeLoading, setFinalizeLoading] = useState(false) // Loading state for payment finalization
  const [orderToPrint, setOrderToPrint] = useState(null) // Store order details for printing
  const [showPrintButton, setShowPrintButton] = useState(false) // Track Print button visibility

  const [showCustomer, setShowCustomer] = useState(false) // Toggle Customer Section
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')

  const printRef = useRef(null) // ✅ Initialize correctly

  const handlePrint = useReactToPrint({
    content: () => printRef.current || null, // ✅ Prevent null errors
    documentTitle: 'Invoice Print',
    onAfterPrint: () => alert('Invoice Printed Successfully!')
  })

  const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0) // ✅ Define totalAmount first
  // New version
  const deliveryCharge = orderType === 'Delivery' ? 40 : 0

  const handleAddProduct = () => {
    if (!currentProduct || quantity <= 0) return

    const productItem = {
      id: currentProduct.id,
      name: currentProduct.name,
      quantity,
      sellingPrice: currentProduct.sellingPrice,
      totalPrice: currentProduct.sellingPrice * quantity
    }

    setOrderItems([...orderItems, productItem])
    setQuantity(1)
    setCurrentProduct(null)
  }

  const handleOpenPaymentModal = () => {
    setOpenPaymentModal(true) // Open the payment modal
  }

  const handleRemoveProduct = index => {
    setOrderItems(prevItems => prevItems.filter((_, i) => i !== index)) // ✅ Removes the selected product
  }

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false) // Close the payment modal
  }

  const handleFinalizePayment = async () => {
    setFinalizeLoading(true)

    if (!paymentMethod) {
      alert('Please select a payment method.')
      setFinalizeLoading(false)
      return
    }

    let paymentDetails = {}
    if (paymentMethod === 'Cash') {
      const cashReceived = Number(cashPaid)
      if (cashReceived < totalAmount) {
        alert('Cash paid is less than the total amount.')
        setFinalizeLoading(false)
        return
      }
      paymentDetails = {
        method: 'Cash',
        cashPaid: cashReceived,
        returnCash: cashReceived - totalAmount
      }
    } else if (paymentMethod === 'Card') {
      if (!transactionNumber) {
        alert('Please enter a valid transaction number.')
        setFinalizeLoading(false)
        return
      }
      paymentDetails = {
        method: 'Card',
        transactionNumber
      }
    }

    const invoiceNumber = Math.floor(1000 + Math.random() * 9000)

    const orderData = {
      invoiceNumber,
      orderType,
      orderItems: orderItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
        totalPrice: item.totalPrice
      })),
      totalAmount,
      deliveryCharge,
      paymentDetails,
      timestamp: new Date().toISOString(),
      customer: showCustomer
        ? {
            name: customerName,
            phone: customerPhone,
            address: customerAddress
          }
        : null // ✅ If customer info is not provided, keep it null
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Server Error:', result)
        alert(result.message || 'Failed to place the order.')
        setFinalizeLoading(false)
        return
      }

      alert('Order placed successfully!')
      setOrderToPrint(orderData)
      setOrderItems([])

      // Fetch the latest orders and update the state
      const latestOrdersResponse = await fetch('/api/orders')
      if (latestOrdersResponse.ok) {
        const latestOrdersData = await latestOrdersResponse.json()
        setOrders(latestOrdersData.orders)
      }

      setTimeout(() => {
        handlePrintInvoice()
      }, 500)
    } catch (error) {
      console.error('Network Error:', error)
      alert('Network error. Please check your internet connection.')
    }

    setFinalizeLoading(false)
    setOpenPaymentModal(false)
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders') // Fetch all orders
        if (!response.ok) throw new Error('Failed to fetch orders')
        const data = await response.json()

        console.log('Fetched Orders:', data.orders) // ✅ Debugging Log
        setOrders(data.orders) // ✅ Ensure orders are stored in state
      } catch (error) {
        console.error('Error fetching orders:', error)
      }
    }

    fetchOrders()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products') // Fetch product data
        if (!response.ok) throw new Error('Failed to fetch products')
        const data = await response.json()
        setProducts(data) // Set products from the API response
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter(
    product => product.name.toLowerCase().includes(searchText.toLowerCase()) // Filter products based on search text
  )

  const handlePrintOrder = order => {
    console.log('Printing Order:', order) // ✅ Debugging Log
    setOrderToPrint(order)
    setTimeout(() => {
      handlePrintInvoice()
    }, 500)
  }

  const handlePrintInvoice = () => {
    if (!orderToPrint) {
      alert('No order to print')
      return
    }

    console.log('Order Being Printed:', orderToPrint) // ✅ Debugging Log

    const invoiceWindow = window.open('', '_blank')
    if (invoiceWindow) {
      invoiceWindow.document.write(`
        <html>
        <head>
          <title>Invoice #${orderToPrint.invoiceNumber}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              text-align: center;
              margin: 0;
              padding: 5px;
            }
            h2, h3 {
              margin: 5px 0;
            }
            .invoice-header {
              font-size: 16px;
              font-weight: bold;
            }
            .contact-info {
              font-size: 10px;
              margin-bottom: 10px;
            }
            .divider {
              border-top: 1px dashed black;
              margin: 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 5px;
              text-align: left;
            }
            th, td {
              font-size: 10px;
              padding: 3px;
            }
            .total-section {
              font-size: 12px;
              font-weight: bold;
            }
            .footer {
              font-size: 10px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <h2 class="invoice-header">BAIT AL NEMA</h2>
          <p class="contact-info">
            Main Gt Rd, Taj Town, Kamoke, Pakistan<br>
            Mobile: 0315 588 8660, 0309 588 8660<br>
            www.baitalnema.com
          </p>

          <h3>Invoice</h3>
          <p><strong>Invoice No:</strong> ${orderToPrint.invoiceNumber}</p>
          <p><strong>Date:</strong> ${new Date(orderToPrint.timestamp).toLocaleString()}</p>
          <p><strong>Customer:</strong> Walk-In Customer</p>

          <div class="divider"></div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderToPrint.orderItems
                .map(
                  (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.sellingPrice} PKR</td>
                  <td>${item.totalPrice} PKR</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <p class="total-section">Total Items: ${orderToPrint.orderItems.length}</p>
          <div class="divider"></div>

         <p class="total-section">Subtotal: Rs ${orderToPrint.totalAmount.toFixed(2)}</p>
<p class="total-section">Total: Rs ${orderToPrint.totalAmount.toFixed(2)}</p>

          ${
            orderToPrint.paymentDetails.method === 'Cash'
              ? `
              <p class="total-section">Cash Paid: Rs ${orderToPrint.paymentDetails.cashPaid.toFixed(2)}</p>
              <p class="total-section">Return Cash: Rs ${orderToPrint.paymentDetails.returnCash.toFixed(2)}</p>
            `
              : `<p class="total-section">Payment Method: ${orderToPrint.paymentDetails.method}</p>`
          }

          <div class="divider"></div>

          <p class="footer">pak twon 0324 8785628</p>

          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
        </html>
      `)
      invoiceWindow.document.close()
    } else {
      alert('Failed to open print window. Please allow pop-ups.')
    }
  }

  return (
    <div className='shadow-lg px-6 py-6 rounded-md'>
      <Box sx={{ padding: 4, backgroundColor: '#f4f6f8', borderRadius: 2 }}>
        {/* Main Title */}
        <Typography variant='h4' sx={{ marginBottom: 4, textAlign: 'center' }}>
          Order Management
        </Typography>

        {/* Main Grid Container */}
        <Grid container spacing={4}>
          {/* Left Section - Order Management */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ padding: 3, borderRadius: 2 }}>
              <Typography variant='h6' gutterBottom>
                Select Menu Item
              </Typography>

              {/* Autocomplete for selecting product */}
              <Autocomplete
                options={filteredProducts}
                getOptionLabel={option => option.name}
                value={currentProduct || null}
                onChange={(event, newValue) => setCurrentProduct(newValue)}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Search Menu Item'
                    variant='outlined'
                    fullWidth
                    sx={{ marginBottom: 2 }}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                  />
                )}
              />

              {/* Quantity Input */}
              <TextField
                label='Quantity'
                type='number'
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                variant='outlined'
                fullWidth
                sx={{ marginBottom: 2 }}
              />

              <Button
                variant='outlined'
                fullWidth
                sx={{ marginBottom: 2 }}
                onClick={() => setShowCustomer(!showCustomer)}
              >
                {showCustomer ? 'Hide Customer Info' : 'Add Customer Info'}
              </Button>

              {showCustomer && (
                <Box sx={{ marginBottom: 2 }}>
                  <TextField
                    label='Customer Name'
                    variant='outlined'
                    fullWidth
                    sx={{ marginBottom: 2 }}
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                  <TextField
                    label='Phone Number'
                    variant='outlined'
                    fullWidth
                    sx={{ marginBottom: 2 }}
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                  />
                  <TextField
                    label='Address'
                    variant='outlined'
                    fullWidth
                    sx={{ marginBottom: 2 }}
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                  />
                </Box>
              )}

              {/* Add Product Button */}
              <Button variant='contained' fullWidth sx={{ marginBottom: 3 }} onClick={handleAddProduct}>
                Add Product
              </Button>

              {/* Order Type Selection */}
              <Typography variant='h6' gutterBottom>
                Select Order Type
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, marginBottom: 3 }}>
                <Button
                  variant={orderType === 'Dine-in' ? 'contained' : 'outlined'}
                  onClick={() => setOrderType('Dine-in')}
                >
                  Dine-in
                </Button>
                <Button
                  variant={orderType === 'Takeaway' ? 'contained' : 'outlined'}
                  onClick={() => setOrderType('Takeaway')}
                >
                  Takeaway
                </Button>
                <Button
                  variant={orderType === 'Delivery' ? 'contained' : 'outlined'}
                  onClick={() => setOrderType('Delivery')}
                >
                  Delivery (+40 PKR)
                </Button>
              </Box>

              {/* Order Summary */}
              <Typography variant='h6' gutterBottom>
                Order Summary
              </Typography>
              <List>
                {orderItems.length > 0 ? (
                  orderItems.map((item, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 1
                      }}
                    >
                      <Box>
                        {item.name} - {item.quantity} x {item.sellingPrice} = {item.totalPrice} PKR
                      </Box>
                      <Button color='error' onClick={() => handleRemoveProduct(index)}>
                        Remove
                      </Button>
                    </ListItem>
                  ))
                ) : (
                  <Typography>No items added yet.</Typography>
                )}
              </List>

              {/* Totals */}
              <Typography variant='body1' sx={{ marginTop: 2 }}>
                <strong>Subtotal:</strong> {totalAmount} PKR
              </Typography>
              {/* {orderType === 'Delivery' && (
                <Typography variant='body1'>
                  <strong>Delivery Charges:</strong> 40 PKR
                </Typography>
              )} */}
              <Typography variant='h6' sx={{ marginBottom: 2 }}>
                <strong>Total:</strong> {totalAmount} PKR
              </Typography>

              {/* Buttons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant='contained' color='primary' onClick={handleOpenPaymentModal} fullWidth>
                  Place Order
                </Button>
                {showPrintButton && (
                  <Button variant='contained' color='secondary' onClick={handlePrintInvoice} fullWidth>
                    Print Invoice
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Right Section - Recent Orders */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ padding: 3, borderRadius: 2 }}>
              <Typography variant='h6' gutterBottom>
                Recent Orders
              </Typography>

              {orders.length === 0 ? (
                <Typography>No orders yet.</Typography>
              ) : (
                // Wrap each order in a Grid item so it appears as a separate "card"
                <Grid container spacing={2}>
                  {orders.map(order => (
                    <Grid item xs={12} key={order.id}>
                      <Paper elevation={3} sx={{ p: 2 }}>
                        {/* Top-level info */}
                        <Typography variant='subtitle1' gutterBottom>
                          <strong>Invoice #:</strong> {order.invoiceNumber}
                        </Typography>
                        <Typography variant='body2'>
                          <strong>Order Type:</strong> {order.orderType}
                        </Typography>
                        <Typography variant='body2' sx={{ mb: 1 }}>
                          <strong>Customer:</strong>{' '}
                          {order.customer?.name ? (
                            <>
                              {order.customer.name}
                              {order.customer.phone && <> | Phone: {order.customer.phone}</>}
                              {order.customer.address && <> | Addr: {order.customer.address}</>}
                            </>
                          ) : (
                            'N/A'
                          )}
                        </Typography>

                        <Typography variant='body2'>
                          <strong>Payment Method:</strong> {order.paymentDetails?.method || 'N/A'}
                        </Typography>
                        {order.paymentDetails?.method === 'Cash' && (
                          <>
                            <Typography variant='body2'>Cash Paid: {order.paymentDetails.cashPaid}</Typography>
                            <Typography variant='body2'>Return Cash: {order.paymentDetails.returnCash}</Typography>
                          </>
                        )}
                        {order.paymentDetails?.method === 'Card' && (
                          <Typography variant='body2'>
                            Transaction #: {order.paymentDetails.transactionNumber}
                          </Typography>
                        )}

                        <Typography variant='body2' sx={{ mt: 1 }}>
                          <strong>Total (PKR):</strong> {order.totalAmount}
                        </Typography>

                        {/* Button(s) */}
                        <Button
                          variant='contained'
                          color='success'
                          sx={{ mt: 1 }}
                          onClick={() => handlePrintOrder(order)}
                        >
                          Print
                        </Button>

                        {/* Order Items (nested table or list) */}
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
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Modal for Payment */}
      <Modal open={openPaymentModal} onClose={handleClosePaymentModal}>
        <Box sx={modalStyle}>
          <Typography variant='h6' component='h2'>
            Select Payment Method
          </Typography>

          <Button
            variant='contained'
            onClick={() => setPaymentMethod('Cash')}
            style={{
              backgroundColor: '#A259FF',
              color: 'white',
              marginRight: '10px',
              marginTop: '20px',
              width: '100px'
            }}
          >
            Cash
          </Button>
          <Button
            variant='contained'
            onClick={() => setPaymentMethod('Card')}
            style={{
              backgroundColor: '#BDBDBD',
              color: 'white',
              marginRight: '10px',
              marginTop: '20px',
              width: '100px'
            }}
          >
            Card
          </Button>

          {paymentMethod === 'Cash' && (
            <div>
              <Typography variant='body1'>Enter Cash Paid:</Typography>
              <TextField
                label='Cash Paid'
                type='number'
                variant='outlined'
                fullWidth
                value={cashPaid}
                onChange={e => setCashPaid(e.target.value)}
                style={{ marginBottom: '10px' }}
              />
            </div>
          )}

          {paymentMethod === 'Card' && (
            <div>
              <Typography variant='body1'>Enter Transaction Number:</Typography>
              <TextField
                label='Transaction Number'
                type='text'
                variant='outlined'
                fullWidth
                value={transactionNumber}
                onChange={e => setTransactionNumber(e.target.value)}
                style={{ marginBottom: '10px' }}
              />
            </div>
          )}

          <Button
            variant='contained'
            onClick={handleFinalizePayment}
            style={{
              backgroundColor: '#A259FF',
              color: 'white',
              marginTop: '20px',
              width: '150px'
            }}
            disabled={finalizeLoading}
          >
            {finalizeLoading ? <CircularProgress size={24} style={{ color: 'white' }} /> : 'Finalize Payment'}
          </Button>
        </Box>
      </Modal>
      {orderToPrint && (
        <div style={{ display: 'none' }}>
          <div ref={printRef}>
            <h2>Invoice #{orderToPrint.invoiceNumber}</h2>
            <p>Order Type: {orderToPrint.orderType}</p>
            <p>Total: {orderToPrint.totalAmount} PKR</p>
            {/* Add More Order Details Here */}
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderManagement
