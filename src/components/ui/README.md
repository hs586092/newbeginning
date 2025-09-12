# UI Design System

ParentWise의 모던 UI 컴포넌트 라이브러리입니다.

## 🎨 디자인 철학

- **사용자 중심**: 직관적이고 접근 가능한 인터페이스
- **일관성**: 전체 애플리케이션에서 통일된 디자인 언어
- **성능**: 최적화된 번들 크기와 런타임 성능
- **접근성**: WCAG 2.1 AA 준수

## 📦 컴포넌트 목록

### 기본 UI 컴포넌트

| 컴포넌트 | 설명 | Variants | 특징 |
|---------|------|----------|------|
| `Button` | 기본 버튼 | 6가지 variant, 4가지 size | 로딩 상태, 아이콘 지원 |
| `Badge` | 상태 표시 | 4가지 variant | CVA 패턴, 접근성 |
| `Input` | 입력 필드 | 표준 폼 요소 | 검증, 에러 상태 |
| `Label` | 라벨 | 기본형 | 폼 연동 |

### 데이터 표시

| 컴포넌트 | 설명 | Variants | 특징 |
|---------|------|----------|------|
| `Card` | 콘텐츠 카드 | 5가지 variant, 4가지 size | 포스트, 프로필용 |
| `Avatar` | 사용자 아바타 | 7가지 크기, 4가지 variant | 그룹, 이니셜 생성 |
| `Badge` | 태그/상태 | 4가지 variant | 우선순위 표시 |

### 네비게이션

| 컴포넌트 | 설명 | Variants | 특징 |
|---------|------|----------|------|
| `Tabs` | 탭 네비게이션 | 4가지 variant, 3가지 size | Lazy 로딩, Hook |
| `Select` | 드롭다운 선택 | 4가지 variant, 3가지 size | 검색, 다중선택 |

### 피드백

| 컴포넌트 | 설명 | Variants | 특징 |
|---------|------|----------|------|
| `Alert` | 알림 메시지 | 5가지 variant, 3가지 size | 자동닫기, Hook |
| `Tooltip` | 도움말 툴팁 | 5가지 variant, 4방향 | 접근성, 지연 |
| `Loading` | 로딩 스피너 | 기본형 | 애니메이션 |
| `Skeleton` | 스켈레톤 UI | 기본형 | 로딩 상태 |

### 유틸리티

| 컴포넌트 | 설명 | 특징 |
|---------|------|------|
| `OptimizedImage` | 최적화된 이미지 | 성능 최적화, lazy loading |
| `ThemeToggle` | 다크모드 토글 | 시스템 테마 감지 |

## 🚀 사용법

### 기본 사용

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

export function Example() {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>제목</CardTitle>
      </CardHeader>
      <CardContent>
        <p>콘텐츠</p>
        <Button variant="default" size="lg">
          클릭하세요
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 고급 사용

```tsx
import { Select, Alert, useAlert } from '@/components/ui'

export function AdvancedExample() {
  const { addAlert } = useAlert()

  return (
    <>
      <Select
        options={[
          { value: '1', label: '옵션 1' },
          { value: '2', label: '옵션 2' }
        ]}
        searchable
        multiple
        onChange={(value) => addAlert(`선택됨: ${value}`, { variant: 'success' })}
      />
    </>
  )
}
```

## 🎯 컴포넌트별 상세 가이드

### Card 컴포넌트

포스트, 프로필, 콘텐츠 표시용 카드 컴포넌트

**Variants:**
- `default`: 기본 카드 (hover shadow)
- `elevated`: 상승된 카드 (shadow-md)
- `interactive`: 클릭 가능한 카드 (scale effect)
- `outline`: 테두리 강조 카드
- `ghost`: 투명 카드

**Size Options:**
- `compact`: 작은 패딩 (p-4)
- `default`: 기본 패딩 (p-6)  
- `spacious`: 큰 패딩 (p-8)
- `none`: 패딩 없음 (p-0)

```tsx
<Card variant="interactive" size="compact">
  <CardHeader compact>
    <CardTitle as="h2">포스트 제목</CardTitle>
    <CardDescription>포스트 설명</CardDescription>
  </CardHeader>
  <CardContent>
    포스트 내용
  </CardContent>
  <CardFooter compact>
    <Button variant="ghost" size="sm">좋아요</Button>
  </CardFooter>
</Card>
```

### Avatar 컴포넌트

사용자 프로필 표시용 아바타 컴포넌트

**크기:** xs, sm, default, lg, xl, 2xl, 3xl

**기능:**
- 이미지 로드 실패 시 fallback
- 이니셜 자동 생성
- 그룹 표시 지원
- 색상 자동 생성

```tsx
<Avatar size="lg" variant="ring">
  <AvatarImage src="/avatar.jpg" alt="사용자" />
  <AvatarFallback variant="colorful">
    {generateInitials("홍길동")}
  </AvatarFallback>
</Avatar>

<AvatarGroup max={3} size="default">
  <Avatar><AvatarImage src="/user1.jpg" alt="User 1" /></Avatar>
  <Avatar><AvatarImage src="/user2.jpg" alt="User 2" /></Avatar>
  <Avatar><AvatarImage src="/user3.jpg" alt="User 3" /></Avatar>
  <Avatar><AvatarImage src="/user4.jpg" alt="User 4" /></Avatar>
</AvatarGroup>
```

### Select 컴포넌트

필터, 옵션 선택용 드롭다운 컴포넌트

**기능:**
- 검색 가능
- 다중 선택
- 로딩 상태
- 에러 상태
- 아이콘 지원

```tsx
<Select
  options={[
    { 
      value: 'pregnancy', 
      label: '임신', 
      icon: <Baby />,
      description: '임신 관련 게시글'
    },
    { value: 'newborn', label: '신생아' },
    { value: 'toddler', label: '유아' }
  ]}
  placeholder="카테고리 선택"
  searchable
  multiple
  onChange={(value) => console.log(value)}
/>
```

### Tabs 컴포넌트

네비게이션용 탭 컴포넌트

**Variants:**
- `default`: 기본 탭
- `line`: 언더라인 탭
- `pills`: 알약형 탭
- `cards`: 카드형 탭

```tsx
<Tabs defaultValue="posts" orientation="horizontal">
  <TabsList variant="line">
    <TabsTrigger value="posts" badge={12}>
      게시글
    </TabsTrigger>
    <TabsTrigger value="comments" badge={5}>
      댓글
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="posts">
    게시글 내용
  </TabsContent>
  <TabsContent value="comments">
    댓글 내용
  </TabsContent>
</Tabs>
```

### Alert 시스템

피드백 메시지 표시 시스템

**Hook 사용:**

```tsx
function MyComponent() {
  const { addAlert, success, error, warning } = useAlert()
  
  const handleSubmit = async () => {
    try {
      await submitData()
      success('데이터가 저장되었습니다!')
    } catch (err) {
      error('저장에 실패했습니다.')
    }
  }
  
  return (
    <Button onClick={handleSubmit}>
      저장
    </Button>
  )
}

// App.tsx에서 Container 설정
<AlertContainer position="top-right" maxAlerts={3} />
```

### Tooltip 컴포넌트

도움말 및 부가 정보 표시

```tsx
<Tooltip 
  content="이 버튼을 클릭하면 게시글이 저장됩니다"
  side="top"
  delay={300}
>
  <Button>저장</Button>
</Tooltip>
```

## 🔧 커스터마이징

### CSS Variables

```css
:root {
  --radius: 0.5rem;
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
}
```

### 테마 확장

```tsx
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        }
      }
    }
  }
}
```

## 📱 반응형 디자인

모든 컴포넌트는 모바일 우선 반응형 디자인을 따릅니다:

- **xs**: 320px+
- **sm**: 640px+  
- **md**: 768px+
- **lg**: 1024px+
- **xl**: 1280px+

## ♿ 접근성

### WCAG 2.1 AA 준수

- **키보드 네비게이션**: 모든 인터랙티브 요소
- **스크린 리더**: ARIA 속성 완벽 지원
- **색상 대비**: 4.5:1 이상 유지
- **포커스 관리**: 명확한 포커스 표시

### 접근성 테스트

```tsx
// 예제: 키보드 네비게이션 테스트
test('keyboard navigation', () => {
  render(<Select options={options} />)
  
  // Tab으로 포커스
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Tab' })
  
  // Enter로 열기
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' })
  
  // Arrow로 선택
  fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' })
})
```

## 🚀 성능 최적화

### Bundle Size

- Tree-shaking 지원
- 개별 컴포넌트 import 가능
- CSS-in-JS 최적화

```tsx
// ✅ 좋은 예 - 필요한 컴포넌트만 import
import { Button } from '@/components/ui/button'

// ❌ 나쁜 예 - 전체 라이브러리 import
import * as UI from '@/components/ui'
```

### Runtime Performance

- React.memo() 적용
- useMemo(), useCallback() 최적화
- Virtual scrolling (대용량 리스트)

## 🧪 테스트

### Unit Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

test('button click', () => {
  const onClick = jest.fn()
  render(<Button onClick={onClick}>클릭</Button>)
  
  fireEvent.click(screen.getByRole('button'))
  expect(onClick).toHaveBeenCalledTimes(1)
})
```

### Visual Testing

```tsx
// Storybook stories
export const Default = {
  args: {
    children: '기본 버튼',
    variant: 'default'
  }
}

export const AllVariants = () => (
  <div className="space-x-2">
    <Button variant="default">Default</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="outline">Outline</Button>
  </div>
)
```

## 📚 추가 리소스

- [Design Tokens](./tokens.md)
- [Component Patterns](./patterns.md)
- [Migration Guide](./migration.md)
- [Contributing](./CONTRIBUTING.md)

## 🔄 버전 관리

컴포넌트 라이브러리는 Semantic Versioning을 따릅니다:

- **Major**: Breaking changes
- **Minor**: 새로운 컴포넌트/기능 추가
- **Patch**: 버그 수정, 성능 개선

현재 버전: `1.0.0`