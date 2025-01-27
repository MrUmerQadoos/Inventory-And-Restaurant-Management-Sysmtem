import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db' // Adjust the path to match your project structure

// DELETE an item by ID
export async function DELETE(req) {
  const id = req.nextUrl.pathname.split('/').pop()

  try {
    const deletedItem = await db.item.delete({
      where: { id }
    })

    return NextResponse.json(deletedItem, { status: 200 })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
