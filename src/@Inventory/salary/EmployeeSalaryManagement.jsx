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
  Paper
} from '@mui/material'

const EmployeeSalaryManagement = () => {
  const [employees, setEmployees] = useState([]) // List of employees
  const [name, setName] = useState('') // Employee name
  const [designation, setDesignation] = useState('') // Employee designation
  const [salary, setSalary] = useState('') // Employee salary
  const [editingEmployee, setEditingEmployee] = useState(null) // For update operation
  const [loading, setLoading] = useState(false) // Loading state

  useEffect(() => {
    // Fetch employees on component mount
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees')
        const data = await response.json()
        setEmployees(data)
      } catch (error) {
        console.error('Error fetching employees:', error)
      }
    }

    fetchEmployees()
  }, [])

  const handleSubmit = async event => {
    event.preventDefault()
    setLoading(true)

    const employeeData = {
      name,
      designation,
      salary: parseFloat(salary)
    }

    try {
      let response
      if (editingEmployee) {
        // Update existing employee
        response = await fetch(`/api/employees/${editingEmployee.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData)
        })
      } else {
        // Add new employee
        response = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData)
        })
      }

      if (response.ok) {
        const updatedOrNewEmployee = await response.json()
        if (editingEmployee) {
          setEmployees(employees.map(emp => (emp.id === editingEmployee.id ? updatedOrNewEmployee : emp)))
        } else {
          setEmployees([...employees, updatedOrNewEmployee])
        }
        clearForm()
      }
    } catch (error) {
      console.error('Error saving employee:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditEmployee = employee => {
    setEditingEmployee(employee)
    setName(employee.name)
    setDesignation(employee.designation)
    setSalary(employee.salary.toString())
  }

  const handleDeleteEmployee = async id => {
    try {
      const response = await fetch(`/api/employees/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setEmployees(employees.filter(employee => employee.id !== id))
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }

  const clearForm = () => {
    setEditingEmployee(null)
    setName('')
    setDesignation('')
    setSalary('')
  }

  return (
    <div className='shadow-lg px-6 py-6 rounded-md'>
      <Typography variant='h4' gutterBottom>
        {editingEmployee ? 'Update Employee' : 'Add Employee'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              label='Name'
              variant='outlined'
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label='Designation'
              variant='outlined'
              fullWidth
              value={designation}
              onChange={e => setDesignation(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label='Salary'
              type='number'
              variant='outlined'
              fullWidth
              value={salary}
              onChange={e => setSalary(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant='contained' color='primary' type='submit' disabled={loading}>
              {loading ? (
                <CircularProgress size={24} color='inherit' />
              ) : editingEmployee ? (
                'Update Employee'
              ) : (
                'Add Employee'
              )}
            </Button>
            {editingEmployee && (
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
              <TableCell>Designation</TableCell>
              <TableCell>Salary</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map(employee => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.designation}</TableCell>
                <TableCell>{employee.salary}</TableCell>
                <TableCell align='right'>
                  <Button variant='outlined' onClick={() => handleEditEmployee(employee)}>
                    Edit
                  </Button>
                  <Button
                    variant='outlined'
                    color='error'
                    onClick={() => handleDeleteEmployee(employee.id)}
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

export default EmployeeSalaryManagement
