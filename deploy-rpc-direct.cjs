#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// .env.local에서 환경변수 로드
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 연결 정보가 없습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function deployFunctions() {
  console.log('🚀 댓글 시스템 RPC 함수 배포 시작...\n');
  
  const functions = [
    {
      name: 'get_post_comments',
      sql: `CREATE OR REPLACE FUNCTION get_post_comments(p_post_id UUID)
RETURNS TABLE (
    id UUID, post_id UUID, user_id UUID, author_name TEXT, content TEXT,
    parent_comment_id UUID, is_deleted BOOLEAN, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
    profile_username TEXT, profile_avatar_url TEXT, reply_count BIGINT, like_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.post_id, c.user_id, c.author_name, c.content, c.parent_comment_id, c.is_deleted, c.created_at, c.updated_at,
        p.username as profile_username, p.avatar_url as profile_avatar_url,
        (SELECT COUNT(*)::BIGINT FROM comments cc WHERE cc.parent_comment_id = c.id AND cc.is_deleted = FALSE) as reply_count,
        (SELECT COUNT(*)::BIGINT FROM comment_likes cl WHERE cl.comment_id = c.id) as like_count
    FROM comments c
    LEFT JOIN profiles p ON c.user_id = p.id
    WHERE c.post_id = p_post_id AND c.is_deleted = FALSE
    ORDER BY CASE WHEN c.parent_comment_id IS NULL THEN c.created_at ELSE NULL END ASC NULLS LAST,
             CASE WHEN c.parent_comment_id IS NOT NULL THEN c.created_at ELSE NULL END ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql;`
    },
    {
      name: 'create_comment',
      sql: `CREATE OR REPLACE FUNCTION create_comment(p_post_id UUID, p_user_id UUID, p_author_name TEXT, p_content TEXT, p_parent_comment_id UUID DEFAULT NULL)
RETURNS UUID AS $$
DECLARE new_comment_id UUID;
BEGIN
    INSERT INTO comments (post_id, user_id, author_name, content, parent_comment_id, created_at, updated_at) 
    VALUES (p_post_id, p_user_id, p_author_name, p_content, p_parent_comment_id, NOW(), NOW()) 
    RETURNING id INTO new_comment_id;
    RETURN new_comment_id;
END;
$$ LANGUAGE plpgsql;`
    },
    {
      name: 'update_comment',
      sql: `CREATE OR REPLACE FUNCTION update_comment(p_comment_id UUID, p_user_id UUID, p_content TEXT)
RETURNS BOOLEAN AS $$
DECLARE affected_rows INTEGER;
BEGIN
    UPDATE comments SET content = p_content, updated_at = NOW()
    WHERE id = p_comment_id AND user_id = p_user_id AND is_deleted = FALSE;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql;`
    },
    {
      name: 'delete_comment',
      sql: `CREATE OR REPLACE FUNCTION delete_comment(p_comment_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE affected_rows INTEGER;
BEGIN
    UPDATE comments SET is_deleted = TRUE, updated_at = NOW()
    WHERE id = p_comment_id AND user_id = p_user_id AND is_deleted = FALSE;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql;`
    },
    {
      name: 'toggle_comment_like',
      sql: `CREATE OR REPLACE FUNCTION toggle_comment_like(p_comment_id UUID, p_user_id UUID)
RETURNS JSON AS $$
DECLARE existing_like_id UUID; new_like_count INTEGER; is_liked BOOLEAN := FALSE;
BEGIN
    SELECT id INTO existing_like_id FROM comment_likes WHERE comment_id = p_comment_id AND user_id = p_user_id;
    IF existing_like_id IS NOT NULL THEN
        DELETE FROM comment_likes WHERE id = existing_like_id;
        is_liked := FALSE;
    ELSE
        INSERT INTO comment_likes (comment_id, user_id, created_at) VALUES (p_comment_id, p_user_id, NOW());
        is_liked := TRUE;
    END IF;
    SELECT COUNT(*)::INTEGER INTO new_like_count FROM comment_likes WHERE comment_id = p_comment_id;
    RETURN json_build_object('success', TRUE, 'liked', is_liked, 'like_count', new_like_count);
END;
$$ LANGUAGE plpgsql;`
    },
    {
      name: 'get_post_comment_count',
      sql: `CREATE OR REPLACE FUNCTION get_post_comment_count(p_post_id UUID)
RETURNS INTEGER AS $$
DECLARE comment_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO comment_count FROM comments WHERE post_id = p_post_id AND is_deleted = FALSE;
    RETURN comment_count;
END;
$$ LANGUAGE plpgsql;`
    },
    {
      name: 'get_user_comments',
      sql: `CREATE OR REPLACE FUNCTION get_user_comments(p_user_id UUID, p_limit INTEGER DEFAULT 10, p_offset INTEGER DEFAULT 0)
RETURNS TABLE (id UUID, post_id UUID, content TEXT, created_at TIMESTAMPTZ, post_title TEXT, reply_count BIGINT, like_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.post_id, c.content, c.created_at, p.title as post_title,
        (SELECT COUNT(*)::BIGINT FROM comments cc WHERE cc.parent_comment_id = c.id AND cc.is_deleted = FALSE) as reply_count,
        (SELECT COUNT(*)::BIGINT FROM comment_likes cl WHERE cl.comment_id = c.id) as like_count
    FROM comments c LEFT JOIN posts p ON c.post_id = p.id
    WHERE c.user_id = p_user_id AND c.is_deleted = FALSE
    ORDER BY c.created_at DESC LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;`
    },
    {
      name: 'notify_comment_change',
      sql: `CREATE OR REPLACE FUNCTION notify_comment_change() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM pg_notify('comment_changes', json_build_object('type', 'INSERT', 'post_id', NEW.post_id, 'comment_id', NEW.id, 'user_id', NEW.user_id)::text);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM pg_notify('comment_changes', json_build_object('type', 'UPDATE', 'post_id', NEW.post_id, 'comment_id', NEW.id, 'user_id', NEW.user_id)::text);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM pg_notify('comment_changes', json_build_object('type', 'DELETE', 'post_id', OLD.post_id, 'comment_id', OLD.id, 'user_id', OLD.user_id)::text);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;`
    }
  ];
  
  let successCount = 0;
  let errorCount = 0;
  
  // 각 함수 개별 배포
  for (const func of functions) {
    try {
      console.log(`📦 ${func.name} 함수 생성 중...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { sql: func.sql });
      
      if (error) {
        console.error(`❌ ${func.name} 생성 실패:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ ${func.name} 생성 완료`);
        successCount++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (err) {
      console.error(`❌ ${func.name} 생성 중 예외:`, err.message);
      errorCount++;
    }
  }
  
  // 트리거 생성
  try {
    console.log('\n🔧 트리거 생성 중...');
    
    const triggerSQL = `
DROP TRIGGER IF EXISTS comment_change_notify ON comments;
CREATE TRIGGER comment_change_notify
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION notify_comment_change();`;
    
    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: triggerSQL });
    
    if (triggerError) {
      console.error('❌ 트리거 생성 실패:', triggerError.message);
      errorCount++;
    } else {
      console.log('✅ 트리거 생성 완료');
      successCount++;
    }
  } catch (err) {
    console.error('❌ 트리거 생성 중 예외:', err.message);
    errorCount++;
  }
  
  // 권한 설정
  try {
    console.log('\n🔐 함수 권한 설정 중...');
    
    const permissionSQL = `
GRANT EXECUTE ON FUNCTION get_post_comments(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_comment(UUID, UUID, TEXT, TEXT, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_comment(UUID, UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION delete_comment(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION toggle_comment_like(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_post_comment_count(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_comments(UUID, INTEGER, INTEGER) TO authenticated, service_role;`;
    
    const { error: permError } = await supabase.rpc('exec_sql', { sql: permissionSQL });
    
    if (permError) {
      console.error('❌ 권한 설정 실패:', permError.message);
      errorCount++;
    } else {
      console.log('✅ 권한 설정 완료');
      successCount++;
    }
  } catch (err) {
    console.error('❌ 권한 설정 중 예외:', err.message);
    errorCount++;
  }
  
  console.log('\n📊 배포 결과:');
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${errorCount}개`);
  
  return errorCount === 0;
}

async function main() {
  try {
    const success = await deployFunctions();
    
    if (success) {
      console.log('\n🎉 모든 RPC 함수가 성공적으로 배포되었습니다!');
    } else {
      console.log('\n⚠️  일부 함수 배포에 실패했습니다.');
      console.log('대안: Supabase 대시보드 SQL Editor에서 수동 실행');
    }
  } catch (error) {
    console.error('❌ 배포 실패:', error);
  }
}

if (require.main === module) {
  main();
}