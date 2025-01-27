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
  Autocomplete
} from '@mui/material'

const ProductPage = () => {
  const [inventoryItems, setInventoryItems] = useState([]) // Fetch inventory items
  const [products, setProducts] = useState([]) // Store products
  const [selectedItem, setSelectedItem] = useState(null) // Selected inventory item
  const [amount, setAmount] = useState('') // Amount of item
  const [price, setPrice] = useState('') // Calculated price
  const [actualPrice, setActualPrice] = useState('') // Manual actual price
  const [sellingPrice, setSellingPrice] = useState('') // Manual selling price
  const [loading, setLoading] = useState(false) // Loading state
  const [editingProduct, setEditingProduct] = useState(null) // For update operation

  useEffect(() => {
    // Fetch inventory items
    const fetchInventoryItems = async () => {
      try {
        const response = await fetch('/api/inventory')
        const data = await response.json()
        setInventoryItems(data)
      } catch (error) {
        console.error('Error fetching inventory items:', error)
      }
    }

    // Fetch products
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }

    fetchInventoryItems()
    fetchProducts()
  }, [])

  useEffect(() => {
    // Automatically calculate price when selectedItem or amount changes
    if (selectedItem && amount) {
      const calculatedPrice = parseFloat(selectedItem.UnitPrice) * parseInt(amount, 10)
      setPrice(calculatedPrice.toFixed(2)) // Format to 2 decimal places
    } else {
      setPrice('')
    }
  }, [selectedItem, amount])

  const handleAddOrUpdateProduct = async event => {
    event.preventDefault()
    if (!selectedItem || !amount || !actualPrice || !sellingPrice) return

    setLoading(true)
    try {
      const productData = {
        name: selectedItem.name,
        amount: parseInt(amount, 10),
        price: parseFloat(price),
        actualPrice: parseFloat(actualPrice),
        sellingPrice: parseFloat(sellingPrice)
      }

      let response
      if (editingProduct) {
        // Update existing product
        response = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })
      } else {
        // Add new product
        response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })
      }

      if (response.ok) {
        const updatedOrNewProduct = await response.json()
        if (editingProduct) {
          setProducts(products.map(p => (p.id === editingProduct.id ? updatedOrNewProduct : p)))
        } else {
          setProducts([...products, updatedOrNewProduct])
        }
        clearForm()
      }
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditProduct = product => {
    setEditingProduct(product)
    setSelectedItem(inventoryItems.find(item => item.name === product.name))
    setAmount(product.amount.toString())
    setPrice(product.price.toString())
    setActualPrice(product.actualPrice.toString())
    setSellingPrice(product.sellingPrice.toString())
  }

  const handleDeleteProduct = async id => {
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setProducts(products.filter(product => product.id !== id))
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const clearForm = () => {
    setEditingProduct(null)
    setSelectedItem(null)
    setAmount('')
    setPrice('')
    setActualPrice('')
    setSellingPrice('')
  }

  return (
    <div className='shadow-lg px-6 py-6 rounded-md'>
      <Typography variant='h4' gutterBottom>
        {editingProduct ? 'Update Product' : 'Add Product'}
      </Typography>
      <form onSubmit={handleAddOrUpdateProduct}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={inventoryItems}
              getOptionLabel={option => option.name}
              value={selectedItem}
              onChange={(e, value) => setSelectedItem(value)}
              renderInput={params => <TextField {...params} label='Select Item' required />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label='Amount'
              type='number'
              fullWidth
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              InputProps={{ readOnly: !!editingProduct }} // Make read-only if editing
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField label='Price' type='text' fullWidth value={price} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label='Actual Price'
              type='number'
              fullWidth
              value={actualPrice}
              onChange={e => setActualPrice(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label='Selling Price'
              type='number'
              fullWidth
              value={sellingPrice}
              onChange={e => setSellingPrice(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant='contained' color='primary' type='submit' disabled={loading}>
              {loading ? (
                <CircularProgress size={24} color='inherit' />
              ) : editingProduct ? (
                'Update Product'
              ) : (
                'Add Product'
              )}
            </Button>
            {editingProduct && (
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
              <TableCell>Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Actual Price</TableCell>
              <TableCell>Selling Price</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(product => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.amount}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.actualPrice}</TableCell>
                <TableCell>{product.sellingPrice}</TableCell>
                <TableCell align='right'>
                  <Button variant='outlined' onClick={() => handleEditProduct(product)}>
                    Edit
                  </Button>
                  <Button
                    variant='outlined'
                    color='error'
                    onClick={() => handleDeleteProduct(product.id)}
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

export default ProductPage
