'use client'
import { useState, useEffect, useRef } from 'react'
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
  ListItem
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

  const printRef = useRef(null) // ✅ Initialize correctly

  const handlePrint = useReactToPrint({
    content: () => printRef.current || null, // ✅ Prevent null errors
    documentTitle: 'Invoice Print',
    onAfterPrint: () => alert('Invoice Printed Successfully!')
  })

  const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0) // ✅ Define totalAmount first
  const deliveryCharge = orderType === 'Delivery' ? 280 : 0
  const finalTotal = totalAmount + deliveryCharge // ✅ No more ReferenceError

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
      if (cashReceived < finalTotal) {
        alert('Cash paid is less than the total amount.')
        setFinalizeLoading(false)
        return
      }
      paymentDetails = {
        method: 'Cash',
        cashPaid: cashReceived,
        returnCash: cashReceived - finalTotal
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
      finalTotal,
      paymentDetails,
      timestamp: new Date().toISOString()
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
            body { font-family: Arial, sans-serif; padding: 10px; text-align: center; }
            h2, h3 { margin: 5px 0; }
            .invoice-header { font-size: 18px; font-weight: bold; }
            .contact-info { font-size: 12px; margin-bottom: 10px; }
            .divider { border-top: 1px solid black; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; text-align: left; }
            th, td { border: 1px solid black; padding: 5px; font-size: 12px; }
            th { background-color: #f2f2f2; }
            .total-section { margin-top: 10px; font-size: 14px; font-weight: bold; }
            .footer { margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <h2 class="invoice-header">BAIT AL NEMA</h2>
          <p class="contact-info">
            Main Gt Rd, Taj Town, Kamoke, Pakistan<br>
            www.baitalnema.com
          </p>
          <h3>Invoice</h3>
          <p><strong>Invoice No:</strong> ${orderToPrint.invoiceNumber}</p>
          <p><strong>Date:</strong> ${new Date(orderToPrint.timestamp).toLocaleString()}</p>
          <p><strong>Customer:</strong> Walk-In Customer</p>
          <p><strong>Mobile:</strong> -</p>

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
          <p class="total-section">Total: Rs ${orderToPrint.finalTotal.toFixed(2)}</p>
          <p class="total-section">Current Due: Rs ${orderToPrint.finalTotal.toFixed(2)}</p>

          <div class="divider"></div>

          <p class="footer">
            pak twon 0324 8785628
          </p>

          <p class="total-section">Last Invoice No.: ${orderToPrint.invoiceNumber}</p>
          <p class="total-section">Last Visit Date: ${new Date(orderToPrint.timestamp).toLocaleString()}</p>

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
                Select Product
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
                    label='Search Products'
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
                  Delivery (+280 PKR)
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
              {orderType === 'Delivery' && (
                <Typography variant='body1'>
                  <strong>Delivery Charges:</strong> 280 PKR
                </Typography>
              )}
              <Typography variant='h6' sx={{ marginBottom: 2 }}>
                <strong>Total:</strong> {finalTotal} PKR
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
                <List>
                  {orders.map(order => (
                    <ListItem
                      key={order.id}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        borderBottom: '1px solid #e0e0e0',
                        paddingBottom: 2,
                        marginBottom: 2
                      }}
                    >
                      <Typography>
                        <strong>Invoice #:</strong> {order.invoiceNumber}
                      </Typography>
                      <Typography>
                        <strong>Order Type:</strong> {order.orderType}
                      </Typography>
                      <Typography>
                        <strong>Total:</strong> {order.finalTotal} PKR
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, marginTop: 1 }}>
                        <Button variant='outlined' color='primary' onClick={() => handlePrintOrder(order)}>
                          Print
                        </Button>
                        <Button variant='contained' color='success'>
                          Done
                        </Button>
                      </Box>
                    </ListItem>
                  ))}
                </List>
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
            <p>Total: {orderToPrint.finalTotal} PKR</p>
            {/* Add More Order Details Here */}
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderManagement
