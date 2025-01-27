'use client'
import React from 'react'

import { useParams } from 'next/navigation'
import EditReservationPage from '@/@hotel/reservation/EditReservationPage'

const ReservationEditPage = () => {
  const { id } = useParams()

  return (
    <div>
      <EditReservationPage reservationId={id} />

    </div>
  )
}

export default ReservationEditPage
