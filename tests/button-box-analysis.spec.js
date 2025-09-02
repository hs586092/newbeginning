const { test, expect } = require('@playwright/test');

test.describe('🔍 버튼 박스 크기 분석', () => {
  test('현재 버튼 박스 상태 분석', async ({ page, context }) => {
    // 다양한 뷰포트 사이즈 테스트
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'large-desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      console.log(`\n📱 ${viewport.name.toUpperCase()} 분석 (${viewport.width}x${viewport.height})`);
      
      // 뷰포트 설정
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:3003');
      await page.waitForLoadState('networkidle');

      // 사용자 타입 선택 박스 찾기
      const buttonContainer = page.locator('div:has(button:has-text("구직자"))').first();
      
      if (await buttonContainer.isVisible()) {
        // 컨테이너 크기 측정
        const containerBox = await buttonContainer.boundingBox();
        console.log(`📦 컨테이너 크기: ${containerBox.width}x${containerBox.height}px`);

        // 각 버튼 크기 측정
        const buttons = buttonContainer.locator('button');
        const buttonCount = await buttons.count();
        console.log(`🔘 버튼 개수: ${buttonCount}개`);

        for (let i = 0; i < buttonCount; i++) {
          const button = buttons.nth(i);
          const buttonText = await button.textContent();
          const buttonBox = await button.boundingBox();
          
          if (buttonBox) {
            console.log(`  - "${buttonText}": ${buttonBox.width}x${buttonBox.height}px`);
          }
        }

        // 컨테이너 스타일 분석
        const containerClasses = await buttonContainer.getAttribute('class');
        console.log(`🎨 컨테이너 클래스: ${containerClasses}`);

        // 버튼 스타일 분석
        const firstButton = buttons.first();
        const buttonClasses = await firstButton.getAttribute('class');
        console.log(`🎨 버튼 클래스: ${buttonClasses}`);

        // 스크린샷 저장
        await buttonContainer.screenshot({ 
          path: `playwright-outputs/button-box-${viewport.name}-before.png`,
          animations: 'disabled'
        });
        console.log(`📸 스크린샷 저장: button-box-${viewport.name}-before.png`);

      } else {
        console.log(`❌ ${viewport.name}에서 버튼 컨테이너를 찾을 수 없음`);
      }

      // 전체 페이지 스크린샷도 저장
      await page.screenshot({
        path: `playwright-outputs/full-page-${viewport.name}-before.png`,
        fullPage: true
      });
    }

    console.log('\n✅ 버튼 박스 현재 상태 분석 완료');
  });

  test('버튼 박스 상호작용 테스트', async ({ page }) => {
    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');

    console.log('\n🎯 버튼 상호작용 테스트');

    // 각 버튼 클릭 테스트
    const userTypes = ['구직자', '채용담당자', '커뮤니티'];
    
    for (const userType of userTypes) {
      const button = page.locator(`button:has-text("${userType}")`).first();
      
      if (await button.isVisible()) {
        console.log(`🔄 "${userType}" 버튼 클릭 테스트`);
        
        // 클릭 전 상태
        const beforeClick = await button.getAttribute('class');
        
        await button.click();
        await page.waitForTimeout(500); // 애니메이션 대기
        
        // 클릭 후 상태
        const afterClick = await button.getAttribute('class');
        
        console.log(`  이전 클래스: ${beforeClick}`);
        console.log(`  이후 클래스: ${afterClick}`);
        
        // 변화 확인
        if (beforeClick !== afterClick) {
          console.log(`  ✅ 상태 변화 감지됨`);
        } else {
          console.log(`  ⚠️ 상태 변화 없음`);
        }

        // 클릭 후 스크린샷
        const buttonContainer = page.locator('div:has(button:has-text("구직자"))').first();
        await buttonContainer.screenshot({ 
          path: `playwright-outputs/button-${userType}-selected.png`,
          animations: 'disabled'
        });
      }
    }

    console.log('\n✅ 버튼 상호작용 테스트 완료');
  });
});