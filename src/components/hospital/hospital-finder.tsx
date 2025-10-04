'use client'

import { useState, useEffect, useRef } from 'react'
import { HospitalList } from './hospital-list'
import { HospitalMap } from './hospital-map'
import { HospitalFilters } from './hospital-filters'
import { HospitalListSkeleton } from './hospital-skeleton'
import { MapPin, List, Map, Search, Navigation2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export interface Hospital {
  id: string
  name: string
  address: string
  phone: string
  category: string
  lat: number
  lng: number
  rating: number
  reviewCount: number
  distance?: number
  isOpen?: boolean
  openingHours?: string
  features: string[]
  description?: string
}

export interface HospitalFilters {
  category: string
  isOpen: boolean
  sortBy: 'distance' | 'rating' | 'reviewCount'
  features: string[]
}

export function HospitalFinder() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [filters, setFilters] = useState<HospitalFilters>({
    category: 'all',
    isOpen: false,
    sortBy: 'distance',
    features: []
  })

  useEffect(() => {
    getUserLocation()
  }, [])

  useEffect(() => {
    if (userLocation) {
      loadNearbyHospitals()
    }
  }, [userLocation])

  useEffect(() => {
    applyFilters()
  }, [hospitals, filters, searchQuery])

  const getUserLocation = async () => {
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
            toast.success('현재 위치를 찾았습니다')
          },
          (error) => {
            console.error('Geolocation error:', error)
            // 서울 시청 기본 좌표
            setUserLocation({ lat: 37.5665, lng: 126.9780 })
            toast.info('위치 권한이 없어 서울 지역을 기본으로 설정했습니다')
          }
        )
      } else {
        setUserLocation({ lat: 37.5665, lng: 126.9780 })
        toast.info('위치 서비스를 사용할 수 없어 서울 지역을 기본으로 설정했습니다')
      }
    } catch (error) {
      console.error('Error getting location:', error)
      setUserLocation({ lat: 37.5665, lng: 126.9780 })
    }
  }

  const loadNearbyHospitals = async () => {
    setLoading(true)
    try {
      if (!userLocation) return

      // 실제 데이터 로드 시도
      try {
        const { getNearbyHospitals } = await import('@/lib/hospital-service')
        const realHospitals = await getNearbyHospitals(
          userLocation.lat,
          userLocation.lng,
          {
            category: filters.category !== 'all' ? filters.category : undefined,
            radius_km: 5.0
          }
        )

        if (realHospitals.length > 0) {
          setHospitals(realHospitals)
          setLoading(false)
          return
        }
      } catch (error) {
        console.warn('실제 데이터 로드 실패, 목업 데이터 사용:', error)
      }

      // 폴백: 목업 데이터
      const mockHospitals: Hospital[] = [
        {
          id: '1',
          name: '우리아이 소아과',
          address: '서울시 강남구 역삼동 123-45',
          phone: '02-1234-5678',
          category: '소아과',
          lat: 37.5665 + Math.random() * 0.01,
          lng: 126.9780 + Math.random() * 0.01,
          rating: 4.8,
          reviewCount: 234,
          distance: 0.3,
          isOpen: true,
          openingHours: '평일 09:00-18:00, 토요일 09:00-13:00',
          features: ['야간진료', '주말진료', '주차가능', '예약가능'],
          description: '20년 경력의 원장님이 진료하는 동네 소아과입니다. 친절하고 꼼꼼한 진료로 유명합니다.'
        },
        {
          id: '2',
          name: '서울 아동병원',
          address: '서울시 강남구 역삼동 234-56',
          phone: '02-2345-6789',
          category: '소아과',
          lat: 37.5665 + Math.random() * 0.01,
          lng: 126.9780 + Math.random() * 0.01,
          rating: 4.5,
          reviewCount: 156,
          distance: 0.5,
          isOpen: true,
          openingHours: '평일 08:30-19:00, 토요일 09:00-15:00',
          features: ['주차가능', '예약가능', '영유아검진'],
          description: '대학병원급 시설과 장비를 갖춘 소아 전문병원입니다.'
        },
        {
          id: '3',
          name: '행복한 소아청소년과',
          address: '서울시 강남구 삼성동 345-67',
          phone: '02-3456-7890',
          category: '소아청소년과',
          lat: 37.5665 + Math.random() * 0.01,
          lng: 126.9780 + Math.random() * 0.01,
          rating: 4.9,
          reviewCount: 312,
          distance: 0.7,
          isOpen: false,
          openingHours: '평일 09:00-18:00 (점심시간 12:30-14:00)',
          features: ['예약가능', '영유아검진', '예방접종'],
          description: '아이들과 소통을 잘하는 원장님으로 유명합니다. 예약 필수!'
        },
        {
          id: '4',
          name: '건강한 아이들 의원',
          address: '서울시 강남구 대치동 456-78',
          phone: '02-4567-8901',
          category: '소아과',
          lat: 37.5665 + Math.random() * 0.01,
          lng: 126.9780 + Math.random() * 0.01,
          rating: 4.3,
          reviewCount: 89,
          distance: 0.9,
          isOpen: true,
          openingHours: '평일 09:30-18:30, 토요일 09:00-13:00',
          features: ['주차가능', '영유아검진', '예방접종'],
          description: '넓은 주차장과 쾌적한 대기실이 장점입니다.'
        },
        {
          id: '5',
          name: '사랑 소아청소년과',
          address: '서울시 강남구 도곡동 567-89',
          phone: '02-5678-9012',
          category: '소아청소년과',
          lat: 37.5665 + Math.random() * 0.01,
          lng: 126.9780 + Math.random() * 0.01,
          rating: 4.7,
          reviewCount: 198,
          distance: 1.2,
          isOpen: true,
          openingHours: '평일 08:00-20:00, 토요일 09:00-17:00, 일요일 09:00-13:00',
          features: ['야간진료', '주말진료', '공휴일진료', '주차가능', '예약가능'],
          description: '365일 진료하는 소아과! 응급상황에도 안심하고 방문하세요.'
        }
      ]

      setHospitals(mockHospitals)
      setLoading(false)
    } catch (error) {
      console.error('Error loading hospitals:', error)
      toast.error('병원 정보를 불러오는데 실패했습니다')
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...hospitals]

    // 검색어 필터
    if (searchQuery) {
      filtered = filtered.filter(h =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 카테고리 필터
    if (filters.category !== 'all') {
      filtered = filtered.filter(h => h.category === filters.category)
    }

    // 영업중 필터
    if (filters.isOpen) {
      filtered = filtered.filter(h => h.isOpen)
    }

    // 특징 필터
    if (filters.features.length > 0) {
      filtered = filtered.filter(h =>
        filters.features.every(f => h.features.includes(f))
      )
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0)
        case 'rating':
          return b.rating - a.rating
        case 'reviewCount':
          return b.reviewCount - a.reviewCount
        default:
          return 0
      }
    })

    setFilteredHospitals(filtered)
  }

  const handleFilterChange = (newFilters: Partial<HospitalFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleRefreshLocation = () => {
    getUserLocation()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Quick Filters Skeleton */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg shadow-md p-4 animate-pulse">
          <div className="h-4 bg-white/30 rounded w-24 mb-3"></div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 bg-white/20 rounded-full w-24"></div>
            ))}
          </div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>

        {/* Hospital Cards Skeleton */}
        <HospitalListSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Filters - 원클릭 필터 */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-semibold text-sm">⚡ 빠른 필터</span>
          {(filters.isOpen || filters.features.length > 0) && (
            <button
              onClick={() => handleFilterChange({ isOpen: false, features: [] })}
              className="text-white text-xs underline hover:no-underline"
            >
              초기화
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange({ isOpen: !filters.isOpen })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              filters.isOpen
                ? 'bg-white text-purple-600 shadow-md scale-105'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            🟢 지금진료중
          </button>
          {['야간진료', '주말진료', '주차가능', '예약가능'].map((feature) => (
            <button
              key={feature}
              onClick={() => {
                const newFeatures = filters.features.includes(feature)
                  ? filters.features.filter(f => f !== feature)
                  : [...filters.features, feature]
                handleFilterChange({ features: newFeatures })
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filters.features.includes(feature)
                  ? 'bg-white text-purple-600 shadow-md scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {feature === '야간진료' && '🌙 '}
              {feature === '주말진료' && '📅 '}
              {feature === '주차가능' && '🅿️ '}
              {feature === '예약가능' && '📞 '}
              {feature}
            </button>
          ))}
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="병원 이름이나 주소로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefreshLocation}
            title="현재 위치로 재검색"
          >
            <Navigation2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>
              {userLocation
                ? `주변 ${filteredHospitals.length}곳의 병원`
                : '위치 정보를 가져오는 중...'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-1" />
              목록
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <Map className="w-4 h-4 mr-1" />
              지도
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <HospitalFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Content */}
      {viewMode === 'list' ? (
        <HospitalList hospitals={filteredHospitals} userLocation={userLocation} />
      ) : (
        <HospitalMap hospitals={filteredHospitals} userLocation={userLocation} />
      )}
    </div>
  )
}
