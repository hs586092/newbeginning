'use client'

import { Hospital } from './hospital-finder'
import { MapPin } from 'lucide-react'

interface HospitalMapProps {
  hospitals: Hospital[]
  userLocation: { lat: number; lng: number } | null
}

export function HospitalMap({ hospitals, userLocation }: HospitalMapProps) {
  // TODO: 네이버 지도 API 실제 연동
  // 현재는 placeholder UI

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="relative h-[600px] bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <MapPin className="w-16 h-16 text-blue-600 mx-auto" />
          <div>
            <p className="text-lg font-semibold text-gray-900 mb-2">
              네이버 지도 API 연동 예정
            </p>
            <p className="text-sm text-gray-600 max-w-md">
              네이버 클라우드 플랫폼의 Maps API를 연동하여<br />
              실시간 지도에서 병원 위치를 확인하고<br />
              길찾기 기능을 제공할 예정입니다.
            </p>
          </div>

          <div className="pt-4">
            <div className="inline-block bg-white rounded-lg shadow-sm p-4 text-left">
              <p className="text-sm font-medium text-gray-900 mb-2">주요 기능</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• 실시간 병원 위치 표시</li>
                <li>• 클러스터링으로 편한 탐색</li>
                <li>• 마커 클릭 시 상세 정보</li>
                <li>• 네이버 지도 길찾기 연동</li>
                <li>• 현재 위치 기반 검색</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 임시 통계 표시 */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{hospitals.length}</p>
                <p className="text-xs text-gray-600">검색된 병원</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {hospitals.filter(h => h.isOpen).length}
                </p>
                <p className="text-xs text-gray-600">영업중</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-pink-600">
                  {hospitals.reduce((sum, h) => sum + h.rating, 0) / hospitals.length || 0}
                </p>
                <p className="text-xs text-gray-600">평균 별점</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
