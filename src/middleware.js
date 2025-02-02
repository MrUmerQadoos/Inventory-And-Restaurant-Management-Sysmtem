import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Define secure paths that require authentication
const securePaths = [
  '/admin/dashboard',
  '/bills',
  '/createusers',
  '/dailyReport',
  '/frontdesk',
  '/items',
  '/orders',
  '/receptionist/dashboard'
]

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // Check if the requested path is in the secure paths list
  if (securePaths.some(path => pathname.startsWith(path))) {
    const authToken = req.cookies.get('authToken')?.value

    if (!authToken) {
      // If no token, redirect to the login page
      return NextResponse.redirect(new URL('/login', req.url))
    }

    try {
      // If token exists, verify it using jose
      const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
      await jwtVerify(authToken, secretKey)

      // Token is valid, let the user proceed
      return NextResponse.next()
    } catch (error) {
      console.error('JWT verification failed:', error)
      // If the token is invalid, redirect to login
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // If path is not secure, allow the request to proceed
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/dashboard',
    '/bills',
    '/createusers',
    '/dailyReport',
    '/frontdesk',
    '/items',
    '/orders',
    '/inventory',
    '/product',
    '/salary',
    '/salarymanagement',
    '/overhead',
    '/inventoryrecord',
    '/orderlist',
    '/checkcustomer',
    '/invoice',
    '/productinvoice',
    '/receptionist/dashboard'
    // Add more secure routes here if necessary
  ]
}
