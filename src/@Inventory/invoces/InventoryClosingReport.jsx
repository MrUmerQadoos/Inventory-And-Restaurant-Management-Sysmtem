'use client'
import { useState, useEffect, useCallback } from 'react'
import InventoryTable from './InventoryTable'
import BtnGrp from './BtnGrp'
import { useSelector } from 'react-redux'
import Cookies from 'js-cookie'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const InventoryClosingReport = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState(new Date()) // Start Date
  const [endDate, setEndDate] = useState(new Date()) // End Date

  const user = useSelector(state => state.user.authUser) || {
    name: Cookies.get('userName'),
    id: Cookies.get('UserId')
  }

  const role = useSelector(state => state.user.role) || Cookies.get('userRole')

  const fetchInventoryData = useCallback(async () => {
    setIsLoading(true)
    try {
      const url = new URL('/api/inventoryClosingReport', window.location.origin)

      // Append date range and filter to the API request
      const start = new Date(startDate)
      const end = new Date(endDate)

      url.searchParams.append('startDate', start.toISOString())
      url.searchParams.append('endDate', end.toISOString())
      url.searchParams.append('filter', filter)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()

      // Setting the fetched data for display
      setProducts(data.filteredProducts)
      setFilteredProducts(data.filteredProducts)
    } catch (error) {
      console.error('Error fetching inventory data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [startDate, endDate, filter])

  useEffect(() => {
    fetchInventoryData()
  }, [fetchInventoryData])

  const handleFilterChange = newFilter => {
    setFilter(newFilter)
  }

  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>Inventory Closing Report</h1>
      <h1>Welcome, {user?.name}!</h1>
      <p>Your User ID: {user?.id}</p>
      <p>Your Role: {role}</p>
      {isLoading && <p>Loading inventory data...</p>}
      <BtnGrp
        setFilter={handleFilterChange}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        role={role}
      />
      <InventoryTable products={filteredProducts} />
    </div>
  )
}

export default InventoryClosingReport
