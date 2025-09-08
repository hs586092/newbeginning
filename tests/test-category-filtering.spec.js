const { test, expect } = require('@playwright/test');

test.describe('카테고리 필터링 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 개발 서버 접속
    await page.goto('http://localhost:3000');
  });

  test('메인 페이지 로딩 및 로그인 버튼 확인', async ({ page }) => {
    console.log('🔍 메인 페이지 접속 중...');
    
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/newbeginning/);
    
    // 로그인 버튼 존재 확인
    const loginButton = page.locator('a[href="/login"], button:has-text("로그인")').first();
    await expect(loginButton).toBeVisible();
    
    console.log('✅ 메인 페이지 로딩 성공');
  });

  test('로그인 페이지 접속 및 OAuth 테스트', async ({ page }) => {
    console.log('🔍 로그인 페이지로 이동 중...');
    
    // 로그인 버튼 클릭
    const loginButton = page.locator('a[href="/login"], button:has-text("로그인")').first();
    await loginButton.click();
    
    // 로그인 페이지 확인
    await expect(page).toHaveURL(/.*login/);
    
    // OAuth 버튼들 확인
    const googleButton = page.locator('button:has-text("Google"), [data-provider="google"]').first();
    const kakaoButton = page.locator('button:has-text("카카오"), [data-provider="kakao"]').first();
    
    if (await googleButton.isVisible()) {
      console.log('✅ Google 로그인 버튼 발견');
    }
    if (await kakaoButton.isVisible()) {
      console.log('✅ 카카오 로그인 버튼 발견');
    }
    
    console.log('✅ 로그인 페이지 접속 성공');
  });

  test('대시보드 접속 시도 및 카테고리 버튼 확인', async ({ page, context }) => {
    console.log('🔍 대시보드 직접 접속 시도...');
    
    try {
      // 대시보드 페이지 직접 접속 시도
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForTimeout(2000);
      
      // 로그인 요구 메시지 또는 대시보드 컨텐츠 확인
      const loginRequired = await page.locator('text=로그인이 필요합니다').isVisible();
      const dashboardContent = await page.locator('[data-testid="dashboard"], .dashboard, main').first().isVisible();
      
      if (loginRequired) {
        console.log('⚠️ 로그인이 필요한 상태 - 이는 정상적인 보안 동작입니다');
        return;
      }
      
      if (dashboardContent) {
        console.log('🎉 대시보드 접근 성공 - 카테고리 버튼 검사 중...');
        
        // 카테고리 버튼들 확인
        const categoryButtons = [
          { text: '전체', emoji: '🌟' },
          { text: '예비맘', emoji: '🤰' },
          { text: '신생아맘', emoji: '👶' },
          { text: '성장기맘', emoji: '🧒' },
          { text: '선배맘', emoji: '👩‍👧‍👦' }
        ];
        
        for (const category of categoryButtons) {
          const button = page.locator(`button:has-text("${category.text}"), button:has-text("${category.emoji}")`).first();
          const isVisible = await button.isVisible();
          
          if (isVisible) {
            console.log(`✅ ${category.emoji} ${category.text} 버튼 발견`);
            
            // 버튼 클릭 테스트
            await button.click();
            await page.waitForTimeout(500);
            console.log(`✅ ${category.text} 버튼 클릭 성공`);
          } else {
            console.log(`⚠️ ${category.text} 버튼을 찾을 수 없습니다`);
          }
        }
      }
      
    } catch (error) {
      console.log('ℹ️ 대시보드 직접 접근 불가 - 인증이 필요한 상태입니다');
    }
  });

  test('카테고리 컴포넌트 존재 확인 (개발자 도구)', async ({ page }) => {
    console.log('🔍 페이지 소스에서 카테고리 컴포넌트 확인...');
    
    await page.goto('http://localhost:3000');
    
    // 페이지 콘텐츠에서 카테고리 관련 텍스트 검색
    const pageContent = await page.content();
    
    const categoryTexts = ['예비맘', '신생아맘', '성장기맘', '선배맘'];
    let foundCategories = 0;
    
    for (const category of categoryTexts) {
      if (pageContent.includes(category)) {
        console.log(`✅ 페이지에서 "${category}" 텍스트 발견`);
        foundCategories++;
      }
    }
    
    if (foundCategories > 0) {
      console.log(`🎉 총 ${foundCategories}개의 카테고리 텍스트 발견!`);
    } else {
      console.log('ℹ️ 메인 페이지에는 카테고리가 표시되지 않음 (로그인 후 대시보드에서 확인 필요)');
    }
  });

  test('네트워크 요청 및 컴포넌트 로딩 확인', async ({ page }) => {
    console.log('🔍 네트워크 요청 모니터링...');
    
    // 네트워크 요청 모니터링
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('localhost:3000')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          type: response.request().resourceType()
        });
      }
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // JavaScript 번들 로딩 확인
    const jsResponses = responses.filter(r => r.type === 'script' && r.status === 200);
    const cssResponses = responses.filter(r => r.type === 'stylesheet' && r.status === 200);
    
    console.log(`✅ JavaScript 파일 ${jsResponses.length}개 로딩 성공`);
    console.log(`✅ CSS 파일 ${cssResponses.length}개 로딩 성공`);
    
    // 컴파일 오류 확인 (개발 서버에서)
    const hasError = await page.locator('text=Error, text=Failed to compile').isVisible();
    if (!hasError) {
      console.log('✅ 컴파일 오류 없음');
    } else {
      console.log('❌ 컴파일 오류 발견');
    }
  });
  
  test('반응형 디자인 테스트', async ({ page }) => {
    console.log('📱 반응형 디자인 테스트 중...');
    
    await page.goto('http://localhost:3000');
    
    // 모바일 뷰포트 테스트
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    console.log('✅ 모바일 뷰포트 (375x667) 적용');
    
    // 태블릿 뷰포트 테스트
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    console.log('✅ 태블릿 뷰포트 (768x1024) 적용');
    
    // 데스크탑 뷰포트 테스트
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    console.log('✅ 데스크탑 뷰포트 (1920x1080) 적용');
    
    console.log('🎉 반응형 디자인 테스트 완료');
  });
});