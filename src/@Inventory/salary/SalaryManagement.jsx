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
  Paper
} from '@mui/material'

const SalaryManagement = () => {
  const [employees, setEmployees] = useState([]) // List of all employees
  const [completedSalaries, setCompletedSalaries] = useState([]) // Completed salaries
  const [payAmount, setPayAmount] = useState({}) // Input for custom pay amounts

  useEffect(() => {
    // Fetch employees on component mount
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees') // API endpoint
        const data = await response.json()
        const unpaid = data.filter(emp => emp.status === 'Unpaid')
        const paid = data.filter(emp => emp.status === 'Paid')
        setEmployees(unpaid)
        setCompletedSalaries(paid)
      } catch (error) {
        console.error('Error fetching employees:', error)
      }
    }

    fetchEmployees()
  }, [])

  const handlePaySalary = async employeeId => {
    // Get pay amount
    const payAmountValue = parseFloat(payAmount[employeeId] || 0)
    if (payAmountValue <= 0) {
      alert('Please enter a valid payment amount.')
      return
    }

    try {
      const response = await fetch(`/api/salary/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Paid', amountPaid: payAmountValue })
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        setEmployees(prev => prev.filter(emp => emp.id !== employeeId)) // Remove from pending
        setCompletedSalaries(prev => [...prev, updatedEmployee]) // Add to completed
        setPayAmount(prev => ({ ...prev, [employeeId]: '' })) // Reset input
      }
    } catch (error) {
      console.error('Error paying salary:', error)
    }
  }

  return (
    <div className='shadow-lg px-6 py-6 rounded-md'>
      <Typography variant='h4' gutterBottom>
        Employee Salary Management
      </Typography>

      <Typography variant='h5' style={{ marginTop: '20px' }}>
        Pending Salaries
      </Typography>
      <TableContainer component={Paper} style={{ marginTop: '10px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Total Salary</TableCell>
              <TableCell>Pay Amount</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map(employee => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.designation}</TableCell>
                <TableCell>{employee.salary}</TableCell>
                <TableCell>
                  <TextField
                    type='number'
                    value={payAmount[employee.id] || ''}
                    onChange={e => setPayAmount(prev => ({ ...prev, [employee.id]: e.target.value }))}
                    placeholder='Enter amount'
                  />
                </TableCell>
                <TableCell align='right'>
                  <Button variant='contained' color='primary' onClick={() => handlePaySalary(employee.id)}>
                    Pay
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant='h5' style={{ marginTop: '20px' }}>
        Completed Salaries
      </Typography>
      <TableContainer component={Paper} style={{ marginTop: '10px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Total Salary</TableCell>
              <TableCell>Amount Paid</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {completedSalaries.map(employee => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.designation}</TableCell>
                <TableCell>{employee.salary}</TableCell>
                <TableCell>{employee.amountPaid}</TableCell>
                <TableCell>{employee.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default SalaryManagement
