const { test, expect } = require('@playwright/test');

test('간단한 로그인 테스트', async ({ page }) => {
  try {
    console.log('🔍 현재 사이트 상태 확인');
    
    // 기본 접속 테스트
    const response = await page.goto('https://newbeginning-seven.vercel.app/login');
    console.log('📊 응답 상태:', response.status());
    
    if (response.status() === 200) {
      console.log('✅ 사이트 정상 접근');
      
      // 페이지 타이틀 확인
      const title = await page.title();
      console.log('📖 페이지 제목:', title);
      
      // 로그인 폼 확인
      const emailInput = await page.locator('input[name="email"]').count();
      const passwordInput = await page.locator('input[name="password"]').count();
      const loginButton = await page.locator('button[type="submit"]:has-text("로그인")').count();
      
      console.log('📝 이메일 입력:', emailInput > 0 ? '✅' : '❌');
      console.log('📝 비밀번호 입력:', passwordInput > 0 ? '✅' : '❌');
      console.log('📝 로그인 버튼:', loginButton > 0 ? '✅' : '❌');
      
      // 기존 테스트 계정으로 로그인 시도 (이전에 만든 계정)
      const testEmail = 'test592846@gmail.com'; // 이전 Playwright 테스트에서 만든 계정
      const testPassword = 'testpass123';
      
      console.log('\n🔑 기존 계정으로 로그인 시도...');
      console.log('📧 이메일:', testEmail);
      
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', testPassword);
      
      await page.click('button[type="submit"]:has-text("로그인")');
      console.log('🔄 로그인 버튼 클릭됨');
      
      // 결과 대기
      await page.waitForTimeout(5000);
      
      // 에러 메시지 확인
      const loginError = await page.locator('.text-red-500').textContent();
      if (loginError) {
        console.log('❌ 로그인 에러:', loginError);
        console.log('📍 현재 URL:', page.url());
      } else {
        console.log('✅ 에러 메시지 없음 - 로그인 성공 가능성');
        console.log('📍 현재 URL:', page.url());
        
        // 로그인 성공 확인
        if (page.url() === 'https://newbeginning-seven.vercel.app/' || !page.url().includes('/login')) {
          console.log('🎉 로그인 성공! 메인 페이지로 이동됨');
        }
      }
      
      // 스크린샷 저장
      await page.screenshot({ path: 'simple-login-test-result.png', fullPage: true });
      console.log('📸 로그인 테스트 결과 스크린샷 저장됨');
      
    } else {
      console.log('❌ 사이트 접근 실패:', response.status());
    }
    
  } catch (error) {
    console.log('🔥 테스트 오류:', error.message);
    
    try {
      await page.screenshot({ path: 'simple-test-error.png' });
      console.log('📸 오류 스크린샷 저장됨');
    } catch (e) {
      console.log('스크린샷 실패');
    }
  }
});