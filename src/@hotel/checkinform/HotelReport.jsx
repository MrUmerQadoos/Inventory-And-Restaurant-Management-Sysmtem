'use client'

import { useState, useEffect, useCallback } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const HotelReport = () => {
  const [checkins, setCheckins] = useState([])
  const [filteredCheckins, setFilteredCheckins] = useState([])
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())

  const getTodayDate = () => new Date().toISOString().split('T')[0]

  const totalAmount = filteredCheckins.reduce((sum, checkin) => sum + checkin.totalCost, 0)

  // Fetch check-ins and check-outs
  const fetchLatestCheckins = useCallback(async () => {
    setIsLoading(true)
    try {
      const url = new URL('/api/latestCheckins', window.location.origin)
      const todayDate = getTodayDate()

      url.searchParams.append('startDate', startDate.toISOString())
      url.searchParams.append('endDate', endDate.toISOString())

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setCheckins(data)
      filterCheckins(data, filter)
    } catch (error) {
      console.error('Error fetching check-ins:', error)
    } finally {
      setIsLoading(false)
    }
  }, [startDate, endDate, filter])

  const filterCheckins = useCallback((data, currentFilter) => {
    let updatedData = [...data]
    if (currentFilter !== 'all') {
      updatedData = updatedData.filter(checkin => checkin.status === currentFilter)
    }
    setFilteredCheckins(updatedData)
  }, [])

  useEffect(() => {
    fetchLatestCheckins()
    const intervalId = setInterval(fetchLatestCheckins, 30000)
    return () => clearInterval(intervalId)
  }, [fetchLatestCheckins])

  useEffect(() => {
    filterCheckins(checkins, filter)
  }, [checkins, filter, filterCheckins])

  const handlePrint = () => {
    const printContents = document.querySelector('.report-container')
    const newWindow = window.open('', '_blank')

    newWindow.document.write(`
      <html>
        <head>
          <title>Hotel Report</title>
          <style>
            @media print {
              @page { size: A4; margin: 10mm; }
              body { margin: 0; font-size: 14px; }
              .report-container { width: 100%; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid black; padding: 8px; }
              th { background-color: #f2f2f2; }
              .no-break { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h3 style="text-align: center;">
            Report from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}
          </h3>
          ${printContents.innerHTML}
        </body>
      </html>
    `)

    newWindow.document.close()
    newWindow.print()
    newWindow.close()
  }

  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>Hotel Report</h1>
      {isLoading && <p>Loading check-ins...</p>}

      <div className='mb-4 flex flex-wrap items-center gap-4'>
        <button onClick={() => setFilter('all')} className='bg-blue-500 text-white px-4 py-2 rounded'>
          All
        </button>
        <button onClick={() => setFilter('PENDING')} className='bg-yellow-500 text-white px-4 py-2 rounded'>
          Pending
        </button>
        <button onClick={() => setFilter('COMPLETED')} className='bg-green-500 text-white px-4 py-2 rounded'>
          Completed
        </button>

        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <span>From:</span>
            <DatePicker selected={startDate} onChange={date => setStartDate(date)} className='p-2 border rounded' />
          </div>
          <div className='flex items-center gap-2'>
            <span>To:</span>
            <DatePicker selected={endDate} onChange={date => setEndDate(date)} className='p-2 border rounded' />
          </div>
        </div>
      </div>

      <div className='report-container overflow-x-auto'>
        <table className='min-w-full border border-gray-300'>
          <thead className='bg-gray-200'>
            <tr>
              <th className='border p-2'>#</th>
              <th className='border p-2'>Guest Name</th>
              <th className='border p-2'>Room</th>
              <th className='border p-2'>Total Amount</th>
              <th className='border p-2'>User Name</th>

              <th className='border p-2'>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCheckins.map((checkin, index) => (
              <tr key={checkin.id}>
                <td className='border p-2'>{index + 1}</td>
                <td className='border p-2'>{checkin.guestName}</td>
                <td className='border p-2'>{checkin.reservationRooms[0]?.room.roomName || 'N/A'}</td>
                <td className='border p-2'>{Math.round(checkin.totalCost)}</td>
                <td className='border p-2'>{checkin.user.name}</td>
                <td className='border p-2'>{checkin.status}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className='bg-gray-300 font-bold'>
              <td className='border p-2' colSpan='3'>
                Total
              </td>
              <td className='border p-2' colSpan='3'>
                {totalAmount}
              </td>

              {/* Add more cells as needed */}
            </tr>
          </tfoot>
        </table>
      </div>

      <div className='mt-4'>
        <button
          onClick={handlePrint}
          className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200 transform hover:scale-105 cursor-pointer'
        >
          Print Report
        </button>
      </div>
    </div>
  )
}

export default HotelReport
