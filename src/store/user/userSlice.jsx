import { createSlice } from '@reduxjs/toolkit'
import { userLogin, userLogout } from './userThunk'
import Cookies from 'js-cookie'

const initialState = {
  authUser: null,
  token: null,
  role: Cookies.get('userRole') || null, // Initialize role from cookies
  loading: false,
  error: null
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // Handle login
    builder
      .addCase(userLogin.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.loading = false
        state.authUser = {
          id: action.payload.user.id,
          email: action.payload.user.email,
          name: action.payload.user.name // Save user name
        }
        state.token = action.payload.token
        state.role = action.payload.role // Save the role in state
        state.name = action.payload.name
        state.id = action.payload.id
      })
      // .addCase(userLogin.fulfilled, (state, action) => {
      //   state.loading = false
      //   state.authUser = action.payload.user
      //   state.token = action.payload.token
      //   state.role = action.payload.role // Save the role in state
      // })
      .addCase(userLogin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to login'
      })

    // Handle logout
    builder
      .addCase(userLogout.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(userLogout.fulfilled, state => {
        state.loading = false
        state.authUser = null
        state.token = null
        state.role = null // Clear the role on logout
      })
      .addCase(userLogout.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to logout'
      })
  }
})

export default userSlice.reducer
