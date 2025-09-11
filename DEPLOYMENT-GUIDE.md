# 📋 댓글 시스템 RPC 함수 배포 가이드

## 🎯 개요

이 가이드는 Supabase에 댓글 시스템 RPC 함수들을 수동으로 배포하는 방법을 안내합니다.

## 🚀 배포 방법

### 1단계: Supabase 대시보드 접속

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택: `spgcihtrquywmaieflue`
3. 왼쪽 메뉴에서 **SQL Editor** 클릭

### 2단계: SQL 실행

1. **New query** 버튼 클릭
2. `comments-rpc-functions.sql` 파일의 전체 내용을 복사
3. SQL Editor에 붙여넣기
4. **Run** 버튼 클릭 (또는 Cmd/Ctrl + Enter)

### 3단계: 배포 확인

배포 완료 후 터미널에서 확인:

```bash
node test-rpc-functions.cjs
```

## 📦 배포되는 RPC 함수 목록

| 함수명 | 기능 | 매개변수 |
|--------|------|----------|
| `get_post_comments` | 댓글 목록 조회 | p_post_id |
| `create_comment` | 댓글 생성 | p_post_id, p_user_id, p_author_name, p_content, p_parent_comment_id |
| `update_comment` | 댓글 수정 | p_comment_id, p_user_id, p_content |
| `delete_comment` | 댓글 삭제 | p_comment_id, p_user_id |
| `toggle_comment_like` | 좋아요 토글 | p_comment_id, p_user_id |
| `get_post_comment_count` | 댓글 수 조회 | p_post_id |
| `get_user_comments` | 사용자 댓글 목록 | p_user_id, p_limit, p_offset |
| `notify_comment_change` | 실시간 알림 트리거 | (자동 실행) |

## 🔧 필요한 테이블 구조

다음 테이블들이 이미 존재해야 합니다:

### comments 테이블
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### comment_likes 테이블
```sql
CREATE TABLE comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);
```

## ✅ 배포 확인 방법

### 자동 테스트
```bash
# 함수 존재 여부 확인
node test-rpc-functions.cjs

# 실제 기능 테스트
node test-real-functionality.cjs
```

### 수동 확인
Supabase Dashboard → Database → Functions에서 다음 함수들이 보이는지 확인:
- get_post_comments
- create_comment
- update_comment
- delete_comment
- toggle_comment_like
- get_post_comment_count
- get_user_comments
- notify_comment_change

## 🎉 성공 시 결과

모든 함수가 성공적으로 배포되면:

```
🎉 모든 RPC 함수가 정상적으로 배포되었습니다!
✅ 통과: 7개
❌ 실패: 0개
📈 성공률: 100%
```

## 🔧 문제 해결

### 함수 호출 시 "Could not find function" 오류
1. Supabase 대시보드에서 함수가 생성되었는지 확인
2. 캐시 새로고침을 위해 잠시 대기 (1-2분)
3. 권한 설정이 올바른지 확인

### 권한 오류
SQL 실행 시 권한 설정도 함께 실행됩니다:
```sql
GRANT EXECUTE ON FUNCTION ... TO authenticated, service_role;
```

### 테이블 관련 오류
필요한 테이블(comments, comment_likes)이 존재하지 않으면 먼저 생성해야 합니다.

## 📞 지원

배포 관련 문제가 발생하면:
1. 터미널에서 테스트 스크립트 실행
2. 오류 메시지 확인
3. Supabase 대시보드에서 함수 상태 점검