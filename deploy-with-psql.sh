#!/bin/bash

# Supabase 환경변수 로드
source .env.local 2>/dev/null || true

# Supabase URL에서 연결 정보 추출
SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
PROJECT_ID=$(echo $SUPABASE_URL | sed 's/https:\/\/\([^.]*\)\..*/\1/')

echo "🚀 Supabase RPC 함수 배포 시작..."
echo "📍 프로젝트 ID: $PROJECT_ID"
echo "🔗 Supabase URL: $SUPABASE_URL"

# PostgreSQL 연결 문자열 구성
PG_HOST="${PROJECT_ID}.supabase.co"
PG_PORT="6543"
PG_DATABASE="postgres"
PG_USER="postgres"

echo ""
echo "🔑 PostgreSQL 비밀번호를 입력하세요:"
echo "   (Supabase Dashboard > Settings > Database > Connection string에서 확인 가능)"
read -s PG_PASSWORD

echo ""
echo "🔌 PostgreSQL 연결 테스트 중..."

# psql 설치 확인
if ! command -v psql &> /dev/null; then
    echo "❌ psql이 설치되어 있지 않습니다."
    echo "📥 설치 방법:"
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

# PostgreSQL 연결 문자열
PGPASSWORD=$PG_PASSWORD psql -h $PG_HOST -p $PG_PORT -U $PG_USER -d $PG_DATABASE -c "SELECT version();" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ PostgreSQL 연결 실패"
    echo "🔧 연결 정보를 확인해주세요:"
    echo "   Host: $PG_HOST"
    echo "   Port: $PG_PORT"
    echo "   User: $PG_USER"
    echo "   Database: $PG_DATABASE"
    exit 1
fi

echo "✅ PostgreSQL 연결 성공"

# 기존 함수들 제거
echo ""
echo "🗑️  기존 RPC 함수들 제거 중..."

DROP_SQL="
DROP FUNCTION IF EXISTS get_post_comments(UUID);
DROP FUNCTION IF EXISTS create_comment(UUID, UUID, TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS update_comment(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS delete_comment(UUID, UUID);
DROP FUNCTION IF EXISTS toggle_comment_like(UUID, UUID);
DROP FUNCTION IF EXISTS get_post_comment_count(UUID);
DROP FUNCTION IF EXISTS get_user_comments(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS notify_comment_change();
"

PGPASSWORD=$PG_PASSWORD psql -h $PG_HOST -p $PG_PORT -U $PG_USER -d $PG_DATABASE -c "$DROP_SQL"

if [ $? -eq 0 ]; then
    echo "✅ 기존 함수들 제거 완료"
else
    echo "⚠️  기존 함수 제거 중 일부 오류 (계속 진행)"
fi

# SQL 파일 실행
echo ""
echo "🔧 comments-rpc-functions.sql 파일 실행 중..."

PGPASSWORD=$PG_PASSWORD psql -h $PG_HOST -p $PG_PORT -U $PG_USER -d $PG_DATABASE -f comments-rpc-functions.sql

if [ $? -eq 0 ]; then
    echo "✅ SQL 파일 실행 완료"
else
    echo "❌ SQL 파일 실행 실패"
    exit 1
fi

# get_post_comments 함수 테스트
echo ""
echo "🧪 get_post_comments 함수 테스트 중..."

TEST_SQL="SELECT get_post_comments('00000000-0000-0000-0000-000000000001'::UUID);"

PGPASSWORD=$PG_PASSWORD psql -h $PG_HOST -p $PG_PORT -U $PG_USER -d $PG_DATABASE -c "$TEST_SQL" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ get_post_comments 함수 테스트 성공!"
else
    echo "❌ get_post_comments 함수 테스트 실패"
    exit 1
fi

# 함수 목록 확인
echo ""
echo "📊 생성된 함수들 확인 중..."

LIST_FUNCTIONS_SQL="
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%comment%'
ORDER BY routine_name;
"

PGPASSWORD=$PG_PASSWORD psql -h $PG_HOST -p $PG_PORT -U $PG_USER -d $PG_DATABASE -c "$LIST_FUNCTIONS_SQL"

echo ""
echo "🎉 Supabase RPC 함수 배포 완료!"
echo "🔄 스키마 캐시가 자동으로 새로고침되었습니다."