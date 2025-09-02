const { test, expect } = require('@playwright/test');

test.describe('BUDICONNECTS 홈페이지', () => {
  
  test('홈페이지 기본 요소들이 정상적으로 로드된다', async ({ page }) => {
    // 홈페이지로 이동
    await page.goto('/');
    
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/BUDICONNECTS|불자들의 커뮤니티/);
    
    // 메인 헤딩 확인
    await expect(page.locator('h1')).toContainText('불자들의 커뮤니티');
    
    // 헤더 네비게이션 확인
    await expect(page.getByText('전체')).toBeVisible();
    await expect(page.getByText('구인구직')).toBeVisible();
    await expect(page.getByText('커뮤니티')).toBeVisible();
    
    // Quick Actions 버튼들 확인
    await expect(page.getByText('채용')).toBeVisible();
    await expect(page.getByText('구인')).toBeVisible();
    await expect(page.getByText('구직')).toBeVisible();
    
    // CTA 버튼 확인
    await expect(page.getByRole('button', { name: /시작하기|커뮤니티 둘러보기/ })).toBeVisible();
  });

  test('네비게이션이 정상적으로 작동한다', async ({ page }) => {
    await page.goto('/');
    
    // 구인구직 페이지로 이동
    await page.getByText('구인구직').first().click();
    await expect(page).toHaveURL(/\/jobs/);
    
    // 뒤로가기
    await page.goBack();
    await expect(page).toHaveURL('/');
    
    // 커뮤니티 페이지로 이동
    await page.getByText('커뮤니티').first().click();
    await expect(page).toHaveURL(/\/community/);
  });

  test('Quick Actions 버튼들이 올바른 페이지로 연결된다', async ({ page }) => {
    await page.goto('/');
    
    // 채용 버튼 (파란색 주요 버튼) 클릭
    const jobPostButton = page.locator('a[href="/write"]').first();
    await expect(jobPostButton).toBeVisible();
    await jobPostButton.click();
    await expect(page).toHaveURL(/\/write/);
    
    await page.goBack();
    
    // 구인 버튼 클릭
    const jobSearchButton = page.locator('a[href="/jobs"]').first();
    await expect(jobSearchButton).toBeVisible();
    await jobSearchButton.click();
    await expect(page).toHaveURL(/\/jobs/);
  });

  test('고급 기능 토글이 작동한다', async ({ page }) => {
    await page.goto('/');
    
    // 고급 기능 버튼 클릭
    const advancedFeaturesButton = page.getByText('고급 기능 살펴보기');
    await expect(advancedFeaturesButton).toBeVisible();
    await advancedFeaturesButton.click();
    
    // 고급 기능 카드들 확인
    await expect(page.getByText('스마트 매칭')).toBeVisible();
    await expect(page.getByText('실시간 분석')).toBeVisible();
    await expect(page.getByText('1:1 컨설팅')).toBeVisible();
  });

});

test.describe('새로 추가된 페이지들', () => {
  
  test('스마트 매칭 페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/matching');
    
    await expect(page.locator('h1')).toContainText('AI 스마트 매칭');
    await expect(page.getByText('당신에게 완벽한 기회를 찾아드립니다')).toBeVisible();
    await expect(page.getByRole('button', { name: 'AI 매칭 시작하기' })).toBeVisible();
  });

  test('실시간 분석 페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/analytics');
    
    await expect(page.locator('h1')).toContainText('실시간 시장 분석');
    await expect(page.getByText('총 채용공고')).toBeVisible();
    await expect(page.getByText('활성 구직자')).toBeVisible();
    await expect(page.getByText('평균 연봉')).toBeVisible();
  });

  test('1:1 컨설팅 페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/consulting');
    
    await expect(page.locator('h1')).toContainText('1:1 전문 컨설팅');
    await expect(page.getByText('전문가와 함께하는 맞춤형 커리어 컨설팅')).toBeVisible();
    await expect(page.getByText('커리어 로드맵')).toBeVisible();
    await expect(page.getByText('면접 준비')).toBeVisible();
  });
  
});