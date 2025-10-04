/**
 * 강남구 소아과 병원 테스트 크롤러
 */

import axios from 'axios'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || ''
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || ''
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface NaverPlace {
  title: string
  link: string
  category: string
  description: string
  telephone: string
  address: string
  roadAddress: string
  mapx: string
  mapy: string
}

interface Hospital {
  naver_id: string
  name: string
  address: string
  road_address: string
  phone: string
  category: string
  lat: number
  lng: number
  description: string
  features: string[]
}

// 좌표 변환 (네이버 EPSG:3857 → WGS84)
function convertCoordinates(mapx: string, mapy: string): { lat: number; lng: number } {
  const x = parseFloat(mapx) / 10000000
  const y = parseFloat(mapy) / 10000000
  return { lat: y, lng: x }
}

// HTML 태그 제거
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

// 네이버 지역 검색 API
async function searchPlaces(query: string, start: number = 1): Promise<NaverPlace[]> {
  try {
    console.log(`🔍 검색: ${query} (${start}번째부터)`)
    const response = await axios.get('https://openapi.naver.com/v1/search/local.json', {
      params: {
        query,
        display: 5,
        start,
        sort: 'random'
      },
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
      }
    })
    return response.data.items || []
  } catch (error: any) {
    console.error('❌ API 에러:', error.response?.data || error.message)
    return []
  }
}

// 특징 추출
function extractFeatures(place: NaverPlace): string[] {
  const features: string[] = []
  const text = (place.title + place.description + place.category).toLowerCase()

  if (text.includes('야간') || text.includes('저녁')) features.push('야간진료')
  if (text.includes('주말') || text.includes('토요일') || text.includes('일요일')) features.push('주말진료')
  if (text.includes('공휴일')) features.push('공휴일진료')
  if (text.includes('주차')) features.push('주차가능')
  if (text.includes('예약')) features.push('예약가능')
  if (text.includes('영유아') || text.includes('검진')) features.push('영유아검진')
  if (text.includes('예방접종') || text.includes('접종')) features.push('예방접종')

  return features
}

// 병원 데이터 저장
async function saveHospital(hospital: Hospital) {
  const { data, error } = await supabase
    .from('hospitals')
    .upsert({
      naver_id: hospital.naver_id,
      name: hospital.name,
      address: hospital.address,
      road_address: hospital.road_address,
      phone: hospital.phone,
      category: hospital.category,
      lat: hospital.lat,
      lng: hospital.lng,
      description: hospital.description,
      features: hospital.features,
      rating: 4.0 + Math.random() * 0.9, // 임시 평점
      review_count: Math.floor(Math.random() * 300) + 10, // 임시 리뷰 수
      last_updated: new Date().toISOString()
    }, {
      onConflict: 'naver_id'
    })

  if (error) {
    console.error('❌ DB 저장 에러:', error)
    return false
  } else {
    console.log(`✅ ${hospital.name} 저장 완료`)
    return true
  }
}

// 메인 크롤링
async function crawlGangnamHospitals() {
  console.log('🏥 강남구 소아과 병원 크롤링 시작...\n')

  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    console.error('❌ 네이버 API 키가 없습니다.')
    console.error('NAVER_CLIENT_ID:', NAVER_CLIENT_ID)
    console.error('NAVER_CLIENT_SECRET:', NAVER_CLIENT_SECRET ? '설정됨' : '없음')
    return
  }

  let totalCount = 0
  const queries = [
    '서울 강남구 소아과',
    '서울 강남구 소아청소년과',
    '강남 역삼동 소아과',
    '강남 논현동 소아과',
    '강남 삼성동 소아과',
    '강남 대치동 소아과',
    '강남 청담동 소아과'
  ]

  for (const query of queries) {
    console.log(`\n📍 "${query}" 검색 중...`)

    // 각 검색어당 2페이지씩 (1-5, 6-10)
    for (let page = 1; page <= 2; page++) {
      const start = (page - 1) * 5 + 1
      const places = await searchPlaces(query, start)

      if (places.length === 0) {
        console.log(`  ⚠️  검색 결과 없음 (페이지 ${page})`)
        break
      }

      for (const place of places) {
        const coords = convertCoordinates(place.mapx, place.mapy)

        // 강남구 좌표 범위 체크 (대략적)
        if (coords.lat < 37.45 || coords.lat > 37.55 || coords.lng < 127.0 || coords.lng > 127.1) {
          console.log(`  ⚠️  강남구 외 지역 제외: ${stripHtml(place.title)}`)
          continue
        }

        const hospital: Hospital = {
          naver_id: place.link.split('?')[0].split('/').pop() || `${Date.now()}_${Math.random()}`,
          name: stripHtml(place.title),
          address: place.address,
          road_address: place.roadAddress,
          phone: place.telephone,
          category: place.category.includes('소아청소년과') ? '소아청소년과' : '소아과',
          lat: coords.lat,
          lng: coords.lng,
          description: stripHtml(place.description),
          features: extractFeatures(place)
        }

        const saved = await saveHospital(hospital)
        if (saved) totalCount++

        // API 레이트 리밋 대응
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // 페이지 간 대기
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    // 검색어 간 대기
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log(`\n✅ 크롤링 완료! 총 ${totalCount}개 병원 저장`)
  console.log('\n📊 다음 단계:')
  console.log('1. Supabase에서 데이터 확인')
  console.log('2. 웹사이트에서 병원 검색 테스트')
  console.log('3. 실제 리뷰 크롤링 준비')
}

// 실행
crawlGangnamHospitals().catch(console.error)
