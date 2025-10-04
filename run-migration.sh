#!/bin/bash

# Supabase 데이터베이스에 직접 연결해서 마이그레이션 실행
PGPASSWORD='mJCu4eO#21xhz#Zn' psql \
  -h aws-0-ap-northeast-2.pooler.supabase.com \
  -p 5432 \
  -U postgres.gwqvqncgveqenzymwlmy \
  -d postgres \
  -f supabase/migrations/create_hospitals_simple.sql

echo "✅ 마이그레이션 완료!"
