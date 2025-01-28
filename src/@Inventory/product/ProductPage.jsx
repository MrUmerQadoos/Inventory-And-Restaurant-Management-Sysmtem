'use client'

import { useEffect, useRef, useState } from 'react'
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
  Autocomplete,
  IconButton
} from '@mui/material'
import { Add, Delete, Edit, Print } from '@mui/icons-material'
import ProductPrintComponent from './ProductPrintComponent'

const ProductPage = () => {
  const [inventoryItems, setInventoryItems] = useState([])
  const [products, setProducts] = useState([])
  const [productName, setProductName] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [itemAmount, setItemAmount] = useState('')
  const [addedItems, setAddedItems] = useState([])
  const [actualPrice, setActualPrice] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [inventoryWiseAmount, setInventoryWiseAmount] = useState(0)

  const printRef = useRef()

  useEffect(() => {
    const totalPrice = addedItems.reduce((sum, item) => sum + (item.unitPrice * item.amount || 0), 0)
    setInventoryWiseAmount(totalPrice)
  }, [addedItems])

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await fetch('/api/inventory')
        const data = await response.json()
        setInventoryItems(data)
      } catch (error) {
        console.error('Error fetching inventory items:', error)
      }
    }

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

  const addItemToProduct = () => {
    if (!selectedItem || !itemAmount) return
    const newItem = {
      id: selectedItem.id,
      name: selectedItem.name,
      unitPrice: selectedItem.unitPrice,
      amount: parseInt(itemAmount, 10)
    }
    setAddedItems([...addedItems, newItem])
    setSelectedItem(null)
    setItemAmount('')
  }

  const handleAddOrUpdateProduct = async event => {
    event.preventDefault()
    if (!productName || addedItems.length === 0 || !actualPrice || !sellingPrice) return

    setLoading(true)
    try {
      const productData = {
        name: productName,
        actualPrice: parseFloat(actualPrice),
        sellingPrice: parseFloat(sellingPrice),
        inventoryWiseAmount,
        inventoryItems: addedItems,
        inventoryUsage: JSON.stringify(addedItems)
      }

      let response
      if (editingProduct) {
        response = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })
      } else {
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

  const handleEditProduct = product => {
    setEditingProduct(product)
    setProductName(product.name)
    setActualPrice(product.actualPrice.toString())
    setSellingPrice(product.sellingPrice.toString())

    // If inventoryUsage is a string, parse it. If it's already an object, use it directly.
    let parsedInventoryUsage = []
    if (typeof product.inventoryUsage === 'string') {
      parsedInventoryUsage = JSON.parse(product.inventoryUsage) // Parse if it's a JSON string
    } else if (Array.isArray(product.inventoryUsage)) {
      parsedInventoryUsage = product.inventoryUsage // If it's already an array, use it directly
    }

    // Map inventory usage to the structure you need for addedItems
    const inventoryItemsForEdit = parsedInventoryUsage.map(item => ({
      id: item.id,
      name: item.name,
      unitPrice: item.unitPrice,
      amount: item.amount
    }))

    // Set the addedItems for the edit form
    setAddedItems(inventoryItemsForEdit)
  }

  const handlePrint = product => {
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Product</title>
          <style>
            body { font-family: monospace; font-size: 12px; padding: 10px; }
            .header { text-align: center; }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  const clearForm = () => {
    setEditingProduct(null)
    setProductName('')
    setActualPrice('')
    setSellingPrice('')
    setAddedItems([])
  }

  return (
    <div className='shadow-lg px-6 py-6 rounded-md'>
      <Typography variant='h4' gutterBottom>
        {editingProduct ? 'Update Product' : 'Add Product'}
      </Typography>
      <form onSubmit={handleAddOrUpdateProduct}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label='Product Name'
              type='text'
              fullWidth
              value={productName}
              onChange={e => setProductName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              options={inventoryItems}
              getOptionLabel={option => option.name}
              value={selectedItem}
              onChange={(e, value) => setSelectedItem(value)}
              renderInput={params => <TextField {...params} label='Select Inventory Item' />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label='Amount'
              type='number'
              fullWidth
              value={itemAmount}
              onChange={e => setItemAmount(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button variant='outlined' onClick={addItemToProduct}>
              Add Item
            </Button>
          </Grid>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {addedItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.unitPrice} PKR</TableCell>
                      <TableCell>{item.amount || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label='Inventory Wise Amount'
              type='number'
              fullWidth
              value={inventoryWiseAmount}
              InputProps={{
                readOnly: true
              }}
            />
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
              {loading ? <CircularProgress size={24} /> : 'Save Product'}
            </Button>
          </Grid>
        </Grid>
      </form>

      <Typography variant='h5' gutterBottom>
        Product List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product Name</TableCell>
              <TableCell>Actual Price</TableCell>
              <TableCell>Selling Price</TableCell>
              <TableCell>Inventory Wise Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(product => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.actualPrice} PKR</TableCell>
                <TableCell>{product.sellingPrice} PKR</TableCell>
                <TableCell>{product.inventoryWiseAmount} PKR</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditProduct(product)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteProduct(product.id)}>
                    <Delete />
                  </IconButton>
                  <IconButton onClick={() => handlePrint(product)}>
                    <Print />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Print Preview for the selected product */}
      <div ref={printRef} style={{ display: 'none' }}>
        {products.length > 0 && <ProductPrintComponent product={products[0]} />}
      </div>
    </div>
  )
}

export default ProductPage
