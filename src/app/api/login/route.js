// route.js (login API)
import { db } from '@/libs/db/db' // Your Prisma Client instance
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    console.log('Received a POST request to login endpoint')

    // Parse the request body
    const body = await req.json()
    console.log('Request body parsed successfully:', body)

    const { email, password } = body

    // Fetch the user based on email
    const user = await db.user.findUnique({
      where: { email }
    })

    // If user not found, return an error
    if (!user) {
      console.error('No user found with this email')
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      console.error('Invalid password')
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    console.log('User authenticated successfully')

    // Set up JWT token
    const secretKey = process.env.JWT_SECRET || 'your-secret-key-here'
    const sessionToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name }, // Include user name in the token
      secretKey,
      { expiresIn: '7d' } // Set token expiry to 7 days
    )

    console.log('Generated JWT:', sessionToken)

    // Return token and user data (including role) in the response
    return NextResponse.json(
      {
        message: 'Login successful',
        token: sessionToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name, // Include the name in the response
          role: user.role // Include the role in the response
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error logging in:', error.message)
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
  }
}
