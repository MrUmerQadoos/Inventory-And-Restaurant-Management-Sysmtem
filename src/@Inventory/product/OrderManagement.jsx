'use client'
import { useState, useEffect } from 'react'
import { Grid, Typography, Button, Modal, Box, TextField, CircularProgress, Autocomplete } from '@mui/material'

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

  const handleAddProduct = () => {
    if (!currentProduct || quantity <= 0) return // Validate before adding

    const productItem = {
      id: currentProduct.id,
      name: currentProduct.name,
      quantity,
      sellingPrice: currentProduct.sellingPrice,
      totalPrice: currentProduct.sellingPrice * quantity
    }

    setOrderItems([...orderItems, productItem]) // Add the product to the order items
    setQuantity(1) // Reset quantity after adding product
    setCurrentProduct(null) // Clear the selected product
  }

  const handleOpenPaymentModal = () => {
    setOpenPaymentModal(true) // Open the payment modal
  }

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false) // Close the payment modal
  }

  const handleFinalizePayment = async () => {
    setFinalizeLoading(true) // Set loading state for finalize button

    const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0) // Calculate total

    let paymentDetails = {}
    if (paymentMethod === 'Cash') {
      const cashReceived = Number(cashPaid)
      if (cashReceived < totalAmount) {
        alert('Cash paid is less than the total amount.')
        setFinalizeLoading(false) // Stop loading
        return
      }
      paymentDetails = {
        method: 'Cash',
        cashPaid: cashReceived,
        returnCash: cashReceived - totalAmount
      }
    } else if (paymentMethod === 'Card') {
      paymentDetails = {
        method: 'Card',
        transactionNumber
      }
    }

    // Prepare the order data including inventory usage (items used in the order)
    const inventoryUsage = orderItems.map(item => ({
      id: item.id, // The inventory item ID
      name: item.name,
      unitPrice: item.sellingPrice, // Price for the item
      amount: item.quantity // Amount used
    }))

    const orderData = {
      orderItems: orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
        totalPrice: item.totalPrice,
        name: item.name
      })),
      totalAmount,
      receptionistName: 'Receptionist Name', // Replace with actual receptionist's name
      inventoryUsage // Include the inventory usage
    }

    // Send the order data to the backend
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()
      if (response.ok) {
        alert('Order placed and inventory updated!')
      } else {
        alert(result.error || 'Failed to place the order')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Something went wrong while placing the order')
    }

    setFinalizeLoading(false) // Reset loading state
    handleClosePaymentModal() // Close the payment modal
  }

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

          <Grid container spacing={2} className='mt-4'>
            <Grid item xs={12}>
              <Typography variant='h6'>Order Summary</Typography>
              {orderItems.length > 0 && (
                <ul>
                  {orderItems.map((item, index) => (
                    <li key={index}>
                      {item.name} - {item.quantity} x {item.sellingPrice} = {item.totalPrice} PKR
                    </li>
                  ))}
                </ul>
              )}
            </Grid>
          </Grid>

          <Button variant='contained' color='primary' onClick={handleOpenPaymentModal} style={{ marginTop: '20px' }}>
            Order Place
          </Button>
        </Grid>
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
    </div>
  )
}

export default OrderManagement
