import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db' // Adjust this path based on your project structure
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Fetch all users
    const users = await db.user.findMany()

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    // Parse the request data
    const body = await req.json()

    const { name, email, password, role } = body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Check if the email already exists
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create a new user
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // Store the hashed password
        role
      }
    })

    return NextResponse.json(newUser)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
