'use client'

import { useState } from 'react'

const DeleteBill = () => {
  const [kotId, setKotId] = useState('')
  const [message, setMessage] = useState('')

  const handleDelete = async () => {
    if (!kotId) {
      setMessage('Please enter a Bill ID')
      return
    }

    try {
      const response = await fetch(`/api/deleteBill/${kotId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage('Bill deleted successfully')
        setKotId('') // Clear input
      } else {
        const errorData = await response.json()
        setMessage(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting bill:', error)
      setMessage('An error occurred while deleting the bill')
    }
  }

  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>Delete Bill by Bill ID</h1>
      <input
        type='text'
        value={kotId}
        onChange={e => setKotId(e.target.value)}
        placeholder='Enter Bill ID'
        className='border p-2 mb-4'
      />
      <button
        onClick={handleDelete}
        className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200'
      >
        Delete Bill
      </button>
      {message && <p className='mt-4'>{message}</p>}
    </div>
  )
}

export default DeleteBill
