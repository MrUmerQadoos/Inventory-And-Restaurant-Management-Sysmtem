import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db' // Adjust the path to match your project structure

// GET request handler for fetching kotIds from orders
export async function GET() {
  try {
    // Query only the kotId from the orders in the database
    const kotIds = await db.order.findMany({
      select: {
        kotId: true // Only fetch the kotId field
      }
    })

    // Return the list of kotIds as a JSON response
    return NextResponse.json(kotIds)
  } catch (error) {
    console.error('Error fetching kotIds:', error)

    // Return a JSON response with an error message and a 500 status code
    return NextResponse.json({ error: 'Something went wrong while fetching kotIds.' }, { status: 500 })
  }
}
