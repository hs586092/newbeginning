# 📊 데이터베이스 설계 계획 - MOCK 데이터 대체

## 현재 데이터베이스 상태 분석

### ✅ 기존 테이블 (연동 완료)
- **posts**: 게시글 데이터 ✅ 작동중
  - 샘플 데이터: "첫 번째 테스트 게시글", "두 번째 테스트 게시글"
  - 작성자: testuser1

### ❌ 누락된 테이블 (생성 필요)
- **profiles**: 사용자 프로필 (포인트, 레벨 컬럼 없음)
- **groups**: 그룹 정보
- **categories**: 카테고리 관리
- **chat_rooms**: 채팅방 (스키마 있지만 실제 테이블 없음)
- **messages**: 메시지 (스키마 있지만 실제 테이블 없음)
- **chat_room_members**: 채팅방 멤버 (스키마 있지만 실제 테이블 없음)
- **notifications**: 알림 시스템
- **bookmarks**: 북마크 기능
- **follows**: 팔로우 관계
- **events**: 이벤트 관리
- **mentors**: 멘토 프로필

## 우선순위별 데이터베이스 구현 계획

### Phase 1: 핵심 사이드바 데이터 (즉시 수정 필요)

#### 1. profiles 테이블 확장
```sql
-- 기존 profiles 테이블에 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ranking INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS next_badge_points INTEGER DEFAULT 250;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level DESC);
```

#### 2. categories 테이블 생성
```sql
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  post_count INTEGER DEFAULT 0,
  is_hot BOOLEAN DEFAULT false,
  icon VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 초기 데이터 삽입
INSERT INTO categories (name, post_count, is_hot, icon) VALUES
('아기 수유 고민', 124, true, '🍼'),
('이유식 거부', 89, true, '🥄'),
('밤수유 노하우', 78, false, '🌙'),
('변비 과열', 67, false, '💊'),
('놀이 활동', 56, false, '🧸'),
('둘째 조작', 45, false, '👶'),
('육아휴직 복직', 34, false, '💼'),
('모유수유 노하우', 23, false, '🤱');
```

#### 3. groups 테이블 생성
```sql
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  member_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  icon VARCHAR(50),
  color VARCHAR(20),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 초기 그룹 데이터
INSERT INTO groups (name, description, member_count, is_public, icon, color) VALUES
('신생아맘 모임', '0-6개월 아기를 키우는 엄마들의 모임', 124, true, '👶', 'purple'),
('이유식 레시피', '이유식 레시피 공유와 노하우', 89, true, '🍼', 'green');

-- 그룹 멤버십 테이블
CREATE TABLE IF NOT EXISTS group_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- member, admin, owner
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(group_id, user_id)
);
```

### Phase 2: 소셜 기능 데이터

#### 4. follows 테이블 생성
```sql
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(follower_id, following_id)
);

-- 팔로워 수를 profiles에 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
```

#### 5. notifications 테이블 생성
```sql
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- message, follow, like, comment
  title VARCHAR(200),
  content TEXT,
  is_read BOOLEAN DEFAULT false,
  related_id UUID, -- 관련 게시글, 메시지 등의 ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at);
```

### Phase 3: 메시징 시스템

#### 6. 채팅 테이블 생성 (기존 스키마 활용)
```sql
-- 기존 chat-schema.sql의 스키마를 실제로 적용
-- chat_rooms, messages, chat_room_members 테이블 생성
```

#### 7. 샘플 메시지 데이터
```sql
-- 샘플 메시지 데이터 삽입하여 MOCK 대체
```

## 사이드바 컴포넌트 수정 계획

### 왼쪽 사이드바 수정사항
1. **포인트 시스템**: `profiles` 테이블에서 실제 포인트, 레벨, 랭킹 조회
2. **메시지 알림**: `notifications` 테이블에서 읽지 않은 메시지 수 조회
3. **메시지 미리보기**: 최근 메시지 2개를 `messages` 테이블에서 조회

### 오른쪽 사이드바 수정사항
1. **추천 그룹**: `groups` 테이블에서 실제 그룹 데이터 조회
2. **그룹 가입 기능**: `group_memberships` 테이블과 실제 연동
3. **인기 카테고리**: `categories` 테이블에서 실제 통계 조회

## API 서비스 생성 계획

### 1. 사용자 프로필 서비스
```typescript
// src/lib/services/profile-service.ts
export class ProfileService {
  async getUserProfile(userId: string)
  async updateUserPoints(userId: string, points: number)
  async calculateUserRanking(userId: string)
}
```

### 2. 그룹 관리 서비스
```typescript
// src/lib/services/group-service.ts
export class GroupService {
  async getRecommendedGroups(userId: string)
  async joinGroup(groupId: string, userId: string)
  async getGroupMembers(groupId: string)
}
```

### 3. 카테고리 서비스
```typescript
// src/lib/services/category-service.ts
export class CategoryService {
  async getHotCategories()
  async updateCategoryStats()
}
```

## 구현 순서

### 1단계: 데이터베이스 스키마 생성 (오늘)
- [x] 현재 데이터베이스 상태 확인
- [ ] profiles 테이블 확장
- [ ] categories 테이블 생성 및 데이터 삽입
- [ ] groups 테이블 생성 및 데이터 삽입

### 2단계: 사이드바 데이터 연동 (오늘)
- [ ] 왼쪽 사이드바에서 MOCK 데이터 제거
- [ ] 오른쪽 사이드바에서 MOCK 데이터 제거
- [ ] 실제 데이터베이스 쿼리로 대체

### 3단계: 기능 테스트 (내일)
- [ ] 사이드바 기능 테스트
- [ ] 실제 그룹 가입 기능 구현
- [ ] 포인트 시스템 동작 확인

### 4단계: 추가 기능 (다음 주)
- [ ] 메시징 시스템 완성
- [ ] 알림 시스템 구현
- [ ] 팔로우 시스템 구현

## 예상 시간
- **Phase 1**: 2-3시간 (데이터베이스 + 사이드바)
- **Phase 2**: 1-2일 (소셜 기능)
- **Phase 3**: 3-5일 (전체 시스템)

**총 예상**: 1주일 내 MOCK 데이터 완전 제거 및 실제 데이터 연동 완료