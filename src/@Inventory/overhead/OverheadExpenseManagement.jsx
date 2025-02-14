'use client'

import { useEffect, useState } from 'react'
import {
  Button,
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material'

const OverheadExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]) // List of overhead expenses
  const [expenseName, setExpenseName] = useState('') // Expense name
  const [expenseAmount, setExpenseAmount] = useState('') // Expense amount
  const [editingExpense, setEditingExpense] = useState(null) // Expense being edited
  const [loading, setLoading] = useState(false) // Loading state

  useEffect(() => {
    // Fetch overhead expenses on component mount
    const fetchExpenses = async () => {
      try {
        const response = await fetch('/api/overhead-expenses') // API endpoint
        const data = await response.json()
        setExpenses(data)
      } catch (error) {
        console.error('Error fetching expenses:', error)
      }
    }

    fetchExpenses()
  }, [])

  const handleAddOrUpdateExpense = async event => {
    event.preventDefault()
    setLoading(true)

    const expenseData = {
      name: expenseName,
      amount: parseFloat(expenseAmount)
    }

    try {
      let response
      if (editingExpense) {
        // Update an existing expense
        response = await fetch(`/api/overhead-expenses/${editingExpense.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expenseData)
        })
      } else {
        // Add a new expense
        response = await fetch('/api/overhead-expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expenseData)
        })
      }

      if (response.ok) {
        const updatedOrNewExpense = await response.json()
        if (editingExpense) {
          setExpenses(prev => prev.map(expense => (expense.id === editingExpense.id ? updatedOrNewExpense : expense)))
        } else {
          setExpenses([...expenses, updatedOrNewExpense])
        }
        clearForm()
      }
    } catch (error) {
      console.error('Error saving expense:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditExpense = expense => {
    setEditingExpense(expense)
    setExpenseName(expense.name)
    setExpenseAmount(expense.amount.toString())
  }

  const handleDeleteExpense = async id => {
    setLoading(true)
    try {
      const response = await fetch(`/api/overhead-expenses/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setExpenses(prev => prev.filter(expense => expense.id !== id))
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearForm = () => {
    setEditingExpense(null)
    setExpenseName('')
    setExpenseAmount('')
  }

  return (
    <div className='shadow-lg px-6 py-6 rounded-md'>
      <Typography variant='h4' gutterBottom>
        Overhead Expense Management
      </Typography>
      <form onSubmit={handleAddOrUpdateExpense}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label='Expense Name'
              variant='outlined'
              fullWidth
              value={expenseName}
              onChange={e => setExpenseName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label='Expense Cost'
              type='number'
              variant='outlined'
              fullWidth
              value={expenseAmount}
              onChange={e => setExpenseAmount(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant='contained' color='primary' type='submit' disabled={loading}>
              {loading ? (
                <CircularProgress size={24} color='inherit' />
              ) : editingExpense ? (
                'Update Expense'
              ) : (
                'Add Expense'
              )}
            </Button>
            {editingExpense && (
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
              <TableCell>Expense Name</TableCell>
              <TableCell>Expense Cost</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map(expense => (
              <TableRow key={expense.id}>
                <TableCell>{expense.name}</TableCell>
                <TableCell>{expense.amount}</TableCell>
                <TableCell align='right'>
                  <Button variant='outlined' onClick={() => handleEditExpense(expense)}>
                    Edit
                  </Button>
                  <Button
                    variant='outlined'
                    color='error'
                    onClick={() => handleDeleteExpense(expense.id)}
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

export default OverheadExpenseManagement
