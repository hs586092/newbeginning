const { chromium } = require('playwright');

const SITE_URL = 'http://localhost:3000';

async function evaluateSite() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🔍 사이트 종합 평가 시작...\n');

  try {
    // 성능 측정
    const startTime = Date.now();
    await page.goto(SITE_URL, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    console.log('📊 성능 평가:');
    console.log(`⚡ 로딩 시간: ${loadTime}ms (${loadTime < 3000 ? '✅ 좋음' : '⚠️ 개선필요'})`);
    
    // 페이지 제목과 기본 정보
    const title = await page.title();
    console.log(`📄 페이지 제목: ${title}`);
    
    // 주요 요소들 확인
    console.log('\n🔘 주요 기능 확인:');
    
    const loginExists = await page.locator('text=로그인').count() > 0;
    const signupExists = await page.locator('text=회원가입').count() > 0;
    const chatExists = await page.locator('text=채팅').count() > 0;
    const writeExists = await page.locator('text=글쓰기').count() > 0;
    
    console.log(`🔑 로그인 버튼: ${loginExists ? '✅' : '❌'}`);
    console.log(`📝 회원가입: ${signupExists ? '✅' : '❌'}`);
    console.log(`💬 채팅 기능: ${chatExists ? '✅' : '❌'}`);
    console.log(`✏️ 글쓰기: ${writeExists ? '✅' : '❌'}`);
    
    // 콘텐츠 확인
    console.log('\n📝 콘텐츠 현황:');
    const postElements = await page.locator('article, .post, [data-testid="post"]').count();
    const textContent = await page.textContent('body');
    
    const hasRealContent = textContent.includes('게시글') || textContent.includes('포스트') || postElements > 0;
    console.log(`📰 게시글 요소: ${postElements}개`);
    console.log(`📄 콘텐츠 유무: ${hasRealContent ? '✅' : '❌'}`);
    
    // 네비게이션 확인
    console.log('\n🧭 네비게이션:');
    const navLinks = await page.locator('nav a, header a').evaluateAll(links => 
      links.map(link => link.textContent?.trim()).filter(text => text && text.length > 0)
    );
    console.log(`🔗 네비게이션 링크들:`, navLinks.slice(0, 5));
    
    // 반응형 테스트
    console.log('\n📱 반응형 테스트:');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const mobileBody = await page.locator('body').boundingBox();
    const isMobileFriendly = mobileBody && mobileBody.width <= 375;
    console.log(`📱 모바일 친화적: ${isMobileFriendly ? '✅' : '❌'}`);
    
    // 에러 수집
    const errors = [];
    page.on('console', message => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    console.log('\n🚨 콘솔 에러:');
    if (errors.length > 0) {
      errors.slice(0, 3).forEach(error => {
        console.log(`❌ ${error.substring(0, 100)}...`);
      });
    } else {
      console.log('✅ 심각한 에러 없음');
    }
    
    // 접근성 기본 체크
    console.log('\n♿ 접근성:');
    const imagesWithAlt = await page.locator('img[alt]').count();
    const totalImages = await page.locator('img').count();
    console.log(`🖼️ 이미지 alt 텍스트: ${imagesWithAlt}/${totalImages}`);
    
    const hasMainLandmark = await page.locator('main, [role="main"]').count() > 0;
    console.log(`🏛️ Main 랜드마크: ${hasMainLandmark ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ 평가 중 에러:', error.message);
  }

  await browser.close();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 평가 완료! 아래는 개발 우선순위 추천사항입니다');
  console.log('='.repeat(60));
  
  console.log('\n🥇 최우선 개발 필요:');
  console.log('• 📝 샘플 콘텐츠/더미 데이터 추가');
  console.log('• 🔑 사용자 인증 플로우 완성');
  console.log('• 💬 채팅 기능 접근성 개선');
  
  console.log('\n🥈 중요 기능:');
  console.log('• 🔍 게시글 검색 기능');
  console.log('• 🏷️ 카테고리/태그 시스템');
  console.log('• 🔔 알림 시스템');
  console.log('• ⭐ 좋아요/북마크 기능');
  
  console.log('\n🥉 추가 개선사항:');
  console.log('• 🎨 사용자 프로필 커스터마이제이션');
  console.log('• 📊 대시보드/통계');
  console.log('• 🌙 다크모드');
  console.log('• 📱 PWA 기능');
  
  console.log('\n💡 즉시 개선 가능한 것들:');
  console.log('• 🖼️ 이미지 alt 텍스트 추가');
  console.log('• 📱 모바일 UX 최적화');
  console.log('• ⚡ 로딩 속도 최적화');
}

evaluateSite().catch(console.error);