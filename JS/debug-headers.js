// 헤더 디버깅 스크립트
console.log('=== 헤더 디버깅 ===');
console.log('현재 경로:', window.location.pathname);
console.log('현재 URL:', window.location.href);

// 페이지의 모든 헤더 요소를 찾기
const headers = document.querySelectorAll('header');
console.log('발견된 헤더 개수:', headers.length);

headers.forEach((header, index) => {
  console.log(`헤더 ${index + 1}:`, {
    innerHTML: header.innerHTML.substring(0, 100) + '...',
    className: header.className,
    parentElement: header.parentElement?.tagName,
    display: getComputedStyle(header).display
  });
});

// 네비게이션 요소들 찾기
const navs = document.querySelectorAll('nav');
console.log('발견된 nav 개수:', navs.length);

navs.forEach((nav, index) => {
  console.log(`Nav ${index + 1}:`, {
    innerHTML: nav.innerHTML.substring(0, 100) + '...',
    className: nav.className,
    display: getComputedStyle(nav).display
  });
});

// 중복될 수 있는 요소들 찾기
const duplicateElements = document.querySelectorAll('[class*="header"], [class*="nav"], [class*="Header"], [class*="Nav"]');
console.log('잠재적 중복 요소 개수:', duplicateElements.length);

duplicateElements.forEach((el, index) => {
  if (el.textContent.includes('첫돌까지') || el.textContent.includes('회원가입') || el.textContent.includes('로그인')) {
    console.log(`중복 요소 ${index + 1}:`, {
      tagName: el.tagName,
      className: el.className,
      textContent: el.textContent.substring(0, 50) + '...',
      display: getComputedStyle(el).display
    });
  }
});