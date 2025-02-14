'use client'
import React from 'react'

const InventoryTable = ({ transactions }) => {
  return (
    <div className='a4-container overflow-x-auto'>
      <table className='min-w-full border border-gray-300'>
        <thead>
          <tr className='bg-gray-200'>
            <th className='border border-gray-300 p-2'>#</th>
            <th className='border border-gray-300 p-2'>Type</th>
            <th className='border border-gray-300 p-2'>Name/Invoice</th>
            <th className='border border-gray-300 p-2'>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((item, index) => (
            <tr key={item.id}>
              <td className='border border-gray-300 p-2'>{index + 1}</td>
              <td className={`border border-gray-300 p-2 ${item.type === 'sale' ? 'text-green-500' : 'text-red-500'}`}>
                {item.type === 'sale' ? 'Sale' : 'Expense'}
              </td>
              <td className='border border-gray-300 p-2'>
                {item.invoiceNumber ? `Invoice #${item.invoiceNumber}` : item.name}
              </td>
              <td className='border border-gray-300 p-2'>Rs {item.type === 'sale' ? item.finalTotal : item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default InventoryTable
