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
    const chromium = require('@sparticuz/chromium')
    const puppeteer = require('puppeteer-core')

    return await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
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

    // Set viewport
    await page.setViewport({ width: 1280, height: 720 })

    const searchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(placeName)}`
    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    // Wait for iframes to load
    await sleep(3000)

    // Find search result iframe - try multiple times
    let searchFrame = null
    for (let i = 0; i < 3; i++) {
      const frames = page.frames()
      searchFrame = frames.find(f => f.url().includes('pcmap.place.naver.com'))

      if (searchFrame) break
      await sleep(2000)
    }

    if (!searchFrame) {
      throw new Error('검색 결과를 찾을 수 없습니다')
    }

    // Wait for search results to appear
    await sleep(2000)

    // Click first search result - try multiple selectors
    let clicked = false
    const selectors = [
      'a[class*="place"]',
      'li[class*="search"] a',
      'div[class*="search"] a',
      '.search_item a',
      'a'
    ]

    for (const selector of selectors) {
      try {
        const firstResult = await searchFrame.$(selector)
        if (firstResult) {
          await firstResult.click()
          clicked = true
          break
        }
      } catch (e) {
        continue
      }
    }

    if (!clicked) {
      throw new Error('검색 결과를 찾을 수 없습니다')
    }

    // Wait for detail page to load
    await sleep(4000)

    // Find detail iframe
    let detailFrame = null
    for (let i = 0; i < 3; i++) {
      const frames = page.frames()
      detailFrame = frames.find(f =>
        f.url().includes('pcmap.place.naver.com') &&
        f.url().includes('/place/')
      )

      if (detailFrame) break
      await sleep(2000)
    }

    if (!detailFrame) {
      throw new Error('상세 페이지를 찾을 수 없습니다')
    }

    // Wait for content to load
    await sleep(2000)

    // Extract all text content
    const detailText = await detailFrame.evaluate(() => {
      return document.body.innerText
    })

    // Get current URL
    const currentUrl = page.url()

    await browser.close()

    // Extract review section
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
