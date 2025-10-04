'use client'

import { useState, useEffect } from 'react'
import { Hospital } from './hospital-finder'
import { X, Star, Phone, MapPin, Clock, Navigation, MessageSquare, ThumbsUp, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HospitalReviews } from './hospital-reviews'

interface HospitalDetailModalProps {
  hospital: Hospital
  userLocation: { lat: number; lng: number } | null
  onClose: () => void
}

export function HospitalDetailModal({ hospital, userLocation, onClose }: HospitalDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info')

  useEffect(() => {
    // 모달 열릴 때 스크롤 막기
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleCall = () => {
    window.location.href = `tel:${hospital.phone}`
  }

  const handleNavigate = () => {
    const naverMapUrl = `https://map.naver.com/v5/directions/-/-/-/car?c=${hospital.lng},${hospital.lat},15,0,0,0,dh`
    window.open(naverMapUrl, '_blank')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: hospital.name,
          text: `${hospital.name} - ${hospital.address}`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: 클립보드 복사
      navigator.clipboard.writeText(window.location.href)
      alert('링크가 복사되었습니다')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="pr-12">
            <div className="flex items-center space-x-2 mb-3">
              <h2 className="text-2xl font-bold">{hospital.name}</h2>
              {hospital.isOpen && (
                <Badge variant="secondary" className="bg-green-500 text-white">
                  영업중
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-blue-100">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-300 mr-1 fill-yellow-300" />
                <span className="font-semibold text-white">{hospital.rating}</span>
                <span className="ml-1">({hospital.reviewCount}개의 리뷰)</span>
              </div>
              {hospital.distance !== undefined && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{hospital.distance}km</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 p-4 border-b border-gray-200">
          <Button onClick={handleCall} className="flex-1">
            <Phone className="w-4 h-4 mr-2" />
            전화하기
          </Button>
          <Button onClick={handleNavigate} variant="outline" className="flex-1">
            <Navigation className="w-4 h-4 mr-2" />
            길찾기
          </Button>
          <Button onClick={handleShare} variant="outline" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'info'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            병원 정보
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            리뷰 ({hospital.reviewCount})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' ? (
            <div className="space-y-6">
              {/* Description */}
              {hospital.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">소개</h3>
                  <p className="text-gray-700">{hospital.description}</p>
                </div>
              )}

              {/* Address */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  주소
                </h3>
                <p className="text-gray-700">{hospital.address}</p>
              </div>

              {/* Phone */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  전화번호
                </h3>
                <p className="text-gray-700">{hospital.phone}</p>
              </div>

              {/* Opening Hours */}
              {hospital.openingHours && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    진료시간
                  </h3>
                  <p className="text-gray-700">{hospital.openingHours}</p>
                </div>
              )}

              {/* Features */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">특징</h3>
                <div className="flex flex-wrap gap-2">
                  {hospital.features.map((feature) => (
                    <Badge key={feature} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Naver Map Embed */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">위치</h3>
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  <p className="text-gray-500">
                    네이버 지도 연동 예정
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <HospitalReviews hospitalId={hospital.id} />
          )}
        </div>
      </div>
    </div>
  )
}
