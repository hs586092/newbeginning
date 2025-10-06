/**
 * Naver Map Crawler
 *
 * Extracts reviews from Naver Map using Puppeteer (Vercel compatible)
 * Accepts MetricsTracker for performance monitoring
 */

import { MetricsTracker } from '@/types/place'

export interface CrawlResult {
  reviewText: string
  naverUrl: string
}

/**
 * Get browser instance (Vercel-compatible)
 */
async function getBrowser() {
  // Check if running on Vercel
  if (process.env.VERCEL) {
    const chromium = require('chrome-aws-lambda')
    const puppeteer = require('puppeteer-core')

    return await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    })
  } else {
    // Local development - use Playwright
    const { chromium: playwrightChromium } = require('playwright')
    return await playwrightChromium.launch({ headless: true })
  }
}

/**
 * Sleep helper
 */
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Extract reviews from Naver Map
 *
 * @param placeName - Place name to search
 * @param metrics - Optional performance metrics tracker
 * @returns Review text and Naver Map URL
 */
export async function extractReviewsFromNaverMap(
  placeName: string,
  metrics?: MetricsTracker
): Promise<CrawlResult> {
  let browser

  try {
    const start = metrics?.startCrawl()

    browser = await getBrowser()
    const page = await browser.newPage()

    const searchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(placeName)}`
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })

    await sleep(5000)

    // iframe에서 검색 결과 찾기
    const frames = page.frames()
    const searchFrame = frames.find(f => f.url().includes('pcmap.place.naver.com/place/list'))

    if (!searchFrame) {
      throw new Error('검색 결과를 찾을 수 없습니다')
    }

    // 첫 번째 검색 결과 클릭 (Puppeteer API)
    const firstResult = await searchFrame.$('a')
    if (!firstResult) {
      throw new Error('검색 결과를 찾을 수 없습니다')
    }
    await firstResult.click()
    await sleep(5000)

    // 상세 페이지 iframe 찾기
    const framesAfterClick = page.frames()
    let detailFrame = framesAfterClick.find(f =>
      f.url().includes('pcmap.place.naver.com') &&
      !f.url().includes('/list')
    )

    if (!detailFrame) {
      throw new Error('상세 페이지를 찾을 수 없습니다')
    }

    // 리뷰 탭 클릭 시도
    try {
      // Puppeteer doesn't have :has-text selector, use alternative
      const reviewTab = await detailFrame.$('a[href*="review"], button[aria-label*="리뷰"]')
      if (reviewTab) {
        await reviewTab.click()
        await sleep(3000)
      }
    } catch (e) {
      // 리뷰 탭 없으면 전체 페이지 사용
    }

    // 현재 URL (네이버 지도 링크)
    const currentUrl = page.url()

    // 상세 페이지에서 텍스트 추출
    const detailText = await detailFrame.evaluate(() => {
      return document.body.innerText
    })

    await browser.close()

    // 리뷰 섹션 텍스트만 추출 시도
    let reviewText = detailText
    const reviewIndex = detailText.indexOf('리뷰')
    if (reviewIndex !== -1) {
      reviewText = detailText.substring(reviewIndex, reviewIndex + 10000)
    }

    if (start && metrics) {
      metrics.endCrawl(start)
    }

    return {
      reviewText: reviewText.substring(0, 8000),
      naverUrl: currentUrl
    }

  } catch (error: any) {
    if (browser) {
      await browser.close()
    }

    if (metrics) {
      metrics.recordError(error, 'crawl')
    }

    throw error
  }
}
