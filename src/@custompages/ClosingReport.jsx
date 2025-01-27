'use client'
import { useState, useEffect, useCallback } from 'react'
import BillTable from './BillTable'
import BtnGrp from './BtnGrp'
import { useSelector } from 'react-redux'
import Cookies from 'js-cookie'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const ClosingReport = () => {
  const [bills, setBills] = useState([])
  const [filteredBills, setFilteredBills] = useState([])
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState(new Date()) // Add this
  const [endDate, setEndDate] = useState(new Date()) // Add this

  const user = useSelector(state => state.user.authUser) || {
    name: Cookies.get('userName'),
    id: Cookies.get('UserId')
  }

  const role = useSelector(state => state.user.role) || Cookies.get('userRole')

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchLatestBills = useCallback(async () => {
    setIsLoading(true)
    try {
      const url = new URL('/api/latestBills', window.location.origin)

      if (role === 'ADMIN') {
        // For admin, set start date to beginning of selected day
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)

        // Set end date to end of selected day
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)

        url.searchParams.append('startDate', start.toISOString())
        url.searchParams.append('endDate', end.toISOString())
      } else {
        const todayDate = getTodayDate()
        url.searchParams.append('date', todayDate)
      }

      url.searchParams.append('role', role)
      if (role === 'RECEPTIONIST') {
        url.searchParams.append('userId', user.id)
      }

      console.log('Fetching URL:', url.toString()) // Debug log

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      console.log('Fetched Bills:', data) // Debug log
      setBills(data)
      filterBills(data, filter)
    } catch (error) {
      console.error('Error fetching bills:', error)
    } finally {
      setIsLoading(false)
    }
  }, [role, user.id, startDate, endDate, filter])

  const filterBills = useCallback((billsToFilter, currentFilter) => {
    let updatedBills = [...billsToFilter]

    if (currentFilter === 'Cash') {
      updatedBills = updatedBills.filter(bill => bill.paymentDetails?.method === 'Cash')
    } else if (currentFilter === 'Card') {
      updatedBills = updatedBills.filter(bill => bill.paymentDetails?.method === 'Card')
    } else if (currentFilter === 'Room Pay') {
      updatedBills = updatedBills.filter(bill => bill.paymentDetails?.method === 'Room Pay')
    }

    setFilteredBills(updatedBills)
  }, [])

  useEffect(() => {
    fetchLatestBills()
    const intervalId = setInterval(fetchLatestBills, 30000)
    return () => clearInterval(intervalId)
  }, [fetchLatestBills])

  useEffect(() => {
    filterBills(bills, filter)
  }, [bills, filter, filterBills])

  const handlePrint = () => {
    const printContents = document.querySelector('.a4-container')
    const newWindow = window.open('', '_blank')

    newWindow.document.write(`
      <html>
        <head>
          <title>Print Report</title>
          <style>
            @media print {
              @page { size: A4; margin: 10mm; }
              body { margin: 0; font-size: 14px; }
              .a4-container { width: 100%; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid black; padding: 8px; }
              th { background-color: #f2f2f2; }
              img { max-width: 100%; display: block; margin: auto; }
              .no-break { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h3 style="text-align: center;">
            ${
              role === 'ADMIN'
                ? `Report from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
                : 'Daily Closing Report'
            }
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
      <h1 className='text-2xl font-bold mb-4'>{role === 'ADMIN' ? 'Date Range Report' : 'Daily Closing Report'}</h1>
      <h1>Welcome, {user?.name}!</h1>
      <p>Your User ID: {user?.id}</p>
      <p>Your Role: {role}</p>
      {isLoading && <p>Loading bills...</p>}
      <BtnGrp
        setFilter={setFilter}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        role={role}
      />
      <BillTable bills={filteredBills} />
      <div className='mt-4 flex space-x-4'>
        <button
          onClick={fetchLatestBills}
          className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200 transform hover:scale-105 cursor-pointer'
        >
          Reload Bills
        </button>
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

export default ClosingReport
