/**
 * 네이버 검색 API를 사용한 리뷰 수집
 *
 * 참고: 네이버 검색 API는 블로그/카페 리뷰를 제공합니다.
 * 지도 앱 내부 리뷰는 공식 API로 제공되지 않습니다.
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
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || ''
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || ''

interface NaverBlogItem {
  title: string
  link: string
  description: string
  bloggername: string
  bloggerlink: string
  postdate: string
}

interface Review {
  hospital_id: string
  author: string
  rating: number
  content: string
  date: string
  source_url?: string
}

async function searchBlogReviews(hospitalName: string): Promise<NaverBlogItem[]> {
  const query = encodeURIComponent(`${hospitalName} 리뷰`)
  const url = `https://openapi.naver.com/v1/search/blog.json?query=${query}&display=10&sort=sim`

  try {
    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
      }
    })

    if (!response.ok) {
      console.error(`❌ API 오류: ${response.status}`)
      return []
    }

    const data = await response.json()
    return data.items || []

  } catch (error: any) {
    console.error('❌ API 요청 실패:', error.message)
    return []
  }
}

function extractRatingFromText(text: string): number {
  // 별점 패턴 찾기 (★, 별, 5점 만점 등)
  const patterns = [
    /별점[:\s]*([1-5])/,
    /평점[:\s]*([1-5])/,
    /([1-5])점/,
    /★{1,5}/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      if (pattern.source.includes('★')) {
        return match[0].length // ★의 개수
      }
      return parseInt(match[1])
    }
  }

  // 긍정적/부정적 키워드 기반 추정
  const positive = ['추천', '좋아요', '만족', '친절', '최고', '감사']
  const negative = ['별로', '실망', '불친절', '아쉽', '후회']

  const positiveCount = positive.filter(word => text.includes(word)).length
  const negativeCount = negative.filter(word => text.includes(word)).length

  if (positiveCount > negativeCount + 1) return 5
  if (positiveCount > negativeCount) return 4
  if (negativeCount > positiveCount) return 2
  return 3 // 중립
}

function cleanHtmlTags(text: string): string {
  return text
    .replace(/<[^>]+>/g, '') // HTML 태그 제거
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

async function convertBlogToReviews(
  hospitalId: string,
  hospitalName: string,
  blogItems: NaverBlogItem[]
): Promise<Review[]> {
  const reviews: Review[] = []

  for (const item of blogItems) {
    const title = cleanHtmlTags(item.title)
    const description = cleanHtmlTags(item.description)
    const content = `${title}\n\n${description}`

    // 병원 이름이 포함되지 않은 경우 스킵
    if (!content.includes(hospitalName.replace('의원', '').replace('병원', ''))) {
      continue
    }

    const rating = extractRatingFromText(content)

    reviews.push({
      hospital_id: hospitalId,
      author: item.bloggername || '익명',
      rating,
      content: description.substring(0, 500), // 최대 500자
      date: item.postdate,
      source_url: item.link
    })
  }

  return reviews
}

async function saveReviewsToSupabase(reviews: Review[]) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  console.log(`💾 Supabase에 ${reviews.length}개 리뷰 저장 중...`)

  let successCount = 0
  let skipCount = 0

  for (const review of reviews) {
    const { error } = await supabase
      .from('hospital_reviews')
      .insert({
        hospital_id: review.hospital_id,
        author: review.author,
        rating: review.rating,
        content: review.content,
        review_date: review.date,
        source_url: review.source_url,
        helpful_count: 0
      })

    if (error) {
      if (error.code === '23505') {
        // 중복 리뷰
        skipCount++
      } else {
        console.error('  ⚠️ 리뷰 저장 실패:', error.message)
      }
    } else {
      successCount++
    }
  }

  console.log(`✅ ${successCount}개 저장 완료, ${skipCount}개 중복 스킵`)
}

async function main() {
  console.log('🚀 네이버 검색 API 리뷰 수집 시작\n')

  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    console.error('❌ 네이버 API 키가 설정되지 않았습니다.')
    return
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // 강남구 병원 목록 가져오기 (5개만 테스트)
  const { data: hospitals, error } = await supabase
    .from('hospitals')
    .select('id, name')
    .limit(5)

  if (error || !hospitals) {
    console.error('❌ 병원 목록 조회 실패:', error)
    return
  }

  console.log(`📋 총 ${hospitals.length}개 병원의 리뷰를 수집합니다\n`)

  for (const hospital of hospitals) {
    console.log(`\n🔍 "${hospital.name}" 리뷰 검색 중...`)

    // 블로그 검색
    const blogItems = await searchBlogReviews(hospital.name)
    console.log(`📊 블로그 검색 결과: ${blogItems.length}개`)

    if (blogItems.length === 0) {
      console.log('⚠️ 검색 결과 없음')
      continue
    }

    // 리뷰로 변환
    const reviews = await convertBlogToReviews(hospital.id, hospital.name, blogItems)
    console.log(`📝 리뷰 추출: ${reviews.length}개`)

    if (reviews.length > 0) {
      await saveReviewsToSupabase(reviews)
    }

    // API 호출 제한 대비 대기
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n🎉 리뷰 수집 완료!')
  console.log('\n💡 참고: 네이버 지도 앱 내부 리뷰는 공식 API로 제공되지 않습니다.')
  console.log('   블로그/카페 리뷰를 수집했습니다.')
}

main()
