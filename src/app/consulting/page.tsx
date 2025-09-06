'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, Users, Calendar, Clock, Star, MessageCircle, 
  CheckCircle, Phone, Video, MessageSquare, User, Award, 
  Briefcase, TrendingUp, Target
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Consultant {
  id: string
  name: string
  title: string
  experience: string
  rating: number
  reviews: number
  specialties: string[]
  availableSlots: string[]
  image: string
  price: number
  description: string
}

const CONSULTANTS: Consultant[] = [
  {
    id: '1',
    name: '김민수',
    title: '시니어 커리어 컨설턴트',
    experience: '15년',
    rating: 4.9,
    reviews: 324,
    specialties: ['개발자 커리어', '이직 전략', '연봉 협상'],
    availableSlots: ['오늘 14:00', '내일 10:00', '내일 16:00'],
    image: '/images/consultant1.jpg',
    price: 50000,
    description: '네이버, 카카오에서 15년간 개발자로 근무하며 200+ 개발자들의 커리어 성장을 도왔습니다.'
  },
  {
    id: '2',
    name: '박지영',
    title: 'CTO & 스타트업 멘토',
    experience: '12년',
    rating: 4.8,
    reviews: 189,
    specialties: ['스타트업 이직', '기술 리더십', '포트폴리오'],
    availableSlots: ['오늘 15:30', '내일 11:00', '모레 14:00'],
    image: '/images/consultant2.jpg',
    price: 80000,
    description: '3개 스타트업을 CTO로 성장시킨 경험으로 개발자들의 리더십 여정을 돕습니다.'
  },
  {
    id: '3',
    name: '이준호',
    title: 'FAANG 출신 시니어 개발자',
    experience: '10년',
    rating: 5.0,
    reviews: 97,
    specialties: ['해외 취업', '코딩 테스트', '기술 면접'],
    availableSlots: ['내일 13:00', '모레 15:00', '모레 17:00'],
    image: '/images/consultant3.jpg',
    price: 120000,
    description: 'Google, Meta에서 근무한 경험으로 글로벌 테크 기업 진출을 도와드립니다.'
  }
]

const CONSULTATION_TYPES = [
  {
    type: 'career',
    title: '커리어 로드맵',
    description: '개인 맞춤형 커리어 계획 수립',
    duration: '60분',
    icon: <TrendingUp className="w-6 h-6" />
  },
  {
    type: 'interview',
    title: '면접 준비',
    description: '기술 면접 및 코딩 테스트 대비',
    duration: '45분',
    icon: <Target className="w-6 h-6" />
  },
  {
    type: 'portfolio',
    title: '포트폴리오 리뷰',
    description: '이력서 및 포트폴리오 최적화',
    duration: '45분',
    icon: <Briefcase className="w-6 h-6" />
  },
  {
    type: 'negotiation',
    title: '연봉 협상',
    description: '연봉 및 근무 조건 협상 전략',
    duration: '30분',
    icon: <Award className="w-6 h-6" />
  }
]

export default function ConsultingPage() {
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
  const [selectedType, setSelectedType] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [consultationMethod, setConsultationMethod] = useState('video')

  const handleBooking = () => {
    if (!selectedConsultant || !selectedType || !selectedSlot) {
      alert('모든 항목을 선택해주세요.')
      return
    }
    alert('상담 예약이 완료되었습니다! 확인 이메일을 확인해주세요.')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="https://newbeginning-seven.vercel.app/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-5 h-5" />
              <span>홈으로</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">1:1 전문 컨설팅</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            전문가와 함께하는 맞춤형 커리어 컨설팅
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            15년+ 경력의 시니어 개발자, CTO, HR 전문가들이 당신의 커리어 성장을 1:1로 도와드립니다
          </p>
        </div>

        {/* Consultation Types */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">컨설팅 서비스</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONSULTATION_TYPES.map((type) => (
              <button
                key={type.type}
                onClick={() => setSelectedType(type.type)}
                className={`p-6 bg-white rounded-xl border cursor-pointer transition-all hover:shadow-md text-left w-full ${
                  selectedType === type.type ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
                }`}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                  {type.icon}
                </div>
                <h4 className="text-lg font-semibold mb-2">{type.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{type.description}</p>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{type.duration}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Consultants */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">전문 컨설턴트</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CONSULTANTS.map((consultant) => (
              <button
                key={consultant.id}
                onClick={() => setSelectedConsultant(consultant)}
                className={`bg-white rounded-xl p-6 border cursor-pointer transition-all hover:shadow-md text-left w-full ${
                  selectedConsultant?.id === consultant.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
                }`}
              >
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-500" />
                  </div>
                  <h4 className="text-lg font-semibold">{consultant.name}</h4>
                  <p className="text-blue-600 text-sm">{consultant.title}</p>
                  <p className="text-gray-600 text-sm">경력 {consultant.experience}</p>
                </div>

                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{consultant.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <MessageCircle className="w-4 h-4" />
                    <span>{consultant.reviews}개 리뷰</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 text-center mb-4">{consultant.description}</p>

                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium">전문 분야:</p>
                  <div className="flex flex-wrap gap-1">
                    {consultant.specialties.map((specialty, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">
                    {consultant.price.toLocaleString()}원
                  </p>
                  <p className="text-xs text-gray-500">1회 상담</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Booking Form */}
        {selectedConsultant && selectedType && (
          <div className="bg-white rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6 text-center">상담 예약</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Side - Selection Summary */}
              <div>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold mb-4">선택한 상담</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">컨설턴트</span>
                      <span className="font-medium">{selectedConsultant.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">상담 유형</span>
                      <span className="font-medium">
                        {CONSULTATION_TYPES.find(t => t.type === selectedType)?.title}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">소요 시간</span>
                      <span className="font-medium">
                        {CONSULTATION_TYPES.find(t => t.type === selectedType)?.duration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">상담료</span>
                      <span className="font-bold text-blue-600">
                        {selectedConsultant.price.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>

                {/* Consultation Method */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">상담 방식</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'video', label: '화상통화', icon: <Video className="w-5 h-5" /> },
                      { value: 'phone', label: '전화통화', icon: <Phone className="w-5 h-5" /> },
                      { value: 'chat', label: '채팅상담', icon: <MessageSquare className="w-5 h-5" /> }
                    ].map((method) => (
                      <button
                        key={method.value}
                        onClick={() => setConsultationMethod(method.value)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          consultationMethod === method.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          {method.icon}
                          <span className="text-sm">{method.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Time Slots */}
              <div>
                <h4 className="font-semibold mb-3">예약 가능한 시간</h4>
                <div className="space-y-3 mb-6">
                  {selectedConsultant.availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSlot(slot)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        selectedSlot === slot
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5" />
                        <span>{slot}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상담 목적 (선택사항)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="어떤 부분에 대해 상담받고 싶으신지 간단히 적어주세요."
                    />
                  </div>

                  <Button
                    onClick={handleBooking}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    disabled={!selectedSlot}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    상담 예약하기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-center mb-8">왜 BUDICONNECTS 컨설팅인가?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">검증된 전문가</h4>
              <p className="text-gray-600">
                15년+ 경력의 시니어 개발자, CTO, HR 전문가들만 선별
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">맞춤형 솔루션</h4>
              <p className="text-gray-600">
                개인의 상황과 목표에 맞는 구체적이고 실행 가능한 조언
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">검증된 성과</h4>
              <p className="text-gray-600">
                95% 상담 만족도, 평균 6개월 내 목표 달성률 78%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}