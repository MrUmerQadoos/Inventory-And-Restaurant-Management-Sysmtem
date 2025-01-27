'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Typography,
  Button,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const InvoiceReport = () => {
  const [inventoryData, setInventoryData] = useState([])
  const [salesData, setSalesData] = useState([])
  const [salariesData, setSalariesData] = useState([])
  const [expensesData, setExpensesData] = useState([])
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [inventoryRes, salesRes, salariesRes, expensesRes] = await Promise.all([
        fetch(`/api/invoice/inventory?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        fetch(`/api/invoice/sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        fetch(`/api/invoice/salaries?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        fetch(`/api/invoice/overhead-expenses?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      ])

      setInventoryData(await inventoryRes.json())
      setSalesData(await salesRes.json())
      setSalariesData(await salariesRes.json())
      setExpensesData(await expensesRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const calculateTotals = () => {
    const inventoryTotal = inventoryData.reduce((sum, item) => sum + item.price, 0)
    const salesTotal = salesData.reduce((sum, item) => sum + item.amount, 0)
    const salariesTotal = salariesData.reduce((sum, salary) => sum + salary.amountPaid, 0)
    const expensesTotal = expensesData.reduce((sum, expense) => sum + expense.amount, 0)

    return {
      inventoryTotal,
      salesTotal,
      salariesTotal,
      expensesTotal,
      grandTotal: inventoryTotal + salariesTotal + expensesTotal - salesTotal
    }
  }

  const totals = calculateTotals()

  const handlePrint = () => {
    window.print()
  }

  return (
    <Box sx={{ padding: 4 }}>
      <style>
        {`
          @media print {
            .no-print {
              display: none;
            }
          }
        `}
      </style>
      <Typography variant='h4' gutterBottom>
        Invoice Report
      </Typography>

      <Grid container spacing={3} sx={{ marginBottom: 3 }} className='no-print'>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant='body1'>From:</Typography>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className='date-picker'
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant='body1'>To:</Typography>
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            className='date-picker'
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button variant='contained' onClick={fetchData} sx={{ marginTop: 2 }}>
            Filter
          </Button>
        </Grid>
      </Grid>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Box>
          {/* Section Tables */}
          {['Inventory', 'Sales', 'Salaries', 'Expenses'].map((category, index) => {
            const data =
              category === 'Inventory'
                ? inventoryData
                : category === 'Sales'
                  ? salesData
                  : category === 'Salaries'
                    ? salariesData
                    : expensesData

            return (
              <TableContainer component={Paper} key={index} sx={{ marginBottom: 3 }}>
                <Typography variant='h6' sx={{ padding: 2 }}>
                  {category}
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{(item.price || item.amount || item.amountPaid).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          })}

          {/* Totals */}
          <Typography variant='h5' sx={{ marginTop: 3 }}>
            Totals
          </Typography>
          <ul>
            <li>Inventory Total: {totals.inventoryTotal.toFixed(2)}</li>
            <li>Sales Total: {totals.salesTotal.toFixed(2)}</li>
            <li>Salaries Total: {totals.salariesTotal.toFixed(2)}</li>
            <li>Expenses Total: {totals.expensesTotal.toFixed(2)}</li>
            <li>
              <strong>Grand Total: {totals.grandTotal.toFixed(2)}</strong>
            </li>
          </ul>

          {/* Print Button */}
          <Button
            variant='contained'
            color='secondary'
            onClick={handlePrint}
            sx={{ marginTop: 3 }}
            className='no-print'
          >
            Print Report
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default InvoiceReport
