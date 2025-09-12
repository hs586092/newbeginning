/**
 * Playwright 기반 로그인 전후 페이지 상태 분석 스크립트
 * 목적: UI 통합 후 여전히 남은 차이점들을 정확히 진단
 */

import { chromium } from 'playwright';
import fs from 'fs';

async function analyzeLoginStates() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const analysis = {
    beforeLogin: {},
    afterLogin: {},
    differences: [],
    networkRequests: []
  };

  // 네트워크 요청 모니터링
  page.on('request', request => {
    analysis.networkRequests.push({
      state: 'before-login',
      url: request.url(),
      method: request.method(),
      timestamp: new Date().toISOString()
    });
  });

  console.log('🔍 로그인 전 상태 분석 시작...');

  try {
    // 로그인 전 상태 분석
    await page.goto('https://www.fortheorlingas.com');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // 스크린샷 캡처
    await page.screenshot({ 
      path: 'before-login-full.png', 
      fullPage: true 
    });

    // DOM 구조 분석
    analysis.beforeLogin = await page.evaluate(() => {
      const getElementInfo = (element) => {
        if (!element) return null;
        
        return {
          tagName: element.tagName,
          className: element.className,
          id: element.id,
          textContent: element.textContent?.substring(0, 200),
          children: Array.from(element.children).map(child => ({
            tagName: child.tagName,
            className: child.className,
            id: child.id
          }))
        };
      };

      return {
        // 페이지 기본 정보
        url: window.location.href,
        title: document.title,
        
        // 주요 컨테이너 분석
        main: getElementInfo(document.querySelector('main')),
        header: getElementInfo(document.querySelector('header')),
        nav: getElementInfo(document.querySelector('nav')),
        
        // 피드 관련 컴포넌트
        unifiedFeed: getElementInfo(document.querySelector('[data-component="unified-feed"]')),
        socialFeed: getElementInfo(document.querySelector('[data-component="social-feed"]')),
        postList: getElementInfo(document.querySelector('[data-component="post-list"]')),
        
        // 게시물 개수 및 구조
        posts: Array.from(document.querySelectorAll('article, [data-testid*="post"]')).map(post => ({
          id: post.id || post.dataset.postId,
          className: post.className,
          textContent: post.textContent?.substring(0, 100)
        })),
        
        // 레이아웃 정보
        layout: {
          hasHeroSection: !!document.querySelector('[data-testid="hero-section"]'),
          hasSocialProof: !!document.querySelector('[data-testid="social-proof"]'),
          hasSidebar: !!document.querySelector('[data-testid="sidebar"]'),
          mainWidth: getComputedStyle(document.querySelector('main') || document.body).maxWidth,
        },
        
        // 인터랙션 버튼
        interactions: {
          likeButtons: document.querySelectorAll('[data-testid*="like"], [aria-label*="좋아요"]').length,
          commentButtons: document.querySelectorAll('[data-testid*="comment"], [aria-label*="댓글"]').length,
          loginPrompts: document.querySelectorAll('[data-testid*="login-required"]').length
        }
      };
    });

    console.log('✅ 로그인 전 상태 분석 완료');
    console.log('📊 로그인 전 게시물 수:', analysis.beforeLogin.posts?.length || 0);

    // 시간 간격을 두고 로그인 후 상태 분석
    console.log('🔍 로그인 프로세스 시뮬레이션...');

    // 네트워크 요청 모니터링 리셋
    page.removeAllListeners('request');
    page.on('request', request => {
      analysis.networkRequests.push({
        state: 'after-login',
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    });

    // 로그인 버튼 클릭 (만약 존재한다면)
    const loginButton = await page.$('a[href*="/login"], button:has-text("로그인")');
    if (loginButton) {
      console.log('📍 로그인 버튼 발견, 클릭 시도...');
      await loginButton.click();
      await page.waitForTimeout(3000);
    }

    // 로그인 후 상태 분석 (실제 로그인 없이 URL 직접 접근으로 시뮬레이션)
    console.log('🔍 로그인 후 상태 시뮬레이션...');
    
    // 새 컨텍스트로 로그인 상태 시뮬레이션
    const loggedInContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const loggedInPage = await loggedInContext.newPage();
    
    // 로그인 상태 쿠키 설정 (임시)
    await loggedInPage.goto('https://www.fortheorlingas.com');
    
    // 개발자 도구에서 로그인 상태 시뮬레이션
    await loggedInPage.evaluate(() => {
      // localStorage에 임시 인증 토큰 설정
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'temporary-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
    
    await loggedInPage.reload();
    await loggedInPage.waitForLoadState('networkidle', { timeout: 10000 });

    // 로그인 후 스크린샷
    await loggedInPage.screenshot({ 
      path: 'after-login-full.png', 
      fullPage: true 
    });

    // 로그인 후 DOM 구조 분석
    analysis.afterLogin = await loggedInPage.evaluate(() => {
      const getElementInfo = (element) => {
        if (!element) return null;
        
        return {
          tagName: element.tagName,
          className: element.className,
          id: element.id,
          textContent: element.textContent?.substring(0, 200),
          children: Array.from(element.children).map(child => ({
            tagName: child.tagName,
            className: child.className,
            id: child.id
          }))
        };
      };

      return {
        // 페이지 기본 정보
        url: window.location.href,
        title: document.title,
        
        // 주요 컨테이너 분석
        main: getElementInfo(document.querySelector('main')),
        header: getElementInfo(document.querySelector('header')),
        nav: getElementInfo(document.querySelector('nav')),
        
        // 피드 관련 컴포넌트
        unifiedFeed: getElementInfo(document.querySelector('[data-component="unified-feed"]')),
        socialFeed: getElementInfo(document.querySelector('[data-component="social-feed"]')),
        postList: getElementInfo(document.querySelector('[data-component="post-list"]')),
        
        // 게시물 개수 및 구조
        posts: Array.from(document.querySelectorAll('article, [data-testid*="post"]')).map(post => ({
          id: post.id || post.dataset.postId,
          className: post.className,
          textContent: post.textContent?.substring(0, 100)
        })),
        
        // 레이아웃 정보
        layout: {
          hasHeroSection: !!document.querySelector('[data-testid="hero-section"]'),
          hasSocialProof: !!document.querySelector('[data-testid="social-proof"]'),
          hasSidebar: !!document.querySelector('[data-testid="sidebar"]'),
          mainWidth: getComputedStyle(document.querySelector('main') || document.body).maxWidth,
        },
        
        // 인터랙션 버튼
        interactions: {
          likeButtons: document.querySelectorAll('[data-testid*="like"], [aria-label*="좋아요"]').length,
          commentButtons: document.querySelectorAll('[data-testid*="comment"], [aria-label*="댓글"]').length,
          loginPrompts: document.querySelectorAll('[data-testid*="login-required"]').length
        }
      };
    });

    console.log('✅ 로그인 후 상태 분석 완료');
    console.log('📊 로그인 후 게시물 수:', analysis.afterLogin.posts?.length || 0);

    await loggedInContext.close();

  } catch (error) {
    console.error('❌ 분석 중 오류:', error);
  }

  // 차이점 분석
  console.log('🔍 차이점 분석 시작...');
  
  const compareSections = [
    'main', 'header', 'nav', 'layout', 'interactions'
  ];

  compareSections.forEach(section => {
    const before = analysis.beforeLogin[section];
    const after = analysis.afterLogin[section];
    
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      analysis.differences.push({
        section,
        before,
        after,
        type: 'structure-change'
      });
    }
  });

  // 게시물 개수 차이
  const postsCountDiff = (analysis.afterLogin.posts?.length || 0) - (analysis.beforeLogin.posts?.length || 0);
  if (postsCountDiff !== 0) {
    analysis.differences.push({
      section: 'posts-count',
      before: analysis.beforeLogin.posts?.length || 0,
      after: analysis.afterLogin.posts?.length || 0,
      difference: postsCountDiff,
      type: 'content-change'
    });
  }

  // 컴포넌트 사용 차이
  const componentDiff = {
    unifiedFeed: {
      before: !!analysis.beforeLogin.unifiedFeed,
      after: !!analysis.afterLogin.unifiedFeed
    },
    socialFeed: {
      before: !!analysis.beforeLogin.socialFeed,
      after: !!analysis.afterLogin.socialFeed
    },
    postList: {
      before: !!analysis.beforeLogin.postList,
      after: !!analysis.afterLogin.postList
    }
  };

  Object.keys(componentDiff).forEach(component => {
    const { before, after } = componentDiff[component];
    if (before !== after) {
      analysis.differences.push({
        section: `component-${component}`,
        before,
        after,
        type: 'component-change'
      });
    }
  });

  // 결과 저장
  fs.writeFileSync('page-analysis.json', JSON.stringify(analysis, null, 2));
  
  console.log('📋 분석 완료! 결과:');
  console.log(`- 발견된 차이점: ${analysis.differences.length}개`);
  console.log(`- 네트워크 요청: ${analysis.networkRequests.length}개`);
  console.log('- 상세 결과: page-analysis.json 파일 참조');
  console.log('- 스크린샷: before-login-full.png, after-login-full.png');

  await browser.close();
  return analysis;
}

// 스크립트 실행
analyzeLoginStates().catch(console.error);

export { analyzeLoginStates };