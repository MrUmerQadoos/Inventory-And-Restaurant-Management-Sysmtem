// PUT (Update an overhead expense by ID)
export async function PUT(req, { params }) {
  const { id } = params
  try {
    const { name, amount } = await req.json()

    if (!name || amount == null) {
      return NextResponse.json({ error: 'Name and amount are required' }, { status: 400 })
    }

    const updatedExpense = await db.OverheadExpenses.update({
      where: { id },
      data: { name, amount: parseFloat(amount) }
    })

    return NextResponse.json(updatedExpense, { status: 200 })
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE (Delete an overhead expense by ID)
export async function DELETE(req, { params }) {
  const { id } = params
  try {
    const deletedExpense = await db.OverheadExpenses.delete({
      where: { id }
    })

    return NextResponse.json(deletedExpense, { status: 200 })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
