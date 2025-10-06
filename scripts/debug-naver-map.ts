/**
 * Debug script to test Naver Map crawling locally
 */

import { chromium } from 'playwright'

async function debugNaverMap() {
  const placeName = '스타벅스 강남역점'
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  try {
    console.log('1. Navigating to Naver Map...')
    const searchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(placeName)}`
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 })

    console.log('2. Waiting for page load...')
    await page.waitForTimeout(5000)

    console.log('3. Checking frames...')
    const frames = page.frames()
    console.log(`Found ${frames.length} frames:`)
    frames.forEach((f, i) => {
      console.log(`  Frame ${i}: ${f.url()}`)
    })

    console.log('\n✅ Success! Check browser window.')
    await page.waitForTimeout(60000)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    await browser.close()
  }
}

debugNaverMap()
