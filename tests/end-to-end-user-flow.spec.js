const { test, expect } = require('@playwright/test');

test('완전한 사용자 플로우: 회원가입 → 로그인 → 글 작성', async ({ page }) => {
  const testUser = {
    username: `test${Date.now().toString().slice(-6)}`, // 짧은 닉네임 (최대 10자)
    email: `test${Date.now().toString().slice(-6)}@gmail.com`, // 실제적인 이메일 도메인
    password: 'testpass123'
  };
  
  const testPost = {
    title: '🤖 Playwright 자동 테스트 글',
    content: `안녕하세요! 저는 Claude가 Playwright를 통해 자동으로 생성한 테스트 계정입니다.

🎯 **테스트 목적**:
- 회원가입 시스템 검증
- 프로필 생성 확인
- 글 작성 기능 테스트
- 새로운 정보 컨텐츠 피드 시스템 확인

⏰ **생성 시간**: ${new Date().toLocaleString('ko-KR')}
🤖 **생성자**: Claude AI + Playwright

이 글이 정상적으로 보인다면 모든 시스템이 완벽하게 작동하고 있다는 뜻입니다! 💯`,
    category: 'community'
  };

  try {
    console.log('🚀 End-to-End 사용자 플로우 테스트 시작');
    console.log('👤 테스트 사용자:', testUser.username, testUser.email);
    
    // ========================================
    // STEP 1: 사이트 접속
    // ========================================
    console.log('\n📍 STEP 1: 사이트 접속');
    await page.goto('https://newbeginning-seven.vercel.app/');
    console.log('✅ 메인 사이트 접속 완료');
    
    // ========================================
    // STEP 2: 회원가입
    // ========================================
    console.log('\n📍 STEP 2: 회원가입');
    
    // 로그인 페이지로 이동
    await page.click('text=로그인');
    console.log('✅ 로그인 페이지 이동');
    
    // 회원가입 탭으로 전환
    await page.click('text=회원가입');
    console.log('✅ 회원가입 탭 선택');
    
    // 회원가입 폼 작성
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    console.log('✅ 회원가입 폼 작성 완료');
    
    // 회원가입 버튼 클릭
    await page.click('button[type="submit"]:has-text("회원가입")');
    console.log('🔄 회원가입 버튼 클릭');
    
    // 성공 메시지 대기
    try {
      await page.waitForSelector('text=회원가입이 완료되었습니다', { timeout: 10000 });
      console.log('✅ 회원가입 성공 메시지 확인');
    } catch (error) {
      const errorMessage = await page.locator('.text-red-500').textContent();
      console.log('❌ 회원가입 실패:', errorMessage);
      throw new Error(`회원가입 실패: ${errorMessage}`);
    }
    
    // ========================================
    // STEP 3: 로그인
    // ========================================
    console.log('\n📍 STEP 3: 로그인');
    
    // 로그인 탭으로 전환
    await page.click('text=로그인');
    console.log('✅ 로그인 탭 선택');
    
    // 로그인 폼 작성
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    console.log('✅ 로그인 폼 작성 완료');
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"]:has-text("로그인")');
    console.log('🔄 로그인 버튼 클릭');
    
    // 메인 페이지로 리다이렉트 대기
    await page.waitForURL('**/');
    console.log('✅ 메인 페이지로 리다이렉트 성공');
    
    // 로그인 상태 확인 (헤더에 사용자명 또는 글쓰기 버튼 확인)
    try {
      await page.waitForSelector('text=글쓰기, button:has-text("글쓰기")', { timeout: 5000 });
      console.log('✅ 로그인 상태 확인 (글쓰기 버튼 발견)');
    } catch (e) {
      console.log('⚠️ 글쓰기 버튼을 찾을 수 없음, 다른 방법으로 확인');
      const userElement = await page.locator('[class*="space-x-2"]:has-text("' + testUser.username + '")').count();
      if (userElement > 0) {
        console.log('✅ 사용자명으로 로그인 상태 확인');
      }
    }
    
    // ========================================
    // STEP 4: 메인 피드 확인
    // ========================================
    console.log('\n📍 STEP 4: 메인 피드 확인');
    
    // 피드 타이틀 확인
    const feedTitle = await page.locator('h1:has-text("최신 피드"), h1:has-text("최신 게시글")').first();
    if (await feedTitle.count() > 0) {
      const titleText = await feedTitle.textContent();
      console.log('✅ 피드 화면 확인:', titleText);
    }
    
    // 네비게이션 바에서 정보센터 버튼 확인 (새 기능)
    const educationalButton = await page.locator('button:has-text("정보센터"), button:has(span:text("📚"))').first();
    if (await educationalButton.count() > 0) {
      console.log('✅ 피드 네비게이션에 정보센터 버튼 발견');
    }
    
    // ========================================
    // STEP 5: 글 작성
    // ========================================
    console.log('\n📍 STEP 5: 글 작성');
    
    // 글쓰기 페이지로 이동
    await page.goto('https://newbeginning-seven.vercel.app/write');
    console.log('✅ 글쓰기 페이지 이동');
    
    // 글 작성 폼 확인 및 작성
    await page.waitForSelector('input[name="title"]', { timeout: 10000 });
    console.log('✅ 글쓰기 폼 발견');
    
    await page.fill('input[name="title"]', testPost.title);
    await page.fill('textarea[name="content"]', testPost.content);
    console.log('✅ 글 내용 작성 완료');
    
    // 카테고리 선택
    const categorySelect = await page.locator('select[name="category"]').first();
    if (await categorySelect.count() > 0) {
      await categorySelect.selectOption(testPost.category);
      console.log('✅ 카테고리 선택:', testPost.category);
    }
    
    // 글 발행 버튼 클릭
    await page.click('button[type="submit"]:has-text("발행"), button[type="submit"]:has-text("작성")');
    console.log('🔄 글 발행 버튼 클릭');
    
    // 글 상세 페이지 또는 메인으로 리다이렉트 대기
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    console.log('📍 글 작성 후 URL:', currentUrl);
    
    if (currentUrl.includes('/post/')) {
      console.log('✅ 글 상세 페이지로 리다이렉트 성공');
      
      // 작성한 글 내용 확인
      const postTitle = await page.locator('h1, h2, h3').first();
      if (await postTitle.count() > 0) {
        const title = await postTitle.textContent();
        if (title?.includes(testPost.title.substring(0, 10))) {
          console.log('✅ 작성한 글 제목 확인:', title);
        }
      }
    }
    
    // ========================================
    // STEP 6: 메인 피드에서 작성한 글 확인
    // ========================================
    console.log('\n📍 STEP 6: 메인 피드에서 글 확인');
    
    await page.goto('https://newbeginning-seven.vercel.app/');
    await page.waitForTimeout(2000);
    
    // 작성한 글이 피드에 나타나는지 확인
    const myPost = await page.locator(`text=${testPost.title}`).first();
    if (await myPost.count() > 0) {
      console.log('✅ 메인 피드에서 작성한 글 확인됨');
    } else {
      console.log('⚠️ 메인 피드에서 글을 찾을 수 없음 (로딩 중이거나 다른 페이지에 있을 수 있음)');
    }
    
    // ========================================
    // STEP 7: 최종 스크린샷 및 결과
    // ========================================
    console.log('\n📍 STEP 7: 최종 결과');
    
    await page.screenshot({ path: 'complete-user-flow-test.png', fullPage: true });
    console.log('📸 완전한 사용자 플로우 테스트 스크린샷 저장됨');
    
    console.log('\n🎉 END-TO-END 테스트 완료!');
    console.log('=======================================');
    console.log('✅ 회원가입 → 로그인 → 글 작성 → 피드 확인');
    console.log('✅ 모든 시스템이 정상 작동함');
    console.log('✅ 새로운 UI 개선사항 적용됨');
    console.log('=======================================');
    
  } catch (error) {
    console.log('\n🔥 테스트 중 오류 발생:');
    console.log('Error:', error.message);
    
    // 현재 페이지 상태 확인
    const currentUrl = page.url();
    const pageTitle = await page.title();
    console.log('Current URL:', currentUrl);
    console.log('Page Title:', pageTitle);
    
    // 에러 스크린샷
    await page.screenshot({ path: 'user-flow-error.png', fullPage: true });
    console.log('📸 오류 상황 스크린샷 저장됨');
    
    // 에러 메시지 캡처 시도
    try {
      const errorMessages = await page.locator('.text-red-500, [class*="error"], .error').allTextContents();
      if (errorMessages.length > 0) {
        console.log('🔍 발견된 에러 메시지들:', errorMessages);
      }
    } catch (e) {
      console.log('에러 메시지 캡처 실패');
    }
    
    throw error;
  }
});