/**
 * 네이버 지도에서 병원 리뷰 크롤링
 *
 * 사용법:
 * npx tsx scripts/crawl-naver-reviews.ts
 */

import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

interface Review {
  hospital_id: string
  author: string
  rating: number
  content: string
  date: string
  helpful_count?: number
}

async function crawlHospitalReviews(hospitalName: string, hospitalId: string) {
  console.log(`\n🔍 "${hospitalName}" 리뷰 크롤링 시작...`)

  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  try {
    // 네이버 지도 검색
    const searchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(hospitalName)}`
    console.log(`📍 URL: ${searchUrl}`)

    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    })
    await page.waitForTimeout(5000)

    // 첫 번째 검색 결과 클릭 (새 UI)
    try {
      // 여러 선택자 시도
      const possibleSelectors = [
        'li[role="button"]',
        '.search_item',
        'div[class*="search"] li',
        'li a'
      ]

      let clicked = false
      for (const selector of possibleSelectors) {
        try {
          const elements = await page.locator(selector).all()
          if (elements.length > 0) {
            await elements[0].click({ timeout: 3000 })
            clicked = true
            console.log(`✅ 검색 결과 클릭: ${selector}`)
            await page.waitForTimeout(3000)
            break
          }
        } catch (e) {
          continue
        }
      }

      if (!clicked) {
        console.log('⚠️ 검색 결과를 찾을 수 없습니다')
        await browser.close()
        return []
      }
    } catch (e) {
      console.log('⚠️ 검색 결과 클릭 실패')
      await browser.close()
      return []
    }

    // iframe으로 전환
    const frame = page.frameLocator('iframe#entryIframe')

    // 리뷰 탭 클릭
    try {
      await frame.locator('a:has-text("리뷰")').first().click()
      await page.waitForTimeout(2000)
    } catch (e) {
      console.log('⚠️ 리뷰 탭을 찾을 수 없습니다')
      await browser.close()
      return []
    }

    // 리뷰 더보기 버튼 클릭 (최대 3번)
    for (let i = 0; i < 3; i++) {
      try {
        const moreButton = frame.locator('a:has-text("더보기")')
        if (await moreButton.count() > 0) {
          await moreButton.first().click()
          await page.waitForTimeout(1000)
        }
      } catch (e) {
        break
      }
    }

    // 리뷰 수집
    const reviews: Review[] = []
    const reviewElements = await frame.locator('.place_section_review li').all()

    console.log(`📊 발견된 리뷰: ${reviewElements.length}개`)

    for (const reviewEl of reviewElements.slice(0, 20)) { // 최대 20개
      try {
        const author = await reviewEl.locator('.reviewer_name').textContent() || '익명'
        const ratingText = await reviewEl.locator('.rating_star .star_fill').getAttribute('style') || ''
        const ratingMatch = ratingText.match(/width:\s*(\d+)%/)
        const rating = ratingMatch ? Math.round(parseInt(ratingMatch[1]) / 20) : 5

        const content = await reviewEl.locator('.review_content').textContent() || ''
        const date = await reviewEl.locator('.review_date').textContent() || ''

        if (content.trim()) {
          reviews.push({
            hospital_id: hospitalId,
            author: author.trim(),
            rating,
            content: content.trim(),
            date: date.trim()
          })
        }
      } catch (e) {
        continue
      }
    }

    console.log(`✅ ${reviews.length}개 리뷰 수집 완료`)
    await browser.close()
    return reviews

  } catch (error: any) {
    console.error('❌ 크롤링 에러:', error.message)
    await browser.close()
    return []
  }
}

async function saveReviewsToSupabase(reviews: Review[]) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  console.log(`\n💾 Supabase에 ${reviews.length}개 리뷰 저장 중...`)

  for (const review of reviews) {
    const { error } = await supabase
      .from('hospital_reviews')
      .insert({
        hospital_id: review.hospital_id,
        author: review.author,
        rating: review.rating,
        content: review.content,
        review_date: review.date,
        helpful_count: 0
      })

    if (error) {
      console.error('⚠️ 리뷰 저장 실패:', error.message)
    }
  }

  console.log('✅ 리뷰 저장 완료')
}

async function main() {
  console.log('🚀 네이버 지도 리뷰 크롤러 시작\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // 강남구 병원 목록 가져오기
  const { data: hospitals, error } = await supabase
    .from('hospitals')
    .select('id, name')
    .limit(5) // 테스트로 5개만

  if (error || !hospitals) {
    console.error('❌ 병원 목록 조회 실패:', error)
    return
  }

  console.log(`📋 총 ${hospitals.length}개 병원의 리뷰를 크롤링합니다\n`)

  for (const hospital of hospitals) {
    const reviews = await crawlHospitalReviews(hospital.name, hospital.id)

    if (reviews.length > 0) {
      await saveReviewsToSupabase(reviews)
    }

    // 다음 병원 전에 잠시 대기 (네이버 차단 방지)
    await new Promise(resolve => setTimeout(resolve, 5000))
  }

  console.log('\n🎉 모든 리뷰 크롤링 완료!')
}

main()
