import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db' // Adjust this path based on your project structure

export async function DELETE(req) {
  try {
    // Extract the user ID from the request URL
    const id = req.nextUrl.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if the user exists
    const existingUser = await db.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete the user
    const deletedUser = await db.user.delete({
      where: { id }
    })

    return NextResponse.json(deletedUser)
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
