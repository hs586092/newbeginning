import { chromium } from 'playwright'
import fs from 'fs'

async function captureUIDesign() {
  console.log('🎨 Capturing UI design for analysis...')

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })
  const page = await context.newPage()

  try {
    console.log('📱 Loading site...')
    await page.goto('https://fortheorlingas.com/')

    // Wait for page to load completely
    await page.waitForTimeout(3000)

    console.log('📸 Taking full page screenshot...')
    await page.screenshot({
      path: 'ui-analysis-full.png',
      fullPage: true
    })

    // Navigate to community section where posts would be
    console.log('🏘️ Navigating to community section...')
    try {
      await page.click('text=커뮤니티', { timeout: 5000 })
      await page.waitForTimeout(2000)
      await page.screenshot({
        path: 'ui-analysis-community.png',
        fullPage: true
      })
    } catch (e) {
      console.log('⚠️ Community navigation failed, trying alternative...')

      // Try clicking on navigation menu
      const navLinks = await page.locator('nav a, [role="menuitem"]').all()
      for (const link of navLinks) {
        const text = await link.textContent()
        console.log(`Found nav link: ${text}`)
      }
    }

    // Look for any existing posts or post-like elements
    console.log('🔍 Looking for post elements...')
    const postElements = await page.locator('[class*="post"], [class*="card"], [class*="item"], article').all()
    console.log(`Found ${postElements.length} potential post elements`)

    if (postElements.length > 0) {
      console.log('📸 Capturing post area...')
      await postElements[0].screenshot({ path: 'ui-analysis-post.png' })
    }

    // Analyze CSS styles
    console.log('🎨 Analyzing design system...')
    const styles = await page.evaluate(() => {
      const computedStyle = window.getComputedStyle(document.body)
      return {
        fontFamily: computedStyle.fontFamily,
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        fontSize: computedStyle.fontSize
      }
    })

    // Get primary colors from CSS variables
    const cssVariables = await page.evaluate(() => {
      const root = document.documentElement
      const computedStyle = window.getComputedStyle(root)
      const variables = {}

      // Common CSS variable names to check
      const varNames = [
        '--primary', '--primary-color', '--primary-500',
        '--secondary', '--secondary-color', '--secondary-500',
        '--accent', '--accent-color',
        '--background', '--bg-color', '--bg-primary',
        '--text', '--text-color', '--text-primary',
        '--border', '--border-color',
        '--success', '--error', '--warning',
        '--pink-500', '--blue-500', '--red-500', '--purple-500',
        '--rose-500', '--indigo-500'
      ]

      varNames.forEach(name => {
        const value = computedStyle.getPropertyValue(name)
        if (value) variables[name] = value.trim()
      })

      return variables
    })

    console.log('🎨 Design System Analysis:')
    console.log('Body Styles:', styles)
    console.log('CSS Variables:', cssVariables)

    // Save analysis to file
    const analysis = {
      timestamp: new Date().toISOString(),
      bodyStyles: styles,
      cssVariables: cssVariables,
      screenshots: [
        'ui-analysis-full.png',
        'ui-analysis-community.png',
        'ui-analysis-post.png'
      ]
    }

    fs.writeFileSync('ui-design-analysis.json', JSON.stringify(analysis, null, 2))
    console.log('💾 Design analysis saved to ui-design-analysis.json')

  } catch (error) {
    console.error('❌ Error capturing UI:', error)
  } finally {
    console.log('🔚 Closing browser (keeping it open for manual inspection)...')
    // Don't close immediately to allow manual inspection
    await page.waitForTimeout(5000)
    await browser.close()
  }
}

captureUIDesign().catch(console.error)