/**
 * 병원 데이터 조회 테스트
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

async function testHospitalData() {
  console.log('🧪 병원 데이터 조회 테스트 시작...\n')
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`)
  console.log(`🔑 Anon Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...\n`)

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  try {
    // 1. 전체 병원 개수 확인
    console.log('1️⃣ 전체 병원 개수 확인...')
    const { count, error: countError } = await supabase
      .from('hospitals')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ 개수 조회 실패:', countError)
    } else {
      console.log(`✅ 총 병원 개수: ${count}개\n`)
    }

    // 2. 첫 5개 병원 조회
    console.log('2️⃣ 첫 5개 병원 조회...')
    const { data, error } = await supabase
      .from('hospitals')
      .select('id, name, address, rating, review_count, lat, lng')
      .limit(5)

    if (error) {
      console.error('❌ 병원 조회 실패:', error)
      return
    }

    if (!data || data.length === 0) {
      console.log('⚠️ 병원 데이터가 없습니다')
      return
    }

    console.log(`✅ ${data.length}개 병원 조회 성공:\n`)
    data.forEach((hospital, index) => {
      console.log(`${index + 1}. ${hospital.name}`)
      console.log(`   주소: ${hospital.address}`)
      console.log(`   평점: ${hospital.rating} ⭐ (리뷰 ${hospital.review_count}개)`)
      console.log(`   좌표: (${hospital.lat}, ${hospital.lng})\n`)
    })

    // 3. 거리 계산 함수 테스트
    console.log('3️⃣ 거리 계산 함수 테스트 (강남역 기준)...')
    const gangnamLat = 37.4979
    const gangnamLng = 127.0276

    const { data: nearbyData, error: nearbyError } = await supabase.rpc('get_nearby_hospitals', {
      user_lat: gangnamLat,
      user_lng: gangnamLng,
      radius_km: 2.0,
      category_filter: null
    })

    if (nearbyError) {
      console.error('❌ 주변 병원 조회 실패:', nearbyError)
      return
    }

    console.log(`✅ 강남역 2km 반경 내 병원: ${nearbyData?.length || 0}개\n`)
    if (nearbyData && nearbyData.length > 0) {
      nearbyData.slice(0, 3).forEach((hospital: any, index: number) => {
        console.log(`${index + 1}. ${hospital.name}`)
        console.log(`   거리: ${hospital.distance?.toFixed(2)}km`)
        console.log(`   평점: ${hospital.rating} ⭐\n`)
      })
    }

    console.log('✅ 모든 테스트 완료!')
  } catch (error: any) {
    console.error('❌ 테스트 실패:', error.message)
  }
}

testHospitalData()
