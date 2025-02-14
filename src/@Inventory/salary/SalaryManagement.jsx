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
  const [employees, setEmployees] = useState([]) // All employees with status !== 'Paid'
  const [completedSalaries, setCompletedSalaries] = useState([]) // All employees with status === 'Paid'
  const [payAmount, setPayAmount] = useState({}) // Track how much we are paying each employee

  // Fetch data on mount:
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees')
        const data = await response.json()

        // Split employees by status:
        const pending = data.filter(emp => emp.status !== 'Paid')
        const paid = data.filter(emp => emp.status === 'Paid')

        setEmployees(pending)
        setCompletedSalaries(paid)
      } catch (error) {
        console.error('Error fetching employees:', error)
      }
    }

    fetchEmployees()
  }, [])

  // Pay partial or full salary:
  const handlePaySalary = async employeeId => {
    const pay = parseFloat(payAmount[employeeId] || 0)
    if (pay <= 0) {
      alert('Please enter a valid payment amount.')
      return
    }

    try {
      // Send the payment to the server:
      const response = await fetch(`/api/salary/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountPaid: pay })
      })

      if (!response.ok) {
        console.error('Server Error:', await response.json())
        alert('Failed to update salary')
        return
      }

      const updatedEmployee = await response.json()

      // Clear the input after paying:
      setPayAmount(prev => ({ ...prev, [employeeId]: '' }))

      // If the employee is now fully paid, move them to completed:
      if (updatedEmployee.status === 'Paid') {
        setEmployees(prev => prev.filter(emp => emp.id !== employeeId))
        setCompletedSalaries(prev => [...prev, updatedEmployee])
      } else {
        // Otherwise, update the partial payment info in the pending list:
        setEmployees(prev =>
          prev.map(emp => {
            if (emp.id === employeeId) {
              return updatedEmployee
            }
            return emp
          })
        )
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

      {/* PENDING SALARIES */}
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
              <TableCell>Amount Paid So Far</TableCell>
              <TableCell>Remaining</TableCell>
              <TableCell> Credit Salary</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>No pending salaries</TableCell>
              </TableRow>
            ) : (
              employees.map(employee => {
                const remaining = employee.salary - employee.amountPaid
                return (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.designation}</TableCell>
                    <TableCell>{employee.salary}</TableCell>
                    <TableCell>{employee.amountPaid}</TableCell>
                    <TableCell>{remaining}</TableCell>
                    <TableCell>
                      <TextField
                        type='number'
                        size='small'
                        value={payAmount[employee.id] || ''}
                        onChange={e =>
                          setPayAmount(prev => ({
                            ...prev,
                            [employee.id]: e.target.value
                          }))
                        }
                        placeholder='Enter amount'
                      />
                    </TableCell>
                    <TableCell align='right'>
                      <Button variant='contained' color='primary' onClick={() => handlePaySalary(employee.id)}>
                        Pay
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* COMPLETED SALARIES */}
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
            {completedSalaries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No completed salaries yet</TableCell>
              </TableRow>
            ) : (
              completedSalaries.map(employee => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>{employee.salary}</TableCell>
                  <TableCell>{employee.amountPaid}</TableCell>
                  <TableCell>{employee.status}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default SalaryManagement
