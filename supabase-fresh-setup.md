# 새로운 Supabase 프로젝트 설정 가이드

## 1. 현재 스키마 백업 (완료)

### 데이터베이스 테이블 구조
```sql
-- 사용자 프로필 테이블
profiles (
  id UUID PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- 게시글 테이블
posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT,
  content TEXT,
  author_name TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE
)

-- 게시글 좋아요 테이블
post_likes (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ,
  UNIQUE(post_id, user_id)
)

-- 댓글 테이블
comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  user_id UUID REFERENCES profiles(id),
  author_name TEXT,
  content TEXT,
  parent_comment_id UUID REFERENCES comments(id),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- 댓글 좋아요 테이블
comment_likes (
  id UUID PRIMARY KEY,
  comment_id UUID REFERENCES comments(id),
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ,
  UNIQUE(comment_id, user_id)
)
```

### RPC 함수들
1. `get_post_comments(p_post_id UUID)` - 댓글 목록 조회
2. `create_comment(...)` - 댓글 생성
3. `update_comment(...)` - 댓글 수정
4. `delete_comment(...)` - 댓글 삭제
5. `toggle_comment_like(...)` - 댓글 좋아요 토글
6. `get_post_comment_count(...)` - 댓글 수 조회
7. `get_user_comments(...)` - 사용자 댓글 목록
8. `notify_comment_change()` - 실시간 알림 트리거

## 2. 새 Supabase 프로젝트 생성 단계

### Step 1: Supabase 웹 콘솔에서 새 프로젝트 생성
1. https://app.supabase.com 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `newbeginning-fresh`
   - Database Password: 안전한 비밀번호 생성
   - Region: Northeast Asia (Seoul) - ap-northeast-2

### Step 2: 환경 변수 업데이트
```bash
# .env.local 파일 업데이트 필요
NEXT_PUBLIC_SUPABASE_URL=[새 프로젝트 URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[새 익명 키]
SUPABASE_SERVICE_ROLE_KEY=[새 서비스 역할 키]
NEXT_PUBLIC_SITE_URL=https://fortheorlingas.com
```

### Step 3: Authentication 설정
- Email confirmation 비활성화 (개발 편의)
- OAuth 제공업체 설정 (필요시)
- Site URL: `https://fortheorlingas.com`
- Redirect URLs: `https://fortheorlingas.com/auth/callback`

### Step 4: 데이터베이스 스키마 생성
- 위의 테이블 구조 적용
- RLS (Row Level Security) 정책 설정
- RPC 함수들 생성

### Step 5: Realtime 설정
- 필요한 테이블에 대해 realtime 활성화
- WebSocket 연결 테스트

## 3. 테스트 계획
1. 로컬 개발 서버에서 인증 플로우 테스트
2. 게시글 CRUD 동작 확인
3. 댓글 시스템 동작 확인
4. 좋아요 기능 동작 확인
5. 실시간 기능 확인
6. 프로덕션 배포 및 검증

## 4. 예상 해결되는 문제들
- UUID 유효성 검사 오류
- WebSocket 연결 실패
- 인증 상태 동기화 문제
- 실시간 구독 오류
- 404 라우팅 오류 (이미 해결됨)

## 5. 롤백 계획
- 기존 .env.local 파일 백업 보관
- 기존 Supabase 프로젝트 일시 유지
- 문제 발생시 즉시 이전 설정으로 복구 가능