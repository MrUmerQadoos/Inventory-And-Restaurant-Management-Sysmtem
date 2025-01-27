import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import Cookies from 'js-cookie'

// Login thunk
export const userLogin = createAsyncThunk('user/login', async ({ email, password, onSuccess }, thunkAPI) => {
  try {
    const response = await axios.post('/api/login', { email, password })

    if (response.status === 200) {
      const { token, user } = response.data

      Cookies.set('authToken', token, { secure: true, sameSite: 'Lax' })
      Cookies.set('userRole', user.role, { secure: true, sameSite: 'Lax' })
      Cookies.set('userName', user.name, { secure: true, sameSite: 'Lax' })
      Cookies.set('UserId', user.id, { secure: true, sameSite: 'Lax' })

      // Execute success callback if provided
      if (onSuccess) onSuccess()

      return {
        user: response.data.user,
        token: token,
        role: user.role, // Capture role from response
        name: user.name,
        userId: user.id
      }
    } else {
      return thunkAPI.rejectWithValue('Failed to login')
    }
  } catch (error) {
    console.error('Error during login:', error)
    return thunkAPI.rejectWithValue(error.response?.data || error.message)
  }
})

// Logout thunk
export const userLogout = createAsyncThunk('user/logout', async (_, thunkAPI) => {
  try {
    // Remove the JWT token and role from cookies
    Cookies.remove('authToken')
    Cookies.remove('userRole') // Remove role cookie as well
    return { message: 'Logged out successfully' }
  } catch (error) {
    return thunkAPI.rejectWithValue('Failed to log out')
  }
})
