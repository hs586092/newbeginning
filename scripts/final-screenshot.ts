import { chromium } from 'playwright'

async function takeScreenshot() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  await page.goto('https://fortheorlingas.com/hospital', { waitUntil: 'networkidle' })
  await page.waitForTimeout(8000)

  await page.screenshot({ path: '/tmp/hospital-final.png', fullPage: true })
  console.log('✅ 스크린샷 저장: /tmp/hospital-final.png')

  // 병원 이름 추출
  const names = await page.locator('h3').allTextContents()
  console.log('\n📋 표시된 병원들:')
  names.slice(0, 10).forEach((name, i) => {
    if (name.trim() && name.length > 3) {
      console.log(`  ${i + 1}. ${name.trim()}`)
    }
  })

  await browser.close()
}

takeScreenshot()
