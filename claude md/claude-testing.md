# Testing Guide - NewBeginning

> 🎯 **테스트 전략, E2E 가이드, 품질 보증 가이드**

---

## 📚 목차

1. [테스트 전략](#테스트-전략)
2. [단위 테스트](#단위-테스트)
3. [통합 테스트](#통합-테스트)
4. [E2E 테스트 (Playwright)](#e2e-테스트-playwright)
5. [API 테스트](#api-테스트)
6. [접근성 테스트](#접근성-테스트)
7. [성능 테스트](#성능-테스트)
8. [테스트 자동화](#테스트-자동화)

---

## 🎯 테스트 전략

### 테스트 피라미드
```
                  /\
                 /  \
                / E2E \     <- 느리고 비용 높음, 적은 수
               /      \
              /        \
             / Integration \ <- 중간 속도, 중간 수량
            /            \
           /              \
          /   Unit Tests   \  <- 빠르고 저비용, 많은 수
         /__________________\
```

### 커버리지 목표
- **단위 테스트**: 80% 이상
- **통합 테스트**: 주요 워크플로우 70% 이상  
- **E2E 테스트**: 핵심 사용자 여정 100%
- **전체 커버리지**: 75% 이상

---

## 🧪 단위 테스트

### Jest & Testing Library 설정
```json
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### 컴포넌트 테스트 예시
```typescript
// __tests__/components/PostCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PostCard } from '@/components/post/post-card'
import type { PostWithDetails } from '@/types/database.types'

const mockPost: PostWithDetails = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: '첫 임신 후기',
  content: '임신 초기 경험을 공유합니다.',
  category: 'expecting',
  author_name: 'test_user',
  created_at: '2025-01-13T10:00:00Z',
  profiles: {
    username: 'test_user',
    avatar_url: 'https://example.com/avatar.jpg'
  },
  _count: {
    likes: 5,
    comments: 3
  },
  user_id: 'user123',
  updated_at: '2025-01-13T10:00:00Z',
  view_count: 10
}

describe('PostCard', () => {
  it('게시글 정보를 올바르게 렌더링한다', () => {
    render(<PostCard post={mockPost} />)
    
    expect(screen.getByText('첫 임신 후기')).toBeInTheDocument()
    expect(screen.getByText('임신 초기 경험을 공유합니다.')).toBeInTheDocument()
    expect(screen.getByText('test_user')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument() // 좋아요 수
    expect(screen.getByText('3')).toBeInTheDocument() // 댓글 수
  })

  it('좋아요 버튼 클릭 시 콜백을 호출한다', async () => {
    const mockOnLike = jest.fn()
    render(<PostCard post={mockPost} onLike={mockOnLike} />)
    
    const likeButton = screen.getByRole('button', { name: /좋아요/i })
    fireEvent.click(likeButton)
    
    await waitFor(() => {
      expect(mockOnLike).toHaveBeenCalledWith(mockPost.id)
    })
  })

  it('접근성 속성이 올바르게 설정되어 있다', () => {
    render(<PostCard post={mockPost} />)
    
    const article = screen.getByRole('article')
    expect(article).toHaveAttribute('aria-label', expect.stringContaining('첫 임신 후기'))
    
    const likeButton = screen.getByRole('button', { name: /좋아요/i })
    expect(likeButton).toHaveAttribute('aria-pressed')
  })
})
```

### Custom Hook 테스트
```typescript
// __tests__/hooks/usePosts.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { usePosts } from '@/hooks/usePosts'

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          range: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({
              data: mockPostsData,
              error: null,
              count: 10
            }))
          }))
        }))
      }))
    }))
  })
}))

describe('usePosts', () => {
  it('초기 상태가 올바르게 설정된다', () => {
    const { result } = renderHook(() => usePosts())
    
    expect(result.current.posts).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.hasMore).toBe(true)
  })

  it('게시글 목록을 성공적으로 로드한다', async () => {
    const { result } = renderHook(() => usePosts({ enabled: true }))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.posts).toHaveLength(mockPostsData.length)
    expect(result.current.error).toBe(null)
  })
})
```

---

## 🔗 통합 테스트

### API 라우트 통합 테스트
```typescript
// __tests__/integration/api/posts.test.ts
import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/posts/route'

// Mock 인증
jest.mock('@/lib/auth/jwt', () => ({
  getAuthenticatedUser: jest.fn(() => ({
    user: { id: 'user123' },
    error: null
  }))
}))

describe('/api/posts', () => {
  describe('GET', () => {
    it('게시글 목록을 반환한다', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/posts?category=expecting&limit=10'
      })
      
      const response = await GET(req as any)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.meta).toBeDefined()
    })
  })

  describe('POST', () => {
    it('새 게시글을 생성한다', async () => {
      const postData = {
        title: '테스트 게시글',
        content: '테스트 내용',
        category: 'community'
      }

      const { req } = createMocks({
        method: 'POST',
        body: postData
      })
      
      const response = await POST(req as any)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.title).toBe(postData.title)
    })
  })
})
```

---

## 🎭 E2E 테스트 (Playwright)

### Playwright 설정
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 핵심 사용자 여정 테스트
```typescript
// e2e/user-journey.spec.ts
import { test, expect } from '@playwright/test'

test.describe('사용자 핵심 여정', () => {
  test('회원가입 → 프로필 설정 → 게시글 작성 → 댓글 작성', async ({ page }) => {
    // 1. 회원가입
    await page.goto('/signup')
    await page.fill('[data-testid=email]', 'test@example.com')
    await page.fill('[data-testid=password]', 'password123!')
    await page.fill('[data-testid=username]', 'test_user')
    await page.click('[data-testid=signup-button]')
    
    // 이메일 확인 페이지로 이동 확인
    await expect(page).toHaveURL('/auth/verify-email')
    
    // 2. 프로필 설정 (Mock으로 이메일 확인 완료 상태)
    await page.goto('/profile/setup')
    await page.selectOption('[data-testid=parenting-stage]', 'expecting')
    await page.selectOption('[data-testid=parenting-role]', 'mother')
    await page.fill('[data-testid=due-date]', '2025-08-01')
    await page.click('[data-testid=save-profile]')
    
    // 홈페이지로 리다이렉트 확인
    await expect(page).toHaveURL('/')
    
    // 3. 게시글 작성
    await page.click('[data-testid=write-post-button]')
    await page.fill('[data-testid=post-title]', '첫 임신 궁금한 점들')
    await page.fill('[data-testid=post-content]', '임신 초기에 주의할 점이 있나요?')
    await page.selectOption('[data-testid=post-category]', 'expecting')
    await page.click('[data-testid=publish-button]')
    
    // 게시글 목록에서 확인
    await expect(page.locator('[data-testid=post-item]').first()).toContainText('첫 임신 궁금한 점들')
    
    // 4. 댓글 작성
    await page.click('[data-testid=post-item]').first()
    await page.fill('[data-testid=comment-input]', '축하드려요! 저도 비슷한 경험이 있어요.')
    await page.click('[data-testid=comment-submit]')
    
    // 댓글 표시 확인
    await expect(page.locator('[data-testid=comment-item]')).toContainText('축하드려요!')
  })

  test('게시글 좋아요 및 북마크 기능', async ({ page }) => {
    // 로그인 상태로 시작
    await page.goto('/login')
    await page.fill('[data-testid=email]', 'existing@example.com')
    await page.fill('[data-testid=password]', 'password123!')
    await page.click('[data-testid=login-button]')
    
    await page.goto('/')
    
    // 좋아요 버튼 클릭
    const likeButton = page.locator('[data-testid=like-button]').first()
    const initialCount = await likeButton.locator('[data-testid=like-count]').textContent()
    
    await likeButton.click()
    
    // Optimistic UI 업데이트 확인
    await expect(likeButton).toHaveAttribute('aria-pressed', 'true')
    await expect(likeButton.locator('[data-testid=like-count]')).not.toHaveText(initialCount!)
    
    // 북마크 기능
    const bookmarkButton = page.locator('[data-testid=bookmark-button]').first()
    await bookmarkButton.click()
    await expect(bookmarkButton).toHaveAttribute('aria-pressed', 'true')
  })
})
```

### 접근성 E2E 테스트
```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('접근성 테스트', () => {
  test('홈페이지 접근성 준수', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('키보드 내비게이션', async ({ page }) => {
    await page.goto('/')
    
    // Tab 키로 네비게이션
    await page.keyboard.press('Tab')
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(['A', 'BUTTON', 'INPUT'].includes(focusedElement!)).toBeTruthy()
    
    // 게시글 목록에서 Enter 키로 선택
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    
    // 게시글 상세 페이지로 이동 확인
    await expect(page).toHaveURL(/\/posts\/[a-f0-9-]+/)
  })

  test('스크린 리더 지원', async ({ page }) => {
    await page.goto('/')
    
    // aria-label 확인
    const articles = page.locator('article[role="article"]')
    await expect(articles.first()).toHaveAttribute('aria-label')
    
    // 헤딩 구조 확인
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
    
    const h2Elements = page.locator('h2')
    const h2Count = await h2Elements.count()
    expect(h2Count).toBeGreaterThan(0)
  })
})
```

---

## 🔧 API 테스트

### API 테스트 도구 설정
```typescript
// __tests__/api-integration/setup.ts
import { createClient } from '@supabase/supabase-js'

export const testSupabase = createClient(
  process.env.SUPABASE_TEST_URL!,
  process.env.SUPABASE_TEST_ANON_KEY!
)

export const setupTestData = async () => {
  // 테스트용 사용자 생성
  const { data: authData } = await testSupabase.auth.signUp({
    email: 'test@example.com',
    password: 'password123!'
  })
  
  if (authData.user) {
    // 테스트용 프로필 생성
    await testSupabase.from('profiles').insert({
      id: authData.user.id,
      username: 'test_user',
      parenting_stage: 'expecting'
    })
  }
  
  return authData.user
}

export const cleanupTestData = async (userId: string) => {
  await testSupabase.from('profiles').delete().eq('id', userId)
  await testSupabase.auth.admin.deleteUser(userId)
}
```

---

## ⚡ 성능 테스트

### Lighthouse CI 설정
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/posts',
        'http://localhost:3000/login'
      ],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.8}],
        'categories:accessibility': ['error', {minScore: 0.9}],
        'categories:best-practices': ['error', {minScore: 0.9}],
        'categories:seo': ['error', {minScore: 0.8}]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}
```

### 성능 테스트 코드
```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test'

test.describe('성능 테스트', () => {
  test('페이지 로딩 시간 측정', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    
    // First Contentful Paint 대기
    await page.waitForSelector('[data-testid=main-content]')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // 3초 이내 로딩
  })

  test('무한 스크롤 성능', async ({ page }) => {
    await page.goto('/posts')
    
    // 초기 게시글 로드 확인
    await expect(page.locator('[data-testid=post-item]')).toHaveCount(20)
    
    // 스크롤 성능 측정
    const startTime = Date.now()
    
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })
    
    // 새 게시글 로드 대기
    await expect(page.locator('[data-testid=post-item]')).toHaveCount(40)
    
    const scrollLoadTime = Date.now() - startTime
    expect(scrollLoadTime).toBeLessThan(2000) // 2초 이내
  })
})
```

---

## 🤖 테스트 자동화

### GitHub Actions 워크플로우
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Start app
        run: npm run build && npm start &
      
      - name: Wait for app
        run: npx wait-on http://localhost:3000
      
      - name: Run E2E tests
        run: npx playwright test
      
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build app
        run: npm run build
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
```

### 테스트 스크립트
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:api": "jest --testPathPattern=api",
    "test:all": "npm run test:coverage && npm run test:e2e",
    "test:lighthouse": "lhci autorun"
  }
}
```

---

**📝 마지막 업데이트**: 2025-09-13  
**🔄 다음 리뷰 예정**: 2025-10-13  
**📖 관련 문서**: [CLAUDE.md](./CLAUDE.md) | [claude-development.md](./claude-development.md)