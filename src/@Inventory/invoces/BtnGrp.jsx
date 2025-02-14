'use client'
import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const BtnGrp = ({
  setFilter,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  role,
  handleDailyReport,
  handleFetchWithRange
}) => {
  return (
    <div className='mb-4 flex flex-wrap items-center gap-4'>
      <div className='flex gap-2'>
        {/* ALL */}
        <button
          className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 transform hover:scale-105 cursor-pointer'
          onClick={() => setFilter('all')}
        >
          All
        </button>

        {/* DELIVERY CHARGE (Expense) */}
        <button
          className='bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition duration-200 transform hover:scale-105 cursor-pointer'
          onClick={() => setFilter('DeliveryCharge')}
        >
          Delivery Charge
        </button>

        {/* SALARY */}
        <button
          className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200 transform hover:scale-105 cursor-pointer'
          onClick={() => setFilter('Salary')}
        >
          Salary
        </button>

        {/* OVERHEAD */}
        <button
          className='bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-200 transform hover:scale-105 cursor-pointer'
          onClick={() => setFilter('Overhead')}
        >
          Overhead
        </button>

        {/* INVENTORY */}
        <button
          className='bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition duration-200 transform hover:scale-105 cursor-pointer'
          onClick={() => setFilter('Inventory')}
        >
          Inventory
        </button>

        {/* SALES */}
        <button
          className='bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition duration-200 transform hover:scale-105 cursor-pointer'
          onClick={() => setFilter('sales')}
        >
          Sales
        </button>

        {/* DAILY (2 AM - 2 AM) */}
        <button
          className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200 transform hover:scale-105 cursor-pointer'
          onClick={handleDailyReport}
        >
          Daily
        </button>
      </div>

      {role === 'ADMIN' && (
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <span>From:</span>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className='p-2 border rounded'
            />
          </div>
          <div className='flex items-center gap-2'>
            <span>To:</span>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className='p-2 border rounded'
            />
          </div>

          {/* Filter Button to fetch custom date range */}
          <button
            className='bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition duration-200 transform hover:scale-105 cursor-pointer'
            onClick={handleFetchWithRange}
          >
            Filter
          </button>
        </div>
      )}
    </div>
  )
}

export default BtnGrp
