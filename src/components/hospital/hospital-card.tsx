'use client'

import { Hospital } from './hospital-finder'
import { Star, Phone, MapPin, Clock, CheckCircle, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface HospitalCardProps {
  hospital: Hospital
  onClick: () => void
}

export function HospitalCard({ hospital, onClick }: HospitalCardProps) {
  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.location.href = `tel:${hospital.phone}`
  }

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation()
    // 네이버 지도 길찾기
    const naverMapUrl = `https://map.naver.com/v5/directions/-/-/-/car?c=${hospital.lng},${hospital.lat},15,0,0,0,dh`
    window.open(naverMapUrl, '_blank')
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-5 border border-gray-100"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{hospital.name}</h3>
            {hospital.isOpen && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                영업중
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1 fill-yellow-500" />
              <span className="font-semibold text-gray-900">{hospital.rating}</span>
              <span className="ml-1">({hospital.reviewCount})</span>
            </div>
            {hospital.distance !== undefined && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{hospital.distance}km</span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3">{hospital.address}</p>

          {hospital.description && (
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {hospital.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {hospital.features.slice(0, 4).map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {hospital.features.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{hospital.features.length - 4}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCall}
          className="flex-1"
        >
          <Phone className="w-4 h-4 mr-1" />
          전화
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNavigate}
          className="flex-1"
        >
          <Navigation className="w-4 h-4 mr-1" />
          길찾기
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onClick}
          className="flex-1"
        >
          상세보기
        </Button>
      </div>

      {hospital.openingHours && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>{hospital.openingHours}</span>
        </div>
      )}
    </div>
  )
}
