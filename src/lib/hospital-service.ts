/**
 * 병원 데이터 서비스
 * Supabase에서 실제 병원 데이터를 가져옵니다
 */

import { getSupabaseClient } from './supabase/client-factory'

export interface Hospital {
  id: string
  naver_id?: string
  name: string
  address: string
  road_address?: string
  phone: string
  category: string
  lat: number
  lng: number
  rating: number
  review_count: number
  distance?: number
  is_open?: boolean
  opening_hours?: any
  features: string[]
  description?: string
  website?: string
  images?: string[]
  review_summary?: {
    summary: string
    pros: string[]
    cons: string[]
    sentiment: 'positive' | 'neutral' | 'negative'
  }
}

export interface HospitalFilters {
  category?: string
  is_open?: boolean
  features?: string[]
  sort_by?: 'distance' | 'rating' | 'review_count'
  radius_km?: number
}

/**
 * 거리 계산 함수 (Haversine formula)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadius = 6371 // km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadius * c
}

/**
 * 주변 병원 검색
 */
export async function getNearbyHospitals(
  userLat: number,
  userLng: number,
  filters: HospitalFilters = {}
): Promise<Hospital[]> {
  try {
    const supabase = await getSupabaseClient()
    const radiusKm = filters.radius_km || 5.0

    // RPC 함수 호출 시도
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_nearby_hospitals', {
      user_lat: userLat,
      user_lng: userLng,
      radius_km: radiusKm,
      category_filter: filters.category === 'all' ? null : filters.category
    })

    let data: any[] = []

    // RPC 성공
    if (!rpcError && rpcData) {
      data = rpcData
    }
    // RPC 실패: 클라이언트 측에서 거리 계산
    else {
      console.warn('RPC 함수 없음, 클라이언트 측 거리 계산 사용:', rpcError?.message)

      let query = supabase
        .from('hospitals')
        .select('*')

      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }

      const { data: allHospitals, error } = await query

      if (error) {
        console.error('병원 검색 에러:', error)
        return []
      }

      // 클라이언트 측에서 거리 계산 및 필터링
      data = (allHospitals || [])
        .map(hospital => ({
          ...hospital,
          distance: calculateDistance(userLat, userLng, hospital.lat, hospital.lng)
        }))
        .filter(hospital => hospital.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)
    }

    // 리뷰 요약 데이터 병합
    const hospitals = await Promise.all(
      (data || []).map(async (hospital: any) => {
        const summary = await getHospitalReviewSummary(hospital.id)
        return {
          ...hospital,
          is_open: checkIsOpen(hospital.opening_hours),
          review_summary: summary
        }
      })
    )

    // 필터 적용
    let filtered = hospitals

    if (filters.is_open) {
      filtered = filtered.filter(h => h.is_open)
    }

    if (filters.features && filters.features.length > 0) {
      filtered = filtered.filter(h =>
        filters.features!.every(f => h.features.includes(f))
      )
    }

    // 정렬
    if (filters.sort_by === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating)
    } else if (filters.sort_by === 'review_count') {
      filtered.sort((a, b) => b.review_count - a.review_count)
    }
    // distance는 이미 정렬되어 있음

    return filtered
  } catch (error) {
    console.error('병원 검색 실패:', error)
    return []
  }
}

/**
 * 병원 리뷰 요약 가져오기
 */
async function getHospitalReviewSummary(hospitalId: string) {
  try {
    const supabase = await getSupabaseClient()

    const { data, error } = await supabase
      .from('hospital_review_summaries')
      .select('summary, pros, cons, sentiment')
      .eq('hospital_id', hospitalId)
      .single()

    if (error || !data) {
      return undefined
    }

    return {
      summary: data.summary,
      pros: data.pros,
      cons: data.cons,
      sentiment: data.sentiment as 'positive' | 'neutral' | 'negative'
    }
  } catch (error) {
    console.error('리뷰 요약 가져오기 실패:', error)
    return undefined
  }
}

/**
 * 영업 시간 확인
 */
function checkIsOpen(openingHours: any): boolean {
  if (!openingHours) return false

  const now = new Date()
  const day = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()]
  const currentTime = now.getHours() * 60 + now.getMinutes()

  const todayHours = openingHours[day]
  if (!todayHours || todayHours === 'closed') return false

  const [open, close] = todayHours.split('-')
  const [openHour, openMin] = open.split(':').map(Number)
  const [closeHour, closeMin] = close.split(':').map(Number)

  const openTime = openHour * 60 + openMin
  const closeTime = closeHour * 60 + closeMin

  return currentTime >= openTime && currentTime <= closeTime
}

/**
 * 병원 상세 정보 가져오기
 */
export async function getHospitalDetail(hospitalId: string): Promise<Hospital | null> {
  try {
    const supabase = await getSupabaseClient()

    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .eq('id', hospitalId)
      .single()

    if (error || !data) {
      console.error('병원 상세 정보 에러:', error)
      return null
    }

    const summary = await getHospitalReviewSummary(hospitalId)

    return {
      ...data,
      is_open: checkIsOpen(data.opening_hours),
      review_summary: summary
    }
  } catch (error) {
    console.error('병원 상세 정보 실패:', error)
    return null
  }
}

/**
 * 병원 리뷰 가져오기
 */
export async function getHospitalReviews(hospitalId: string, limit: number = 10) {
  try {
    const supabase = await getSupabaseClient()

    const { data, error } = await supabase
      .from('hospital_reviews')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('리뷰 가져오기 에러:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('리뷰 가져오기 실패:', error)
    return []
  }
}
