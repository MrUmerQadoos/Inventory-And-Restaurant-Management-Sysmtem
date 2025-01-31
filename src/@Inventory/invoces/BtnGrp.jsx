import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const BtnGrp = ({ setFilter, startDate, endDate, setStartDate, setEndDate, role }) => {
  return (
    <div className='mb-4 flex flex-wrap items-center gap-4'>
      <div className='flex gap-2'>
        <button
          className='bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition duration-200 transform hover:scale-105 cursor-pointer'
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className='bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600 transition duration-200 transform hover:scale-105 cursor-pointer'
          onClick={() => setFilter('Salary')}
        >
          Salary
        </button>
        <button
          className='bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-200 transform hover:scale-105 cursor-pointer'
          onClick={() => setFilter('Overhead')}
        >
          Overhead
        </button>
        <button
          className='bg-purple-500 text-white px-4 py-2 rounded mr-2 hover:bg-purple-600 transition duration-200 transform hover:scale-105 cursor-pointer'
          onClick={() => setFilter('Inventory')}
        >
          Inventory
        </button>
        <button
          className='bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition duration-200 transform hover:scale-105 cursor-pointer'
          onClick={() => setFilter('sales')}
        >
          Sales
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
        </div>
      )}
    </div>
  )
}

export default BtnGrp
