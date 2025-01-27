'use client'

import { useEffect, useState } from 'react'
import {
  Button,
  Grid,
  TextField,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

const CreateUsers = () => {
  const [users, setUsers] = useState([]) // Store created users
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('ADMIN') // Default to Admin
  const [loading, setLoading] = useState(false) // Loading state for the add operation
  const [deletingId, setDeletingId] = useState(null) // Track which user is being deleted
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch all users on component mount
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/create-user')
        const data = await response.json()
        setUsers(data)
      } catch (err) {
        console.error('Error fetching users:', err)
        setError('Error fetching users')
      }
    }

    fetchUsers()
  }, [])

  const handleSubmit = async event => {
    event.preventDefault()
    setLoading(true) // Start loading

    const newUser = { name, email, password, role }

    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })

      const result = await response.json()

      if (response.ok) {
        setUsers([...users, result])
        setName('')
        setEmail('')
        setPassword('')
        setRole('ADMIN')
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Error creating user.')
      console.error('Error creating user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async id => {
    setDeletingId(id)

    try {
      const response = await fetch(`/api/create-user/${id}`, { method: 'DELETE' })
      const result = await response.json()

      if (response.ok) {
        setUsers(users.filter(user => user.id !== id))
      } else {
        console.error(result.error)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className='shadow-lg px-6 py-6 rounded-md'>
      <Grid container spacing={6}>
        <Grid item xs={12} md={12}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3} alignItems='center'>
              <Grid item xs={12} md={6}>
                <TextField
                  label='Name'
                  variant='outlined'
                  fullWidth
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label='Email'
                  variant='outlined'
                  fullWidth
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label='Password'
                  variant='outlined'
                  type='password'
                  fullWidth
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id='role-label'>Role</InputLabel>
                  <Select labelId='role-label' value={role} label='Role' onChange={e => setRole(e.target.value)}>
                    <MenuItem value='ADMIN'>ADMIN</MenuItem>
                    <MenuItem value='RECEPTIONIST'>RECEPTIONIST</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={12}>
                <Button variant='contained' color='primary' type='submit' disabled={loading}>
                  {loading ? <CircularProgress size={24} color='inherit' /> : 'Create User'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>

        <Grid item xs={12} md={12}>
          {users.length > 0 && (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label='user table'>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell align='right'>
                        <Button
                          variant='outlined'
                          color='error'
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingId === user.id}
                        >
                          {deletingId === user.id ? <CircularProgress size={24} color='inherit' /> : 'Delete'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>
    </div>
  )
}

export default CreateUsers
