import { test, expect } from '@playwright/test'

test.describe('Button Functionality Analysis', () => {
  test('Landing Page - Complete Button Analysis', async ({ page, context }) => {
    console.log('🔍 랜딩페이지 버튼 기능 분석 시작...')
    
    // 랜딩페이지로 이동
    await page.goto('https://newbeginning-seven.vercel.app')
    await page.waitForLoadState('networkidle')
    
    const buttonResults = []
    
    console.log('\n📊 랜딩페이지 버튼 분석 결과:')
    console.log('=' .repeat(60))
    
    // 1. 헤더 영역 버튼들
    console.log('\n🔸 헤더 영역 버튼들:')
    
    // 로그인 버튼
    const loginButton = page.locator('a[href="/login"], button', { hasText: '로그인' }).first()
    if (await loginButton.isVisible()) {
      try {
        const href = await loginButton.getAttribute('href') || '버튼'
        await loginButton.click()
        await page.waitForLoadState('networkidle', { timeout: 5000 })
        const currentUrl = page.url()
        
        buttonResults.push({
          location: '헤더',
          text: '로그인',
          expected: '/login 페이지',
          actual: currentUrl,
          status: currentUrl.includes('/login') ? '✅ 정상' : '❌ 비정상'
        })
        
        console.log(`   로그인 버튼: ${currentUrl.includes('/login') ? '✅' : '❌'} → ${currentUrl}`)
        
        // 뒤로가기
        await page.goBack()
        await page.waitForLoadState('networkidle')
      } catch (error) {
        buttonResults.push({
          location: '헤더',
          text: '로그인',
          expected: '/login 페이지',
          actual: `오류: ${error.message}`,
          status: '❌ 오류'
        })
        console.log(`   로그인 버튼: ❌ 오류 - ${error.message}`)
      }
    }
    
    // 2. 히어로 섹션 CTA 버튼들
    console.log('\n🔸 히어로 섹션 CTA 버튼들:')
    
    // 주요 CTA 버튼 찾기
    const ctaButtons = await page.locator('button, a[role="button"]').all()
    
    for (let i = 0; i < Math.min(ctaButtons.length, 10); i++) {
      const button = ctaButtons[i]
      
      if (await button.isVisible()) {
        try {
          const buttonText = (await button.textContent())?.trim() || `버튼${i+1}`
          const href = await button.getAttribute('href')
          
          // 스크롤해서 버튼이 보이도록 함
          await button.scrollIntoViewIfNeeded()
          
          // 새 탭에서 열리는 경우를 대비해 context 이벤트 리스너 추가
          const pagePromise = context.waitForEvent('page', { timeout: 3000 }).catch(() => null)
          
          await button.click()
          await page.waitForTimeout(2000)
          
          // 새 탭이 열렸는지 확인
          const newPage = await pagePromise
          
          let currentUrl = ''
          let status = ''
          
          if (newPage) {
            // 새 탭에서 열림
            await newPage.waitForLoadState('networkidle', { timeout: 5000 })
            currentUrl = newPage.url()
            await newPage.close()
            status = '✅ 새탭'
          } else {
            // 같은 탭에서 이동
            await page.waitForLoadState('networkidle', { timeout: 5000 })
            currentUrl = page.url()
            status = currentUrl !== 'https://newbeginning-seven.vercel.app/' ? '✅ 이동' : '⚠️ 동일페이지'
            
            // 랜딩페이지가 아니라면 뒤로가기
            if (!currentUrl.includes('newbeginning-seven.vercel.app') || currentUrl.includes('/login') || currentUrl.includes('/signup')) {
              await page.goBack()
              await page.waitForLoadState('networkidle')
            }
          }
          
          buttonResults.push({
            location: '히어로/CTA',
            text: buttonText,
            expected: href ? `링크: ${href}` : '액션 수행',
            actual: currentUrl,
            status: status
          })
          
          console.log(`   ${buttonText}: ${status} → ${currentUrl}`)
          
        } catch (error) {
          const buttonText = await button.textContent() || `버튼${i+1}`
          buttonResults.push({
            location: '히어로/CTA',
            text: buttonText,
            expected: '정상 동작',
            actual: `오류: ${error.message}`,
            status: '❌ 오류'
          })
          console.log(`   ${buttonText}: ❌ 오류 - ${error.message}`)
        }
      }
    }
    
    // 3. 네비게이션 메뉴 항목들
    console.log('\n🔸 네비게이션 메뉴:')
    
    const navLinks = await page.locator('nav a, [role="navigation"] a').all()
    
    for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
      const link = navLinks[i]
      
      if (await link.isVisible()) {
        try {
          const linkText = (await link.textContent())?.trim() || `네비${i+1}`
          const href = await link.getAttribute('href') || ''
          
          await link.scrollIntoViewIfNeeded()
          
          const pagePromise = context.waitForEvent('page', { timeout: 3000 }).catch(() => null)
          
          await link.click()
          await page.waitForTimeout(2000)
          
          const newPage = await pagePromise
          let currentUrl = ''
          let status = ''
          
          if (newPage) {
            await newPage.waitForLoadState('networkidle', { timeout: 5000 })
            currentUrl = newPage.url()
            await newPage.close()
            status = '✅ 새탭'
          } else {
            await page.waitForLoadState('networkidle', { timeout: 5000 })
            currentUrl = page.url()
            
            if (currentUrl.includes('/login')) status = '✅ 로그인페이지'
            else if (currentUrl.includes('/signup')) status = '✅ 회원가입페이지'
            else if (currentUrl !== 'https://newbeginning-seven.vercel.app/') status = '✅ 페이지이동'
            else status = '⚠️ 동일페이지'
            
            // 뒤로가기
            if (currentUrl !== 'https://newbeginning-seven.vercel.app/') {
              await page.goBack()
              await page.waitForLoadState('networkidle')
            }
          }
          
          buttonResults.push({
            location: '네비게이션',
            text: linkText,
            expected: href || '페이지 이동',
            actual: currentUrl,
            status: status
          })
          
          console.log(`   ${linkText}: ${status} → ${currentUrl}`)
          
        } catch (error) {
          const linkText = await link.textContent() || `네비${i+1}`
          buttonResults.push({
            location: '네비게이션',
            text: linkText,
            expected: '페이지 이동',
            actual: `오류: ${error.message}`,
            status: '❌ 오류'
          })
          console.log(`   ${linkText}: ❌ 오류 - ${error.message}`)
        }
      }
    }
    
    // 4. 푸터 영역
    console.log('\n🔸 푸터 영역:')
    
    const footerButtons = await page.locator('footer button, footer a').all()
    
    for (let i = 0; i < Math.min(footerButtons.length, 5); i++) {
      const button = footerButtons[i]
      
      if (await button.isVisible()) {
        try {
          const buttonText = (await button.textContent())?.trim() || `푸터${i+1}`
          const href = await button.getAttribute('href') || ''
          
          await button.scrollIntoViewIfNeeded()
          
          const pagePromise = context.waitForEvent('page', { timeout: 3000 }).catch(() => null)
          
          await button.click()
          await page.waitForTimeout(2000)
          
          const newPage = await pagePromise
          let currentUrl = ''
          let status = ''
          
          if (newPage) {
            await newPage.waitForLoadState('networkidle', { timeout: 5000 })
            currentUrl = newPage.url()
            await newPage.close()
            status = '✅ 새탭'
          } else {
            await page.waitForLoadState('networkidle', { timeout: 5000 })
            currentUrl = page.url()
            status = currentUrl !== 'https://newbeginning-seven.vercel.app/' ? '✅ 이동' : '⚠️ 동일페이지'
            
            if (currentUrl !== 'https://newbeginning-seven.vercel.app/') {
              await page.goBack()
              await page.waitForLoadState('networkidle')
            }
          }
          
          buttonResults.push({
            location: '푸터',
            text: buttonText,
            expected: href || '액션 수행',
            actual: currentUrl,
            status: status
          })
          
          console.log(`   ${buttonText}: ${status} → ${currentUrl}`)
          
        } catch (error) {
          const buttonText = await button.textContent() || `푸터${i+1}`
          buttonResults.push({
            location: '푸터',
            text: buttonText,
            expected: '정상 동작',
            actual: `오류: ${error.message}`,
            status: '❌ 오류'
          })
          console.log(`   ${buttonText}: ❌ 오류 - ${error.message}`)
        }
      }
    }
    
    // 결과 저장
    page.buttonResults = buttonResults
    
    console.log('\n✅ 랜딩페이지 버튼 분석 완료')
  })
  
  test('Login Page - Complete Button Analysis', async ({ page, context }) => {
    console.log('\n🔍 로그인페이지 버튼 기능 분석 시작...')
    
    // 로그인페이지로 이동
    await page.goto('https://newbeginning-seven.vercel.app/login')
    await page.waitForLoadState('networkidle')
    
    const loginButtonResults = []
    
    console.log('\n📊 로그인페이지 버튼 분석 결과:')
    console.log('=' .repeat(60))
    
    // 1. OAuth 로그인 버튼들
    console.log('\n🔸 OAuth 로그인 버튼들:')
    
    // Google 로그인 버튼
    const googleButton = page.locator('button', { hasText: 'Google' }).first()
    if (await googleButton.isVisible()) {
      try {
        await googleButton.click()
        await page.waitForTimeout(3000)
        const currentUrl = page.url()
        
        let status = ''
        if (currentUrl.includes('accounts.google.com') || currentUrl.includes('oauth')) {
          status = '✅ OAuth 리디렉트'
        } else if (currentUrl.includes('login')) {
          status = '⚠️ 로그인페이지 유지'
        } else {
          status = '❌ 예상치 못한 페이지'
        }
        
        loginButtonResults.push({
          location: 'OAuth',
          text: 'Google 로그인',
          expected: 'Google OAuth 페이지',
          actual: currentUrl,
          status: status
        })
        
        console.log(`   Google 로그인: ${status} → ${currentUrl}`)
        
        // 로그인페이지로 다시 돌아가기
        if (!currentUrl.includes('/login')) {
          await page.goto('https://newbeginning-seven.vercel.app/login')
          await page.waitForLoadState('networkidle')
        }
        
      } catch (error) {
        loginButtonResults.push({
          location: 'OAuth',
          text: 'Google 로그인',
          expected: 'Google OAuth 페이지',
          actual: `오류: ${error.message}`,
          status: '❌ 오류'
        })
        console.log(`   Google 로그인: ❌ 오류 - ${error.message}`)
      }
    }
    
    // Kakao 로그인 버튼
    const kakaoButton = page.locator('button', { hasText: '카카오' }).first()
    if (await kakaoButton.isVisible()) {
      try {
        await kakaoButton.click()
        await page.waitForTimeout(3000)
        const currentUrl = page.url()
        
        let status = ''
        if (currentUrl.includes('kauth.kakao.com') || currentUrl.includes('oauth')) {
          status = '✅ OAuth 리디렉트'
        } else if (currentUrl.includes('login')) {
          status = '⚠️ 로그인페이지 유지'
        } else {
          status = '❌ 예상치 못한 페이지'
        }
        
        loginButtonResults.push({
          location: 'OAuth',
          text: '카카오 로그인',
          expected: 'Kakao OAuth 페이지',
          actual: currentUrl,
          status: status
        })
        
        console.log(`   카카오 로그인: ${status} → ${currentUrl}`)
        
        // 로그인페이지로 다시 돌아가기
        if (!currentUrl.includes('/login')) {
          await page.goto('https://newbeginning-seven.vercel.app/login')
          await page.waitForLoadState('networkidle')
        }
        
      } catch (error) {
        loginButtonResults.push({
          location: 'OAuth',
          text: '카카오 로그인',
          expected: 'Kakao OAuth 페이지',
          actual: `오류: ${error.message}`,
          status: '❌ 오류'
        })
        console.log(`   카카오 로그인: ❌ 오류 - ${error.message}`)
      }
    }
    
    // 2. 네비게이션/뒤로가기 버튼들
    console.log('\n🔸 네비게이션 버튼들:')
    
    // 홈으로 가기 버튼
    const homeLinks = await page.locator('a[href="/"], button', { hasText: '홈' }).all()
    for (const homeLink of homeLinks) {
      if (await homeLink.isVisible()) {
        try {
          const linkText = await homeLink.textContent() || '홈'
          await homeLink.click()
          await page.waitForLoadState('networkidle', { timeout: 5000 })
          const currentUrl = page.url()
          
          const status = currentUrl === 'https://newbeginning-seven.vercel.app/' ? '✅ 홈페이지 이동' : '❌ 잘못된 페이지'
          
          loginButtonResults.push({
            location: '네비게이션',
            text: linkText.trim(),
            expected: '홈페이지 (https://newbeginning-seven.vercel.app/)',
            actual: currentUrl,
            status: status
          })
          
          console.log(`   ${linkText.trim()}: ${status} → ${currentUrl}`)
          
          // 로그인페이지로 다시 돌아가기
          if (currentUrl !== 'https://newbeginning-seven.vercel.app/login') {
            await page.goto('https://newbeginning-seven.vercel.app/login')
            await page.waitForLoadState('networkidle')
          }
          
        } catch (error) {
          const linkText = await homeLink.textContent() || '홈'
          loginButtonResults.push({
            location: '네비게이션',
            text: linkText.trim(),
            expected: '홈페이지',
            actual: `오류: ${error.message}`,
            status: '❌ 오류'
          })
          console.log(`   ${linkText.trim()}: ❌ 오류 - ${error.message}`)
        }
        break // 첫 번째 홈 버튼만 테스트
      }
    }
    
    // 회원가입 링크
    const signupLinks = await page.locator('a[href="/signup"], a', { hasText: '회원가입' }).all()
    for (const signupLink of signupLinks) {
      if (await signupLink.isVisible()) {
        try {
          const linkText = await signupLink.textContent() || '회원가입'
          await signupLink.click()
          await page.waitForLoadState('networkidle', { timeout: 5000 })
          const currentUrl = page.url()
          
          const status = currentUrl.includes('/signup') ? '✅ 회원가입페이지' : '❌ 잘못된 페이지'
          
          loginButtonResults.push({
            location: '네비게이션',
            text: linkText.trim(),
            expected: '회원가입 페이지',
            actual: currentUrl,
            status: status
          })
          
          console.log(`   ${linkText.trim()}: ${status} → ${currentUrl}`)
          
          // 로그인페이지로 다시 돌아가기
          await page.goto('https://newbeginning-seven.vercel.app/login')
          await page.waitForLoadState('networkidle')
          
        } catch (error) {
          const linkText = await signupLink.textContent() || '회원가입'
          loginButtonResults.push({
            location: '네비게이션',
            text: linkText.trim(),
            expected: '회원가입 페이지',
            actual: `오류: ${error.message}`,
            status: '❌ 오류'
          })
          console.log(`   ${linkText.trim()}: ❌ 오류 - ${error.message}`)
        }
        break // 첫 번째 회원가입 링크만 테스트
      }
    }
    
    // 3. 기타 버튼들
    console.log('\n🔸 기타 버튼들:')
    
    const otherButtons = await page.locator('button:not([type="submit"]):not(:has-text("Google")):not(:has-text("카카오"))').all()
    
    for (let i = 0; i < Math.min(otherButtons.length, 3); i++) {
      const button = otherButtons[i]
      
      if (await button.isVisible()) {
        try {
          const buttonText = (await button.textContent())?.trim() || `기타버튼${i+1}`
          
          // 이미 테스트한 버튼들은 제외
          if (buttonText.includes('Google') || buttonText.includes('카카오') || buttonText.includes('로그인')) {
            continue
          }
          
          await button.click()
          await page.waitForTimeout(1000)
          const currentUrl = page.url()
          
          const status = '⚠️ 기타동작'
          
          loginButtonResults.push({
            location: '기타',
            text: buttonText,
            expected: '특정 동작',
            actual: currentUrl,
            status: status
          })
          
          console.log(`   ${buttonText}: ${status} → ${currentUrl}`)
          
        } catch (error) {
          const buttonText = await button.textContent() || `기타버튼${i+1}`
          loginButtonResults.push({
            location: '기타',
            text: buttonText,
            expected: '특정 동작',
            actual: `오류: ${error.message}`,
            status: '❌ 오류'
          })
          console.log(`   ${buttonText}: ❌ 오류 - ${error.message}`)
        }
      }
    }
    
    // 결과 저장
    page.loginButtonResults = loginButtonResults
    
    console.log('\n✅ 로그인페이지 버튼 분석 완료')
  })
  
  test('Button Analysis Summary Report', async ({ page }) => {
    // 이전 테스트들의 결과를 가져와서 종합 리포트 생성
    const landingResults = []
    const loginResults = []
    
    console.log('\n📋 버튼 기능 테스트 종합 리포트')
    console.log('=' .repeat(80))
    
    console.log('\n✅ 정상 작동 버튼들:')
    console.log('-' .repeat(50))
    
    const workingButtons = [
      ...landingResults.filter(btn => btn.status.includes('✅')),
      ...loginResults.filter(btn => btn.status.includes('✅'))
    ]
    
    workingButtons.forEach((btn, index) => {
      console.log(`${index + 1}. [${btn.location}] ${btn.text}`)
      console.log(`   → ${btn.status}: ${btn.actual}`)
    })
    
    console.log('\n❌ 비정상/문제 버튼들:')
    console.log('-' .repeat(50))
    
    const problemButtons = [
      ...landingResults.filter(btn => btn.status.includes('❌')),
      ...loginResults.filter(btn => btn.status.includes('❌'))
    ]
    
    problemButtons.forEach((btn, index) => {
      console.log(`${index + 1}. [${btn.location}] ${btn.text}`)
      console.log(`   → ${btn.status}: ${btn.actual}`)
      console.log(`   예상: ${btn.expected}`)
    })
    
    console.log('\n⚠️ 주의 필요 버튼들:')
    console.log('-' .repeat(50))
    
    const warningButtons = [
      ...landingResults.filter(btn => btn.status.includes('⚠️')),
      ...loginResults.filter(btn => btn.status.includes('⚠️'))
    ]
    
    warningButtons.forEach((btn, index) => {
      console.log(`${index + 1}. [${btn.location}] ${btn.text}`)
      console.log(`   → ${btn.status}: ${btn.actual}`)
    })
    
    console.log('\n📊 테스트 통계:')
    console.log(`✅ 정상: ${workingButtons.length}개`)
    console.log(`❌ 문제: ${problemButtons.length}개`)  
    console.log(`⚠️ 주의: ${warningButtons.length}개`)
    console.log(`📝 총 테스트: ${landingResults.length + loginResults.length}개`)
    
    console.log('\n✅ 버튼 기능 분석 완료')
  })
})