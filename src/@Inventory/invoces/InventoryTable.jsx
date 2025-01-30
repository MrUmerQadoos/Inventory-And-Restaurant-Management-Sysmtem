// InventoryTable.jsx
import React from 'react'

const InventoryTable = ({ products }) => {
  return (
    <div className='a4-container overflow-x-auto'>
      <table className='min-w-full border border-gray-300'>
        <thead>
          <tr className='bg-gray-200'>
            <th className='border border-gray-300 p-2'>#</th>
            <th className='border border-gray-300 p-2'>Product Name</th>
            <th className='border border-gray-300 p-2'>Selling Price</th>
            <th className='border border-gray-300 p-2'>Actual Price</th>
            <th className='border border-gray-300 p-2'>Inventory Wise Amount</th>
            <th className='border border-gray-300 p-2'>Profit</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.id}>
              <td className='border border-gray-300 p-2'>{index + 1}</td>
              <td className='border border-gray-300 p-2'>{product.name}</td>
              <td className='border border-gray-300 p-2'>{product.sellingPrice}</td>
              <td className='border border-gray-300 p-2'>{product.actualPrice}</td>
              <td className='border border-gray-300 p-2'>{product.inventoryWiseAmount}</td>
              <td className='border border-gray-300 p-2'>
                {Math.round((product.sellingPrice - product.actualPrice) * product.inventoryWiseAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default InventoryTable
