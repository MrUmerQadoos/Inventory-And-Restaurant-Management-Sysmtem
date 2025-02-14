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
import { Delete, Edit } from '@mui/icons-material'
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
  const [expenses, setExpenses] = useState([]) // Store added expenses
  const [expenseName, setExpenseName] = useState('') // Expense name input
  const [expensePrice, setExpensePrice] = useState('') // Expense price input
  const [inventoryCostPrice, setInventoryCostPrice] = useState('') // Add this line to define the state

  const printRef = useRef()

  // Calculate inventory wise amount whenever addedItems change
  useEffect(() => {
    const totalPrice = addedItems.reduce((sum, item) => sum + (item.unitPrice * item.amount || 0), 0)
    setInventoryWiseAmount(totalPrice) // This keeps the inventory wise total up-to-date

    // Calculate inventory cost price and set it
    setInventoryCostPrice(totalPrice.toFixed(2)) // Set the calculated inventory cost price as a fixed number
  }, [addedItems])

  useEffect(() => {
    const totalInventoryCost = addedItems.reduce((sum, item) => sum + (item.unitPrice * item.amount || 0), 0)
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.price, 0)

    setInventoryWiseAmount(totalInventoryCost)
    setActualPrice((totalInventoryCost + totalExpenses).toFixed(2)) // ✅ Updated actual price calculation
  }, [addedItems, expenses])

  // Fetch inventory items and products on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inventoryResponse, productResponse] = await Promise.all([
          fetch('/api/inventory'),
          fetch('/api/products')
        ])
        const [inventoryData, productData] = await Promise.all([inventoryResponse.json(), productResponse.json()])
        setInventoryItems(inventoryData)
        setProducts(productData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const handleAddExpense = () => {
    if (!expenseName || !expensePrice) return

    const newExpense = {
      name: expenseName,
      price: parseFloat(expensePrice)
    }

    setExpenses([...expenses, newExpense])
    setExpenseName('') // Reset expense name input
    setExpensePrice('') // Reset expense price input
  }

  const handleRemoveExpense = expenseIndex => {
    setExpenses(prevExpenses => prevExpenses.filter((_, index) => index !== expenseIndex))
  }

  // Add selected inventory item to product
  const addItemToProduct = () => {
    if (!selectedItem || !itemAmount) return
    const newItem = {
      id: selectedItem.id,
      name: selectedItem.name,
      unitPrice: selectedItem.unitPrice,
      amount: parseInt(itemAmount, 10)
    }
    setAddedItems([...addedItems, newItem]) // Adds new item to the array
    setSelectedItem(null)
    setItemAmount('') // Reset input field for item quantity
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
        inventoryUsage: JSON.stringify(addedItems), // This is fine as JSON.stringify is required for complex objects
        expenses: expenses // Send expenses as an array, not stringified
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
        setProducts(prevProducts =>
          editingProduct
            ? prevProducts.map(p => (p.id === editingProduct.id ? updatedOrNewProduct : p))
            : [...prevProducts, updatedOrNewProduct]
        )
        clearForm()
      }
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearForm = () => {
    setEditingProduct(null)
    setProductName('')
    setActualPrice('')
    setSellingPrice('')
    setAddedItems([])
    setExpenses([]) // Clear expenses here
  }

  const handleDeleteProduct = async id => {
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setProducts(prevProducts => prevProducts.filter(product => product.id !== id))
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

    // Parse inventory items correctly
    const inventoryItemsForEdit = product.inventoryUsage
      ? product.inventoryUsage.map(item => ({
          id: item.id,
          name: item.name,
          unitPrice: item.unitPrice,
          amount: item.amount
        }))
      : []
    setAddedItems(inventoryItemsForEdit)

    // Ensure expenses are properly parsed
    let parsedExpenses = []
    try {
      parsedExpenses = product.expenses ? JSON.parse(product.expenses) : []
    } catch (error) {
      console.error('Error parsing expenses:', error)
    }

    setExpenses(Array.isArray(parsedExpenses) ? parsedExpenses : []) // Ensure it's an array
  }

  return (
    <div className='shadow-lg px-6 py-6 rounded-md'>
      <Typography variant='h4' gutterBottom>
        {editingProduct ? 'Update Menu Item' : 'Add Menu Item'}
      </Typography>
      <form onSubmit={handleAddOrUpdateProduct}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label='Menu Item Name'
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
              label='Quantity'
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
                    <TableCell>Inv Item Name</TableCell>
                    <TableCell>Single Inv Item Price</TableCell>
                    <TableCell>Inv Item Quantity</TableCell>
                    <TableCell>Total Inv Item Price </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {addedItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.unitPrice} PKR</TableCell>
                      <TableCell>{item.amount || 0}</TableCell>
                      <TableCell>{(item.unitPrice * item.amount).toFixed(2)} PKR</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleRemoveItem(index)} color='error'>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid className=' pt-9' container spacing={2}>
            <Grid item xs={4}>
              <TextField
                label='Inventory Cost Price'
                type='number'
                fullWidth
                value={inventoryCostPrice} // This now holds the total cost value
                disabled // Make the input non-editable
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                label='Expense Name'
                type='text'
                fullWidth
                value={expenseName}
                onChange={e => setExpenseName(e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label='Expense Price'
                type='number'
                fullWidth
                value={expensePrice}
                onChange={e => setExpensePrice(e.target.value)}
              />
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Button variant='outlined' onClick={handleAddExpense}>
              Add Expense
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='h6'>Expenses</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Expense Name</TableCell>
                    <TableCell>Expense Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(expenses) &&
                    expenses.map((expense, index) => (
                      <TableRow key={index}>
                        <TableCell>{expense.name}</TableCell>
                        <TableCell>{expense.price} PKR</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleRemoveExpense(index)} color='error'>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label='Actual Cost Price'
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
              {loading ? <CircularProgress size={24} /> : 'Save Menu Item'}
            </Button>
          </Grid>
        </Grid>
      </form>

      <Typography variant='h5' gutterBottom>
        Menu Item List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Menu Item Name</TableCell>
              <TableCell>Actual Cost Price</TableCell>
              <TableCell>Selling Price</TableCell>
              <TableCell>Inventory Cost Amount</TableCell>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Print Preview */}
      <div ref={printRef} style={{ display: 'none' }}>
        {products.length > 0 && <ProductPrintComponent product={products[0]} />}
      </div>
    </div>
  )
}

export default ProductPage
