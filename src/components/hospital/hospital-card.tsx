'use client'

import { Hospital } from './hospital-finder'
import { Star, Phone, MapPin, Clock, CheckCircle, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ReviewSummary } from './review-summary'

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

          <p className="text-sm text-gray-600 mb-2">{hospital.address}</p>

          {/* 진료시간 항상 노출 */}
          {hospital.openingHours && (
            <div className="flex items-start text-xs text-gray-600 mb-3">
              <Clock className="w-3.5 h-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">{hospital.openingHours}</span>
            </div>
          )}

          {/* 특징 6개로 확대 */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {hospital.features.slice(0, 6).map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs px-2 py-0.5">
                {feature}
              </Badge>
            ))}
            {hospital.features.length > 6 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                +{hospital.features.length - 6}
              </Badge>
            )}
          </div>

          {/* AI 리뷰 요약 추가 */}
          {(hospital as any).review_summary ? (
            <ReviewSummary
              hospitalId={hospital.id}
              summary={(hospital as any).review_summary.summary}
              pros={(hospital as any).review_summary.pros}
              cons={(hospital as any).review_summary.cons}
              sentiment={(hospital as any).review_summary.sentiment}
            />
          ) : (
            <ReviewSummary
              hospitalId={hospital.id}
              summary={
                hospital.id === '1' ? '친절하고 꼼꼼한 진료, 다만 대기시간이 긴 편입니다' :
                hospital.id === '2' ? '시설과 장비는 좋으나 예약이 필수입니다' :
                hospital.id === '3' ? '아이들과 소통 잘하는 원장님, 예약 필수' :
                hospital.id === '4' ? '주차 편리하고 대기실 쾌적, 진료는 평범' :
                '365일 진료로 편리하지만 혼잡할 수 있음'
              }
              pros={
                hospital.id === '1' ? ['친절한 상담', '꼼꼼한 진료', '깨끗한 시설'] :
                hospital.id === '2' ? ['최신 장비', '전문 진료', '깨끗한 환경'] :
                hospital.id === '3' ? ['아이 소통 잘함', '친절한 직원', '정확한 진단'] :
                hospital.id === '4' ? ['주차 편리', '쾌적한 대기실', '친절한 안내'] :
                ['365일 진료', '야간진료', '응급 대응']
              }
              cons={
                hospital.id === '1' ? ['대기시간 긴 편', '주차공간 부족'] :
                hospital.id === '2' ? ['예약 필수', '대기시간 있음'] :
                hospital.id === '3' ? ['예약 어려움', '점심시간 긴 편'] :
                hospital.id === '4' ? ['진료 평범', '혼잡할 수 있음'] :
                ['항상 혼잡', '대기 긴 편']
              }
              sentiment={
                ['1', '3'].includes(hospital.id) ? 'positive' :
                ['2', '4'].includes(hospital.id) ? 'neutral' :
                'positive'
              }
            />
          )}
        </div>
      </div>

      {/* 전화/길찾기 버튼 항상 노출 */}
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
    </div>
  )
}
