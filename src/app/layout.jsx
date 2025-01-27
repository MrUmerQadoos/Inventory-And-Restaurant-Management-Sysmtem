'use client'

import 'react-perfect-scrollbar/dist/css/styles.css'
import ProviderStore from '@/store/ProviderStore'
import NextTopLoader from 'nextjs-toploader'

// import SessionProviderWrapper from '@/app/SessionProviderWrapper'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// Importing MUI theme utilities
import { ThemeProvider, createTheme } from '@mui/material/styles'

// Default MUI theme or customize it as per your need
const theme = createTheme({
  palette: {
    mode: 'light', // or 'dark', depending on your preference
    primary: {
      main: '#2299DD' // Customize primary color
    }
  },
  typography: {
    fontFamily: 'Roboto, sans-serif' // or your preferred font
  }
})

const RootLayout = ({ children }) => {
  // Vars
  const direction = 'ltr'

  return (
    <ProviderStore>
      <html id='__next' dir={direction}>
        <body className='flex is-full min-bs-full flex-auto flex-col'>
          <ThemeProvider theme={theme}>
            {/* Layout */}
            <NextTopLoader
              color='#2299DD'
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={true}
              showSpinner={false}
              easing='ease'
              speed={200}
              shadow='0 0 10px #2299DD,0 0 5px #2299DD'
            />
            {/* <SessionProviderWrapper> */}
            {/* Use the client component here */}
            {children}
            {/* </SessionProviderWrapper> */}
          </ThemeProvider>
        </body>
      </html>
    </ProviderStore>
  )
}

export default RootLayout
