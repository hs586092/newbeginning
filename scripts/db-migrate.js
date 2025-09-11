#!/usr/bin/env node
/**
 * Supabase Migration 자동화 시스템
 * SQL Editor 없이 완전한 마이그레이션 관리
 * 사용법: node scripts/db-migrate.js <command> [options]
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 환경변수 오류')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations')

/**
 * 마이그레이션 디렉토리 생성
 */
function ensureMigrationsDir() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true })
    console.log(`✅ 마이그레이션 디렉토리 생성: ${MIGRATIONS_DIR}`)
  }
}

/**
 * 타임스탬프 생성
 */
function generateTimestamp() {
  const now = new Date()
  return now.toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..+/, '')
    .replace('T', '_')
}

/**
 * 새 마이그레이션 파일 생성
 */
function createMigration(name, content = '') {
  ensureMigrationsDir()
  
  const timestamp = generateTimestamp()
  const filename = `${timestamp}_${name.replace(/\s+/g, '_').toLowerCase()}.sql`
  const filepath = path.join(MIGRATIONS_DIR, filename)
  
  const template = content || `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

BEGIN;

-- Your migration SQL here

COMMIT;
`

  fs.writeFileSync(filepath, template)
  console.log(`✅ 마이그레이션 생성: ${filename}`)
  return filepath
}

/**
 * 마이그레이션 파일 목록 조회
 */
function getMigrations() {
  ensureMigrationsDir()
  
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort()
  
  return files.map(filename => ({
    filename,
    filepath: path.join(MIGRATIONS_DIR, filename),
    timestamp: filename.split('_')[0],
    name: filename.replace(/^\d+_/, '').replace(/\.sql$/, '')
  }))
}

/**
 * SQL 파일 실행 (개선된 마이그레이션 함수 사용)
 */
async function executeSQLFile(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8')
    console.log(`🚀 실행 중: ${path.basename(filepath)}`)
    
    // execute_migration RPC 함수 사용 (전체 마이그레이션 한 번에 실행)
    const { data, error } = await supabase.rpc('execute_migration', {
      migration_sql: content
    })

    if (error) {
      console.error(`❌ 마이그레이션 실행 오류:`, error.message)
      return { success: false, error: error.message }
    }

    if (data && data.status === 'success') {
      console.log(`✅ 완료: ${path.basename(filepath)}`)
      console.log(`📊 실행 시간: ${data.timestamp}`)
      return { success: true }
    } else if (data && data.status === 'error') {
      console.error(`❌ 마이그레이션 오류: ${data.message}`)
      console.error(`🔍 상세 정보: ${data.detail}`)
      return { success: false, error: data.message }
    }

    return { success: true }
  } catch (err) {
    console.error(`❌ 파일 실행 오류: ${err.message}`)
    return { success: false, error: err.message }
  }
}

/**
 * 모든 마이그레이션 실행
 */
async function runMigrations() {
  const migrations = getMigrations()
  
  if (migrations.length === 0) {
    console.log('📝 실행할 마이그레이션이 없습니다.')
    return
  }
  
  console.log(`🚀 ${migrations.length}개 마이그레이션 실행 시작...`)
  
  for (const migration of migrations) {
    const result = await executeSQLFile(migration.filepath)
    
    if (!result.success) {
      console.error(`❌ 마이그레이션 실패: ${migration.filename}`)
      console.error(`오류: ${result.error}`)
      break
    }
  }
  
  console.log('✅ 모든 마이그레이션 완료!')
}

/**
 * 특정 마이그레이션 실행
 */
async function runSpecificMigration(filename) {
  const migrations = getMigrations()
  const migration = migrations.find(m => m.filename.includes(filename))
  
  if (!migration) {
    console.error(`❌ 마이그레이션을 찾을 수 없습니다: ${filename}`)
    return
  }
  
  const result = await executeSQLFile(migration.filepath)
  
  if (result.success) {
    console.log(`✅ 마이그레이션 완료: ${migration.filename}`)
  } else {
    console.error(`❌ 마이그레이션 실패: ${migration.filename}`)
    console.error(`오류: ${result.error}`)
  }
}

/**
 * 마이그레이션 목록 표시
 */
function listMigrations() {
  const migrations = getMigrations()
  
  if (migrations.length === 0) {
    console.log('📝 마이그레이션이 없습니다.')
    return
  }
  
  console.log(`📋 ${migrations.length}개 마이그레이션 발견:`)
  migrations.forEach((migration, index) => {
    console.log(`  ${index + 1}. ${migration.filename}`)
    console.log(`     ${migration.name}`)
  })
}

/**
 * 댓글 시스템 마이그레이션 생성
 */
function createCommentsMigration() {
  const content = `-- Migration: Comments System with 2-level nesting
-- Created: ${new Date().toISOString()}
-- Features: 2-level nested comments, real-time, RLS

BEGIN;

-- 1. Comments 테이블에 누락된 컬럼 추가
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- 2. 새로운 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS comments_parent_comment_id_idx ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS comments_post_id_created_at_idx ON comments(post_id, created_at DESC);

-- 3. 댓글 길이 제한 추가
ALTER TABLE comments 
ADD CONSTRAINT IF NOT EXISTS comments_content_length 
CHECK (length(content) >= 1 AND length(content) <= 1000);

-- 4. 댓글 통계 뷰 생성
DROP VIEW IF EXISTS comment_stats;
CREATE VIEW comment_stats AS
SELECT 
    c.id,
    c.post_id,
    c.user_id,
    c.author_name,
    c.parent_comment_id,
    c.content,
    c.is_deleted,
    c.created_at,
    c.updated_at,
    COALESCE(cl.like_count, 0) as like_count,
    COALESCE(cr.reply_count, 0) as reply_count
FROM comments c
LEFT JOIN (
    SELECT comment_id, COUNT(*) as like_count
    FROM comment_likes
    GROUP BY comment_id
) cl ON c.id = cl.comment_id
LEFT JOIN (
    SELECT parent_comment_id, COUNT(*) as reply_count
    FROM comments
    WHERE parent_comment_id IS NOT NULL AND is_deleted = FALSE
    GROUP BY parent_comment_id
) cr ON c.id = cr.parent_comment_id
WHERE c.is_deleted = FALSE;

-- 5. RLS 정책 활성화 및 설정
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;

-- 댓글 정책 생성
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can create comments" ON comments 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own comments" ON comments 
    FOR UPDATE USING (auth.uid() = user_id);

-- 6. 좋아요 정책 설정
DROP POLICY IF EXISTS "Anyone can view comment likes" ON comment_likes;
DROP POLICY IF EXISTS "Authenticated users can like comments" ON comment_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON comment_likes;

CREATE POLICY "Anyone can view comment likes" ON comment_likes FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can like comments" ON comment_likes 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can unlike their own likes" ON comment_likes 
    FOR DELETE USING (auth.uid() = user_id);

-- 7. 실시간 알림 함수
CREATE OR REPLACE FUNCTION notify_comment_changes()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM pg_notify('comment_changes', 
            json_build_object(
                'operation', TG_OP,
                'record', row_to_json(NEW),
                'post_id', NEW.post_id
            )::text
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM pg_notify('comment_changes',
            json_build_object(
                'operation', TG_OP,
                'record', row_to_json(NEW),
                'old_record', row_to_json(OLD),
                'post_id', NEW.post_id
            )::text
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM pg_notify('comment_changes',
            json_build_object(
                'operation', TG_OP,
                'record', row_to_json(OLD),
                'post_id', OLD.post_id
            )::text
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 8. 트리거 생성
DROP TRIGGER IF EXISTS comment_changes_trigger ON comments;
CREATE TRIGGER comment_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION notify_comment_changes();

-- 9. updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- 성공 메시지
SELECT '✅ 댓글 시스템 마이그레이션 완료! 2레벨 중첩댓글 및 실시간 기능 활성화' as result;`

  return createMigration('comments_system_upgrade', content)
}

/**
 * 메인 실행 함수
 */
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  switch (command) {
    case 'create':
      if (args.length < 2) {
        console.error('❌ 마이그레이션 이름이 필요합니다')
        console.log('사용법: node scripts/db-migrate.js create "migration_name"')
        return
      }
      createMigration(args[1])
      break
      
    case 'run':
      if (args.length > 1) {
        await runSpecificMigration(args[1])
      } else {
        await runMigrations()
      }
      break
      
    case 'list':
      listMigrations()
      break
      
    case 'comments':
      const filepath = createCommentsMigration()
      console.log(`✅ 댓글 시스템 마이그레이션 생성: ${path.basename(filepath)}`)
      console.log('실행하려면: node scripts/db-migrate.js run comments')
      break
      
    default:
      console.log(`
🔄 Supabase Migration 관리 도구

명령어:
  create <name>     새 마이그레이션 생성
  run [filename]    마이그레이션 실행 (파일명 없으면 모두 실행)
  list             마이그레이션 목록 보기
  comments         댓글 시스템 마이그레이션 생성

예시:
  node scripts/db-migrate.js create "add_user_profiles"
  node scripts/db-migrate.js run
  node scripts/db-migrate.js run comments
  node scripts/db-migrate.js comments
`)
  }
}

// 스크립트 직접 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { createMigration, runMigrations, executeSQLFile }