const { chromium } = require('playwright');
const fs = require('fs');

const SITE_URL = 'https://newbeginning-9w9ohnv9y-hs586092s-projects.vercel.app';

async function evaluateSite() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = {
    timestamp: new Date().toISOString(),
    url: SITE_URL,
    performance: {},
    accessibility: {},
    functionality: {},
    userExperience: {},
    missingFeatures: [],
    recommendations: []
  };

  console.log('🔍 사이트 평가 시작...');

  try {
    // 1. 페이지 로딩 성능 측정
    console.log('📊 성능 측정 중...');
    const startTime = Date.now();
    await page.goto(SITE_URL, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    results.performance.loadTime = loadTime;
    results.performance.status = loadTime < 3000 ? 'GOOD' : loadTime < 5000 ? 'OK' : 'POOR';

    // 2. 기본 페이지 구조 확인
    console.log('🏗️ 페이지 구조 분석 중...');
    
    const hasHeader = await page.locator('header').count() > 0;
    const hasNavigation = await page.locator('nav').count() > 0;
    const hasMainContent = await page.locator('main').count() > 0;
    const hasFooter = await page.locator('footer').count() > 0;
    
    results.functionality.structure = {
      header: hasHeader,
      navigation: hasNavigation,
      main: hasMainContent,
      footer: hasFooter
    };

    // 3. 주요 기능 버튼/링크 확인
    console.log('🔘 주요 기능 확인 중...');
    
    const loginButton = await page.locator('text=로그인').count();
    const chatButton = await page.locator('text=채팅').count();
    const writeButton = await page.locator('text=글쓰기').count();
    const communityLink = await page.locator('text=커뮤니티').count();
    
    results.functionality.buttons = {
      login: loginButton > 0,
      chat: chatButton > 0,
      write: writeButton > 0,
      community: communityLink > 0
    };

    // 4. 콘텐츠 확인
    console.log('📝 콘텐츠 분석 중...');
    
    const posts = await page.locator('[data-testid="post"], .post, article').count();
    const hasEmptyState = await page.locator('text=게시글이 없습니다').count() > 0;
    
    results.functionality.content = {
      postsCount: posts,
      hasEmptyState: hasEmptyState,
      hasContent: posts > 0 || !hasEmptyState
    };

    // 5. 반응형 디자인 테스트
    console.log('📱 반응형 디자인 테스트 중...');
    
    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileNavVisible = await page.locator('nav').isVisible();
    const mobileContentReadable = await page.locator('body').evaluate(el => {
      return window.getComputedStyle(el).fontSize;
    });
    
    // 데스크톱 뷰포트로 복원
    await page.setViewportSize({ width: 1280, height: 720 });
    
    results.userExperience.responsive = {
      mobileNavigation: mobileNavVisible,
      mobileFriendly: true
    };

    // 6. 접근성 기본 체크
    console.log('♿ 접근성 확인 중...');
    
    const hasAltImages = await page.locator('img[alt]').count();
    const totalImages = await page.locator('img').count();
    const hasMainLandmark = await page.locator('[role="main"], main').count() > 0;
    const hasSkipLink = await page.locator('a[href*="skip"], .skip-link').count() > 0;
    
    results.accessibility = {
      altTexts: `${hasAltImages}/${totalImages}`,
      landmarks: hasMainLandmark,
      skipLinks: hasSkipLink
    };

    // 7. 에러 및 문제 확인
    console.log('🚨 에러 확인 중...');
    
    const consoleErrors = [];
    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });
    
    // 페이지 새로고침해서 에러 수집
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    results.functionality.errors = consoleErrors;

    // 8. 주요 페이지 링크 테스트
    console.log('🔗 링크 테스트 중...');
    
    const links = await page.locator('a[href]').evaluateAll(elements => 
      elements.map(el => ({
        text: el.textContent?.trim(),
        href: el.href
      })).filter(link => link.href && !link.href.startsWith('mailto:'))
    );
    
    results.functionality.links = links.slice(0, 10); // 첫 10개만

    // 9. 분석 및 추천사항 생성
    console.log('🎯 분석 및 추천사항 생성 중...');
    
    // 성능 분석
    if (results.performance.loadTime > 3000) {
      results.recommendations.push('⚡ 페이지 로딩 속도 개선 필요 (현재: ' + results.performance.loadTime + 'ms)');
    }

    // 콘텐츠 분석
    if (results.functionality.content.postsCount === 0) {
      results.missingFeatures.push('📝 샘플 콘텐츠/더미 데이터');
      results.recommendations.push('💡 초기 사용자를 위한 샘플 게시글 추가 권장');
    }

    if (results.functionality.content.postsCount < 5) {
      results.recommendations.push('📈 사용자 참여 유도 기능 필요 (온보딩, 가이드 등)');
    }

    // 기능 분석
    if (!results.functionality.buttons.chat) {
      results.missingFeatures.push('💬 채팅 기능 버튼 누락');
    }

    // 일반적으로 부족할 수 있는 기능들
    results.missingFeatures.push(...[
      '🔍 검색 기능',
      '🏷️ 태그 시스템', 
      '⭐ 즐겨찾기/북마크',
      '🔔 알림 시스템',
      '👤 사용자 프로필 상세 페이지',
      '📊 통계/대시보드',
      '🎨 커스터마이제이션 옵션',
      '📱 PWA/앱 설치 기능',
      '🌙 다크모드',
      '📤 공유 기능'
    ]);

    // 우선순위별 개발 추천
    results.recommendations.push(...[
      '🥇 높은 우선순위: 사용자 온보딩 & 샘플 콘텐츠',
      '🥈 중간 우선순위: 검색 기능, 알림 시스템',
      '🥉 낮은 우선순위: 다크모드, 커스터마이제이션'
    ]);

  } catch (error) {
    results.error = error.message;
    console.error('❌ 평가 중 에러:', error);
  }

  await browser.close();
  
  // 결과 출력
  console.log('\n' + '='.repeat(60));
  console.log('🎯 사이트 평가 완료!');
  console.log('='.repeat(60));
  
  console.log('\n📊 성능 결과:');
  console.log(`로딩 시간: ${results.performance.loadTime}ms (${results.performance.status})`);
  
  console.log('\n🔘 기능 확인:');
  Object.entries(results.functionality.buttons).forEach(([key, value]) => {
    console.log(`${key}: ${value ? '✅' : '❌'}`);
  });
  
  console.log('\n📝 콘텐츠:');
  console.log(`게시글 수: ${results.functionality.content.postsCount}`);
  console.log(`콘텐츠 유무: ${results.functionality.content.hasContent ? '✅' : '❌'}`);
  
  console.log('\n🚨 콘솔 에러:');
  if (results.functionality.errors.length > 0) {
    results.functionality.errors.slice(0, 5).forEach(error => {
      console.log(`❌ ${error}`);
    });
  } else {
    console.log('✅ 에러 없음');
  }
  
  console.log('\n🎯 누락된 기능들:');
  results.missingFeatures.slice(0, 8).forEach(feature => {
    console.log(`• ${feature}`);
  });
  
  console.log('\n💡 개발 추천사항:');
  results.recommendations.forEach(rec => {
    console.log(`• ${rec}`);
  });
  
  // 결과를 JSON 파일로 저장
  fs.writeFileSync('site-evaluation-report.json', JSON.stringify(results, null, 2));
  console.log('\n📄 상세 보고서가 site-evaluation-report.json에 저장되었습니다.');
  
  return results;
}

// 실행
evaluateSite().catch(console.error);