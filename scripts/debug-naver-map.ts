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

    console.log('\n3. === Frame Analysis ===')
    const frames = page.frames()
    console.log(`Total frames: ${frames.length}`)
    frames.forEach((f, i) => {
      console.log(`  Frame ${i}: ${f.url()}`)
    })

    console.log('\n4. === Checking iframe elements ===')
    const iframes = await page.evaluate(() => {
      const iframeElements = Array.from(document.querySelectorAll('iframe'))
      return iframeElements.map(iframe => ({
        id: iframe.id,
        name: iframe.name,
        src: iframe.src,
        className: iframe.className
      }))
    })
    console.log('Iframe elements:', JSON.stringify(iframes, null, 2))

    console.log('\n5. === Looking for search frame ===')
    const searchFrame = frames.find(f =>
      f.url().includes('map.naver.com') &&
      (f.url().includes('place') || f.url().includes('search'))
    )

    if (searchFrame) {
      console.log(`✅ Found search frame: ${searchFrame.url()}`)

      console.log('\n6. === Checking elements in frame ===')
      const frameContent = await searchFrame.evaluate(() => {
        return {
          hasLinks: document.querySelectorAll('a').length,
          hasListItems: document.querySelectorAll('li').length,
          bodyText: document.body.innerText.substring(0, 500)
        }
      })
      console.log('Frame content:', frameContent)
    } else {
      console.log('❌ Search frame not found')
    }

    console.log('\n7. === Taking screenshot ===')
    await page.screenshot({ path: '/tmp/naver-map-debug.png', fullPage: true })
    console.log('Screenshot saved to: /tmp/naver-map-debug.png')

    console.log('\n✅ Browser will stay open for 60 seconds. Check manually.')
    await page.waitForTimeout(60000)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    await browser.close()
  }
}

debugNaverMap()
