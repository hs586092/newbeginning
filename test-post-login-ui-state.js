import { chromium } from 'playwright';

async function testPostLoginUIState() {
  console.log('🎯 포스트 로그인 UI 상태 반영 테스트 시작...');

  const browser = await chromium.launch({
    headless: false,
    devtools: false
  });
  const page = await browser.newPage();

  // 콘솔 로그 및 에러 캡처
  const logs = [];
  const errors = [];

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(text);
      console.log(`❌ 브라우저 에러: ${text}`);
    } else if (text.includes('AUTH') || text.includes('UnifiedHomepage') || text.includes('isAuthenticated') || text.includes('user:')) {
      logs.push(text);
      console.log(`🔍 인증 상태 로그: ${text}`);
    }
  });

  try {
    console.log('📍 1. 로그인 전 홈페이지 상태 확인...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 로그인 전 UI 상태 캡처
    const preLoginUI = await page.evaluate(() => {
      // 로그인 전 상태 확인
      const loginLinks = document.querySelectorAll('a[href*="login"], a[href="/signup"]');
      const writeButtons = document.querySelectorAll('button:has-text("새 글 작성하기")');
      const signupButtons = document.querySelectorAll('button:has-text("무료로 시작하기")');
      const heroText = document.querySelector('p.text-blue-100')?.textContent || '';

      return {
        hasLoginLinks: loginLinks.length > 0,
        writeButtonsCount: writeButtons.length,
        signupButtonsCount: signupButtons.length,
        heroText: heroText,
        url: window.location.href
      };
    });

    console.log('📊 로그인 전 UI 상태:', preLoginUI);

    console.log('📍 2. 로그인 페이지로 이동...');
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 폼이 로드될 때까지 대기
    await page.waitForSelector('form');

    console.log('📍 3. 테스트 계정으로 로그인...');

    // 테스트 계정 정보 입력
    await page.fill('input[name="email"]', 'test@newbeginning.com');
    await page.fill('input[name="password"]', 'testpassword123');

    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    console.log('📍 4. 로그인 처리 완료 대기...');

    // 인증 상태 변화 대기
    await page.waitForTimeout(5000);

    console.log('📍 5. 홈페이지로 이동하여 로그인 후 상태 확인...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // UI 업데이트 충분히 대기

    // 로그인 후 UI 상태 캡처
    const postLoginUI = await page.evaluate(() => {
      const loginLinks = document.querySelectorAll('a[href*="login"], a[href="/signup"]');
      const writeButtons = document.querySelectorAll('button:has-text("새 글 작성하기")');
      const signupButtons = document.querySelectorAll('button:has-text("무료로 시작하기")');
      const heroText = document.querySelector('p.text-blue-100')?.textContent || '';

      // 좋아요 및 댓글 버튼 상태
      const likeButtons = document.querySelectorAll('[title*="좋아요"]');
      const commentButtons = document.querySelectorAll('[title*="댓글"]');

      // 검색 및 고급 필터
      const searchElements = document.querySelectorAll('input[type="search"], [role="search"]');
      const filterElements = document.querySelectorAll('[class*="filter"]');

      return {
        hasLoginLinks: loginLinks.length > 0,
        writeButtonsCount: writeButtons.length,
        signupButtonsCount: signupButtons.length,
        heroText: heroText,
        likeButtonsCount: likeButtons.length,
        commentButtonsCount: commentButtons.length,
        searchElementsCount: searchElements.length,
        filterElementsCount: filterElements.length,
        url: window.location.href
      };
    });

    console.log('📊 로그인 후 UI 상태:', postLoginUI);

    console.log('📍 6. UI 변화 분석...');

    const uiChanges = {
      heroTextChanged: preLoginUI.heroText !== postLoginUI.heroText,
      loginLinksRemoved: preLoginUI.hasLoginLinks && !postLoginUI.hasLoginLinks,
      writeButtonAppeared: preLoginUI.writeButtonsCount === 0 && postLoginUI.writeButtonsCount > 0,
      signupButtonRemoved: preLoginUI.signupButtonsCount > 0 && postLoginUI.signupButtonsCount === 0,
      interactiveElementsAppeared: postLoginUI.likeButtonsCount > 0 && postLoginUI.commentButtonsCount > 0
    };

    console.log('📊 UI 변화 분석:', uiChanges);

    console.log('📍 7. 좋아요 버튼 기능 테스트...');

    const likeButtons = await page.$$('[title*="좋아요"]');
    if (likeButtons.length > 0) {
      console.log(`✅ 좋아요 버튼 ${likeButtons.length}개 발견`);

      // 첫 번째 좋아요 버튼 클릭 테스트
      try {
        await likeButtons[0].click();
        await page.waitForTimeout(2000);
        console.log('✅ 좋아요 버튼 클릭 성공');
      } catch (error) {
        console.log('❌ 좋아요 버튼 클릭 실패:', error.message);
      }
    } else {
      console.log('❌ 좋아요 버튼을 찾을 수 없음');
    }

    console.log('📍 8. 최종 결과 분석...');

    const authLogs = logs.filter(log => log.includes('isAuthenticated') || log.includes('AUTHENTICATED'));
    const hasAuthenticatedTrue = authLogs.some(log => log.includes('isAuthenticated: true') || log.includes('AUTHENTICATED'));

    console.log(`📊 총 인증 로그: ${logs.length}개`);
    console.log(`📊 총 에러: ${errors.length}개`);

    if (logs.length > 0) {
      console.log('\n✅ 최근 인증 로그:');
      logs.slice(-10).forEach((log, i) => {
        console.log(`${i + 1}. ${log}`);
      });
    }

    if (errors.length > 0) {
      console.log('\n❌ 최근 에러:');
      errors.slice(-5).forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }

    console.log('\n📊 최종 분석:');
    console.log(`✅ 인증 상태 로그 존재: ${hasAuthenticatedTrue ? 'YES' : 'NO'}`);
    console.log(`✅ 히어로 텍스트 변화: ${uiChanges.heroTextChanged ? 'YES' : 'NO'}`);
    console.log(`✅ 로그인 링크 제거: ${uiChanges.loginLinksRemoved ? 'YES' : 'NO'}`);
    console.log(`✅ 글쓰기 버튼 출현: ${uiChanges.writeButtonAppeared ? 'YES' : 'NO'}`);
    console.log(`✅ 회원가입 버튼 제거: ${uiChanges.signupButtonRemoved ? 'YES' : 'NO'}`);
    console.log(`✅ 인터랙션 요소 활성화: ${uiChanges.interactiveElementsAppeared ? 'YES' : 'NO'}`);

    const successCriteria = [
      hasAuthenticatedTrue,
      uiChanges.heroTextChanged,
      (uiChanges.loginLinksRemoved || uiChanges.writeButtonAppeared),
      !errors.some(error => error.includes('UUID') || error.includes('인증'))
    ];

    const successCount = successCriteria.filter(Boolean).length;
    const successRate = (successCount / successCriteria.length) * 100;

    console.log(`\n📈 성공률: ${successRate}% (${successCount}/${successCriteria.length})`);

    if (successRate >= 75) {
      console.log('\n🎉 테스트 성공! 로그인 후 UI 상태가 정상적으로 반영되고 있습니다!');
    } else if (successRate >= 50) {
      console.log('\n⚠️ 부분 성공. 일부 개선이 필요합니다.');
    } else {
      console.log('\n❌ 테스트 실패. 추가적인 수정이 필요합니다.');
    }

  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  }

  console.log('\n⏳ 브라우저를 30초 동안 열어두어 수동 확인이 가능합니다...');
  await page.waitForTimeout(30000);

  await browser.close();
}

testPostLoginUIState().catch(console.error);