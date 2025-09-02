const { test, expect } = require('@playwright/test');

test.describe('🎯 정확한 사용자 타입 선택 박스 테스트', () => {
  test('정확한 버튼 박스만 측정하여 Before/After 비교', async ({ page }) => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 }
    ];

    for (const viewport of viewports) {
      console.log(`\n🔍 ${viewport.name.toUpperCase()} - 정확한 사용자 타입 선택 박스 분석`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:3003');
      await page.waitForLoadState('networkidle');

      // 더 정확한 CSS 선택자로 사용자 타입 선택 박스만 타겟팅
      const userTypeSelector = page.locator('.bg-black\\/10.backdrop-blur-md.rounded-2xl').first();
      
      if (await userTypeSelector.isVisible()) {
        // 정확한 박스 크기 측정
        const boxDimensions = await userTypeSelector.boundingBox();
        console.log(`📦 사용자 타입 선택 박스 크기: ${boxDimensions.width}x${boxDimensions.height}px`);

        // 박스 내부의 버튼들만 측정
        const typeButtons = userTypeSelector.locator('button');
        const typeButtonCount = await typeButtons.count();
        
        console.log(`🔘 사용자 타입 버튼 개수: ${typeButtonCount}개`);
        
        let totalButtonWidth = 0;
        const buttonData = [];
        
        for (let i = 0; i < typeButtonCount; i++) {
          const button = typeButtons.nth(i);
          const buttonText = await button.textContent();
          const buttonBox = await button.boundingBox();
          
          if (buttonBox && buttonText && (buttonText.includes('구직자') || buttonText.includes('채용담당자') || buttonText.includes('커뮤니티'))) {
            console.log(`  - "${buttonText.trim()}": ${buttonBox.width}x${buttonBox.height}px`);
            buttonData.push({ 
              text: buttonText.trim(), 
              width: buttonBox.width, 
              height: buttonBox.height 
            });
            totalButtonWidth += buttonBox.width;
          }
        }

        // 개선 효과 분석
        if (buttonData.length === 3) {
          const widths = buttonData.map(b => b.width);
          const heights = buttonData.map(b => b.height);
          
          const maxWidth = Math.max(...widths);
          const minWidth = Math.min(...widths);
          const avgWidth = widths.reduce((a, b) => a + b, 0) / widths.length;
          
          const maxHeight = Math.max(...heights);
          const minHeight = Math.min(...heights);
          
          console.log(`\n📊 버튼 균등성 분석:`);
          console.log(`  - 너비 편차: ${((maxWidth - minWidth) / maxWidth * 100).toFixed(1)}%`);
          console.log(`  - 높이 편차: ${((maxHeight - minHeight) / maxHeight * 100).toFixed(1)}%`);
          console.log(`  - 평균 버튼 너비: ${avgWidth.toFixed(1)}px`);
          
          // 박스 효율성 계산
          const totalGaps = viewport.width >= 640 ? (buttonData.length - 1) * 8 : (buttonData.length - 1) * 4; // gap-2 sm:gap-3
          const totalPadding = viewport.width >= 640 ? 16 : 12; // p-1.5 sm:p-2
          const expectedBoxWidth = totalButtonWidth + totalGaps + totalPadding;
          
          console.log(`\n📐 박스 효율성 분석:`);
          console.log(`  - 실제 박스 너비: ${boxDimensions.width}px`);
          console.log(`  - 예상 최적 너비: ${expectedBoxWidth.toFixed(1)}px`);
          console.log(`  - 공간 효율성: ${(expectedBoxWidth / boxDimensions.width * 100).toFixed(1)}%`);
          
          if (boxDimensions.width <= expectedBoxWidth + 20) {
            console.log(`  ✅ 박스가 버튼에 잘 맞춰졌습니다!`);
          } else {
            console.log(`  ⚠️ 박스가 여전히 큽니다 (${(boxDimensions.width - expectedBoxWidth).toFixed(1)}px 초과)`);
          }
        }

        // 정확한 박스만 스크린샷
        await userTypeSelector.screenshot({ 
          path: `playwright-outputs/precise-button-box-${viewport.name}-after.png`,
          animations: 'disabled'
        });
        console.log(`📸 정확한 박스 스크린샷: precise-button-box-${viewport.name}-after.png`);

        // 각 사용자 타입 버튼 클릭 테스트
        console.log(`\n🎯 사용자 타입 선택 테스트:`);
        const userTypes = ['구직자', '채용담당자', '커뮤니티'];
        
        for (const userType of userTypes) {
          const targetButton = typeButtons.filter({ hasText: userType }).first();
          
          if (await targetButton.isVisible()) {
            await targetButton.click();
            await page.waitForTimeout(300);
            
            // 선택 상태 확인
            const selectedClasses = await targetButton.getAttribute('class');
            if (selectedClasses && selectedClasses.includes('bg-white')) {
              console.log(`  ✅ "${userType}" 선택됨`);
              
              // 선택된 상태에서 박스 스크린샷
              await userTypeSelector.screenshot({ 
                path: `playwright-outputs/precise-box-${viewport.name}-${userType}-selected.png`,
                animations: 'disabled'
              });
            } else {
              console.log(`  ❌ "${userType}" 선택 실패`);
            }
          }
        }

      } else {
        console.log(`❌ ${viewport.name}에서 사용자 타입 선택 박스를 찾을 수 없음`);
      }
    }

    console.log('\n🎉 정확한 버튼 박스 분석 완료!');
    console.log('\n📈 주요 개선사항 요약:');
    console.log('  🔹 inline-flex + max-w-fit: 박스를 내용에 맞게 축소');
    console.log('  🔹 gap과 padding 조정: 더 컴팩트한 디자인');
    console.log('  🔹 버튼 크기 최적화: 균등하고 적절한 크기');
    console.log('  🔹 반응형 최적화: 모바일과 데스크톱 모두 개선');
  });
});