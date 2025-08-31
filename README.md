# 구인구직 & 커뮤니티 플랫폼

Next.js 15 + Supabase로 구축한 Facebook Pages 스타일의 구인구직 & 커뮤니티 플랫폼입니다.

## 🚀 주요 기능

### 인증 시스템
- 이메일/비밀번호 로그인/회원가입
- Supabase Auth를 활용한 안전한 인증
- 세션 유지 및 자동 로그아웃

### 게시글 기능
- **구인**: 채용 정보 게시 (회사명, 지역, 급여, 연락처, 마감일)
- **구직**: 구직 희망 게시 (희망 회사/분야, 지역, 희망 급여, 연락처)
- **커뮤니티**: 자유로운 소통 공간
- 비회원도 읽기 가능, 회원만 작성 가능
- 실시간 조회수 증가
- 작성자만 수정/삭제 가능

### 상호작용 기능
- 좋아요 토글 (실시간 업데이트)
- 댓글 작성/삭제
- 실시간 알림 및 업데이트

### UI/UX
- Facebook Pages 스타일의 카드형 레이아웃
- 완전 반응형 디자인 (모바일 최적화)
- 다크모드 지원 준비
- 로딩 상태 및 에러 처리

## 🛠 기술 스택

### Frontend
- **Next.js 15.x** (App Router, Server Components)
- **React 19** (Server Components, Suspense)
- **TypeScript 5.x** (완전한 타입 안정성)
- **Tailwind CSS** (유틸리티 퍼스트 CSS)
- **Lucide React** (아이콘)

### Backend & Database
- **Supabase** (PostgreSQL + Auth + Realtime)
- **Row Level Security (RLS)** (보안)
- **Server Actions** (서버사이드 데이터 처리)

### State Management & UI
- **React Hook Form** + **Zod** (폼 관리)
- **Sonner** (토스트 알림)
- **Next.js 15 Server Components** (상태 관리)

### Deployment
- **Vercel** (배포 최적화)
- **환경 변수** (보안 설정)

## 🚀 빠른 시작

### 1. 프로젝트 설치

```bash
npm install
```

### 2. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase-setup.sql` 파일 내용 실행
3. API Keys 복사

### 3. 환경 변수 설정

`.env.local` 파일에서 Supabase 정보 입력:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 📋 Supabase 데이터베이스 스키마

### 핵심 테이블

#### `profiles` - 사용자 프로필
- `id` (UUID, auth.users 참조)
- `username` (VARCHAR, 고유)
- `avatar_url` (TEXT, 선택적)
- `created_at` (TIMESTAMPTZ)

#### `posts` - 게시글
- 기본 정보: `id`, `user_id`, `author_name`, `title`, `content`
- 카테고리: `category` ('job_offer', 'job_seek', 'community')
- 구인구직 필드: `company`, `location`, `salary`, `contact`, `deadline`
- 메타데이터: `view_count`, `created_at`, `updated_at`

#### `comments` - 댓글
- `id`, `post_id`, `user_id`, `author_name`, `content`, `created_at`

#### `likes` - 좋아요
- `id`, `post_id`, `user_id`, `created_at`
- 중복 방지를 위한 `UNIQUE(post_id, user_id)` 제약

### 보안 설정 (RLS)
- 모든 테이블에 Row Level Security 적용
- 읽기는 누구나, 쓰기는 인증된 사용자만
- 수정/삭제는 작성자만 가능

## 🔧 주요 기능 설명

### Server Actions 활용
- `createPost`: 게시글 생성
- `updatePost`: 게시글 수정
- `deletePost`: 게시글 삭제
- `toggleLike`: 좋아요 토글
- `createComment`: 댓글 생성
- `deleteComment`: 댓글 삭제

### 실시간 업데이트
- Supabase Realtime을 활용한 실시간 구독
- 새 게시글, 댓글, 좋아요 실시간 반영
- Optimistic UI 업데이트

### 반응형 디자인
- Mobile-first 접근 방식
- Tailwind CSS breakpoints 활용
- 터치 친화적 UI 요소

## 🚀 배포

### Vercel 배포

1. GitHub에 코드 푸시
2. Vercel에 연결
3. 환경 변수 설정
4. 자동 배포

### 환경 변수 (Production)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

## 🔒 보안 고려사항

- Row Level Security (RLS) 적용
- 사용자 입력 검증 (Zod)
- XSS 방지
- CSRF 보호
- 환경 변수를 통한 설정 분리

## 📈 성능 최적화

- Next.js 15 Server Components 활용
- 데이터베이스 인덱스 최적화
- 이미지 최적화 (next/image)
- 코드 스플리팅
- 캐싱 전략
