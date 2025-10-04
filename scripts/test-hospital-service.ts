/**
 * hospital-service 테스트 (클라이언트 측 거리 계산 포함)
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 거리 계산 함수
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

async function testHospitalService() {
  console.log('🧪 hospital-service 로직 테스트 시작...\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const userLat = 37.4979 // 강남역
  const userLng = 127.0276
  const radiusKm = 2.0

  try {
    // RPC 함수 시도
    console.log('1️⃣ RPC 함수 시도...')
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_nearby_hospitals', {
      user_lat: userLat,
      user_lng: userLng,
      radius_km: radiusKm,
      category_filter: null
    })

    if (!rpcError && rpcData) {
      console.log(`✅ RPC 함수 성공: ${rpcData.length}개 병원 발견\n`)
      rpcData.slice(0, 3).forEach((hospital: any, index: number) => {
        console.log(`${index + 1}. ${hospital.name}`)
        console.log(`   거리: ${hospital.distance?.toFixed(2)}km`)
        console.log(`   평점: ${hospital.rating} ⭐\n`)
      })
      return
    }

    // RPC 실패: 클라이언트 측 계산
    console.log('⚠️ RPC 함수 실패, 클라이언트 측 거리 계산 사용')
    console.log(`에러: ${rpcError?.message}\n`)

    console.log('2️⃣ 모든 병원 조회 후 클라이언트 측 필터링...')
    const { data: allHospitals, error } = await supabase
      .from('hospitals')
      .select('*')

    if (error) {
      console.error('❌ 병원 조회 실패:', error)
      return
    }

    console.log(`✅ 총 ${allHospitals?.length || 0}개 병원 조회 성공`)

    // 거리 계산 및 필터링
    const nearbyHospitals = (allHospitals || [])
      .map(hospital => ({
        ...hospital,
        distance: calculateDistance(userLat, userLng, hospital.lat, hospital.lng)
      }))
      .filter(hospital => hospital.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)

    console.log(`✅ ${nearbyHospitals.length}개 병원이 ${radiusKm}km 반경 내에 있음\n`)

    nearbyHospitals.slice(0, 5).forEach((hospital, index) => {
      console.log(`${index + 1}. ${hospital.name}`)
      console.log(`   주소: ${hospital.address}`)
      console.log(`   거리: ${hospital.distance.toFixed(2)}km`)
      console.log(`   평점: ${hospital.rating} ⭐ (리뷰 ${hospital.review_count}개)\n`)
    })

    console.log('✅ 클라이언트 측 거리 계산 성공!')
  } catch (error: any) {
    console.error('❌ 테스트 실패:', error.message)
  }
}

testHospitalService()
