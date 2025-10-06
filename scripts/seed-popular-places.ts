/**
 * Seed popular places with mock review data
 * This allows the system to work while we fix the real-time crawler
 */

import { createClient } from '@supabase/supabase-js'
import { normalizePlaceName } from '../src/lib/utils/normalizer'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gwqvqncgveqenzymwlmy.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTkyMzYsImV4cCI6MjA3MzQ5NTIzNn0.UG11UfT3c9qUxAAMj9Uv3_7L5upD1KwX6iI_MKLOeu0'
const supabase = createClient(supabaseUrl, supabaseKey)

const popularPlaces = [
  {
    placeName: '스타벅스 강남역점',
    summary: '강남역 근처에 위치한 스타벅스로, 접근성이 매우 좋습니다. 넓은 공간과 다양한 좌석이 있어 공부나 업무하기 좋습니다.',
    pros: ['접근성 좋음', '넓은 공간', '다양한 좌석', '콘센트 많음', '와이파이 빠름'],
    cons: ['사람이 많음', '시끄러운 편', '주말 혼잡', '주차 어려움'],
    sentiment: 'positive' as const,
    reviewCount: 542,
    naverMapUrl: 'https://map.naver.com/v5/search/스타벅스%20강남역점'
  },
  {
    placeName: '무지개의원',
    summary: '친절한 의료진과 깨끗한 시설로 평가받는 동네 의원입니다. 대기 시간이 짧고 설명이 자세합니다.',
    pros: ['친절한 의료진', '깨끗한 시설', '대기시간 짧음', '자세한 설명', '주차 가능'],
    cons: ['예약 필수', '주말 진료 없음'],
    sentiment: 'positive' as const,
    reviewCount: 89,
    naverMapUrl: 'https://map.naver.com/v5/search/무지개의원'
  },
  {
    placeName: '교보문고 광화문점',
    summary: '국내 최대 규모의 서점으로 다양한 도서와 문구류를 갖추고 있습니다. 넓은 공간과 편안한 독서 환경이 특징입니다.',
    pros: ['도서 종류 다양', '넓은 공간', '편안한 분위기', '문구류 충실', '접근성 좋음'],
    cons: ['주말 혼잡', '주차비 비쌈', '카페 가격대 높음'],
    sentiment: 'positive' as const,
    reviewCount: 1234,
    naverMapUrl: 'https://map.naver.com/v5/search/교보문고%20광화문점'
  },
  {
    placeName: '애플스토어 가로수길',
    summary: '세련된 디자인의 애플 매장으로 제품 체험과 상담이 가능합니다. 친절한 직원과 편안한 쇼핑 환경이 장점입니다.',
    pros: ['제품 체험 가능', '친절한 직원', '세련된 인테리어', '위치 좋음', 'A/S 편리'],
    cons: ['항상 붐빔', '대기 시간 김', '주차 불가'],
    sentiment: 'positive' as const,
    reviewCount: 876,
    naverMapUrl: 'https://map.naver.com/v5/search/애플스토어%20가로수길'
  },
  {
    placeName: '백종원의 골목식당 신사점',
    summary: '합리적인 가격에 푸짐한 양의 한식을 제공하는 맛집입니다. TV 방영 이후 인기가 높아졌습니다.',
    pros: ['가성비 좋음', '푸짐한 양', '맛있음', '친절한 서비스', '깔끔한 인테리어'],
    cons: ['대기 시간 김', '주차 어려움', '주말 예약 필수'],
    sentiment: 'positive' as const,
    reviewCount: 653,
    naverMapUrl: 'https://map.naver.com/v5/search/백종원의골목식당%20신사점'
  },
  {
    placeName: '강남세브란스병원',
    summary: '첨단 의료 장비와 전문 의료진을 갖춘 종합병원입니다. 체계적인 진료 시스템과 친절한 서비스가 특징입니다.',
    pros: ['전문 의료진', '첨단 장비', '체계적 시스템', '친절한 간호사', '주차장 넓음'],
    cons: ['대기 시간 김', '비용 비쌈', '예약 어려움', '복잡한 구조'],
    sentiment: 'positive' as const,
    reviewCount: 2341,
    naverMapUrl: 'https://map.naver.com/v5/search/강남세브란스병원'
  }
]

async function seedPlaces() {
  console.log('🌱 Starting to seed popular places...\n')

  for (const place of popularPlaces) {
    const normalizedName = normalizePlaceName(place.placeName)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    console.log(`📍 Seeding: ${place.placeName}`)
    console.log(`   Normalized: ${normalizedName}`)

    try {
      const { data, error } = await supabase
        .from('place_summaries')
        .upsert({
          place_name_original: place.placeName,
          place_name_normalized: normalizedName,
          placename: place.placeName,
          summary: place.summary,
          pros: place.pros,
          cons: place.cons,
          sentiment: place.sentiment,
          reviewcount: place.reviewCount,
          navermapurl: place.naverMapUrl,
          cached_at: new Date().toISOString(),
          expires_at: expiresAt,
          request_count: 1,
          last_requested_at: new Date().toISOString(),
          is_revalidating: false
        }, {
          onConflict: 'place_name_normalized'
        })

      if (error) {
        console.log(`   ❌ Error: ${error.message}`)
      } else {
        console.log(`   ✅ Success!`)
      }
    } catch (err: any) {
      console.log(`   ❌ Error: ${err.message}`)
    }

    console.log()
  }

  console.log('✅ Seeding complete!')
}

seedPlaces().catch(console.error)
