
'use client'

// MUI Imports
import React from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

import { useSelector } from 'react-redux'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

// Component
const DashboardAnalytics = () => {
  const router = useRouter() // Hook for navigation

  const user = useSelector(state => state.user.authUser) || {
    name: Cookies.get('userName'),
    id: Cookies.get('UserId')
  } // Fallback to cookies if user is not available in state

  const role = useSelector(state => state.user.role) || Cookies.get('userRole')

  // Function to handle navigation
  const handleNavigation = route => {
    router.push(route) // Use router.push for Next.js navigation
  }

  return (
    <Container maxWidth='lg' style={{ padding: '2rem' }}>
      <Typography variant='h4' gutterBottom>
        Welcome, {user?.name}!
      </Typography>
      <Typography variant='subtitle1'>Your User ID: {user?.id}</Typography>
      <Typography variant='subtitle1'>Your Role: {role}</Typography>

      {/* Button Container */}
      <Grid container spacing={4} style={{ marginTop: '2rem' }}>
        <Grid item xs={12} sm={6}>
          <Button
            variant='contained'
            color='primary'
            fullWidth
            size='large'
            onClick={() => handleNavigation('/bills')} // Adjust the route for F&B
            style={{
              height: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}
          >
            F&B
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            variant='contained'
            color='secondary'
            fullWidth
            size='large'
            onClick={() => handleNavigation('/frontdesk')} // Adjust the route for Frontdesk
            style={{
              height: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}
          >
            Frontdesk
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            variant='contained'
            color='secondary'
            fullWidth
            size='large'
            onClick={() => handleNavigation('/dailyReport')} // Adjust the route for Frontdesk
            style={{
              height: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}
          >
            Daily Report
          </Button>
        </Grid>
      </Grid>
    </Container>
  )
}

export default DashboardAnalytics
