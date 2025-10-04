'use client'

import { useState } from 'react'
import { Hospital } from './hospital-finder'
import { HospitalCard } from './hospital-card'
import { HospitalDetailModal } from './hospital-detail-modal'

interface HospitalListProps {
  hospitals: Hospital[]
  userLocation: { lat: number; lng: number } | null
}

export function HospitalList({ hospitals, userLocation }: HospitalListProps) {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)

  if (hospitals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <p className="text-gray-500 text-lg mb-2">검색 결과가 없습니다</p>
        <p className="text-gray-400 text-sm">다른 조건으로 검색해보세요</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {hospitals.map((hospital) => (
          <HospitalCard
            key={hospital.id}
            hospital={hospital}
            onClick={() => setSelectedHospital(hospital)}
          />
        ))}
      </div>

      {selectedHospital && (
        <HospitalDetailModal
          hospital={selectedHospital}
          userLocation={userLocation}
          onClose={() => setSelectedHospital(null)}
        />
      )}
    </>
  )
}
