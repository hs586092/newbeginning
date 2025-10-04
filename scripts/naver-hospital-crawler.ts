/**
 * 네이버 지도 API를 사용한 서울 소아과 병원 크롤러
 *
 * 사용법:
 * 1. 네이버 클라우드 플랫폼에서 "Maps" API 신청
 * 2. Client ID, Client Secret 발급
 * 3. .env.local에 추가:
 *    NAVER_CLIENT_ID=your_client_id
 *    NAVER_CLIENT_SECRET=your_client_secret
 * 4. npm install axios
 * 5. ts-node scripts/naver-hospital-crawler.ts
 */

import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

// 환경 변수
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || ''
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || ''
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Supabase 클라이언트
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// 서울 25개 구
const SEOUL_DISTRICTS = [
  '강남구', '강동구', '강북구', '강서구', '관악구',
  '광진구', '구로구', '금천구', '노원구', '도봉구',
  '동대문구', '동작구', '마포구', '서대문구', '서초구',
  '성동구', '성북구', '송파구', '양천구', '영등포구',
  '용산구', '은평구', '종로구', '중구', '중랑구'
]

interface NaverPlace {
  title: string
  link: string
  category: string
  description: string
  telephone: string
  address: string
  roadAddress: string
  mapx: string // 경도 (EPSG:3857)
  mapy: string // 위도 (EPSG:3857)
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
}

// EPSG:3857 → WGS84 좌표 변환
function convertCoordinates(mapx: string, mapy: string): { lat: number; lng: number } {
  const x = parseInt(mapx) / 10000000
  const y = parseInt(mapy) / 10000000
  return { lat: y, lng: x }
}

// 네이버 지역 검색 API
async function searchPlaces(query: string, start: number = 1): Promise<NaverPlace[]> {
  try {
    const response = await axios.get('https://openapi.naver.com/v1/search/local.json', {
      params: {
        query,
        display: 5, // 한 번에 5개씩
        start,
        sort: 'random' // 랜덤 정렬로 다양한 결과
      },
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
      }
    })
    return response.data.items || []
  } catch (error) {
    console.error('네이버 API 에러:', error)
    return []
  }
}

// HTML 태그 제거
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
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
      features: [], // 나중에 리뷰 분석으로 추출
      last_updated: new Date().toISOString()
    }, {
      onConflict: 'naver_id'
    })

  if (error) {
    console.error('DB 저장 에러:', error)
  } else {
    console.log(`✅ ${hospital.name} 저장 완료`)
  }
}

// 메인 크롤링 함수
async function crawlSeoulHospitals() {
  console.log('🏥 서울 소아과 병원 크롤링 시작...\n')

  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    console.error('❌ 네이버 API 키가 없습니다. .env.local을 확인하세요.')
    return
  }

  let totalCount = 0

  for (const district of SEOUL_DISTRICTS) {
    console.log(`\n📍 ${district} 검색 중...`)

    // 소아과 검색
    const queries = [
      `서울 ${district} 소아과`,
      `서울 ${district} 소아청소년과`
    ]

    for (const query of queries) {
      const places = await searchPlaces(query)

      for (const place of places) {
        const coords = convertCoordinates(place.mapx, place.mapy)

        const hospital: Hospital = {
          naver_id: place.link.split('?')[0].split('/').pop() || '',
          name: stripHtml(place.title),
          address: place.address,
          road_address: place.roadAddress,
          phone: place.telephone,
          category: place.category.includes('소아청소년과') ? '소아청소년과' : '소아과',
          lat: coords.lat,
          lng: coords.lng,
          description: stripHtml(place.description)
        }

        await saveHospital(hospital)
        totalCount++
      }

      // API 요청 제한 (하루 25,000건)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  console.log(`\n✅ 크롤링 완료! 총 ${totalCount}개 병원 저장`)
}

// 실행
crawlSeoulHospitals().catch(console.error)
