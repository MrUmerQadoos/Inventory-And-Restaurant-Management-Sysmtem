'use client'

import React, { useEffect, useState } from 'react'
import {
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import PrintIcon from '@mui/icons-material/Print'

const InHouseCheckouts = () => {
  const [checkOuts, setCheckOuts] = useState([])

  useEffect(() => {
    const fetchCheckOuts = async () => {
      try {
        const response = await fetch('/api/inhouse/checkouts')
        if (!response.ok) throw new Error('Failed to fetch checkouts')
        const data = await response.json()
        if (Array.isArray(data)) {
          setCheckOuts(data)
        } else {
          console.error('Unexpected data format:', data)
        }
      } catch (error) {
        console.error('Error fetching checkouts:', error)
      }
    }
    fetchCheckOuts()
  }, [])

  const handlePrint = () => {
    const printContent = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <h2>In-House Checkouts</h2>
        <table>
          <thead>
            <tr>
              <th>Room</th>
              <th>Guest Name</th>
              <th>Company</th>
              <th>Guests</th>
              <th>Checkout Date</th>
            </tr>
          </thead>
          <tbody>
            ${checkOuts
              .map(
                checkOut => `
                  <tr>
                    <td>${checkOut.reservationRooms[0]?.room.roomName || 'N/A'}</td>
                    <td>${checkOut.guestName}</td>
                    <td>${checkOut.company || 'N/A'}</td>
                    <td>${checkOut.guests}</td>
                    <td>${new Date(checkOut.reservationRooms[0]?.checkOutDate).toLocaleDateString() || 'N/A'}</td>
                  </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `
    const printWindow = window.open('', '', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    } else {
      console.error('Failed to open print window')
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant='h4' component='h1' gutterBottom align='center'>
        In-House Checkouts
      </Typography>

      <TableContainer component={Paper} elevation={3} style={{ margin: '20px 0', borderRadius: '8px' }}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Room</TableCell>
              <TableCell>Guest Name</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Guests</TableCell>
              <TableCell>Checkout Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {checkOuts.length > 0 ? (
              checkOuts.map(checkOut => (
                <TableRow key={checkOut.id}>
                  <TableCell>{checkOut.reservationRooms[0]?.room.roomName || 'N/A'}</TableCell>
                  <TableCell>{checkOut.guestName}</TableCell>
                  <TableCell>{checkOut.company || 'N/A'}</TableCell>
                  <TableCell>{checkOut.guests}</TableCell>
                  <TableCell>
                    {new Date(checkOut.reservationRooms[0]?.checkOutDate).toLocaleDateString() || 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align='center'>
                  No checkouts available for today.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        variant='contained'
        color='primary'
        startIcon={<PrintIcon />}
        onClick={handlePrint}
        style={{
          display: 'block',
          margin: '0 auto',
          marginTop: '20px',
          padding: '10px 20px',
          borderRadius: '8px'
        }}
      >
        Print
      </Button>
    </div>
  )
}

export default InHouseCheckouts
