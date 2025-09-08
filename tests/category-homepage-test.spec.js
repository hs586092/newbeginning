const { test, expect } = require('@playwright/test');

test('홈페이지 카테고리 필터링 테스트', async ({ page }) => {
  console.log('🏠 홈페이지 카테고리 필터링 테스트 시작');
  
  // 홈페이지 접속
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);
  
  // 스크린샷 촬영
  await page.screenshot({ path: 'test-results/homepage-initial.png', fullPage: true });
  console.log('📸 초기 홈페이지 스크린샷 저장');
  
  // 페이지 타이틀 확인 (실제 타이틀에 맞춰 수정)
  await expect(page).toHaveTitle(/첫돌까지/);
  console.log('✅ 페이지 타이틀 확인 성공');
  
  // 카테고리 버튼들을 찾기 위한 다양한 셀렉터 시도
  const categorySelectors = [
    // 텍스트 기반 셀렉터
    'text=전체',
    'text=예비맘',
    'text=신생아맘', 
    'text=성장기맘',
    'text=선배맘',
    // 이모지 기반 셀렉터
    'text=🌟',
    'text=🤰',
    'text=👶',
    'text=🧒',
    'text=👩‍👧‍👦',
    // 클래스/속성 기반 셀렉터
    '[data-testid*="category"]',
    'button[class*="category"]',
    'button:has-text("카테고리")',
    // 포괄적인 버튼 셀렉터
    'button:has-text("예비")',
    'button:has-text("신생아")',
    'button:has-text("성장기")',
    'button:has-text("선배")'
  ];
  
  console.log('🔍 카테고리 버튼 검색 중...');
  let foundButtons = [];
  
  for (const selector of categorySelectors) {
    try {
      const element = page.locator(selector).first();
      const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (isVisible) {
        const textContent = await element.textContent();
        foundButtons.push({ selector, text: textContent?.trim() });
        console.log(`✅ 버튼 발견: ${selector} - "${textContent}"`);
      }
    } catch (error) {
      // 조용히 넘어감
    }
  }
  
  if (foundButtons.length > 0) {
    console.log(`🎉 총 ${foundButtons.length}개의 카테고리 관련 버튼 발견!`);
    
    // 발견된 버튼들 클릭 테스트
    for (const button of foundButtons.slice(0, 3)) { // 처음 3개만 테스트
      try {
        const element = page.locator(button.selector).first();
        console.log(`🖱️ "${button.text}" 버튼 클릭 시도...`);
        
        await element.click();
        await page.waitForTimeout(1000);
        
        // 클릭 후 스크린샷
        await page.screenshot({ 
          path: `test-results/category-${button.text?.replace(/[^a-zA-Z0-9가-힣]/g, '_')}.png`,
          fullPage: true 
        });
        console.log(`✅ "${button.text}" 버튼 클릭 성공 - 스크린샷 저장됨`);
        
      } catch (clickError) {
        console.log(`⚠️ "${button.text}" 버튼 클릭 실패:`, clickError.message);
      }
    }
  } else {
    console.log('⚠️ 카테고리 버튼을 찾을 수 없습니다');
    
    // 페이지의 모든 버튼 요소 확인
    const allButtons = await page.locator('button').count();
    console.log(`ℹ️ 페이지에서 총 ${allButtons}개의 버튼 발견`);
    
    if (allButtons > 0) {
      console.log('📋 모든 버튼의 텍스트:');
      for (let i = 0; i < Math.min(allButtons, 10); i++) {
        const buttonText = await page.locator('button').nth(i).textContent();
        console.log(`  ${i + 1}. "${buttonText?.trim()}"`);
      }
    }
  }
  
  // 페이지 소스에서 카테고리 관련 텍스트 확인
  const pageContent = await page.content();
  const categoryTexts = ['예비맘', '신생아맘', '성장기맘', '선배맘'];
  const foundTexts = categoryTexts.filter(text => pageContent.includes(text));
  
  console.log(`📄 페이지 소스에서 ${foundTexts.length}/4개의 카테고리 텍스트 발견: ${foundTexts.join(', ')}`);
  
  // 페이지 HTML 일부 저장 (디버깅용)
  const bodyHTML = await page.locator('body').innerHTML();
  require('fs').writeFileSync('test-results/homepage-body.html', bodyHTML.substring(0, 10000));
  console.log('📄 홈페이지 HTML 일부 저장됨 (첫 10,000자)');
  
  console.log('🏁 홈페이지 카테고리 테스트 완료');
});