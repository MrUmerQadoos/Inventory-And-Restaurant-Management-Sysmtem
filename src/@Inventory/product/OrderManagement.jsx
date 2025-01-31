'use client'
import { useState, useEffect, useRef } from 'react'
import { Grid, Typography, Button, Modal, Box, TextField, CircularProgress, Autocomplete } from '@mui/material'
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
      setTimeout(() => {
        handlePrintInvoice()
      }, 500)
      setOrderItems([])
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
            Mobile: 0315 588 8660, 0309 588 8660<br>
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
          <p class="total-section">Waiter Tip: Rs 0.00</p>
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
      <Typography variant='h4'>Order Management</Typography>
      <Grid container spacing={6} className='mt-4'>
        <Grid item xs={12} md={6}>
          <Typography variant='h6'>Select Product</Typography>

          {/* Autocomplete for selecting product */}
          <Autocomplete
            fullWidth
            value={currentProduct || null}
            onChange={(event, newValue) => setCurrentProduct(newValue)} // Update the selected product
            options={filteredProducts}
            getOptionLabel={option => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={params => (
              <TextField
                {...params}
                label='Search Products'
                variant='outlined'
                fullWidth
                style={{ marginBottom: '20px' }}
                value={searchText}
                onChange={e => setSearchText(e.target.value)} // Handle search text change
              />
            )}
          />

          <TextField
            label='Quantity'
            type='number'
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            variant='outlined'
            fullWidth
            style={{ marginBottom: '20px' }}
          />

          <Button variant='contained' color='primary' onClick={handleAddProduct}>
            Add Product
          </Button>

          <Typography variant='h6'>Select Order Type</Typography>
          <Button variant={orderType === 'Dine-in' ? 'contained' : 'outlined'} onClick={() => setOrderType('Dine-in')}>
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
          <Grid container spacing={2} className='mt-4'>
            <Grid item xs={12}>
              <Typography variant='h6'>Order Summary</Typography>
              {orderItems.length > 0 && (
                <ul>
                  {orderItems.map((item, index) => (
                    <li key={index}>
                      {item.name} - {item.quantity} x {item.sellingPrice} = {item.totalPrice} PKR
                      <Button onClick={() => handleRemoveProduct(index)}>❌</Button>
                    </li>
                  ))}
                </ul>
              )}

              <Typography variant='body1'>
                <strong>Subtotal:</strong> {totalAmount} PKR
              </Typography>
              {orderType === 'Delivery' && (
                <Typography variant='body1'>
                  <strong>Delivery Charges:</strong> 280 PKR
                </Typography>
              )}
              <Typography variant='h6'>
                <strong>Total:</strong> {finalTotal} PKR
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2} className='mt-4'>
            <Grid item>
              <Button variant='contained' color='primary' onClick={handleOpenPaymentModal}>
                Order Place
              </Button>
            </Grid>

            {/* ✅ Show Print button only if payment is finalized */}
            {showPrintButton && (
              <Grid item>
                <Button variant='contained' color='secondary' onClick={handlePrintInvoice}>
                  Print Invoice
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant='h6'>Recent Orders</Typography>
        {orders.length === 0 ? (
          <Typography>No orders yet</Typography>
        ) : (
          <ul>
            {orders.map(order => (
              <li key={order.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
                <p>
                  <strong>Invoice #:</strong> {order.invoiceNumber}
                </p>
                <p>
                  <strong>Order Type:</strong> {order.orderType}
                </p>
                <p>
                  <strong>Total:</strong> {order.finalTotal} PKR
                </p>
                <Button variant='contained' color='secondary' onClick={() => handlePrintOrder(order)}>
                  Print
                </Button>
                <Button variant='contained' color='primary' style={{ marginLeft: '10px' }}>
                  Done
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Grid>

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
