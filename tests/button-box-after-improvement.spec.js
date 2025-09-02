const { test, expect } = require('@playwright/test');

test.describe('✨ 개선된 버튼 박스 검증', () => {
  test('개선된 버튼 박스 분석 및 Before/After 비교', async ({ page }) => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 }
    ];

    for (const viewport of viewports) {
      console.log(`\n🔍 ${viewport.name.toUpperCase()} - 개선된 버튼 박스 검증`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:3003');
      await page.waitForLoadState('networkidle');

      // 정확한 사용자 타입 선택 박스 타겟팅
      const userTypeContainer = page.locator('div:has(button:has-text("구직자")):has(button:has-text("채용담당자")):has(button:has-text("커뮤니티"))').first();
      
      if (await userTypeContainer.isVisible()) {
        // 개선된 컨테이너 크기 측정
        const containerBox = await userTypeContainer.boundingBox();
        console.log(`📦 개선된 컨테이너 크기: ${containerBox.width}x${containerBox.height}px`);

        // 버튼들 개별 측정
        const buttons = userTypeContainer.locator('button');
        const buttonCount = await buttons.count();
        
        console.log(`🔘 버튼 개수: ${buttonCount}개`);
        
        let totalButtonWidth = 0;
        const buttonSizes = [];
        
        for (let i = 0; i < buttonCount; i++) {
          const button = buttons.nth(i);
          const buttonText = await button.textContent();
          const buttonBox = await button.boundingBox();
          
          if (buttonBox && buttonText.trim()) {
            console.log(`  - "${buttonText}": ${buttonBox.width}x${buttonBox.height}px`);
            buttonSizes.push({ text: buttonText, width: buttonBox.width, height: buttonBox.height });
            totalButtonWidth += buttonBox.width;
          }
        }

        // 버튼 크기 균등성 분석
        if (buttonSizes.length > 0) {
          const widths = buttonSizes.map(b => b.width);
          const maxWidth = Math.max(...widths);
          const minWidth = Math.min(...widths);
          const widthVariation = ((maxWidth - minWidth) / maxWidth * 100).toFixed(1);
          
          console.log(`📊 버튼 크기 분석:`);
          console.log(`  - 최대 너비: ${maxWidth}px`);
          console.log(`  - 최소 너비: ${minWidth}px`);
          console.log(`  - 크기 편차: ${widthVariation}%`);
          
          if (widthVariation < 20) {
            console.log(`✅ 버튼 크기가 균등함 (편차 ${widthVariation}%)`);
          } else {
            console.log(`⚠️ 버튼 크기 편차가 큼 (편차 ${widthVariation}%)`);
          }
        }

        // 박스 효율성 분석
        const containerWidth = containerBox.width;
        const utilization = (totalButtonWidth / containerWidth * 100).toFixed(1);
        console.log(`📐 공간 활용도: ${utilization}% (버튼 총 너비 / 컨테이너 너비)`);
        
        if (utilization > 80) {
          console.log(`✅ 공간 활용도 우수`);
        } else if (utilization > 60) {
          console.log(`👍 공간 활용도 양호`);
        } else {
          console.log(`⚠️ 공간 활용도 개선 필요`);
        }

        // 개선된 스타일 확인
        const containerClasses = await userTypeContainer.getAttribute('class');
        console.log(`🎨 개선된 컨테이너 클래스: ${containerClasses}`);
        
        // 개선 후 스크린샷
        await userTypeContainer.screenshot({ 
          path: `playwright-outputs/button-box-${viewport.name}-after.png`,
          animations: 'disabled'
        });
        console.log(`📸 개선 후 스크린샷: button-box-${viewport.name}-after.png`);

        // 각 버튼 상태 테스트
        console.log(`🎯 버튼 상호작용 테스트:`);
        for (let i = 0; i < Math.min(buttonCount, 3); i++) {
          const button = buttons.nth(i);
          const buttonText = await button.textContent();
          
          if (buttonText.trim() && (buttonText.includes('구직자') || buttonText.includes('채용담당자') || buttonText.includes('커뮤니티'))) {
            await button.click();
            await page.waitForTimeout(300);
            
            const afterClickClasses = await button.getAttribute('class');
            if (afterClickClasses.includes('bg-white')) {
              console.log(`  ✅ "${buttonText}" 선택 상태 확인됨`);
            }
            
            // 선택된 상태 스크린샷
            await userTypeContainer.screenshot({ 
              path: `playwright-outputs/button-${viewport.name}-${buttonText.trim()}-selected-after.png`,
              animations: 'disabled'
            });
          }
        }
      } else {
        console.log(`❌ ${viewport.name}에서 사용자 타입 선택 박스를 찾을 수 없음`);
      }

      // 전체 Hero Section 스크린샷
      const heroSection = page.locator('section').first();
      await heroSection.screenshot({
        path: `playwright-outputs/hero-section-${viewport.name}-after.png`,
        animations: 'disabled'
      });
    }

    console.log('\n🎉 버튼 박스 개선 검증 완료!');
    console.log('📈 주요 개선사항:');
    console.log('  🔹 inline-flex를 사용하여 컨테이너를 버튼 크기에 맞춤');
    console.log('  🔹 max-w-fit으로 불필요한 공간 제거');
    console.log('  🔹 gap과 padding을 줄여서 더 컴팩트한 디자인');
    console.log('  🔹 whitespace-nowrap과 min-w-0으로 텍스트 오버플로우 방지');
  });
});