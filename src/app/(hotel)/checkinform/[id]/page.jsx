'use client'
import React from 'react'

import { useParams } from 'next/navigation'
import EditCheckinPage from '@/@hotel/checkinform/EditCheckinPage'

const ReservationEditPage = () => {
  const { id } = useParams()

  return (
    <div>
      <EditCheckinPage reservationId={id} />
    </div>
  )
}

export default ReservationEditPage
